const express = require('express');
const validator = require('express-validator'); 
let check = validator.check

const placesControllers = require('../controllers/places-controllers');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const fileUpload = require('../middleware/file-upload');

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);


router.use(checkAuth); // ovo je middleware za TOKEN. Rutama ispod (znaci posle ovog middlewarea) moze da se pristupi samo sa validnim tokenom

router.post('/',
    fileUpload.single('image'), // ovo je middleware sa uploadovanje slike
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty()
    ],
    placesControllers.createPlace);

router.patch('/:pid',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    placesControllers.updatePlace
);


router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
