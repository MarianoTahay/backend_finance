const pool = require('../config/database');
const multer = require('multer');
const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = (app) => {

  app.use('/static', express.static('assets'))

  app.post('/getProfilePic', (req, res) => {

    const {name, tipo} = req.body;

    const rutaImagen = "http://localhost:3000/static/" + tipo + "/" + name;

    fs.access('assets/' + tipo + '/' + name, fs.constants.F_OK, (err) => {
      if(err){
        res.send("")
        console.log('assets/' + tipo + '/' + name)
      }
      else{
        res.send(rutaImagen);
      }
    })

  })

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {

      const tipo = req.body.tipo

      cb(null, 'assets/' + tipo)
    },
    filename: function (req, file, cb) {

      const id = req.body.id

      cb(null, id + path.extname(file.originalname))
    }
  })
  
  const upload = multer({ storage: storage })

  app.post('/subirArchivo', upload.single('archivo'), (req, res) => {

    console.log("Archivo subido");

  })

}