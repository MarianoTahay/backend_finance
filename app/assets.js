const pool = require('../config/database');
const multer = require('multer');

module.exports = (app) => {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          if (file.mimetype === 'application/pdf') {
            cb(null, 'assets/pdfs/');
          } else if (file.mimetype.startsWith('image/')) {
            cb(null, 'assets/avatars');
          } else {
            cb(new Error('Tipo de archivo no válido.'), null);
          }
        },
        filename: (req, file, cb) => {
          cb(null, file.filename);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(null, false);
        }
    };

    const upload = multer({ storage, fileFilter });

    app.post('/subir-archivo', upload.array('archivo'), (req, res) => {

        if (!req.file) {
            return res.status(400).send('No se ha seleccionado un archivo válido.');
          }
        
          res.send('Archivo subido con éxito.');

    })
}