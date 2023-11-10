const pool = require('../config/database');
const jwt = require('jsonwebtoken');

module.exports = (app) => {

    //Aplicando filtros a la seleccion de facturas
    app.post('/bills-filter', (req, res) => {

        const {username, date_start, date_finish, min, max, companie, order, contador} = req.body

        fecha_inicio = "(SELECT MIN(fecha_emision) FROM facturas)";
        fecha_fin = "(SELECT MAX(fecha_emision) FROM facturas)";
        monto_min = "(SELECT MIN(monto) FROM facturas)";
        monto_max = "(SELECT MAX(monto) FROM facturas)";
        usuario = "'%'";
        nit_emisor = "'%'";

        if(date_start != ""){
            fecha_inicio = "'" + date_start + "'";;
            console.log("Se cambio fecha de inicio: " + fecha_inicio);
        }

        if(date_finish != ""){
            fecha_fin = "'" + date_finish + "'";
            console.log("Se cambio fecha fin: " + fecha_fin);
        }

        if(min != ""){
            monto_min = min;
            console.log(typeof min)
            console.log("Se cambio el monto minimo: " + monto_min);
        }

        if(max != ""){
            monto_max = max;
            console.log("Se cambio el monto maximo:  " + monto_max);
        }

        if(username != ""){
            usuario = "'" + username + "'";
            console.log("Se cambio el usuario:  " + usuario);
        }

        if(companie != 0){
            nit_emisor = "'" + companie + "'";
            console.log("Se cambio la empresa:  " + companie);
        }

        consulta = "SELECT X.* FROM (SELECT * FROM facturas WHERE " + "fecha_emision >= " + fecha_inicio + " AND fecha_emision <= " + fecha_fin + " AND monto >= " + monto_min + " AND monto <= " + monto_max + " AND username LIKE " + usuario + " AND nit_emisor::text LIKE " + nit_emisor + ") AS X, usuarios AS U WHERE U.username = X.username";

        if(contador != ""){
            consulta = consulta + " AND U.contador = '" + contador + "'";
        }

        if(order != ""){
            consulta = consulta + " ORDER BY monto " + order;
        }

        pool.query(consulta, (err, results) => {
            if(err){
                res.json({status: 0, mensaje: "Error en consulta de bills-filter"})
            }
            else{
                if(results.rows.length === 0){
                    res.json({mensaje: "No se encontraron facturas"});
                }
                else{
                    res.json({status: 1, mensaje: "Facturas encontradas", values: results.rows});
                }
            }
        })
    })

    //Registrar facturas
    app.post('/bills-insert', (req, res) => {

        let {dte, serie, emisor, receptor, monto, emision, user, imagen, pdf, status} = req.body;


        let document = {
            nombre: "",
            extension: ""
        }


        if(imagen == "" && pdf == ""){
            res.json({status: 0, mensaje: "Adjunte un archivo"})
        }
        else{
            if(dte == "" || serie == "" || emisor == "" || receptor == "" || monto == "" || emision == "" || user == "" || status == ""){
                res.json({status: 0, mensaje: "Complete el formulario"})
            }
            else{

                let token = ""

                if(imagen == ""){
                    payload = pdf.split('.')
                    document.nombre = payload[0];
                    document.extension = payload[1];
                    token = jwt.sign(document, "profileAuth");
                    pdf = token;
                }
                else{
                    payload = imagen.split('.')
                    document.nombre = payload[0];
                    document.extension = payload[1];
                    token = jwt.sign(document, "profileAuth");
                    imagen = token;
                }

                pool.query("INSERT INTO facturas(dte, serie, nit_emisor, nit_receptor, monto, fecha_emision, id_usuario, imagen, pdf, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ", [dte, serie, emisor, receptor, monto, emision, user, imagen, pdf, status], (err, results) => {
                
                    if(err){
                        console.log(err)
                        res.json({status: 0, mensaje: "No se pudo ingresar la factura", error: err})
                    }
                    else{
                        res.json({status: 1, mensaje: "Factura ingresada", documentToken: token});
                    }
                })
            }
        }
    })

    //Borrar facturas
    app.post('/bills-delete', (req, res) => {
        const {dte, serie} = req.body;

        pool.query("DELETE FROM facturas WHERE  dte = $1 AND serie = $2", [dte, serie], (err, results) => {
            
            if(err){
                res.json({status: 0, mensaje: "Invalid Data", error: err})
            }
            else{
                res.json({status: 1, mensaje: "Bill deleted!", values: results.rows});
            }
        })

    })
}