DROP TABLE facturas
DROP TABLE empresas
DROP TABLE categorias
DROP TABLE usuarios

SELECT * FROM usuarios

DELETE FROM usuarios WHERE nombre = 'Mariano'

ALTER SEQUENCE usuarios_id_usuario_seq RESTART WITH 1

SELECT U.username, U.contador, X.username FROM usuarios AS U, (SELECT username FROM usuarios WHERE email = 'marianotahay15@gmail.com' AND contrasena = 'Mariano_15') AS X WHERE contador=X.username

CREATE TABLE usuarios(
	id_usuario SERIAL NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	apellido VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL,
	pass TEXT NOT NULL,
	username VARCHAR(15) NOT NULL,
	avatar TEXT,
	status VARCHAR(10) NOT NULL,
	cuenta VARCHAR(13) NOT NULL,
	fecha_registro DATE NOT NULL,
	fecha_eliminacion DATE,
	hora_inicio INTEGER NOT NULL,
	horas INTEGER NOT NULL,
	rol VARCHAR(10) NOT NULL,
	jwt TEXT,
	id_contador INTEGER,
	CHECK (status IN ('logged', 'Nlogged') AND cuenta IN ('activa', 'Nactiva') AND rol IN ('usuario', 'cliente', 'contador')),
	PRIMARY KEY (id_usuario),
	FOREIGN KEY (id_contador) REFERENCES usuarios(id_usuario)
);

CREATE TABLE categorias(
	id_categoria SERIAL NOT NULL, 
	nombre VARCHAR(20) NOT NULL,
	status VARCHAR(11) NOT NULL,
	CHECK (status IN ('disponible', 'Ndisponible')),
	PRIMARY KEY(id_categoria)
);

CREATE TABLE empresas( 
	nombre VARCHAR(50) NOT NULL,
	nit INTEGER NOT NULL,
	logo TEXT,
	id_categoria INTEGER NOT NULL,
	status VARCHAR(8) NOT NULL,
	CHECK (status IN ('vigente', 'Nvigente')),
	PRIMARY KEY(nit),
	FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE facturas(
	id_factura SERIAL NOT NULL,
	dte INTEGER NOT NULL,
	serie VARCHAR(20) NOT NULL,
	nit_emisor INTEGER NOT NULL,
	nit_receptor INTEGER NOT NULL,
	monto INTEGER NOT NULL,
	fecha_emision DATE NOT NULL,
	id_usuario INTEGER NOT NULL,
	imagen TEXT NOT NULL,
	pdf TEXT,
	status VARCHAR(10),
	CHECK (status IN ('pendiente', 'ingresada')),
	PRIMARY KEY(dte, serie),
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (nit_emisor) REFERENCES empresas(nit) 
);

SELECT X.* FROM (SELECT * 
				FROM facturas 
				WHERE fecha_emision >= (SELECT MIN(fecha_emision) FROM facturas) AND
				fecha_emision <= (SELECT MAX(fecha_emision) FROM facturas) AND 
				monto >= (SELECT MIN(monto) FROM facturas) AND
				monto <= (SELECT MAX(monto) FROM  facturas) AND
				username LIKE '%' AND
				nit_emisor::text LIKE '%'
				ORDER BY monto ASC) AS X, usuarios AS U
				WHERE U.username = X.username AND U.contador = 'jamesdavis'

(SELECT username FROM usuarios WHERE contador = 'juan123')

SELECT x.username, x.email, x.facturas, x.total 
FROM (SELECT U.username, U.email, COUNT(F.monto) AS Facturas, SUM(F.monto) AS Total 
FROM usuarios AS U, facturas AS F 
WHERE U.contador = 'jamesdavis' AND 
U.username = F.username AND 
U.username LIKE '%' AND 
U.email LIKE '%' AND 
F.monto >=  (SELECT MIN(monto) FROM facturas) AND 
F.monto <= (SELECT MAX(monto) FROM facturas) 
GROUP BY(U.username)) AS x 
WHERE x.facturas >= (SELECT MIN(x.monto) FROM (SELECT COUNT(monto) AS monto FROM facturas GROUP BY(username)) AS x) AND 
x.facturas <= (SELECT MAX(x.monto) FROM (SELECT COUNT(monto) AS monto FROM facturas GROUP BY(username)) AS x) 
ORDER BY x.total DESC
