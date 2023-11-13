DROP TABLE facturas
DROP TABLE empresas
DROP TABLE categorias
DROP TABLE reportes
DROP TABLE mensajes
DROP TABLE usuarios

SELECT * FROM usuarios

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

INSERT INTO categorias(nombre, status) VALUES('Comida', 'disponible')

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

INSERT INTO empresas(nombre, nit, id_categoria, status) VALUES('Pendientes', 0, 1, 'vigente')

SELECT * FROM empresas

CREATE TABLE facturas(
	id_factura SERIAL NOT NULL,
	dte TEXT,
	serie VARCHAR(20),
	nit_emisor INTEGER,
	nit_receptor TEXT,
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

DELETE FROM facturas

DELETE FROM usuarios

SELECT * FROM facturas

update facturas set nit_receptor = 'CF' where id_factura = 8

INSERT INTO empresas

CREATE TABLE mensajes(
	id_mensaje SERIAL NOT NULL,
	id_usuario_from INTEGER NOT NULL,
	id_usuario_to INTEGER NOT NULL,
	accion VARCHAR(12) NOT NULL,
	tipo VARCHAR(10) NOT NULL,
	estado VARCHAR(10) NOT NULL,
	mensaje TEXT NOT NULL,
	FOREIGN KEY (id_usuario_from) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (id_usuario_to) REFERENCES usuarios(id_usuario),
	CHECK (accion IN ('ADD', 'DELETE') AND estado IN ('YES', 'NO', 'WAITING', 'OK') AND tipo IN ('bill', 'report', 'counter', 'client'))
);

CREATE TABLE reportes(
	id_reporte SERIAL NOT NULL,
	id_usuario INTEGER NOT NULL,
	archivo TEXT NOT NULL,
	fecha DATE NOT NULL,
	mensaje TEXT NOT NULL,
	estado VARCHAR(12) NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
	CHECK (estado IN ('disponible', 'eliminado'))
);