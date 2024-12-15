Agregue columna Foto en PRODUCTO
agregue columna Clave en CLIENTE
Agregue columna Estado en VENTA
Estados de una venta {0: Pendiente, 1:Aprobada , 2: Rechazada}

Agregué tabla DIRECCION
Agregué tabla reseña
Agregue tabla ENTREGA
Agregue tabla FAVORITO

-- PLANTEAR CUPONES DE DESCUENTO 
/* 

CREATE TABLE CUPON (
    IdCupon INT AUTO_INCREMENT,
    Codigo VARCHAR(50) UNIQUE,
    Descuento DECIMAL(5,2),
    FechaInicio DATETIME,
    FechaExpiracion DATETIME,
    Estado TINYINT,
    PRIMARY KEY (IdCupon)
);

*/


/* plantear historico de stock

CREATE TABLE HISTORICO_STOCK (
    IdHistoricoStock INT AUTO_INCREMENT,
    IdProducto INT,
    IdSucursal INT,
    CantidadCambio DECIMAL(10,2),
    TipoCambio ENUM('Venta', 'Devolución', 'Ajuste', 'Compra'),
    FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (IdHistoricoStock),
    KEY fkv_historico_stock_producto (IdProducto),
    CONSTRAINT fkv_historico_stock_producto FOREIGN KEY (IdProducto) REFERENCES PRODUCTO (IdProducto),
    KEY fkv_historico_stock_sucursal (IdSucursal),
    CONSTRAINT fkv_historico_stock_sucursal FOREIGN KEY (IdSucursal) REFERENCES SUCURSAL (IdSucursal)
);


*/
/*Plantear si hace falta una tabla contacto para dejar en la página*/ 