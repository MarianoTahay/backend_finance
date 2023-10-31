const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const now = new Date()

module.exports = (app) => {

    //Creamos el token con todos los cambios
    app.post('/token', (req, res) => {

        const {email} = req.body;

        let user = {
            id: 0,
            nombre: "",
            apellido: "",
            email: "",
            username: "",
            avatar: "",
            status: "",
            cuenta: "",
            fecha_regsitro: "",
            fecha_eliminacion: "",
            hora_inicio: 0,
            horas: 0,
            rol: "",
            id_contador: 0            
        }

        pool.query('SELECT id_usuario, nombre, apellido, email, username, avatar, status, cuenta, fecha_registro, fecha_eliminacion, hora_inicio, horas, rol, id_contador FROM usuarios WHERE email = $1', [email], (err, result) => {
            if(err){
                res.json({status: 0, mensaje: "Error en la consulta"})
            }
            else{
                user = result.rows[0];
                const token = jwt.sign(user, "profileAuth");

                pool.query('UPDATE usuarios SET jwt = $1 WHERE email = $2', [token, email], (err, result) => {
                    if(err){
                        res.json({status: 0, mensaje: "Token no pudo ser ingresado"})
                    }
                    else{
                        res.json({status: 1, mensaje: "Token creado", token: token})
                    }
                });
            }
        })

    })

    //Obtenemos la sesion actual
    app.post('/decodeToken', (req, res) => {

        const {token} = req.body;

        const payload = jwt.decode(token);
        console.log(payload);

        if(res){    
            res.json({status: 1, mensaje: "Usuario encontrado", values: payload});
        }
        else{
            res.json({status: 0, mensaje: "Porfavor inicie sesion"})
        }

    })

    //Iniciar sesion
    app.post('/login', (req, res) => {

        const {email, password} = req.body;
        
        if(email == "" && password == ""){
            res.json({status: 0, mensaje: "Complete el formulario"})
        }
        else{
            pool.query("SELECT id_usuario, nombre, apellido, email, username, avatar, status, cuenta, fecha_registro, fecha_eliminacion, hora_inicio, horas, rol, id_contador FROM usuarios WHERE email = $1 AND pass = $2", [email, password], (err, result) => {
                if(err){
                    res.json({status: 0, mensaje: "Usuario no registrado"})
                }
                else{

                    if(result.rows.length == 0){
                         res.json({status: 0, mensaje: "Usuario no registrado", error: err})
                    }
                    else{

                        res.json({status: 1, mensaje: "Bienvenido @" + result.rows[0].username, status: result.rows[0].status, cuenta: result.rows[0].cuenta});
                    }
                }
            })
        }

    })

    //Cambiamos el status de la cuenta del usuario
    app.post('/changeLogged', (req, res) => {

        const {type, email} = req.body;

        pool.query("UPDATE usuarios SET status = $1 WHERE email = $2", [type, email], (err, result) => {

            if(err){
                res.json({status: 0, mensaje: "No se pudo cambiar el status del usuario"})
            }
            else{
                res.json({status: 1, mensaje: "Status cambiado", values: type})
            }
        })


    })

    //Registrar usuario
    app.post('/register', (req, res) => {

        const {nombre, apellido, username, email, password} = req.body ;

        const fecha_registro = now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate();
        const hora_inicio = now.getHours() - 12;

        const usernameRegex = /^(?=.*[A-Z])(?=(?:.*[a-z]){2,})(?=.*\d).{6,12}$/;
        const emailRegex = /^\w+@\w+\.\w{2,}$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*[_$!&])(.{6,12})$/;

        if(nombre == "" || apellido == "" || username == "" || email == "" || password == ""){
            res.json({status: 0, mensaje: "Complete el formulario"})
        }
        else if(!emailRegex.test(email)){
            res.json({status: 0, mensaje: "Correo no valido"});
        }
        else if(!passwordRegex.test(password)){
            res.json({status: 0, mensaje: "Contraseña no valida"});
        }
        else if(!usernameRegex.test(username)){
            res.json({status: 0, mensaje: "Usuarion no valido"});
        }
        else{

            console.log("DATA: " + nombre + ", " + apellido + ", " + email + ", " + password + ", " + username + ", " + fecha_registro + ", " + hora_inicio)

            pool.query("INSERT INTO usuarios (nombre, apellido, email, pass, username, status, cuenta, fecha_registro, hora_inicio, horas, rol) VALUES($1, $2, $3, $4, $5, 'Nlogged', 'activa', $6, $7, 0, $8)", [nombre, apellido, email, password, username, fecha_registro, hora_inicio, "usuario"], (err, results) => {
                if(err){
                    res.json({status: 0, mensaje: "Intente de nuevo"})
                }
                else{
                    res.json({status: 1, mensaje: "Usuario registrado!"});
                }
            })
        }
    })

    //Obtener todos los usuarios para la data del admin
    app.post('/users-filter', (req, res) => {

        const {contador, username, email, facturas_min, facturas_max, total_min, total_max, orderBy, order} = req.body 

        usuario = "'%'";
        correo = "'%'";
        fac_min = "(SELECT MIN(x.monto) FROM (SELECT COUNT(monto) AS monto FROM facturas GROUP BY(username)) AS x)";
        fac_max = "(SELECT MAX(x.monto) FROM (SELECT COUNT(monto) AS monto FROM facturas GROUP BY(username)) AS x)";
        tot_min = "(SELECT MIN(monto) FROM facturas)";
        tot_max = "(SELECT MAX(monto) FROM facturas)";
        

        if(username != ""){
            usuario = "'" + username + "'";
        }

        if(email != ""){
            correo = "'" + email + "'";
        }

        if(facturas_min != ""){
            fac_min = facturas_min;
        }

        if(facturas_max != ""){
            fac_max = facturas_max;
        }
        
        if(total_min != ""){
            tot_min = total_min;
        }

        if(total_max != ""){
            tot_max = total_max;
        }

        consulta = "SELECT x.username, x.email, x.facturas, x.total FROM (SELECT U.username, U.email, COUNT(F.monto) AS Facturas, SUM(F.monto) AS Total FROM usuarios AS U, facturas AS F WHERE U.contador = $1 AND U.username = F.username AND U.username LIKE " + usuario + " AND U.email LIKE " + correo + " AND F.monto >=  " + tot_min + " AND F.monto <= " + tot_max + " GROUP BY(U.username)) AS x WHERE x.facturas >= " + fac_min + " AND x.facturas <= " + fac_max;

        if(orderBy != "" && order != ""){
            consulta = consulta + " ORDER BY " + "x." + orderBy + " " + order
        }

        pool.query(consulta, [contador], (err, results) => {
            if(err){
                res.json({status: 0, mensaje: "Error en la consulta"})
            }
            else if(contador == ""){
                res.json({status: 0, mensaje: "Error, no se ingreso un contador", values: results.rows});
            }
            else{
                res.json({status: 1, mensaje: "Se obtuvieron los usuarios", values: results.rows});
            }
        })
    })

    //Obtener todos los usuarios de la base de datos
    app.post('/getUsers', (req, res) => {

        const {id} = req.body;

        console.log(id)


        pool.query('SELECT * FROM usuarios WHERE id_usuario != $1', [id], (err, result) => {
            if(err){
                res.json({status: 0, mensaje: "Error en la consulta"});
            }
            else{
                res.json({status: 1, mensaje: "Usuarios retribuidos", values: result.rows})
            }
        })
    })

    //El usuario obtiene un contador
    app.post('/addContador', (req, res) => {

        const {id_contador, id_usuario} = req.body;

        pool.query('UPDATE  usuarios  SET id_contador  = $1, rol = $2 WHERE id_usuario = $3', [id_contador, "cliente", id_usuario], (err, result) => {
            if(err){
                res.json({status: 0, mensaje: "No se pudo agregar al contador"});
            }
            else{

                pool.query('UPDATE  usuarios  SET rol = $1 WHERE id_usuario = $2', ["contador", id_contador], (err, result) => {
                    if(err){
                        res.json({status: 0, mensaje: "No se pudo agregar al contador"});
                    }
                    else{
                        res.json({status: 1, mensaje: "Contador agragado", values: result.rows});
                    }
                })
            }
        })



    })

}