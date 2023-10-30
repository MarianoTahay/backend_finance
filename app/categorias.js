const pool = require('../config/database');

module.exports = (app) => {

    
    app.get('/categoria', (req, res) => {
        pool.query("SELECT * FROM categorias", (err, results) => {
            if(err) throw err;
            res.status(200).json(results.rows);
        })
    })

    app.post('/categoria/insertar', (req, res) => {

        const {nombre_categoria} = req.body

        pool.query('INSERT INTO categorias(nombre_categoria) VALUES($1)', [nombre_categoria], (err, results) => {
            if(err) throw err;
            res.json({status: 1, mensaje: "Datos Guardados", values: results.rows});
        })
    })

    app.delete('/categoria/eliminar/:nombre_categoria', (req, res) => {

        const nombre_categoria = req.params.nombre_categoria

        pool.query("DELETE FROM categorias WHERE nombre_categoria = $1", [nombre_categoria], (err, results) => {
            if(err) throw err;
            res.json({status: 1, mensaje: "Datos Eliminados", values: results.rows});
        })
    })
}