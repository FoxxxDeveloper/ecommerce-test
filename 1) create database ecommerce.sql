CREATE DATABASE ECOMMERCE_WEB;

USE ECOMMERCE_WEB;

CREATE table SUCURSAL (		
IdSucursal int auto_increment,
Nombre varchar (60),
CUIT varchar (60),
Direccion varchar (60),
PRIMARY KEY (`IdSucursal`))
;

create table ROL(
IdRol int auto_increment, 
Descripcion varchar (50),
FechaRegistro datetime  DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`IdRol`)
);


create table USUARIO(
IdUsuario int auto_increment,
IdSucursal int,
IdRol int ,
Documento varchar(50),
NombreCompleto varchar (50),
Correo varchar(50),
Clave varchar(50),
Estado tinyint,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdUsuario`),
KEY `fkv_usuario_sucursal` (`IdSucursal`),
  CONSTRAINT `fkv_usuario_sucursal` FOREIGN KEY (`IdSucursal`) REFERENCES `SUCURSAL` (`IdSucursal`),
  KEY `fkv_usuario_rol` (`IdRol`),
  CONSTRAINT `fkv_usuario_rol` FOREIGN KEY (`IdRol`) REFERENCES `ROL` (`IdRol`)

)
;

create table PERMISO(
IdPermiso int auto_increment, 
IdUsuario int,
NombreMenu varchar (100),
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdPermiso`),
KEY `fkv_permiso_usuario` (`IdUsuario`),
  CONSTRAINT `fkv_permiso_usuario` FOREIGN KEY (`IdUsuario`) REFERENCES `USUARIO` (`IdUsuario`)

);


create table PROVEEDOR(
IdProveedor int auto_increment, 
Documento varchar (50),
RazonSocial varchar (50),
Correo varchar (50),
Telefono varchar (50),
Estado tinyint,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdProveedor`)
);


create table CLIENTE(
IdCliente int auto_increment, 
Documento varchar (50),
Clave varchar (50),
NombreCompleto varchar (50),
Correo varchar (50),
Telefono varchar (50),
Deuda decimal(10,2) default 0,
Estado tinyint,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdCliente`)
);

create table DIRECCION(
IdDireccion int auto_increment, 
IdCliente int ,
Provincia varchar(100),
Ciudad varchar(100),
CodigoPostal varchar(50),
Direccion varchar(100),
Estado tinyint,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdDireccion`),
KEY `fkv_direccion_cliente` (`IdCliente`),
  CONSTRAINT `fkv_direccion_cliente` FOREIGN KEY (`IdCliente`) REFERENCES `CLIENTE` (`IdCliente`)
)
;

create table CATEGORIA(
IdCategoria int auto_increment, 
Descripcion varchar (100),
Estado tinyint,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdCategoria`)
)
;


create table PRODUCTO(
IdProducto int auto_increment, 
Codigo varchar(50),
Nombre varchar(500),
Descripcion varchar(500),
Foto varchar(500),
IdCategoria int ,
PrecioCompra decimal(10,2) default 0,
PrecioVenta decimal(10,2) default 0,
Estado tinyint,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdProducto`),
KEY `fkv_producto_categoria` (`IdCategoria`),
  CONSTRAINT `fkv_producto_categoria` FOREIGN KEY (`IdCategoria`) REFERENCES `CATEGORIA` (`IdCategoria`)
)
;
create table RESENA(
IdResena int auto_increment,
IdProducto int, 
IdCliente int,
Titulo varchar(100),
Calificacion int,
Reseña varchar (500),
Estado ENUM('Pendiente', 'Rechazada', 'Aprobada') DEFAULT 'Pendiente',
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdResena`),
KEY `fkv_resena_producto` (`IdProducto`),
  CONSTRAINT `fkv_resena_producto` FOREIGN KEY (`IdProducto`) REFERENCES `PRODUCTO` (`IdProducto`),
  KEY `fkv_resena_cliente` (`IdCliente`),
  CONSTRAINT `fkv_resena_cliente` FOREIGN KEY (`IdCliente`) REFERENCES `CLIENTE` (`IdCliente`)
);

