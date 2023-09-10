require('dotenv').config();
const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.json()); // ovo je middleware za POST request. Middlewares will be parsed from top to bottom. Ovaj middleware mora da bude na vrhu.


app.use('/uploads/images', express.static(path.join('uploads', 'images')));  // Ovo je middleware za slike. I putanja mora da bude onakva kako je precizirano u file-upload.js

app.use((req, res, next) => {  // bez ovog middleware nije moguce poslati request sa frontenda na beckend sa razlicitog porta.
  // res.setHeader('Access-Control-Allow-Origin', '*'); // bolja je donja linija koda
  res.setHeader('Access-Control-Allow-Origin',process.env.ORIGIN );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/users', usersRoutes); 
app.use('/api/places', placesRoutes); 

app.use((req, res, next) => { // ovo je middleware za nepoznate rute (rute koje ne postoje). Ovaj middleware ce se izvrsiti samo ako gornji middleware nije izvrsen. Zbog toga ovaj middleware mora da se stavi ispod ovog gore -> app.use('/api/places', placesRoutes). Ako bi se izvrsio gornji middleware poslao bi se odgovor, next ne bi bio pozvan i znaci ovaj middleware se ne bi izvrsio. Ako se gornji middleware ne bi izvrsio onda se izvrsava ovaj middleware.

  ////////////       Varijanta broj 1.      ///////////////////////
  const error = new HttpError('1. This route does not exist!!! ', 404)
  // throw error // throw error ce raditi samo kod sync koda
  return next(error) // moze i bez returna. Kada je u pitanju async kod mora da se korsti next(error). throw error nece raditi kod async koda.


  //////////////       Varijanta broj 2.      ///////////////////////
  // res.status(404).json({ message: '2. Ova ruta ne postoji' }) // moze a ne mora return na pocetku


  // ////////////       Varijanta broj 3.      ///////////////////////
  // const error = new Error('3.Ne postoji trazena ruta');
  // // error.message = 'NOVA PORUKA'
  // error.code = 404; 
  // // throw error //  throw error ce raditi samo kod sync koda. Ovde return na pocetku zasigurno nije potreban.
  // return next(error); // Kada je u pitanju async kod mora da se da se korsti next(error). Znaci throw error nece raditi kod async koda.

})



app.use((error, req, res, next) => { // ovo je middleware za greske i on nije potreban ako se greske handluju sa obicnim - klasicnim if checkom (bez new Error), ali taj if check nije bas uvek pogodan za error handling

  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err)
    });
  }


  if (res.headerSent) { // ovim if checkom se proverava da li je res.headerSent true, jer bi to znacilo da je response vec poslato. Ako je res.headerSent falsy onda se izvrsava kod ispod

    return next(error); // moze i samo return
  }
  res.status(error.code || 500)

  res.json({ message: error.message || 'An unknown error occurred!' });

});

  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, })
  .then(() => {
    app.listen(process.env.PORT,console.log('Server running..........'));
  }).catch(err => {
    console.log(err);
  });
