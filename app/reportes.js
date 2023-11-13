const pool = require('../config/database');
const jwt = require('jsonwebtoken');

module.exports = (app) => {

    app.post('/reports-insert', (req, res) => {

        let {id_usuario, archivo, fecha, mensaje} = req.body;

        let document = {
            nombre: "",
            extension: ""
        }

        payload = archivo.split('.')
        document.nombre = payload[0];
        document.extension = payload[1];
        token = jwt.sign(document, "profileAuth");
        archivo = token + '.' + payload[1];

        if(mensaje == ""){
            res.json({status: 0, mensaje: "Mensaje obligatorio"});
        }
        else{
            pool.query('INSERT INTO reportes(id_usuario, archivo, fecha, estado, mensaje) VALUES($1, $2, $3, $4, $5)', [id_usuario, archivo, fecha, 'disponible', mensaje], (err, result) => {
                if(err){
                    console.log(err)
                    res.json({status: 0, mensaje: "Error en la consulta"});
                }
                else{
                    res.json({status: 1, mensaje: "Reporte ingresado", documentToken: token + '.' + payload[1]})
                }
            })
        }
    })

    app.post('/reports-filter', (req, res) => {
        
        const {id_usuario, id_contador, fecha_min, fecha_max} = req.body;

        usuario = "'%'"; 
        contador = "'%'";
        fecha_inicio = "(SELECT MIN(fecha) FROM reportes)";
        fecha_fin = "(SELECT MAX(fecha) FROM reportes)"; 

        if(fecha_min != ""){
            fecha_inicio = "'" + fecha_min + "'"; 
        }

        if(fecha_max != ""){
            fecha_fin = "'" + fecha_max + "'"; 
        }

        if(id_contador != ""){
            contador = "'" + id_contador +"'";
        }

        if(id_usuario != ""){
            usuario = "'" + id_usuario +"'"
        }

        consulta = "SELECT R.*, X.username FROM (SELECT id_usuario, username FROM usuarios WHERE cuenta != 'Nactiva' AND id_contador::text LIKE " +  contador + "AND id_usuario::text LIKE " + usuario + ") AS X, reportes AS R WHERE X.id_usuario = R.id_usuario AND R.estado = 'disponible' AND R.fecha >= " + fecha_inicio + " AND R.fecha <= " + fecha_fin;

        pool.query(consulta, (err, result) => {
            if(err){
                console.log(err)
                res.json({status: 0, mensaje: "Error en la consulta", err: err});
            }
            else{
                res.json({status: 1, mensaje: "Reportes Retribuidos", values: result.rows})
            }
        })


    })

    app.post('/reports-delete', (req, res) => {
        const {id_reporte} = req.body;

        pool.query("UPDATE reportes SET estado = $1 WHERE id_reporte = $2", ['eliminado', id_reporte], (err, results) => {
            
            if(err){
                res.json({status: 0, mensaje: "No se pudo borrar el reporte", error: err})
            }
            else{
                res.json({status: 1, mensaje: "Se borro el reporte", values: results.rows});
            }
        })

    });

}