const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

module.exports = (app) => {

  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'assets/' + req.body.type + '/')
    },
    filename: function (req, file, cb) {

      cb(null, req.body.id + path.extname(file.originalname))
    }
  });

  const upload = multer({ storage: storage });

  app.post('/subir-archivo', upload.single('archivo'), (req, res) => {

    console.log("./../../../../../../backend/" + req.body.type + "/" + req.file.filename)

  })
}