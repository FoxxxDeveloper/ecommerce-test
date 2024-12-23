USE ECOMMERCE_WEB;
Insert into SUCURSAL (Nombre, CUIT, Direccion) values ('Nombre del negocio', 'CUIT', 'Direccion');
 insert into ROL (Descripcion) values ('ADMINISTRADOR'), ('CEO'),('EMPLEADO');
 Insert into USUARIO (IdSucursal,Documento, NombreCompleto, Correo, Clave, IdRol, Estado) values (1,'43226633', 'Pedro Alejandro Torres Salazar', 'Deoxysmu00@gmail.com','698465xd00','1', '1');
insert into PERMISO (IdUsuario, NombreMenu) values (1, 'menuusuario'), (1, 'menuconfiguracion'), (1, 'menuventas'), (1, 'menucompras'), (1, 'menuproveedores'), (1, 'menuclientes'), (1, 'menureportes');
Insert into CATEGORIA (Descripcion, Estado) values ('Gastos', 1);
insert into PROVEEDOR (Documento, RazonSocial,Correo,Telefono,Estado) values('Documento', 'RazonSocial', 'Correo', 'Telefono', 1);
insert into METODO_PAGO (Descripcion, Porcentaje) values ('Efectivo', 0),('Transferencia', 0),('Tarjeta Credito', 0),('Tarjeta Debito', 0),('Cuenta Corriente', 0);


/* TRIGGER PARA CREAR STOCK EN NUEVA SUCURSAL */
DELIMITER //

CREATE TRIGGER trg_AfterInsert_SUCURSAL
AFTER INSERT ON SUCURSAL
FOR EACH ROW
BEGIN
    INSERT INTO STOCK (IdProducto, IdSucursal, Cantidad)
    SELECT p.IdProducto, NEW.IdSucursal, 0
    FROM PRODUCTO p;
END //

DELIMITER ;

select * from DIRECCION;


/* --------------CREATE PROCEDURE PARA CRUD DIRECCION--------------*/
DROP PROCEDURE IF EXISTS SP_RegistrarDireccion;

DELIMITER //

