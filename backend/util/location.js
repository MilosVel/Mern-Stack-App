const axios = require('axios');

const HttpError = require('../models/http-error');
const API_KEY = process.env.API_KEY;

async function getCoordsForAddress(address) {

  return {
    lat: 40.7484474,
    lng: -73.9871516
  }


  // const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);

  // const data = response.data; // aksios daje data property na response objektu

  // if (!data || data.status === 'ZERO_RESULTS') {
  //   const error = new HttpError('Could not find location for the specified address.', 422);
  //   throw error;
  // }

  // const coordinates = data.results[0].geometry.location; // ovako se dobija trazena vrednost iz datog API/a

  // return coordinates;
}

module.exports = getCoordsForAddress;