create TABLE COMPRA (
IdCompra int auto_increment,
IdSucursal int,
IdUsuario int ,
IdProveedor int,
TipoDocumento varchar(50),
Documento varchar(50),
MontoTotal decimal(10,2),
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdCompra`),
KEY `fkv_compra_usuario` (`IdUsuario`),
  CONSTRAINT `fkv_compra_usuario` FOREIGN KEY (`IdUsuario`) REFERENCES `USUARIO` (`IdUsuario`),
  KEY `fkv_compra_proveedor` (`IdProveedor`),
  CONSTRAINT `fkv_compra_proveedor` FOREIGN KEY (`IdProveedor`) REFERENCES `PROVEEDOR` (`IdProveedor`),
    KEY `fkv_compra_sucursal` (`IdSucursal`),
  CONSTRAINT `fkv_compra_sucursal` FOREIGN KEY (`IdSucursal`) REFERENCES `SUCURSAL` (`IdSucursal`)
)
;


create TABLE DETALLE_COMPRA (
IdDetalleCompra int auto_increment,
IdCompra int ,
IdProducto int ,
PrecioCompra decimal(10,2) default 0,
PrecioVenta decimal(10,2) default 0,
Cantidad decimal(10,2),
MontoTotal decimal(10,2),
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdDetalleCompra`),
KEY `fkv_detallecompra_compras` (`IdCompra`),
  CONSTRAINT `fkv_detallecompras_compras` FOREIGN KEY (`IdCompra`) REFERENCES `COMPRA` (`IdCompra`),
  KEY `fkv_detallecompra_producto` (`IdProducto`),
  CONSTRAINT `fkv_detallecompra_producto` FOREIGN KEY (`IdProducto`) REFERENCES `PRODUCTO` (`IdProducto`)
)
;
CREATE table PAQUETE (
IdPaquete int auto_increment,
Nombre varchar (60),
Descripcion varchar (60),
Precio decimal (10,2),
Estado tinyint,
PRIMARY KEY (`IdPaquete`)
);
create TABLE VENTA (
IdVenta int auto_increment,
IdSucursal int,
IdUsuario int,
IdCliente int ,
TipoDocumento varchar(50),
NumeroDocumento varchar(50),
MontoPago decimal(10,2),
MontoCambio decimal(10,2),
MontoTotal decimal(10,2),
MetodoPago varchar (50),
Estado tinyint,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdVenta`),
KEY `fkv_venta_usuario` (`IdUsuario`),
  CONSTRAINT `fkv_venta_usuario` FOREIGN KEY (`IdUsuario`) REFERENCES `USUARIO` (`IdUsuario`),
  KEY `fkv_venta_cliente` (`IdCliente`),
  CONSTRAINT `fkv_venta_cliente` FOREIGN KEY (`IdCliente`) REFERENCES `CLIENTE` (`IdCliente`),
    KEY `fkv_venta_sucursal` (`IdSucursal`),
  CONSTRAINT `fkv_venta_sucursal` FOREIGN KEY (`IdSucursal`) REFERENCES `SUCURSAL` (`IdSucursal`)
)
;

create TABLE ENTREGA (
IdEntrega int auto_increment,
IdVenta int,
IdSucursal int,
IdDireccion int,
TipoEntrega ENUM('Envio', 'Retiro en local'),
Estado tinyint,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdEntrega`),
KEY `fkv_entrega_venta` (`IdVenta`),
  CONSTRAINT `fkv_entrega_venta` FOREIGN KEY (`IdVenta`) REFERENCES `VENTA` (`IdVenta`),
  KEY `fkv_entrega_sucursal` (`IdSucursal`),
  CONSTRAINT `fkv_entrega_sucursal` FOREIGN KEY (`IdSucursal`) REFERENCES `SUCURSAL` (`IdSucursal`),
    KEY `fkv_entrega_direccion` (`IdDireccion`),
  CONSTRAINT `fkv_entrega_direccion` FOREIGN KEY (`IdDireccion`) REFERENCES `DIRECCION` (`IdDireccion`)
)
;

create TABLE DETALLE_VENTA (
IdDetalleVenta int auto_increment,
IdVenta int,
IdProducto int ,
IdPaquete INT NULL, 
PrecioVenta decimal(10,2),
Cantidad decimal(10,2),
SubTotal decimal(10,2),
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdDetalleVenta`),
KEY `fkv_detalleventa_venta` (`IdVenta`),
  CONSTRAINT `fkv_detalleventa_venta` FOREIGN KEY (`IdVenta`) REFERENCES `VENTA` (`IdVenta`),
  KEY `fkv_detalleventa_producto` (`IdProducto`),
  CONSTRAINT `fkv_detalleventa_producto` FOREIGN KEY (`IdProducto`) REFERENCES `PRODUCTO` (`IdProducto`),
  KEY `fk_detalle_venta_paquete` (`IdPaquete`),
  CONSTRAINT `fk_detalle_venta_paquete` FOREIGN KEY (`IdPaquete`) REFERENCES `PAQUETE` (`IdPaquete`)
)
;

CREATE table FAVORITO (
IdFavorito int auto_increment,
IdProducto int,
IdCliente int,
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdFavorito`),
 KEY `fkv_favorito_producto` (`IdProducto`),
  CONSTRAINT `fkv_favorito_producto` FOREIGN KEY (`IdProducto`) REFERENCES `PRODUCTO` (`IdProducto`),
    KEY `fkv_favorito_cliente` (`IdCliente`),
  CONSTRAINT `fkv_favorito_cliente` FOREIGN KEY (`IdCliente`) REFERENCES `CLIENTE` (`IdCliente`)
);

