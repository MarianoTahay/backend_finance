const pool = require('../config/database');

module.exports = (app) => {

    //Obtener todas las empresas
    app.get('/getEmpresas', (req, res) => {
        pool.query("SELECT * FROM empresas WHERE nit != 0 AND status != 'Nvigente'", (err, results) => {
            if(err){
                res.json({status: 0, mensaje: "Error en la consulta"})
            }
            else{
                res.json({status: 1, mensaje: "Empresas obtenidas", values: results.rows});
            }
        })
    })
}