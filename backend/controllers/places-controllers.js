const uuid = require('uuid/v4');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');
const mongoose = require('mongoose');
const Place = require('../models/place'); 

const User = require('../models/user');

const fs = require('fs');


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; 

  let place;
  try {
    place = await Place.findById(placeId)  // .exec() -> exec metod bi osigurao da se radi o promisu
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find a place.', 500);
    return next(error); // ->  stop code execution

    // return res.status(404).json({ message: '1. GRESKA!!!!' })
    // return res.status(404).json({ message: err.message }) 

    // const error = new Error('2. GRESKA.');
    // error.code = 404;
    // return next(error) // ne moze throw error jer je async kod
  }

  if (!place) {
    const error = new HttpError('Could not find a place for the provided id.', 404);
    return next(error); // kada se radi sa async kodom ne moze se koristiti throw error,kao ni u ovom slucaju throw new HttpError -> throw new HttpError('Could not find a place for the provided id.', 404); jer je u pitanju async kod
  }

  res.json({ place: place.toObject({ getters: true }) }); //{ getters: true } -> Omogucava da se dobije id properti na objektu. Metod toObject konvertuje u JS object
}





const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId }); // Find metod vraca array. Ukoliko hocemo da osiguramo da se vrati promise koristimo exec metod, mada se async awati moze korstiti i bez exec metoda
  } catch (err) {
    const error = new HttpError('Fetching places failed, please try again later', 500);
    return next(error);
  }


  if (!places || places.length === 0) {
    // ovo ne moze jer je u pitanju async kod->  throw new HttpError('Could not find a place for the provided user id.', 404);
    return next(new HttpError('1. Could not find places for the provided user id+.', 404));

    // return res.status(404).json({ message: 'GRESKA. 2. Ne postoji trazeni id' }) 

    // const error = new Error('3. Greska.');
    // error.code = 404;
    // return next(error);
  }
  res.json({ places: places.map(place => place.toObject({ getters: true })) });
}



// ///  OVO JE ISTO KAO I PRETHODNO SAMO SE KORISTI DRUGI NACIN

// const getPlacesByUserId = async (req, res, next) => {
//   const userId = req.params.uid;

//   let userWithPlaces;
//   try {
//     userWithPlaces = await User.findById(userId).populate('places');
//   } catch (err) {
//     const error = new HttpError('Fetching places failed, please try again later.', 500);
//     return next(error);
//   }

//   if (!userWithPlaces || userWithPlaces.places.length === 0) {
//     return next(new HttpError('Could not find places for the provided user id.', 404));
//   }

//   res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
// };




const createPlace = async (req, res, next) => {  

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // throw new HttpError('Invalid inputs passed, please check your data.', 422); // Kada je async kod mora da se koristi return next(new HttpError('...')). throw new HttpError(...) nece raditi kako treba
    return next(new HttpError('Invalid inputs passed, please check your data. Kada se ne posalje header -> Content-Type : application/json onda se dobije ova greska', 422));
  }


  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error); // sa next(error) se forvarduje greska. Return sprecava dalje izvrsavanje koda
  }


  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path, // ovo je povezano sa PlaceItem.js

    // image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',  // ovo je hardkodovana slika

    ////////        creator    //////////
    // za creatora se takodje mogu koristiti dve varijante: jedna je da se creator izvlaci iz req.body, a druga je da se creator dobije iz dinamicki dodatog propertia u check-auth.js
    // Varijatna broj 1 je samo sledeca linija koda:
    // creator

    // Varijanta broj 2 je bolja i sigurnija: 
    creator: req.userData.userId    // req.UserData.userId se dobija iz dinamicki dodatog propertia u check-auth.js
  });


  let user;
  try {
    //  user = await User.findById(creator); // moze se koristiti i sledeca linija koda.
    user = await User.findById(req.userData.userId); // req.userData.userId -> se dobija iz dinamiski dodatog propertia u check-auth.js
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again.', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }


  try {
    //////  KADA SE KORISTE SESSION AND TRANSACTION onda se u bazi podataka mora rucno kreirati kolekcija u ovom slucaju to je -> places

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();


    // await createdPlace.save(); // kada se koristi ova linija koda nije potrebno manuelno kreirati kolekciju u bazi podataka
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again....', 500);
    return next(error); // obavezan je return
  }

  res.status(201).json({ place: createdPlace });
};



const updatePlace = async (req, res, next) => { 

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Nevalidni input podaci.', 500);
    return next(error);

  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return next(error);
  }


  // Slececi if blok predstavlja kontrolu na bekendu od na primer Postmana, kontrola se vrsi pomocu dinamickog propertia koji se postavlja u check-auth.js



  if (place.creator.toString() !== req.userData.userId) { // mora se staviti place.creator.toString()
    const error = new HttpError('You are not allowed to edit this place.', 401);
    return next(error);
  }


  place.title = title;
  place.description = description;

  try {
    await place.save(); 
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};




const deletePlace = async (req, res, next) => { 
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError('Something went wrong, could not delete place.', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }


  // Slececi if blok predstavlja kontrolu na bekendu on naprimer Postmena koja se vrsi pomocu dinamickog propertia koji se postavlja u check-auth.js
  if (place.creator.id !== req.userData.userId) { // nije potrebno da se primeni .toString na place.creator.id
    const error = new HttpError('You are not allowed to delete this place.', 401);
    return next(error);
  }


  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess }); 
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Something went wrong, could not delete place.', 500);
    return next(error);
  }


  fs.unlink(imagePath, err => {
    console.log(err);
  });


  res.status(200).json({ message: 'Deleted place.' });

};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

