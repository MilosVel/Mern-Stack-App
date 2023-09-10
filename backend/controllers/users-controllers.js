const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 


const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res, next) => { 
    let users;
    try {
        users = await User.find({}, '-password');
       
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later.', 500);
        return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};


const signup = async (req, res, next) => { 

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // sledeci kod nece da radi jer je async funkcija ->  throw new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(new HttpError('Invalid inputs passed, please check your data.m', 422));
    }


    const { name, email, password } = req.body;

    let existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later...', 500);
        return next(error);
    }


    if (existingUser) {
        //////////       Varijanta broj 1.      ///////////////////////
        // ova linija koda ne radi jer funkcija async -> throw new HttpError('1. Could not create user, email already exists.', 422);

        // const error = new HttpError('User exists already, please login instead.', 422);
        // return next(error);

        // //////////       Varijanta broj 2. -> ova varijata ne baca gresku     ///////////////////////
        // res.status(422).json({ mеssage: '2. Could not create user, email already exists.' }) // moze a ne mora return na pocetku


        //////////       Varijanta broj 3.      ///////////////////////
        const error = new Error('3. Could not create user, email already exists... ');
        // error.message = 'NOVA PORUKA'
        error.code = 422; 
        // throw error //  throw error ce raditi samo kod sync koda
        return next(error); // Kada je u pitanju async kod mora da se da se korsti next(error). Znaci throw error nece raditi kod async koda.
    }


    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12); // drugi argument predstavlja jacinu kriptovanja
    } catch (err) {
        const error = new HttpError('Could not create user, please try again.', 500);
        return next(error);
    }

    const createdUser = new User({ // Obratiti paznju kako ce se places -> [] popunjavati kada se kreira novo mesto za datog usera
        name,
        email,
        // image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg', // hardkodovana slika
        // image: 'rEACT_APP_ASSET_URL/' + req.file.path, // ovo je povezano sa UserItem.js
        image: req.file.path,// // ovo je povezano sa UserItem.js
        password: hashedPassword,
        places: [] 
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again.', 500);
        return next(error);
    }


    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_KEY, 
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.', 500);
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};




const login = async (req, res, next) => {

    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }


    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
        console.log('Sifra je validana',isValidPassword)
    } catch (err) {
        const error = new HttpError('Could not log you in, please check your credentials and try again.', 500);
        return next(error);
    }


    if (!isValidPassword) { 
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }



    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token,
        korisnik: existingUser,
        message: 'Uspesno logovanje - Potvrda',
        probni_id: existingUser._id
    });

};



exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