CREATE PROCEDURE SP_RegistrarDireccion(
    IN p_IdCliente INT,
    IN p_Provincia VARCHAR(100),
    IN p_Ciudad VARCHAR(100),
    IN p_CodigoPostal VARCHAR(50),
    IN p_Direccion VARCHAR(100),
    IN p_Estado TINYINT,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Declarar las variables
    DECLARE direccion_count INT;

    -- Inicializar los valores de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si la dirección y ciudad ya están registradas para el cliente
    IF NOT EXISTS (SELECT 1 FROM DIRECCION 
                   WHERE IdCliente = p_IdCliente 
                     AND Direccion = p_Direccion 
                     AND Ciudad = p_Ciudad) THEN

        -- Contar cuántas direcciones tiene el cliente
        SELECT COUNT(*) INTO direccion_count
        FROM DIRECCION
        WHERE IdCliente = p_IdCliente;

        -- Si el cliente ya tiene 3 o más direcciones, eliminar las más antiguas
        IF direccion_count >= 3 THEN
            -- Eliminar la dirección más antigua
            DELETE FROM DIRECCION
            WHERE IdCliente = p_IdCliente
            ORDER BY FechaRegistro ASC
            LIMIT 1;
        END IF;

        -- Insertar la nueva dirección
        INSERT INTO DIRECCION (IdCliente, Provincia, Ciudad, CodigoPostal, Direccion, Estado, FechaRegistro)
        VALUES (p_IdCliente, p_Provincia, p_Ciudad, p_CodigoPostal, p_Direccion, p_Estado, NOW());
        
        -- Obtener el ID del nuevo registro
        SET p_Resultado = LAST_INSERT_ID();
        SET p_Mensaje = 'Dirección registrada correctamente.';
    ELSE
        -- Mensaje si la dirección ya existe para el cliente en esa ciudad
        SET p_Mensaje = 'La dirección ya está registrada para este cliente en la ciudad especificada.';
    END IF;
END //

DELIMITER ;



/* --------------CREATE PROCEDURE PARA CRUD CATEGORIA--------------*/
DROP PROCEDURE IF EXISTS SP_RegistrarCategoria;

DELIMITER //

CREATE PROCEDURE SP_RegistrarCategoria(
    IN p_Descripcion VARCHAR(50),
    IN p_Estado tinyint,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar los valores de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si la categoría ya existe
    IF NOT EXISTS (SELECT 1 FROM CATEGORIA WHERE Descripcion = p_Descripcion) THEN
        -- Insertar la nueva categoría
        INSERT INTO CATEGORIA (Descripcion, Estado) VALUES (p_Descripcion, p_Estado);
        
        -- Obtener el ID del nuevo registro
        SET p_Resultado = LAST_INSERT_ID();
    ELSE
        -- Mensaje si la categoría ya existe
        SET p_Mensaje = 'No se puede repetir la descripción de una categoría.';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_EditarCategoria;

DELIMITER //

CREATE PROCEDURE SP_EditarCategoria(
    IN p_IdCategoria INT,
    IN p_Descripcion VARCHAR(50),
    IN p_Estado TINYINT,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar el valor de resultado y el mensaje
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si la descripción ya existe en otra categoría
    IF NOT EXISTS (
        SELECT 1
        FROM CATEGORIA
        WHERE Descripcion = p_Descripcion
          AND IdCategoria != p_IdCategoria
    ) THEN
        -- Actualizar la categoría
        UPDATE CATEGORIA
        SET Descripcion = p_Descripcion,
            Estado = p_Estado
        WHERE IdCategoria = p_IdCategoria;

        -- Establecer el resultado en éxito
        SET p_Resultado = 1;
        SET p_Mensaje = 'Categoría actualizada correctamente.';
    ELSE
        -- Si la descripción ya existe, devolver un mensaje de error
        SET p_Mensaje = 'No se puede repetir la descripción de una categoría.';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_EliminarCategoria;

DELIMITER //

CREATE PROCEDURE SP_EliminarCategoria(
    IN p_IdCategoria INT,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar los valores de salida
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Verificar si la categoría está relacionada con algún producto
    IF NOT EXISTS (
        SELECT 1 
        FROM CATEGORIA c
        INNER JOIN PRODUCTO p ON p.IdCategoria = c.IdCategoria
        WHERE c.IdCategoria = p_IdCategoria
    ) THEN
        -- Eliminar la categoría
        DELETE FROM CATEGORIA WHERE IdCategoria = p_IdCategoria;
    ELSE
        -- Si la categoría está relacionada, devolver un mensaje de error
        SET p_Resultado = 0;
        SET p_Mensaje = 'La categoría se encuentra relacionada a un producto';
    END IF;
END //

DELIMITER ;



/* --------------CREATE PROCEDURE PARA CRUD CLIENTE--------------*/

DROP PROCEDURE IF EXISTS SP_RegistrarCliente;

DELIMITER //

CREATE PROCEDURE SP_RegistrarCliente(
    IN p_Documento VARCHAR(50),
    IN p_Clave VARCHAR(50),
    IN p_NombreCompleto VARCHAR(50),
    IN p_Correo VARCHAR(50),
    IN p_Telefono VARCHAR(50),
    IN p_Deuda DECIMAL(10,2),
    IN p_Estado tinyint,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar los valores de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si el documento ya existe en la tabla CLIENTE
    IF NOT EXISTS (SELECT 1 FROM CLIENTE WHERE Documento = p_Documento) THEN
        -- Insertar el nuevo cliente en la tabla
        INSERT INTO CLIENTE (Documento, Clave,NombreCompleto, Correo, Telefono, Deuda, Estado) 
        VALUES (p_Documento, p_Clave,p_NombreCompleto, p_Correo, p_Telefono, p_Deuda, p_Estado);
        
        -- Obtener el ID del cliente insertado
        SET p_Resultado = LAST_INSERT_ID();
    ELSE
        -- Si el documento ya existe, devolver un mensaje de error
        SET p_Mensaje = 'El número de documento ya existe';
    END IF;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS SP_ModificarCliente;

DELIMITER //

CREATE PROCEDURE SP_ModificarCliente(
    IN p_IdCliente INT,
    IN p_Documento VARCHAR(50),
	IN p_Clave VARCHAR(50),
    IN p_NombreCompleto VARCHAR(50),
    IN p_Correo VARCHAR(50),
    IN p_Telefono VARCHAR(50),
    IN p_Deuda DECIMAL(10,2),
    IN p_Estado tinyint,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar los valores de salida
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Verificar si el documento ya existe para otro cliente
    IF NOT EXISTS (SELECT 1 FROM CLIENTE WHERE Documento = p_Documento AND IdCliente != p_IdCliente) THEN
        -- Actualizar el cliente en la tabla
        UPDATE CLIENTE SET
            Documento = p_Documento,
            Clave = p_Clave,
            NombreCompleto = p_NombreCompleto,
            Correo = p_Correo,
            Telefono = p_Telefono,
            Deuda = p_Deuda,
            Estado = p_Estado
        WHERE IdCliente = p_IdCliente;
    ELSE
        -- Si el documento ya existe para otro cliente, devolver un mensaje de error
        SET p_Resultado = 0;
        SET p_Mensaje = 'El número de documento ya existe';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_EliminarPago;

DELIMITER //

CREATE PROCEDURE SP_EliminarPago(
    IN p_IdPago INT,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_IdCliente INT;
    DECLARE v_Monto DECIMAL(10,2);

    -- Inicializar el valor de Resultado
    SET p_Resultado = 1;

    -- Verificar si el pago existe y obtener información del cliente, asegurando que se obtiene solo una fila
    SELECT IdCliente, Monto INTO v_IdCliente, v_Monto
    FROM PAGO
    WHERE IdPago = p_IdPago
    LIMIT 1;

    -- Si no se encuentra el pago, asignar error
    IF v_IdCliente IS NULL THEN
        SET p_Resultado = 0;
        SET p_Mensaje = 'El pago especificado no existe.';
    ELSE
        -- Iniciar transacción
        START TRANSACTION;

        -- Aumentar la deuda del cliente
        UPDATE CLIENTE
        SET Deuda = Deuda + v_Monto
        WHERE IdCliente = v_IdCliente;

        -- Eliminar el pago
        DELETE FROM PAGO
        WHERE IdPago = p_IdPago;

        -- Confirmar transacción
        COMMIT;

        -- Mensaje de éxito
        SET p_Mensaje = 'Pago eliminado y deuda actualizada correctamente.';
    END IF;
END //

DELIMITER ;



DROP PROCEDURE IF EXISTS SP_BajarDeuda;

DELIMITER //

CREATE PROCEDURE SP_BajarDeuda(
    IN p_IdCliente INT,
    IN p_Deuda DECIMAL(10,2),
    IN p_IdUsuario INT,
    IN p_MetodoPago VARCHAR(30),
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_Resultado = 0;
        SET p_Mensaje = 'Error al bajar la deuda y registrar el pago.';
    END;

    SET p_Resultado = 1;

    IF NOT EXISTS (SELECT * FROM CLIENTE WHERE IdCliente = p_IdCliente) THEN
        SET p_Resultado = 0;
        SET p_Mensaje = 'El cliente especificado no existe.';
    ELSE
        START TRANSACTION;
        
        UPDATE CLIENTE
        SET Deuda = Deuda - p_Deuda
        WHERE IdCliente = p_IdCliente;

        INSERT INTO PAGO (IdUsuario, IdCliente, Monto, MetodoPago, NumeroVenta)
        VALUES (p_IdUsuario, p_IdCliente, p_Deuda, p_MetodoPago, '');

        COMMIT;
        
        SET p_Mensaje = 'Deuda reducida y pago registrado exitosamente.';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_AumentarDeuda;

DELIMITER //

CREATE PROCEDURE SP_AumentarDeuda(
    IN p_IdCliente INT,
    IN p_IdUsuario INT,
    IN p_Deuda DECIMAL(10,2),
    OUT Resultado INT,
    OUT Mensaje VARCHAR(500)
)
BEGIN
    -- Declarar variables al inicio
    DECLARE NumeroVenta VARCHAR(60);

    -- Inicializar el valor de Resultado
    SET Resultado = 1;
    
    -- Verificar si el cliente existe
    IF NOT EXISTS (SELECT 1 FROM CLIENTE WHERE IdCliente = p_IdCliente) THEN
        SET Resultado = 0;
        SET Mensaje = 'El cliente especificado no existe.';
    ELSE
        -- Actualizar la deuda del cliente
        UPDATE CLIENTE
        SET Deuda = Deuda + p_Deuda
        WHERE IdCliente = p_IdCliente;

        -- Obtener el último NumeroVenta registrado
        SELECT NumeroDocumento
        INTO NumeroVenta
        FROM VENTA
        ORDER BY FechaRegistro DESC
        LIMIT 1;

        -- Insertar un registro en la tabla PAGO
        INSERT INTO PAGO (IdUsuario, IdCliente, Monto, MetodoPago, NumeroVenta)
        VALUES (p_IdUsuario, p_IdCliente, p_Deuda, '', NumeroVenta);

        -- Mensaje de éxito
        SET Mensaje = 'Deuda aumentada y pago registrado exitosamente.';
    END IF;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS SP_ELIMINARCLIENTE;

DELIMITER //

CREATE PROCEDURE SP_ELIMINARCLIENTE(
    IN p_IdCliente INT,
    OUT p_Respuesta BOOLEAN,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Declaración de variables
    DECLARE p_PasoReglas BOOLEAN DEFAULT TRUE;

    -- Inicializar variables de salida
    SET p_Respuesta = FALSE;
    SET p_Mensaje = '';

    -- Verificar si el cliente está relacionado con alguna venta
    IF EXISTS (SELECT 1 
               FROM VENTA V
               WHERE V.IdCliente = p_IdCliente) THEN
        SET p_PasoReglas = FALSE;
        SET p_Mensaje = CONCAT(p_Mensaje, 'No se puede eliminar porque el cliente se encuentra relacionado a una venta.\n');
    END IF;

    -- Eliminar cliente si no está relacionado con ventas
    IF p_PasoReglas THEN
        START TRANSACTION;
        DELETE FROM CLIENTE WHERE IdCliente = p_IdCliente;
        COMMIT;
        SET p_Respuesta = TRUE;
        SET p_Mensaje = 'Cliente eliminado exitosamente.';
    END IF;

END //

DELIMITER ;


/* --------------CREATE PROCEDURE PARA CRUD COMPRA--------------*/
DROP PROCEDURE IF EXISTS sp_RegistrarCompra;

DELIMITER //

CREATE PROCEDURE sp_RegistrarCompra(
    IN p_IdUsuario INT,
    IN p_IdProveedor INT,
    IN p_TipoDocumento VARCHAR(50),
    IN p_MontoTotal DECIMAL(10,2),
    IN p_IdSucursal INT,
    IN p_DetalleCompra JSON,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_IdCompra INT;
    DECLARE v_NumeroDocumento VARCHAR(50);

    -- Manejo de errores
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Resultado = 0;
        SET p_Mensaje = 'Error en el procedimiento.';
        ROLLBACK;
    END;

    -- Inicialización de variables
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Inicia la transacción
    START TRANSACTION;

    -- Insertar en la tabla COMPRA sin NumeroDocumento
    INSERT INTO COMPRA (IdUsuario, IdProveedor, TipoDocumento, Documento, IdSucursal, MontoTotal)
    VALUES (p_IdUsuario, p_IdProveedor, p_TipoDocumento, NULL, p_IdSucursal, p_MontoTotal);

    -- Obtener el IdCompra recién insertado
    SET v_IdCompra = LAST_INSERT_ID();

    -- Generar el NumeroDocumento basado en IdCompra
    SET v_NumeroDocumento = LPAD(v_IdCompra, 9, '0');

    -- Actualizar el Documento en la tabla COMPRA
    UPDATE COMPRA
    SET Documento = v_NumeroDocumento
    WHERE IdCompra = v_IdCompra;

    -- Insertar en la tabla DETALLE_COMPRA
    INSERT INTO DETALLE_COMPRA (IdCompra, IdProducto, PrecioCompra, PrecioVenta, Cantidad, MontoTotal)
    SELECT 
        v_IdCompra,
        JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.IdProducto')) AS IdProducto,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.PrecioCompra')) AS DECIMAL(10,2)) AS PrecioCompra,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.PrecioVenta')) AS DECIMAL(10,2)) AS PrecioVenta,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.Cantidad')) AS DECIMAL(10,2)) AS Cantidad,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.MontoTotal')) AS DECIMAL(10,2)) AS MontoTotal
    FROM JSON_TABLE(p_DetalleCompra, '$[*]' COLUMNS (value JSON PATH '$')) AS d;

    -- Actualizar el stock
    UPDATE STOCK s
    JOIN (
        SELECT 
            JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.IdProducto')) AS IdProducto,
            CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.Cantidad')) AS DECIMAL(10,2)) AS Cantidad
        FROM JSON_TABLE(p_DetalleCompra, '$[*]' COLUMNS (value JSON PATH '$')) AS d
    ) dc ON s.IdProducto = dc.IdProducto
    SET s.Cantidad = s.Cantidad + dc.Cantidad
    WHERE s.IdSucursal = p_IdSucursal;

    -- Actualizar los precios de compra y venta de los productos
    UPDATE PRODUCTO p
    JOIN (
        SELECT 
            JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.IdProducto')) AS IdProducto,
            CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.PrecioCompra')) AS DECIMAL(10,2)) AS PrecioCompra,
            CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.PrecioVenta')) AS DECIMAL(10,2)) AS PrecioVenta
        FROM JSON_TABLE(p_DetalleCompra, '$[*]' COLUMNS (value JSON PATH '$')) AS d
    ) dc ON p.IdProducto = dc.IdProducto
    SET p.PrecioCompra = dc.PrecioCompra,
        p.PrecioVenta = dc.PrecioVenta;

    -- Confirma la transacción
    COMMIT;

    -- Retorna el resultado
    SET p_Resultado = 1;
    SET p_Mensaje = 'Compra registrada correctamente.';
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS SP_EliminarCompra;

DELIMITER //

CREATE PROCEDURE SP_EliminarCompra(
    IN p_IdCompra INT,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_IdSucursal INT;

    -- Manejar excepciones para SQLEXCEPTION
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Resultado = 0;
        SET p_Mensaje = 'Error al eliminar la compra.';
        ROLLBACK;
    END;

    -- Iniciar la transacción
    START TRANSACTION;

    -- Obtener la sucursal de la compra
    SELECT IdSucursal INTO v_IdSucursal FROM COMPRA WHERE IdCompra = p_IdCompra;

    -- Restar las cantidades del stock correspondientes a la compra
    UPDATE STOCK s
    JOIN DETALLE_COMPRA dc ON s.IdProducto = dc.IdProducto
    SET s.Cantidad = s.Cantidad - dc.Cantidad
    WHERE dc.IdCompra = p_IdCompra
      AND s.IdSucursal = v_IdSucursal;

    -- Eliminar los detalles de la compra
    DELETE FROM DETALLE_COMPRA WHERE IdCompra = p_IdCompra;

    -- Eliminar la compra
    DELETE FROM COMPRA WHERE IdCompra = p_IdCompra;

    -- Confirmar la transacción
    COMMIT;

    -- Si todo va bien, devolver éxito
    SET p_Resultado = 1;
    SET p_Mensaje = 'Compra eliminada exitosamente.';
END //

DELIMITER ;

/* --------------CREATE PROCEDURE PARA CRUD METODO_PAGO--------------*/
DROP PROCEDURE IF EXISTS SP_RegistrarMetodoPago;

DELIMITER //

CREATE PROCEDURE SP_RegistrarMetodoPago(
    IN p_Descripcion VARCHAR(50),
    IN p_Porcentaje DECIMAL(10,3),
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_Count INT;

    -- Inicializar valores de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si ya existe un método de pago con la misma descripción
    SELECT COUNT(*) INTO v_Count
    FROM METODO_PAGO
    WHERE Descripcion = p_Descripcion;

    IF v_Count = 0 THEN
        -- Insertar nuevo método de pago
        INSERT INTO METODO_PAGO (Descripcion, Porcentaje)
        VALUES (p_Descripcion, p_Porcentaje);

        -- Confirmar que la inserción fue exitosa
        IF ROW_COUNT() > 0 THEN
            SET p_Resultado = LAST_INSERT_ID();  -- Obtener el ID insertado
            SET p_Mensaje = 'Método de pago registrado con éxito';
        ELSE
            SET p_Mensaje = 'Error al registrar el método de pago.';
        END IF;
    ELSE
        SET p_Mensaje = 'No se puede repetir la descripción de un método de pago';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_EditarMetodoPago;

DELIMITER //

CREATE PROCEDURE SP_EditarMetodoPago(
    IN p_IdMetodoPago INT,
    IN p_Descripcion VARCHAR(50),
    IN p_Porcentaje DECIMAL(10,3),
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_Count INT;

    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Verificar si existe otro método de pago con la misma descripción
    SELECT COUNT(*) INTO v_Count
    FROM METODO_PAGO
    WHERE Descripcion = p_Descripcion
    AND IdMetodoPago != p_IdMetodoPago;

    IF v_Count = 0 THEN
        -- Actualizar el método de pago
        UPDATE METODO_PAGO
        SET Descripcion = p_Descripcion,
            Porcentaje = p_Porcentaje
        WHERE IdMetodoPago = p_IdMetodoPago;
    ELSE
        SET p_Resultado = 0;
        SET p_Mensaje = 'No se puede repetir la descripción de un método de pago';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_EliminarMetodoPago;

DELIMITER //

CREATE PROCEDURE SP_EliminarMetodoPago(
    IN p_IdMetodoPago INT,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Eliminar el método de pago
    DELETE FROM METODO_PAGO
    WHERE IdMetodoPago = p_IdMetodoPago;

    -- Verificar si se eliminó algún registro
    IF ROW_COUNT() = 0 THEN
        SET p_Resultado = 0;
        SET p_Mensaje = 'El método de pago no existe o ya ha sido eliminado';
    END IF;
END //

DELIMITER ;

/* --------------CREATE PROCEDURE PARA CRUD PAQUETE--------------*/
DROP PROCEDURE IF EXISTS sp_RegistrarPaquete;

DELIMITER //

CREATE PROCEDURE sp_RegistrarPaquete(
    IN p_Nombre VARCHAR(60),
    IN p_Descripcion VARCHAR(60),
    IN p_Precio DECIMAL(10,2),
    IN p_DetallePaquete JSON,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(1000)
)
BEGIN
    DECLARE v_IdPaquete INT;
    DECLARE v_IdProducto INT;
    DECLARE v_CantidadProducto DECIMAL(10,2);
    DECLARE done INT DEFAULT 0;

    -- Declaración de cursor para iterar sobre el JSON (debe ir antes del HANDLER)
    DECLARE cur CURSOR FOR 
        SELECT 
            CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.IdProducto')) AS UNSIGNED) AS IdProducto,
            CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.Cantidad')) AS DECIMAL(10,2)) AS CantidadProducto
        FROM JSON_TABLE(p_DetallePaquete, '$[*]' COLUMNS (value JSON PATH '$')) AS d;

    -- Manejo de errores con EXIT HANDLER
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_Resultado = 0;
        SET p_Mensaje = 'Error al registrar el paquete.';
    END;

    -- Manejo de finalización del cursor
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- Inicializar variables de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Comenzar la transacción
    START TRANSACTION;

    -- Insertar en la tabla PAQUETE
    INSERT INTO PAQUETE (Nombre, Descripcion, Precio, Estado)
    VALUES (p_Nombre, p_Descripcion, p_Precio, 1);

    -- Obtener el ID del nuevo paquete
    SET v_IdPaquete = LAST_INSERT_ID();

    -- Verificar si se obtuvo un ID válido
    IF v_IdPaquete > 0 THEN
        -- Iterar sobre cada item en el detalle del paquete
        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO v_IdProducto, v_CantidadProducto;
            IF done THEN
                LEAVE read_loop;
            END IF;

            -- Insertar en la tabla DETALLE_PAQUETE
            INSERT INTO DETALLE_PAQUETE (IdPaquete, IdProducto, Cantidad)
            VALUES (v_IdPaquete, v_IdProducto, v_CantidadProducto);

        END LOOP;
        CLOSE cur;

        -- Confirmar la transacción
        COMMIT;
        SET p_Resultado = 1;
        SET p_Mensaje = CONCAT('Paquete registrado con éxito con Id: ', v_IdPaquete);
    ELSE
        -- Error al insertar el paquete
        ROLLBACK;
        SET p_Mensaje = 'Error al registrar el paquete.';
    END IF;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS sp_EditarPaquete;

DELIMITER //

CREATE PROCEDURE sp_EditarPaquete(
    IN p_IdPaquete INT,
    IN p_Nombre VARCHAR(100),
    IN p_Descripcion VARCHAR(255),
    IN p_Precio DECIMAL(10, 2),
    IN p_DetallePaquete JSON, -- El detalle del paquete en formato JSON
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Declarar variables
    DECLARE v_Index INT DEFAULT 0;
    DECLARE v_ProductoId INT;
    DECLARE v_Cantidad DECIMAL(10, 2);
    DECLARE v_JSONLength INT;

    -- Inicializar variables de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si el paquete existe
    IF EXISTS (SELECT 1 FROM Paquete WHERE IdPaquete = p_IdPaquete) THEN
        -- Actualizar los datos del paquete
        UPDATE Paquete
        SET
            Nombre = p_Nombre,
            Descripcion = p_Descripcion,
            Precio = p_Precio
        WHERE IdPaquete = p_IdPaquete;
        
        -- Eliminar el detalle existente del paquete
        DELETE FROM Detalle_Paquete WHERE IdPaquete = p_IdPaquete;

        -- Obtener la longitud del arreglo JSON
        SET v_JSONLength = JSON_LENGTH(p_DetallePaquete);

        -- Bucle para recorrer el JSON y extraer los detalles
        WHILE v_Index < v_JSONLength DO
            -- Extraer los valores de cada producto y cantidad desde el JSON
            SET v_ProductoId = JSON_UNQUOTE(JSON_EXTRACT(p_DetallePaquete, CONCAT('$[', v_Index, '].IdProducto')));
            SET v_Cantidad = JSON_UNQUOTE(JSON_EXTRACT(p_DetallePaquete, CONCAT('$[', v_Index, '].Cantidad')));

            -- Insertar el nuevo detalle del paquete
            INSERT INTO Detalle_Paquete (IdPaquete, IdProducto, Cantidad)
            VALUES (p_IdPaquete, v_ProductoId, v_Cantidad);

            -- Incrementar el índice
            SET v_Index = v_Index + 1;
        END WHILE;

        -- Indicar éxito
        SET p_Resultado = 1;
        SET p_Mensaje = 'Paquete modificado exitosamente.';
    ELSE
        -- Mensaje si el paquete no existe
        SET p_Mensaje = 'El paquete no existe.';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_EliminarPaquete;

DELIMITER //

CREATE PROCEDURE SP_EliminarPaquete(
    IN p_IdPaquete INT,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar variables de salida
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Iniciar una transacción para asegurarse de que ambas operaciones (eliminación de detalles y paquete) se realicen correctamente
    START TRANSACTION;
    
    -- Eliminar los detalles asociados al paquete
    DELETE FROM Detalle_Paquete WHERE IdPaquete = p_IdPaquete;

    -- Eliminar el paquete
    DELETE FROM Paquete WHERE IdPaquete = p_IdPaquete;

    -- Verificar si se eliminó algún registro de la tabla Paquete
    IF ROW_COUNT() = 0 THEN
        -- Si no se eliminó ningún registro, deshacer la transacción
        ROLLBACK;
        SET p_Resultado = 0;
        SET p_Mensaje = 'El paquete no existe o ya ha sido eliminado.';
    ELSE
        -- Si se eliminó correctamente, confirmar la transacción
        COMMIT;
        SET p_Mensaje = 'Paquete eliminado exitosamente.';
    END IF;
END //

DELIMITER ;

/* --------------CREATE PROCEDURE PARA CRUD PRODUCTO--------------*/


DROP PROCEDURE IF EXISTS SP_RegistrarProducto;

DELIMITER //

CREATE PROCEDURE SP_RegistrarProducto(
    IN p_Codigo VARCHAR(20),
    IN p_Nombre VARCHAR(500),
    IN p_Descripcion VARCHAR(500),
	IN p_Foto VARCHAR(500),
    IN p_PrecioCompra DECIMAL(10,2),
    IN p_PrecioVenta DECIMAL(10,2),
    IN p_Stock INT,
    IN p_IdSucursal INT,
    IN p_IdCategoria INT,
    IN p_Estado TINYINT,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_IdProducto INT;

    -- Inicializar variables de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si el producto ya existe
    IF NOT EXISTS (SELECT 1 FROM PRODUCTO WHERE Codigo = p_Codigo) THEN
        -- Insertar el nuevo producto
        INSERT INTO PRODUCTO (Codigo, Nombre, Descripcion, Foto,PrecioCompra, PrecioVenta, IdCategoria, Estado)
        VALUES (p_Codigo, p_Nombre, p_Descripcion, p_Foto,p_PrecioCompra, p_PrecioVenta, p_IdCategoria, p_Estado);

        -- Obtener el ID del nuevo producto
        SET v_IdProducto = LAST_INSERT_ID();

        -- Verificar si se obtuvo un ID válido
        IF v_IdProducto > 0 THEN
            -- Crear stock para todas las sucursales
            INSERT INTO STOCK (IdProducto, IdSucursal, Cantidad)
            SELECT v_IdProducto, IdSucursal, 
                   CASE 
                       WHEN IdSucursal = p_IdSucursal THEN p_Stock 
                       ELSE 0 
                   END
            FROM SUCURSAL;

            -- Establecer resultado exitoso
            SET p_Resultado = 1;
            SET p_Mensaje = 'Producto registrado correctamente.';
        ELSE
            -- Error al insertar el producto
            SET p_Mensaje = 'Error al registrar el producto.';
        END IF;
    ELSE
        -- Producto ya existe
        SET p_Mensaje = 'Ya existe un producto con el mismo código.';
    END IF;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS SP_ModificarProducto;

DELIMITER //

CREATE PROCEDURE SP_ModificarProducto(
    IN p_IdProducto INT,
    IN p_IdSucursal INT,
    IN p_Codigo VARCHAR(20),
    IN p_Nombre VARCHAR(500),
    IN p_Descripcion VARCHAR(500),
    IN p_Foto VARCHAR(500),
    IN p_PrecioCompra DECIMAL(10,2),
    IN p_PrecioVenta DECIMAL(10,2),
    IN p_Cantidad INT,
    IN p_IdCategoria INT,
    IN p_Estado tinyint,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar valores de salida
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Verificar si el código del producto ya existe para otro producto
    IF NOT EXISTS (SELECT 1 FROM PRODUCTO WHERE Codigo = p_Codigo AND IdProducto != p_IdProducto) THEN
        -- Actualizar el producto en la tabla
        UPDATE PRODUCTO
        SET
            Codigo = p_Codigo,
            Nombre = p_Nombre,
            Descripcion = p_Descripcion,
            Foto = p_Foto,
            PrecioCompra = p_PrecioCompra,
            PrecioVenta = p_PrecioVenta,
            IdCategoria = p_IdCategoria,
            Estado = p_Estado
        WHERE IdProducto = p_IdProducto;

        -- Verificar si se actualizó el producto
        IF ROW_COUNT() > 0 THEN
            -- Verificar si el stock ya existe para la sucursal
            IF EXISTS (SELECT 1 FROM STOCK WHERE IdProducto = p_IdProducto AND IdSucursal = p_IdSucursal) THEN
                -- Actualizar la cantidad en stock
                UPDATE STOCK
                SET Cantidad = p_Cantidad
                WHERE IdProducto = p_IdProducto AND IdSucursal = p_IdSucursal;
            ELSE
                -- Insertar nuevo registro de stock si no existe
                INSERT INTO STOCK (IdProducto, IdSucursal, Cantidad)
                VALUES (p_IdProducto, p_IdSucursal, p_Cantidad);
            END IF;
        END IF;
    ELSE
        -- Si el código ya existe para otro producto, devolver un mensaje de error
        SET p_Resultado = 0;
        SET p_Mensaje = 'Ya existe un producto con el mismo código';
    END IF;
END //

DELIMITER ;



 /* CONTROL MASIVO DE PRODUCTOS */
 
DROP PROCEDURE IF EXISTS SP_InsertarProductos;

DELIMITER //

CREATE PROCEDURE SP_InsertarProductos(
    IN productosJSON JSON,
    IN p_IdCategoria INT,
    IN p_IdSucursal INT,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Establecer el mensaje de error
        SET p_Resultado = -1;
        SET p_Mensaje = 'Error durante la operación';
        ROLLBACK;
        -- Eliminar la tabla temporal si hay un error
        DROP TEMPORARY TABLE IF EXISTS TempProductos;
    END;

    -- Inicializar variables de resultado
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Crear una tabla temporal para almacenar los datos del JSON
    CREATE TEMPORARY TABLE TempProductos (
        Codigo VARCHAR(20),
        Nombre VARCHAR(500),
        Descripcion VARCHAR(500),
        PrecioCompra DECIMAL(10,2),
        PrecioVenta DECIMAL(10,2),
        Stock INT,
        IdSucursal INT,
        Id_categoria INT,
        Estado INT
    );

    -- Insertar datos del JSON en la tabla temporal
    INSERT INTO TempProductos (Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, Stock, IdSucursal, Id_categoria, Estado)
    SELECT Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, Stock, p_IdSucursal AS IdSucursal, p_IdCategoria AS Id_categoria, 1 AS Estado
    FROM JSON_TABLE(productosJSON, '$[*]' 
        COLUMNS (
            Codigo VARCHAR(20) PATH '$.Codigo',
            Nombre VARCHAR(500) PATH '$.Nombre',
            Descripcion VARCHAR(500) PATH '$.Descripcion',
            PrecioCompra DECIMAL(10,2) PATH '$.PrecioCompra',
            PrecioVenta DECIMAL(10,2) PATH '$.PrecioVenta',
            Stock INT PATH '$.Stock'
        )
    ) AS productos;

    START TRANSACTION;

    -- Insertar nuevos productos
    INSERT INTO PRODUCTO (Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, IdCategoria, Estado)
    SELECT 
        t.Codigo, 
        t.Nombre, 
        t.Descripcion, 
        t.PrecioCompra, 
        t.PrecioVenta, 
        t.Id_categoria, 
        t.Estado
    FROM TempProductos t
    LEFT JOIN PRODUCTO p ON t.Codigo = p.Codigo
    WHERE p.IdProducto IS NULL;

    -- Obtener el IdProducto de todos los productos en la tabla temporal
    CREATE TEMPORARY TABLE TempProductIds AS
    SELECT 
        t.Codigo,
        p.IdProducto
    FROM TempProductos t
    JOIN PRODUCTO p ON t.Codigo = p.Codigo;

    -- Insertar stock para la sucursal especificada con las cantidades adecuadas
    INSERT INTO STOCK (IdProducto, IdSucursal, Cantidad)
    SELECT 
        tp.IdProducto,
        p_IdSucursal AS IdSucursal,
        t.Stock
    FROM TempProductos t
    JOIN TempProductIds tp ON t.Codigo = tp.Codigo
    WHERE t.Stock > 0
    ON DUPLICATE KEY UPDATE Cantidad = VALUES(Cantidad);

    -- Establecer el stock en 0 para los productos en otras sucursales si no existe entrada de stock
    INSERT INTO STOCK (IdProducto, IdSucursal, Cantidad)
    SELECT 
        tp.IdProducto,
        s.IdSucursal,
        0
    FROM TempProductIds tp
    JOIN SUCURSAL s ON s.IdSucursal != p_IdSucursal
    LEFT JOIN STOCK st ON st.IdProducto = tp.IdProducto AND st.IdSucursal = s.IdSucursal
    WHERE st.IdProducto IS NULL;

    COMMIT;

    -- Eliminar la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS TempProductos;
    DROP TEMPORARY TABLE IF EXISTS TempProductIds;

    -- Establecer mensaje de éxito
    SET p_Resultado = 1;
    SET p_Mensaje = 'Inserción masiva de productos completada con éxito';

END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_ActualizarProductoIndividual;

DELIMITER //

CREATE PROCEDURE SP_ActualizarProductoIndividual(
    IN p_Codigo VARCHAR(20),
    IN p_Nombre VARCHAR(500),
    IN p_Descripcion VARCHAR(50),
    IN p_PrecioCompra DECIMAL(10,2),
    IN p_PrecioVenta DECIMAL(10,2),
    IN p_Stock INT,
    IN p_IdSucursal INT,
    IN p_IdCategoria INT,  -- Agregar el parámetro de categoría
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Manejo de errores
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Resultado = -1;
        SET p_Mensaje = 'Error durante la operación';
        ROLLBACK;
    END;

    -- Inicializar variables de resultado
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    START TRANSACTION;

    -- Actualizar producto con IdCategoria
    UPDATE PRODUCTO
    SET
        Nombre = p_Nombre,
        Descripcion = p_Descripcion,
        PrecioCompra = p_PrecioCompra,
        PrecioVenta = p_PrecioVenta,
        IdCategoria = p_IdCategoria  
    WHERE Codigo = p_Codigo;

    -- Verificar si el producto fue actualizado
    IF ROW_COUNT() > 0 THEN
        -- Actualizar el stock
        UPDATE STOCK
        SET Cantidad = p_Stock
        WHERE IdProducto = (
            SELECT IdProducto
            FROM PRODUCTO
            WHERE Codigo = p_Codigo
        )
        AND IdSucursal = p_IdSucursal;

        -- Si no existe el stock, insertarlo
        IF ROW_COUNT() = 0 THEN
            INSERT INTO STOCK (IdProducto, IdSucursal, Cantidad)
            VALUES (
                (SELECT IdProducto FROM PRODUCTO WHERE Codigo = p_Codigo),
                p_IdSucursal,
                p_Stock
            );
        END IF;
    ELSE
        SET p_Resultado = 0;
        SET p_Mensaje = 'No se encontró el producto con el código proporcionado';
    END IF;

    COMMIT;

    SET p_Resultado = 1;
    SET p_Mensaje = 'Producto actualizado con éxito';

END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_BajarMasivo;

DELIMITER //

CREATE PROCEDURE SP_BajarMasivo(
    IN p_idCategoria INT,
    IN p_Porcentaje DECIMAL(10,2),
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_Resultado = 0;
        SET p_Mensaje = 'Ocurrió un error al actualizar los precios.';
    END;

    START TRANSACTION;

    IF EXISTS (SELECT 1 FROM PRODUCTO WHERE idCategoria = p_idCategoria) THEN
        UPDATE PRODUCTO
        SET PrecioVenta = GREATEST(0, PrecioVenta - (PrecioVenta * p_Porcentaje / 100))
        WHERE idCategoria = p_idCategoria;

        SET p_Resultado = 1;
        SET p_Mensaje = 'Precios actualizados correctamente.';
    ELSE
        SET p_Resultado = 0;
        SET p_Mensaje = 'No hay productos en la categoría seleccionada.';
    END IF;

    COMMIT;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_SubirMasivo;

DELIMITER //

CREATE PROCEDURE SP_SubirMasivo(
    IN p_idCategoria INT,
    IN p_Porcentaje DECIMAL(10,2),
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_Resultado = 0;
        SET p_Mensaje = 'Ocurrió un error al actualizar los precios.';
    END;

    START TRANSACTION;

    IF EXISTS (SELECT 1 FROM PRODUCTO WHERE idCategoria = p_idCategoria) THEN
        UPDATE PRODUCTO
        SET PrecioVenta = PrecioVenta + (PrecioVenta * p_Porcentaje / 100)
        WHERE idCategoria = p_idCategoria;

        SET p_Resultado = 1;
        SET p_Mensaje = 'Precios actualizados correctamente.';
    ELSE
        SET p_Resultado = 0;
        SET p_Mensaje = 'No hay productos en la categoría seleccionada.';
    END IF;

    COMMIT;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_EliminarProducto;

DELIMITER //

CREATE PROCEDURE SP_EliminarProducto(
    IN p_IdProducto INT,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar los valores de salida
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Verificar si el producto está relacionado con alguna compra o venta
    IF NOT EXISTS (
        SELECT 1
        FROM DETALLE_COMPRA dc
        WHERE dc.IdProducto = p_IdProducto
    ) 
    AND NOT EXISTS (
        SELECT 1
        FROM DETALLE_VENTA dv
        WHERE dv.IdProducto = p_IdProducto
    ) THEN
        -- Si no está relacionado con compras o ventas, eliminar los registros de stock
        DELETE FROM STOCK 
        WHERE IdProducto = p_IdProducto;

        -- Luego, eliminar el producto
        DELETE FROM PRODUCTO 
        WHERE IdProducto = p_IdProducto 
        LIMIT 1;

        -- Devolver un mensaje de éxito
        SET p_Mensaje = 'Producto eliminado correctamente.';
    ELSE
        -- Si el producto está relacionado con una compra o venta, devolver un mensaje de error
        SET p_Resultado = 0;
        SET p_Mensaje = 'El producto está relacionado con una compra o venta y no se puede eliminar.';
    END IF;
END //

DELIMITER ;
/* --------------CREATE PROCEDURE PARA CRUD PROVEEDOR--------------*/
DROP PROCEDURE IF EXISTS SP_RegistrarProveedor;

DELIMITER //

CREATE PROCEDURE SP_RegistrarProveedor(
    IN p_Documento VARCHAR(50),
    IN p_RazonSocial VARCHAR(50),
    IN p_Correo VARCHAR(50),
    IN p_Telefono VARCHAR(50),
    IN p_Estado TINYINT,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar los valores de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si el documento ya existe en la tabla PROVEEDOR
    IF NOT EXISTS (SELECT 1 FROM PROVEEDOR WHERE Documento = p_Documento) THEN
        -- Insertar el nuevo proveedor en la tabla
        INSERT INTO PROVEEDOR (Documento, RazonSocial, Correo, Telefono, Estado) 
        VALUES (p_Documento, p_RazonSocial, p_Correo, p_Telefono, p_Estado);
        
        -- Obtener el ID del proveedor insertado
        SET p_Resultado = LAST_INSERT_ID();
        SET p_Mensaje = 'Proveedor registrado con éxito';
    ELSE
        -- Si el documento ya existe, devolver un mensaje de error
        SET p_Mensaje = 'El número de documento ya existe';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_ModificarProveedor;

DELIMITER //

CREATE PROCEDURE SP_ModificarProveedor(
    IN p_IdProveedor INT,
    IN p_Documento VARCHAR(50),
    IN p_RazonSocial VARCHAR(50),
    IN p_Correo VARCHAR(50),
    IN p_Telefono VARCHAR(50),
    IN p_Estado tinyint,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar los valores de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Verificar si existe otro proveedor con el mismo documento
    IF NOT EXISTS (SELECT 1 FROM PROVEEDOR WHERE Documento = p_Documento AND IdProveedor != p_IdProveedor) THEN
        -- Si no existe, actualizar el proveedor
        UPDATE PROVEEDOR
        SET Documento = p_Documento,
            RazonSocial = p_RazonSocial,
            Correo = p_Correo,
            Telefono = p_Telefono,
            Estado = p_Estado
        WHERE IdProveedor = p_IdProveedor;

        -- Indicar éxito
        SET p_Resultado = 1;
        SET p_Mensaje = 'Proveedor modificado con éxito';
    ELSE
        -- Si el documento ya existe para otro proveedor, devolver un mensaje de error
        SET p_Mensaje = 'El número de documento ya existe';
    END IF;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS SP_EliminarProveedor;

DELIMITER //

CREATE PROCEDURE SP_EliminarProveedor(
    IN p_IdProveedor INT,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar el valor de salida
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Verificar si el proveedor está relacionado con alguna compra
    IF NOT EXISTS (
        SELECT 1
        FROM PROVEEDOR p
        INNER JOIN COMPRA c ON p.IdProveedor = c.IdProveedor
        WHERE p.IdProveedor = p_IdProveedor
    ) THEN
        -- Eliminar el proveedor si no está relacionado con una compra
        DELETE FROM PROVEEDOR 
        WHERE IdProveedor = p_IdProveedor 
        LIMIT 1;
    ELSE
        -- Si el proveedor está relacionado con una compra, devolver un mensaje de error
        SET p_Resultado = 0;
        SET p_Mensaje = 'El proveedor se encuentra relacionado a una COMPRA';
    END IF;
END //

DELIMITER ;


/* --------------CREATE PROCEDURE PARA CRUD STOCK--------------*/
DROP PROCEDURE IF EXISTS SumarStock;

DELIMITER //

CREATE PROCEDURE SumarStock(IN p_IdVenta INT)
BEGIN
    -- Asegurarse de que la tabla temporal exista
    DROP TEMPORARY TABLE IF EXISTS TempStock;

    -- Crear la tabla temporal
    CREATE TEMPORARY TABLE TempStock (
        IdProducto INT PRIMARY KEY,
        Cantidad DECIMAL(10,2) DEFAULT 0
    );

    -- Insertar productos individuales
    INSERT INTO TempStock (IdProducto, Cantidad)
    SELECT 
        dv.IdProducto,
        dv.Cantidad
    FROM DETALLE_VENTA dv
    WHERE dv.IdVenta = p_IdVenta
      AND dv.IdPaquete IS NULL
    ON DUPLICATE KEY UPDATE Cantidad = TempStock.Cantidad + VALUES(Cantidad);

    -- Insertar productos de paquetes
    INSERT INTO TempStock (IdProducto, Cantidad)
    SELECT 
        dp.IdProducto,
        dp.Cantidad * dv.Cantidad AS Cantidad
    FROM DETALLE_PAQUETE dp
    JOIN DETALLE_VENTA dv ON dp.IdPaquete = dv.IdPaquete
    WHERE dv.IdVenta = p_IdVenta
    ON DUPLICATE KEY UPDATE Cantidad = TempStock.Cantidad + VALUES(Cantidad);

    -- Mostrar los datos de la tabla temporal (esto puede eliminarse si no es necesario)
    SELECT * FROM TempStock;

    -- Actualizar el stock usando la tabla temporal
    UPDATE STOCK s
    JOIN TempStock ts ON s.IdProducto = ts.IdProducto
    SET s.Cantidad = s.Cantidad + ts.Cantidad
    WHERE s.IdSucursal = (SELECT IdSucursal FROM VENTA WHERE IdVenta = p_IdVenta);

    -- Eliminar la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS TempStock;
END //

DELIMITER ;



DROP PROCEDURE IF EXISTS sp_ActualizarStock;

DELIMITER //

CREATE PROCEDURE sp_ActualizarStock(
    IN p_IdSucursal INT,
    IN p_DetalleVenta JSON -- JSON para manejar detalles de venta
)
BEGIN
    -- Declaración de variables
    DECLARE v_IdProducto INT;
    DECLARE v_IdPaquete INT;
    DECLARE v_TipoProducto INT;
    DECLARE v_CantidadProducto DECIMAL(10,2); -- Cantidad de productos o paquetes vendidos
    DECLARE v_CantidadEnPaquete DECIMAL(10,2); -- Cantidad de productos dentro del paquete
    
    -- Crear tabla temporal para consolidar productos y sus cantidades
    DROP TEMPORARY TABLE IF EXISTS TempStock;
    CREATE TEMPORARY TABLE TempStock (
        IdProducto INT PRIMARY KEY,
        Cantidad DECIMAL(10,2)
    );

    -- 1. Procesar todos los paquetes y sus productos
    -- Insertar los productos de los paquetes en la tabla temporal
    INSERT INTO TempStock (IdProducto, Cantidad)
    SELECT 
        dp.IdProducto,
        SUM(dp.Cantidad * JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.Cantidad'))) AS Cantidad
    FROM JSON_TABLE(p_DetalleVenta, '$[*]' COLUMNS (value JSON PATH '$')) AS d
    JOIN DETALLE_PAQUETE dp ON dp.IdPaquete = JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.IdPaquete'))
    WHERE JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.TipoProducto')) = '2'
    GROUP BY dp.IdProducto;

    -- 2. Procesar todos los productos individuales
    -- Insertar o actualizar la cantidad de productos individuales en la tabla temporal
    INSERT INTO TempStock (IdProducto, Cantidad)
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.IdProducto')) AS IdProducto,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.Cantidad')) AS DECIMAL(10,2)) AS Cantidad
    FROM JSON_TABLE(p_DetalleVenta, '$[*]' COLUMNS (value JSON PATH '$')) AS d
    WHERE JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.TipoProducto')) = '1'
    ON DUPLICATE KEY UPDATE Cantidad = Cantidad + VALUES(Cantidad);

    -- Verificar el contenido de la tabla temporal (opcional para debugging)
    SELECT * FROM TempStock;

    -- 3. Actualizar el stock con los valores de la tabla temporal
    UPDATE STOCK s
    JOIN TempStock ts ON s.IdProducto = ts.IdProducto
    SET s.Cantidad = s.Cantidad - ts.Cantidad
    WHERE s.IdSucursal = p_IdSucursal;

    -- 4. Eliminar la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS TempStock;

    -- Confirmar la transacción
    COMMIT;
END //

DELIMITER ;




/* --------------CREATE PROCEDURE PARA CRUD USUARIO--------------*/
DROP PROCEDURE IF EXISTS SP_REGISTRARUSUARIO;

DELIMITER //

CREATE PROCEDURE SP_REGISTRARUSUARIO(
    IN p_Documento VARCHAR(50),
    IN p_NombreCompleto VARCHAR(50),
    IN p_Correo VARCHAR(50),
    IN p_Clave VARCHAR(50),
    IN p_IdRol INT,
    IN p_Estado TINYINT,
    IN p_IdSucursal INT,
    OUT p_IdUsuarioResultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    SET p_IdUsuarioResultado = 0;
    SET p_Mensaje = '';

    IF NOT EXISTS (SELECT * FROM USUARIO WHERE Documento = p_Documento) THEN
        INSERT INTO USUARIO (Documento, NombreCompleto, Correo, Clave, IdRol, Estado, IdSucursal)
        VALUES (p_Documento, p_NombreCompleto, p_Correo, p_Clave, p_IdRol, p_Estado, p_IdSucursal);

        SET p_IdUsuarioResultado = LAST_INSERT_ID();

        IF p_IdRol = 1 THEN
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuusuario');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuconfiguracion');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuventas');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menucompras');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuproveedores');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuclientes');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menureportes');
        ELSEIF p_IdRol = 2 THEN
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuconfiguracion');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuventas');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menucompras');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuproveedores');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuclientes');
        ELSEIF p_IdRol = 3 THEN
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuventas');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menucompras');
            INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES (p_IdUsuarioResultado, 'menuclientes');
        END IF;
        SET p_Mensaje = 'Usuario registrado con éxito.';
    ELSE
        SET p_Mensaje = 'No se puede repetir el documento para más de un usuario.';
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS SP_EDITARUSUARIO;

DELIMITER //

CREATE PROCEDURE SP_EDITARUSUARIO(
    IN p_IdUsuario INT,
    IN p_IdSucursal INT,
    IN p_Documento VARCHAR(50),
    IN p_NombreCompleto VARCHAR(50),
    IN p_Correo VARCHAR(50),
    IN p_Clave VARCHAR(50),
    IN p_IdRol INT,
    IN p_Estado tinyint,
    OUT p_Respuesta BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Inicializar variables de salida
    SET p_Respuesta = 0;
    SET p_Mensaje = '';

    -- Verificar si el documento ya existe para otro usuario
    IF NOT EXISTS (SELECT * FROM USUARIO WHERE Documento = p_Documento AND IdUsuario != p_IdUsuario) THEN
        -- Actualizar usuario
        UPDATE USUARIO
        SET
            IdSucursal = p_IdSucursal,
            Documento = p_Documento,
            NombreCompleto = p_NombreCompleto,
            Correo = p_Correo,
            Clave = p_Clave,
            IdRol = p_IdRol,
            Estado = p_Estado
        WHERE IdUsuario = p_IdUsuario;

        -- Indicar éxito
        SET p_Respuesta = 1;
    ELSE
        -- Mensaje de error si el documento ya existe para otro usuario
        SET p_Mensaje = 'No se puede repetir el documento para más de un usuario.';
    END IF;
END //

DELIMITER ;
DROP PROCEDURE IF EXISTS SP_ELIMINARUSUARIO;

DELIMITER //

CREATE PROCEDURE SP_ELIMINARUSUARIO(
    IN p_IdUsuario INT,
    OUT p_Respuesta BOOLEAN,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Declaración de variables
    DECLARE p_PasoReglas BOOLEAN DEFAULT TRUE;

    -- Inicializar variables de salida
    SET p_Respuesta = FALSE;
    SET p_Mensaje = '';

    -- Verificar si el usuario está relacionado con alguna compra
    IF EXISTS (SELECT 1 
               FROM COMPRA C
               WHERE C.IdUsuario = p_IdUsuario) THEN
        SET p_PasoReglas = FALSE;
        SET p_Mensaje = CONCAT(p_Mensaje, 'No se puede eliminar porque el usuario se encuentra relacionado a una compra.\n');
    END IF;

    -- Verificar si el usuario está relacionado con alguna venta
    IF EXISTS (SELECT 1 
               FROM VENTA V
               WHERE V.IdUsuario = p_IdUsuario) THEN
        SET p_PasoReglas = FALSE;
        SET p_Mensaje = CONCAT(p_Mensaje, 'No se puede eliminar porque el usuario se encuentra relacionado a una venta.\n');
    END IF;

    -- Eliminar permisos y usuario si no está relacionado con compras o ventas
    IF p_PasoReglas THEN
        START TRANSACTION;
        
        -- Eliminar permisos asociados al usuario
        DELETE FROM PERMISO WHERE IdUsuario = p_IdUsuario;
        
        -- Eliminar usuario
        DELETE FROM USUARIO WHERE IdUsuario = p_IdUsuario;
        
        COMMIT;
        SET p_Respuesta = TRUE;
        SET p_Mensaje = 'Usuario eliminado exitosamente.';
    END IF;

END //

DELIMITER ;

use ECOMMERCE_WEB;
/* --------------CREATE PROCEDURE PARA CRUD VENTA--------------*/
DROP PROCEDURE IF EXISTS sp_RegistrarVenta;

DELIMITER //

CREATE PROCEDURE sp_RegistrarVenta(
    IN p_IdUsuario INT,
    IN p_TipoDocumento VARCHAR(50),
    IN p_IdCliente INT,
    IN p_MontoPago DECIMAL(10,2),
    IN p_MontoCambio DECIMAL(10,2),
    IN p_MontoTotal DECIMAL(10,2),
    IN p_MetodoPago VARCHAR(50),
    IN p_Estado INT,
    IN p_IdSucursal INT,
    IN p_DetalleVenta JSON, -- JSON para manejar detalles de venta
    IN p_IdDireccion INT, -- Dirección para la entrega
    IN p_TipoEntrega VARCHAR(50), -- Tipo de entrega
    IN p_EstadoEntrega INT, -- Estado de la entrega
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(1000) -- Aumentamos el tamaño para mensajes más largos
)
BEGIN
    -- Declaración de variables
    DECLARE v_IdVenta INT;
    DECLARE v_NumeroDocumento VARCHAR(50);

    -- Inicializar variables de salida
    SET p_Resultado = 0;
    SET p_Mensaje = '';
    SET v_NumeroDocumento = '';

    -- Comenzar la transacción
    START TRANSACTION;

    -- Insertar en la tabla VENTA
    INSERT INTO VENTA (IdUsuario, TipoDocumento, NumeroDocumento, IdCliente, MontoPago, MontoCambio, MontoTotal, MetodoPago, Estado, IdSucursal)
    VALUES (p_IdUsuario, p_TipoDocumento, NULL, p_IdCliente, p_MontoPago, p_MontoCambio, p_MontoTotal, p_MetodoPago, p_Estado, p_IdSucursal);

    -- Obtener el ID de la nueva venta
    SET v_IdVenta = LAST_INSERT_ID();

    -- Generar el número de documento con ceros a la izquierda
    SET v_NumeroDocumento = LPAD(v_IdVenta, 9, '0'); -- Ajusta el número 9 si es necesario para el formato deseado

    -- Actualizar el número de documento en la tabla VENTA
    UPDATE VENTA
    SET NumeroDocumento = v_NumeroDocumento
    WHERE IdVenta = v_IdVenta;

    -- Insertar en la tabla DETALLE_VENTA
    INSERT INTO DETALLE_VENTA (IdVenta, IdProducto, IdPaquete, PrecioVenta, Cantidad, SubTotal)
    SELECT 
        v_IdVenta,
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.IdProducto')), 'null'),
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.IdPaquete')), 'null'),
        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.PrecioVenta')) AS DECIMAL(10,2)),
        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.Cantidad')) AS DECIMAL(10,2)),
        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.value, '$.SubTotal')) AS DECIMAL(10,2))
    FROM JSON_TABLE(p_DetalleVenta, '$[*]' COLUMNS (value JSON PATH '$')) AS d;

    -- Insertar en la tabla ENTREGA
    INSERT INTO ENTREGA (IdVenta, IdSucursal, IdDireccion, TipoEntrega, Estado)
    VALUES (v_IdVenta, p_IdSucursal, p_IdDireccion, p_TipoEntrega, p_EstadoEntrega);

    -- Confirmar la transacción
    COMMIT;

    -- Resultado exitoso
    SET p_Resultado = 1;
    SET p_Mensaje = CONCAT('Venta ', v_NumeroDocumento, ' registrada correctamente con entrega.');
END //

DELIMITER ;



DROP PROCEDURE IF EXISTS SP_EliminarVenta;

DELIMITER //

CREATE PROCEDURE SP_EliminarVenta(
    IN p_IdVenta INT,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_MetodoPago VARCHAR(50);
    DECLARE v_MontoTotal DECIMAL(10, 2);
    DECLARE v_NumeroDocumento VARCHAR(50);

    -- Manejo de errores
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Manejo de errores
        SET p_Resultado = 0;
        SET p_Mensaje = 'Ocurrió un error al eliminar la venta.';
        ROLLBACK;
    END;

    -- Inicializar variables de salida
    SET p_Resultado = 1;
    SET p_Mensaje = '';

    -- Comenzar la transacción
    START TRANSACTION;

    -- Obtener el método de pago, monto total y Número de Documento
    SELECT MetodoPago, MontoTotal, NumeroDocumento
    INTO v_MetodoPago, v_MontoTotal, v_NumeroDocumento
    FROM VENTA
    WHERE IdVenta = p_IdVenta;

    -- Verificar si el método de pago es "Cuenta Corriente"
    IF v_MetodoPago = 'Cuenta Corriente' THEN
        -- Actualizar la deuda en la tabla CLIENTE
        UPDATE CLIENTE
        SET Deuda = Deuda - v_MontoTotal
        WHERE IdCliente = (SELECT IdCliente FROM VENTA WHERE IdVenta = p_IdVenta);
        
          -- Eliminar los registros correspondientes en la tabla PAGO
    DELETE FROM PAGO
    WHERE NumeroVenta = v_NumeroDocumento;

    END IF;

 
    -- Eliminar detalles de la venta
    DELETE FROM DETALLE_VENTA
    WHERE IdVenta = p_IdVenta;

    -- Eliminar la venta
    DELETE FROM VENTA
    WHERE IdVenta = p_IdVenta;

    -- Confirmar la transacción
    COMMIT;
    SET p_Mensaje = 'Venta y sus pagos asociados eliminados correctamente.';
END //

DELIMITER ;


 


/*  VERIFICAR
DROP PROCEDURE IF EXISTS SP_CargarProductosMasivamente;

DELIMITER //

CREATE PROCEDURE SP_CargarProductosMasivamente(
    IN p_Productos JSON, 
    IN p_IdCategoria INT,
    IN p_IdSucursal INT,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Establecer el mensaje de error
        SET p_Resultado = -1;
        SET p_Mensaje = 'Error durante la operación';
        ROLLBACK;
        -- Eliminar la tabla temporal si hay un error
        DROP TEMPORARY TABLE IF EXISTS TempProductos;
    END;

    -- Inicializar variables de resultado
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    -- Crear una tabla temporal para almacenar los datos del JSON
    CREATE TEMPORARY TABLE TempProductos (
        Codigo VARCHAR(20),
        Nombre VARCHAR(500),
        Descripcion VARCHAR(30),
        PrecioCompra DECIMAL(10,2),
        PrecioVenta DECIMAL(10,2),
        Stock INT,
        IdSucursal INT,
        Id_categoria INT,
        Estado INT
    );

    -- Insertar datos del JSON en la tabla temporal
    INSERT INTO TempProductos (Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, Stock, IdSucursal, Id_categoria, Estado)
    SELECT Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, Stock, IdSucursal, Id_categoria, Estado
    FROM JSON_TABLE(p_Productos, '$[*]' 
        COLUMNS (
            Codigo VARCHAR(20) PATH '$.Codigo',
            Nombre VARCHAR(500) PATH '$.Nombre',
            Descripcion VARCHAR(30) PATH '$.Descripcion',
            PrecioCompra DECIMAL(10,2) PATH '$.PrecioCompra',
            PrecioVenta DECIMAL(10,2) PATH '$.PrecioVenta',
            Stock INT PATH '$.Stock',
            IdSucursal INT PATH '$.IdSucursal',
            Id_categoria INT PATH '$.Id_categoria',
            Estado INT PATH '$.Estado'
        )
    ) AS productos;

    -- Mensaje de depuración: Verificar datos en TempProductos
    SELECT * FROM TempProductos;

    START TRANSACTION;

    -- Actualizar productos existentes y su stock
    UPDATE PRODUCTO p
    JOIN TempProductos t ON p.Codigo = t.Codigo
    SET 
        p.Nombre = t.Nombre,
        p.Descripcion = t.Descripcion,
        p.PrecioCompra = t.PrecioCompra,
        p.PrecioVenta = t.PrecioVenta,
        p.IdCategoria = p_IdCategoria
    WHERE 
        EXISTS (SELECT 1 FROM STOCK s WHERE s.IdProducto = p.IdProducto AND s.IdSucursal = p_IdSucursal);

    -- Mensaje de depuración: Verificar productos actualizados
    SELECT * FROM PRODUCTO WHERE Codigo IN (SELECT Codigo FROM TempProductos);

    -- Insertar nuevos productos
    INSERT INTO PRODUCTO (Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, IdCategoria, Estado)
    SELECT 
        t.Codigo, 
        t.Nombre, 
        t.Descripcion, 
        t.PrecioCompra, 
        t.PrecioVenta, 
        p_IdCategoria, 
        t.Estado
    FROM TempProductos t
    LEFT JOIN PRODUCTO p ON t.Codigo = p.Codigo
    WHERE p.IdProducto IS NULL;

    -- Mensaje de depuración: Verificar nuevos productos insertados
    SELECT * FROM PRODUCTO WHERE Codigo IN (SELECT Codigo FROM TempProductos WHERE p_IdCategoria IS NOT NULL);

    -- Insertar stock para nuevos productos
    INSERT INTO STOCK (IdProducto, IdSucursal, Cantidad)
    SELECT 
        p.IdProducto,
        t.IdSucursal,
        t.Stock
    FROM TempProductos t
    JOIN PRODUCTO p ON t.Codigo = p.Codigo
    JOIN SUCURSAL s ON s.IdSucursal = t.IdSucursal
    WHERE t.Stock > 0;

    -- Mensaje de depuración: Verificar stock insertado
    SELECT * FROM STOCK WHERE IdSucursal = p_IdSucursal;

    -- Actualizar stock para productos existentes
    UPDATE STOCK s
    JOIN TempProductos t ON s.IdProducto = (SELECT IdProducto FROM PRODUCTO WHERE Codigo = t.Codigo) AND s.IdSucursal = p_IdSucursal
    SET s.Cantidad = t.Stock
    WHERE t.Stock > 0;

    -- Mensaje de depuración: Verificar stock actualizado
    SELECT * FROM STOCK WHERE IdSucursal = p_IdSucursal;

    COMMIT;

    -- Eliminar la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS TempProductos;

    -- Establecer mensaje de éxito
    SET p_Resultado = 1;
    SET p_Mensaje = 'Carga masiva de productos completada con éxito';

END //

DELIMITER ;


DROP PROCEDURE IF EXISTS sp_registrar_compra;

DELIMITER //

CREATE DEFINER=`root`@`localhost` PROCEDURE sp_registrar_compra(
    IN p_IdUsuario INT,
    IN p_IdProveedor INT,
    IN p_TipoDocumento VARCHAR(500),
    IN p_NumeroDocumento VARCHAR(500),
    IN p_MontoTotal DECIMAL(10,2),
    IN p_IdSucursal INT,
    IN p_DetalleCompra JSON,
    OUT p_Resultado BIT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_IdCompra INT;
    
    SET p_Resultado = 0;
    SET p_Mensaje = '';
    
    START TRANSACTION;

    -- Insertar en COMPRA
    INSERT INTO COMPRA (IdUsuario, IdProveedor, TipoDocumento, Documento, IdSucursal, MontoTotal)
    VALUES (p_IdUsuario, p_IdProveedor, p_TipoDocumento, p_NumeroDocumento, p_IdSucursal, p_MontoTotal);

    SET v_IdCompra = LAST_INSERT_ID();

    -- Insertar en DETALLE_COMPRA
    INSERT INTO DETALLE_COMPRA (IdCompra, IdProducto, PrecioCompra, PrecioVenta, Cantidad, MontoTotal)
    SELECT v_IdCompra, 
           JSON_EXTRACT(p_DetalleCompra, '$.IdProducto') AS IdProducto,
           JSON_EXTRACT(p_DetalleCompra, '$.PrecioCompra') AS PrecioCompra,
           JSON_EXTRACT(p_DetalleCompra, '$.PrecioVenta') AS PrecioVenta,
           JSON_EXTRACT(p_DetalleCompra, '$.Cantidad') AS Cantidad,
           JSON_EXTRACT(p_DetalleCompra, '$.MontoTotal') AS MontoTotal;

    -- Actualizar el stock
    UPDATE STOCK s
    JOIN JSON_TABLE(p_DetalleCompra, '$[*]' 
        COLUMNS (IdProducto INT PATH '$.IdProducto', Cantidad INT PATH '$.Cantidad')) dt
    ON s.IdProducto = dt.IdProducto
    SET s.Cantidad = s.Cantidad + dt.Cantidad
    WHERE s.IdSucursal = p_IdSucursal;

    -- Actualizar precios en PRODUCTO
    UPDATE PRODUCTO p
    JOIN JSON_TABLE(p_DetalleCompra, '$[*]' 
        COLUMNS (IdProducto INT PATH '$.IdProducto', PrecioCompra DECIMAL(18,2) PATH '$.PrecioCompra', PrecioVenta DECIMAL(18,2) PATH '$.PrecioVenta')) dt
    ON p.IdProducto = dt.IdProducto
    SET p.PrecioCompra = dt.PrecioCompra, p.PrecioVenta = dt.PrecioVenta;

    COMMIT;
    
    SET p_Resultado = 1;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_ReporteCompras;

DELIMITER //

CREATE PROCEDURE sp_ReporteCompras(
    IN p_fechainicio DATE,
    IN p_fechafin DATE,
    IN p_IdSucursal INT,
    IN p_IdProveedor INT
)
BEGIN
    SELECT 
        DATE_FORMAT(c.FechaRegistro, '%d/%m/%Y') AS FechaRegistro,
        c.TipoDocumento,
        c.Documento,
        c.MontoTotal,
        u.NombreCompleto AS UsuarioRegistro,
        pr.Documento AS DocumentoProveedor,
        pr.RazonSocial,
        p.Codigo AS CodigoProducto,
        p.Nombre AS NombreProducto,
        ca.Descripcion AS Categoria,
        dc.PrecioCompra,
        dc.PrecioVenta,
        dc.Cantidad,
        dc.MontoTotal AS SubTotal
    FROM COMPRA c 
    INNER JOIN USUARIO u ON u.IdUsuario = c.IdUsuario
    INNER JOIN PROVEEDOR pr ON pr.IdProveedor = c.IdProveedor
    INNER JOIN DETALLE_COMPRA dc ON dc.IdCompra = c.IdCompra
    INNER JOIN PRODUCTO p ON p.IdProducto = dc.IdProducto
    INNER JOIN CATEGORIA ca ON ca.IdCategoria = p.IdCategoria
    WHERE c.IdSucursal = p_IdSucursal
    AND c.FechaRegistro BETWEEN p_fechainicio AND p_fechafin
    AND (p_IdProveedor = 0 OR c.IdProveedor = p_IdProveedor);
END //

DELIMITER ;
DROP PROCEDURE IF EXISTS sp_ReporteVentas;

DELIMITER //

CREATE PROCEDURE sp_ReporteVentas(
    IN p_IdSucursal INT,
    IN p_fechainicio DATE,
    IN p_fechafin DATE
)
BEGIN
    SELECT 
        DATE_FORMAT(v.FechaRegistro, '%d/%m/%Y') AS FechaRegistro,
        v.TipoDocumento,
        v.NumeroDocumento,
        v.MontoTotal,
        v.MetodoPago,
        u.NombreCompleto AS UsuarioRegistro,
        c.Documento AS DocumentoCliente, -- Documento del cliente
        c.Nombre AS NombreCliente, -- Nombre del cliente
        p.Codigo AS CodigoProducto,
        p.Nombre AS NombreProducto,
        ca.Descripcion AS Categoria,
        dv.PrecioVenta,
        dv.Cantidad,
        dv.SubTotal
    FROM VENTA v 
    INNER JOIN USUARIO u ON u.IdUsuario = v.IdUsuario
    INNER JOIN DETALLE_VENTA dv ON dv.IdVenta = v.IdVenta
    INNER JOIN PRODUCTO p ON p.IdProducto = dv.IdProducto
    INNER JOIN CATEGORIA ca ON ca.IdCategoria = p.IdCategoria
    INNER JOIN CLIENTE c ON c.IdCliente = v.IdCliente -- Join con CLIENTE para obtener datos del cliente
    WHERE v.IdSucursal = p_IdSucursal
    AND v.FechaRegistro BETWEEN p_fechainicio AND p_fechafin;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS DescontarStock;

DELIMITER //

CREATE PROCEDURE DescontarStock(IN p_IdVenta INT)
BEGIN
    -- Asegurarse de que la tabla temporal exista
    DROP TEMPORARY TABLE IF EXISTS TempStock;

    -- Crear la tabla temporal
    CREATE TEMPORARY TABLE TempStock (
        IdProducto INT PRIMARY KEY,
        Cantidad DECIMAL(10,2) DEFAULT 0
    );

    -- Insertar productos individuales
    INSERT INTO TempStock (IdProducto, Cantidad)
    SELECT 
        dv.IdProducto,
        dv.Cantidad
    FROM DETALLE_VENTA dv
    WHERE dv.IdVenta = p_IdVenta
      AND dv.IdPaquete IS NULL
    ON DUPLICATE KEY UPDATE Cantidad = TempStock.Cantidad + VALUES(Cantidad);

    -- Insertar productos de paquetes
    INSERT INTO TempStock (IdProducto, Cantidad)
    SELECT 
        dp.IdProducto,
        dp.Cantidad * dv.Cantidad AS Cantidad
    FROM DETALLE_PAQUETE dp
    JOIN DETALLE_VENTA dv ON dp.IdPaquete = dv.IdPaquete
    WHERE dv.IdVenta = p_IdVenta
    ON DUPLICATE KEY UPDATE Cantidad = TempStock.Cantidad + VALUES(Cantidad);

    -- Actualizar el stock usando la tabla temporal
    UPDATE STOCK s
    JOIN TempStock ts ON s.IdProducto = ts.IdProducto
    SET s.Cantidad = s.Cantidad - ts.Cantidad
    WHERE s.IdSucursal = (SELECT IdSucursal FROM VENTA WHERE IdVenta = p_IdVenta);

    -- Eliminar la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS TempStock;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS ProcesarVenta;

DELIMITER //

CREATE PROCEDURE ProcesarVenta(IN p_IdVenta INT)
BEGIN
    -- Eliminar la tabla temporal si ya existe
    DROP TEMPORARY TABLE IF EXISTS TempStock;

    -- Crear la tabla temporal
    CREATE TEMPORARY TABLE TempStock (
        IdProducto INT PRIMARY KEY,
        Cantidad DECIMAL(10,2) DEFAULT 0
    );

    -- Insertar productos individuales
    INSERT INTO TempStock (IdProducto, Cantidad)
    SELECT 
        dv.IdProducto,
        dv.Cantidad
    FROM DETALLE_VENTA dv
    WHERE dv.IdVenta = p_IdVenta
      AND dv.IdPaquete IS NULL
    ON DUPLICATE KEY UPDATE Cantidad = TempStock.Cantidad + VALUES(Cantidad);

    -- Insertar productos de paquetes
    INSERT INTO TempStock (IdProducto, Cantidad)
    SELECT 
        dp.IdProducto,
        dp.Cantidad * dv.Cantidad AS Cantidad
    FROM DETALLE_PAQUETE dp
    JOIN DETALLE_VENTA dv ON dp.IdPaquete = dv.IdPaquete
    WHERE dv.IdVenta = p_IdVenta
    ON DUPLICATE KEY UPDATE Cantidad = TempStock.Cantidad + VALUES(Cantidad);

    -- Consultar el contenido de la tabla temporal
    SELECT * FROM TempStock;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS SP_ActualizarProductos;

DELIMITER //

CREATE PROCEDURE SP_ActualizarProductos(
    IN productosJSON JSON,
    IN p_IdCategoria INT,
    IN p_IdSucursal INT,
    OUT p_Resultado INT,
    OUT p_Mensaje VARCHAR(500)
)
BEGIN
    -- Manejo de errores
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Resultado = -1;
        SET p_Mensaje = 'Error durante la operación';
        ROLLBACK;
        -- Eliminar la tabla temporal si hay un error
        DROP TEMPORARY TABLE IF EXISTS TempProductos;
    END;

    -- Inicializar variables de resultado
    SET p_Resultado = 0;
    SET p_Mensaje = '';

    START TRANSACTION;

    -- Crear una tabla temporal para almacenar los datos del JSON
    CREATE TEMPORARY TABLE TempProductos (
        Codigo VARCHAR(20) PRIMARY KEY,
        Nombre VARCHAR(500),
        Descripcion VARCHAR(50),
        PrecioCompra DECIMAL(10,2),
        PrecioVenta DECIMAL(10,2),
        Stock INT
    );

    -- Insertar datos del JSON en la tabla temporal
    INSERT INTO TempProductos (Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, Stock)
    SELECT Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, Stock
    FROM JSON_TABLE(productosJSON, '$[*]'
        COLUMNS (
            Codigo VARCHAR(20) PATH '$.Codigo',
            Nombre VARCHAR(500) PATH '$.Nombre',
            Descripcion VARCHAR(50) PATH '$.Descripcion',
            PrecioCompra DECIMAL(10,2) PATH '$.PrecioCompra',
            PrecioVenta DECIMAL(10,2) PATH '$.PrecioVenta',
            Stock INT PATH '$.Stock'
        )
    ) AS productos;

    -- Verificar datos en TempProductos
    SELECT * FROM TempProductos;

    -- Actualizar productos existentes
    UPDATE PRODUCTO p
    JOIN TempProductos t ON p.Codigo = t.Codigo
    SET
        p.Nombre = t.Nombre,
        p.Descripcion = t.Descripcion,
        p.PrecioCompra = t.PrecioCompra,
        p.PrecioVenta = t.PrecioVenta,
        p.IdCategoria = p_IdCategoria,
        p.Estado = 1  -- Asumiendo que el estado es 1 por defecto
    WHERE p.Codigo = t.Codigo;

    -- Verificar productos actualizados
    SELECT * FROM PRODUCTO WHERE Codigo IN (SELECT Codigo FROM TempProductos);

    -- Actualizar el stock para la sucursal especificada
    INSERT INTO STOCK (IdProducto, IdSucursal, Cantidad)
    SELECT 
        p.IdProducto,
        p_IdSucursal,
        t.Stock
    FROM TempProductos t
    JOIN PRODUCTO p ON t.Codigo = p.Codigo
    ON DUPLICATE KEY UPDATE Cantidad = VALUES(Cantidad);

    -- Verificar stock actualizado
    SELECT * FROM STOCK WHERE IdSucursal = p_IdSucursal AND IdProducto IN (SELECT IdProducto FROM PRODUCTO WHERE Codigo IN (SELECT Codigo FROM TempProductos));

    -- Establecer el stock en 0 para productos en otras sucursales
    UPDATE STOCK s
    JOIN PRODUCTO p ON s.IdProducto = p.IdProducto
    JOIN TempProductos t ON p.Codigo = t.Codigo
    SET s.Cantidad = 0
    WHERE s.IdSucursal != p_IdSucursal;

    -- Verificar stock en otras sucursales
    SELECT * FROM STOCK WHERE IdSucursal != p_IdSucursal AND IdProducto IN (SELECT IdProducto FROM PRODUCTO WHERE Codigo IN (SELECT Codigo FROM TempProductos));

    -- Eliminar la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS TempProductos;

    COMMIT;

    -- Establecer mensaje de éxito
    SET p_Resultado = 1;
    SET p_Mensaje = 'Actualización masiva de productos completada con éxito';

END //

DELIMITER ;

*/
