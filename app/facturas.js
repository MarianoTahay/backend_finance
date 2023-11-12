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

        if(date_start != ""){
            fecha_inicio = "'" + date_start + "'";
        }

        if(date_finish != ""){
            fecha_fin = "'" + date_finish + "'";
        }

        if(min != ""){
            monto_min = min;
        }

        if(max != ""){
            monto_max = max;
        }

        if(id_usuario != ""){
            usuario = "'" + id_usuario + "'";
        }

        if(nit_emisor != 0){
            emisor = "'" + nit_emisor + "'";
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
                    res.json({status: 1, mensaje: "Facturas encontradas", values: results.rows});
                }
            }
        })
    });

    //Ingresar facturas
    app.post('/bills-insert', (req, res) => {

        let {dte, serie, emisor, receptor, monto, emision, user, imagen, pdf, status} = req.body;

        let extension = "";

        let document = {
            nombre: "",
            extension: ""
        }


        if(imagen == "" && pdf == ""){
            res.json({status: 0, mensaje: "Adjunte un archivo"})
        }
        else{
            if(status != "pendiente"){
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
            else{
                let token = ""

                if(imagen == ""){
                    payload = pdf.split('.')
                    document.nombre = payload[0];
                    document.extension = payload[1];
                    token = jwt.sign(document, "profileAuth");
                    pdf = token + '.' + payload[1];
                    extension = payload[1];
                }
                else{
                    payload = imagen.split('.')
                    document.nombre = payload[0];
                    document.extension = payload[1];
                    token = jwt.sign(document, "profileAuth");
                    imagen = token + '.' + payload[1];
                    extension = payload[1];
                }

                pool.query("INSERT INTO facturas(dte, serie, nit_emisor, nit_receptor, monto, fecha_emision, id_usuario, imagen, pdf, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ", [dte, serie, emisor, receptor, monto, emision, user, imagen, pdf, status], (err, results) => {
                
                    if(err){
                        res.json({status: 0, mensaje: "No se pudo ingresar la factura", error: err})
                    }
                    else{
                        console.log(extension);
                        res.json({status: 1, mensaje: "Factura ingresada", documentToken: token + '.' + extension});
                    }
                })
            }
        }
    });

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

    });

    //Facturas pendientes
    app.post('/bills-pending', (req, res) => {

        const {id_usuario, id_contador, fecha_min, fecha_max} = req.body;

        usuario = "'%'"; 
        contador = "'%'";
        fecha_inicio = "(SELECT MIN(fecha_emision) FROM facturas)";
        fecha_fin = "(SELECT MAX(fecha_emision) FROM facturas)"; 

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

        consulta = "SELECT F.id_factura, F.id_usuario, F.imagen, F.pdf, F.fecha_emision, X.avatar, X.username, F.serie, F.dte FROM (SELECT id_usuario, avatar, username FROM usuarios WHERE id_contador::text LIKE " + contador + " AND id_usuario::text LIKE " +  usuario + ") AS X, facturas AS F WHERE X.id_usuario = F.id_usuario AND F.status = 'pendiente' AND F.fecha_emision >= " + fecha_inicio + " AND F.fecha_emision <= " + fecha_fin;

        pool.query(consulta, (err, result) => {
            if(err){
                console.log(err)
                res.json({status: 0, mensaje: "Error en la consulta", err: err});
            }
            else{
                res.json({status: 1, mensaje: "Facturas retribuidas", values: result.rows})
            }
        })

    });

    //Factura actualizar
    app.post('/bills-update', (req, res) => {

        let {dte, serie, emisor, receptor, monto, emision, id_factura} = req.body;

        if(dte == "" || serie == "" || emisor == "" || receptor == "" || monto == "" || emision == ""){
            res.json({status: 0, mensaje: "Complete el formulario"})
        }
        else{
            pool.query('UPDATE facturas SET dte = $1, serie = $2, nit_emisor = $3, nit_receptor = $4, monto = $5, fecha_emision = $6, status = $7 WHERE id_factura = $8', [dte, serie, emisor, receptor, monto, emision, "ingresada", id_factura], (err, result) => {
                if(err){
                    console.log(err)
                    res.json({status: 0, mensaje: "Error en la consulta"});
                }
                else{
                    res.json({status: 1, mensaje: "Factura ingresada"})
                }
            });    
        }
    })

}