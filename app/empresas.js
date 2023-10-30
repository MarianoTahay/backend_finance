const pool = require('../config/database');

module.exports = (app) => {

    //Obtener todas las empresas
    app.get('/empresas', (req, res) => {
        pool.query("SELECT * FROM empresas", (err, results) => {
            if(err){
                res.json({status: 0, mensaje: "Error en la consulta"})
            }
            else{
                res.json({status: 1, mensaje: "Empresas obtenidas", values: results.rows});
            }
        })
    })
}