CREATE table STOCK (
IdStock int auto_increment,
IdProducto int,
IdSucursal int,
Cantidad decimal (10,2),
PRIMARY KEY (`IdStock`),
 KEY `fkv_stock_producto` (`IdProducto`),
  CONSTRAINT `fkv_stock_producto` FOREIGN KEY (`IdProducto`) REFERENCES `PRODUCTO` (`IdProducto`),
    KEY `fkv_stock_sucursal` (`IdSucursal`),
  CONSTRAINT `fkv_stock_sucursal` FOREIGN KEY (`IdSucursal`) REFERENCES `SUCURSAL` (`IdSucursal`)
);

CREATE table METODO_PAGO (
IdMetodoPago int auto_increment,
Descripcion varchar (60),
Porcentaje decimal (10,2),
PRIMARY KEY (`IdMetodoPago`))
;


CREATE table DETALLE_PAQUETE (
IdDetalle_Paquete int auto_increment,
IdPaquete int,
IdProducto int,
Cantidad decimal (10,2),
PRIMARY KEY (`IdDetalle_Paquete`),
 KEY `fkv_paquete_producto` (`IdProducto`),
  CONSTRAINT `fkv_paquete_producto` FOREIGN KEY (`IdProducto`) REFERENCES `PRODUCTO` (`IdProducto`),
    KEY `fkv_paquete_detalle` (`IdPaquete`),
  CONSTRAINT `fkv_paquete_detalle` FOREIGN KEY (`IdPaquete`) REFERENCES `PAQUETE` (`IdPaquete`)
);
-- DROP table IF EXISTS PAGO;
CREATE table PAGO (
IdPago int auto_increment,
IdUsuario int ,
IdCliente int,
Monto decimal (10,2),
MetodoPago varchar(30),
NumeroVenta varchar(30),
FechaRegistro datetime default CURRENT_TIMESTAMP,
PRIMARY KEY (`IdPago`),
KEY `fkv_pago_usuario` (`IdUsuario`),
  CONSTRAINT `fkv_pago_usuario` FOREIGN KEY (`IdUsuario`) REFERENCES `USUARIO` (`IdUsuario`),
  KEY `fkv_pago_cliente` (`IdCliente`),
  CONSTRAINT `fkv_pago_cliente` FOREIGN KEY (`IdCliente`) REFERENCES `CLIENTE` (`IdCliente`)

);

use ECOMMERCE_WEB;
select * from PRODUCTO;
update PRODUCTO set Descripcion = ' Producto de prueba para ver la descripcion que tanto muestra y ver donde corta la card ya que sino no sabemos donde la cortara xD jeje' where IdProducto = 2;
INSERT INTO RESENA (IdProducto, IdCliente, Titulo, Calificacion, Reseña, Estado, FechaRegistro) VALUES
(1, 1, 'Excelente teléfono', 5, 'El iPhone 15 es increíble, la cámara es impresionante y el diseño muy elegante.', 1, '2024-12-15 10:30:00'),
(1, 2, 'Buen equipo', 4.5, 'El iPhone 15 tiene un excelente rendimiento, aunque esperaba más batería.', 1, '2024-12-16 14:45:00'),
(2, 1, 'Interesante producto', 3, 'El producto de prueba es útil, pero podría ser mejor.', 1, '2024-12-14 11:20:00'),
(3, 2, 'Perfecto para profesionales', 5, 'El iPhone 16 Pro tiene un diseño increíble y un rendimiento espectacular.', 1, '2024-12-20 18:00:00'),
(4, 1, 'Gran calidad', 4, 'El Samsung S24 Ultra es un teléfono potente, aunque algo caro.', 1, '2024-12-19 17:00:00'),
(4, 2, 'Muy bueno', 4.8, 'La cámara del S24 Ultra es excepcional, lo recomiendo.', 1, '2024-12-20 19:00:00'),
(5, 1, 'Excelente notebook', 5, 'La Acer Nitro 5 es perfecta para gaming, su rendimiento es impecable.', 1, '2024-12-20 20:00:00'),
(5, 2, 'Buena relación calidad/precio', 4.5, 'La Acer Nitro 5 tiene un gran desempeño, pero podría ser más ligera.', 1, '2024-12-21 08:00:00');
