const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') { // po defaultu browser vraca 'OPTIONS', i zbog toga je neophodan ovaj if blok
    return next(); // -> ovim se omogucava requestu da nastavi its journey. Kod radi i bez returna, ali next() mora da postoji
  }
  try {
    const token = req.headers.authorization.split(' ')[1]; 
    if (!token) {
      throw new Error('Authentication failed!');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);


    req.userData = { userId: decodedToken.userId }; 

    next(); // ovom se omogucava da - request continue its joutrney (request sada ima i userData properti) 
  } catch (err) {
    const error = new HttpError('Authentication failed***!', 401);
    return next(error);
  }
};
