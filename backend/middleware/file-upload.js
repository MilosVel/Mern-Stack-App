
const multer = require('multer'); 
const uuid = require('uuid/v1');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // console.log('Request u middlwareu je:', req)
      cb(null, 'uploads/images'); // ovim se odredjuje destinacija => precizira gde ce fajl biti skladisten u aplikaciji, kakva je putanja u ovoj callBack funkciji takva mora da bude i u middlewareu za slike u app.js -> app.use('/uploads/images', express.static(path.join('uploads', 'images')));
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + '.' + ext); // prvi argument je null ili error. Drugi argument je ime fajla koji se skladisti
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; // vraca boolean
    let error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid); // prvi argumetn je null ili error, ako je error file will not be accepted. Drugi argumetnt treba da bude true ili false, ako je true onda ce fajl biti accepted i obrnuto ako je false file will not be accepted.
  }
});

module.exports = fileUpload;
