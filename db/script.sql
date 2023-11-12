DROP TABLE facturas
DROP TABLE empresas
DROP TABLE categorias
DROP TABLE usuarios
DROP TABLE solicitudes
DROP TABLE reportes

SELECT * FROM usuarios

SELECT * FROM facturas

DELETE FROM facturas

SELECT * FROM reportes

SELECT * FROM empresas

UPDATE facturas SET dte, serie, nit_emisor, nit_receptor, monto, fecha_emision, status WH

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

INSERT INTO categorias(nombre, status) VALUES('Facturas Pendientes', 'disponible')
SELECT * FROM categorias

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

INSERT INTO empresas(nombre, nit, id_categoria, status) VALUES('Facturas Pendientes', 0, 2, 'vigente')

CREATE TABLE facturas(
	id_factura SERIAL NOT NULL,
	dte INTEGER,
	serie VARCHAR(20),
	nit_emisor INTEGER,
	nit_receptor INTEGER,
	monto INTEGER,
	fecha_emision DATE,
	id_usuario INTEGER NOT NULL,
	imagen TEXT,
	pdf TEXT,
	status VARCHAR(10) NOT NULL,
	CHECK (status IN ('pendiente', 'ingresada', 'borrada')),
	PRIMARY KEY(dte, serie),
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (nit_emisor) REFERENCES empresas(nit) 
);

CREATE TABLE solicitudes(
	id_mensaje SERIAL NOT NULL,
	id_usuario_from INTEGER NOT NULL,
	mensaje VARCHAR(10) NOT NULL,
	estado VARCHAR(10) NOT NULL,
	id_usuario_to INTEGER NOT NULL,
	FOREIGN KEY (id_usuario_from) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (id_usuario_to) REFERENCES usuarios(id_usuario),
	CHECK (mensaje IN ('ADD', 'DELETE') AND estado IN ('YES', 'NO', 'WAITING'))
);

CREATE TABLE reportes(
	id_reporte SERIAL NOT NULL,
	id_usuario INTEGER NOT NULL,
	archivo TEXT NOT NULL,
	fecha DATE NOT NULL,
	estado VARCHAR(12) NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
	CHECK (estado IN ('disponible', 'eliminado'))
);












SELECT X.*, U.username FROM (SELECT * 
				FROM facturas 
				WHERE fecha_emision >= (SELECT MIN(fecha_emision) FROM facturas) AND
				fecha_emision <= (SELECT MAX(fecha_emision) FROM facturas) AND 
				monto >= (SELECT MIN(monto) FROM facturas) AND
				monto <= (SELECT MAX(monto) FROM  facturas) AND
				id_usuario::text LIKE '%' AND
				nit_emisor::text LIKE '%' AND
				nit_receptor::text LIKE '%' AND
				status LIKE 'ingresada'
				ORDER BY monto ASC) AS X, usuarios AS U
				WHERE U.id_usuario = X.id_usuario

SELECT x.avatar, x.id_usuario, x.username, x.email, x.facturas, x.total 
FROM (SELECT U.avatar, U.id_usuario, U.username, U.email, COUNT(F.monto) AS Facturas, SUM(F.monto) AS Total 
FROM usuarios AS U, facturas AS F 
WHERE U.id_contador::text LIKE '6' AND 
U.id_usuario = F.id_usuario AND 
U.id_usuario::text LIKE '%' AND 
U.email LIKE '%' AND 
F.monto >=  (SELECT MIN(monto) FROM facturas) AND 
F.monto <= (SELECT MAX(monto) FROM facturas) 
GROUP BY(U.avatar, U.id_usuario, U.username, U.email)) AS x 
WHERE x.facturas >= (SELECT MIN(x.monto) FROM (SELECT COUNT(monto) AS monto FROM facturas GROUP BY(id_usuario)) AS x) AND 
x.facturas <= (SELECT MAX(x.monto) FROM (SELECT COUNT(monto) AS monto FROM facturas GROUP BY(id_usuario)) AS x) 
ORDER BY x.total DESC




SELECT F.id_factura, F.id_usuario, F.imagen, F.pdf, F.dte, F.serie FROM (SELECT id_usuario FROM usuarios WHERE id_contador = 6) AS X, facturas AS F WHERE X.id_usuario = F.id_usuario AND F.status = 'pendiente'

SELECT id_factura, id_usuario, imagen, pdf FROM facturas WHERE id_usuario = 5 AND status = 'pendiente'
