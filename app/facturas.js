const pool = require('../config/database');
const jwt = require('jsonwebtoken');

module.exports = (app) => {

    //Aplicando filtros a la seleccion de facturas
    app.post('/bills-filter', (req, res) => {

        const {id_usuario, date_start, date_finish, min, max, nit_emisor, nit_receptor, order, id_contador, status} = req.body

        fecha_inicio = "(SELECT MIN(fecha_emision) FROM facturas)";
        fecha_fin = "(SELECT MAX(fecha_emision) FROM facturas)";
        monto_min = "(SELECT MIN(monto) FROM facturas)";
        monto_max = "(SELECT MAX(monto) FROM facturas)";
        usuario = "'%'";
        emisor = "'%'";
        receptor = "'%'";

        console.log(id_usuario)

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

        if(id_usuario != ""){
            usuario = "'" + id_usuario + "'";
            console.log("Se cambio el usuario:  " + usuario);
        }

        if(nit_emisor != 0){
            emisor = "'" + nit_emisor + "'";
            console.log("Se cambio la empresa:  " + emisor);
        }

        if(nit_receptor != 0){
            receptor = "'" + nit_receptor + "'";
            console.log("Se cambio la empresa:  " + receptor);
        }

        consulta = "SELECT X.*, U.username FROM (SELECT * FROM facturas WHERE " + "fecha_emision >= " + fecha_inicio + " AND fecha_emision <= " + fecha_fin + " AND monto >= " + monto_min + " AND monto <= " + monto_max + " AND id_usuario::text LIKE " + usuario + " AND nit_emisor::text LIKE " + emisor + " AND nit_receptor::text LIKE " + receptor + " AND status = '" + status + "') AS X, usuarios AS U WHERE U.id_usuario = X.id_usuario";

        if(id_usuario == ""){
            if(id_contador != ""){
                consulta = "SELECT X.*, U.username FROM (SELECT * FROM facturas WHERE " + "fecha_emision >= " + fecha_inicio + " AND fecha_emision <= " + fecha_fin + " AND monto >= " + monto_min + " AND monto <= " + monto_max + " AND (id_usuario::text LIKE " + usuario + " OR id_usuario::text LIKE '" + id_contador  + "') AND nit_emisor::text LIKE " + emisor + " AND nit_receptor::text LIKE " + receptor + " AND status = '" + status + "') AS X, usuarios AS U WHERE U.id_usuario = X.id_usuario";
            }    
        }

        if(order != ""){
            consulta = consulta + " ORDER BY monto " + order;
        }

        pool.query(consulta, (err, results) => {
            if(err){
                console.log(err)
                res.json({status: 0, mensaje: "Error en consulta de bills-filter", error: err})
            }
            else{
                if(results.rows.length === 0){
                    res.json({mensaje: "No se encontraron facturas"});
                }
                else{
                    console.log(results.rows)
                    res.json({status: 1, mensaje: "Facturas encontradas", values: results.rows});
                }
            }
        })
    })

    //Ingresar facturas
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
                    pdf = token + '.' + payload[1];
                }
                else{
                    payload = imagen.split('.')
                    document.nombre = payload[0];
                    document.extension = payload[1];
                    token = jwt.sign(document, "profileAuth");
                    imagen = token + '.' + payload[1];
                }

                pool.query("INSERT INTO facturas(dte, serie, nit_emisor, nit_receptor, monto, fecha_emision, id_usuario, imagen, pdf, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ", [dte, serie, emisor, receptor, monto, emision, user, imagen, pdf, status], (err, results) => {
                
                    if(err){
                        console.log(err)
                        res.json({status: 0, mensaje: "No se pudo ingresar la factura", error: err})
                    }
                    else{
                        res.json({status: 1, mensaje: "Factura ingresada", documentToken: token + '.' + payload[1]});
                    }
                })
            }
        }
    })

    //Borrar facturas
    app.post('/bills-delete', (req, res) => {
        const {dte, serie} = req.body;

        pool.query("UPDATE facturas SET status = $1 WHERE dte = $2 AND serie = $3", ['borrada', dte, serie], (err, results) => {
            
            if(err){
                res.json({status: 0, mensaje: "No se pudo borrar la factura", error: err})
            }
            else{
                res.json({status: 1, mensaje: "Se borro la factura", values: results.rows});
            }
        })

    })
}