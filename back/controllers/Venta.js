const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');

const registrar = (req, res) => {
    let { TipoEntrega,IdDireccion,IdUsuario, TipoDocumento, MontoPago, MontoCambio, MontoTotal, MetodoPago, IdSucursal, DetalleVenta } = req.body;
  
    let Estado= 0;
    let EstadoEntrega= 0;

    let IdCliente = req.query.IdCliente; 
    if (!IdCliente) {
        IdCliente = req.Usuario?.IdCliente; 
        IdUsuario = 1;
        MontoPago=0;
        MontoCambio=0;
        IdSucursal=1;
    }

    if(!req.Usuario.IdCliente){
     Estado = 1;

        if(TipoEntrega == 'Retiro en local') {
            EstadoEntrega= 3;
        }
        else{
            EstadoEntrega=0
        }

    }
    console.log(IdUsuario, TipoDocumento, IdCliente, MontoPago, MontoCambio, MontoTotal, MetodoPago,Estado, IdSucursal, JSON.stringify(DetalleVenta),IdDireccion, TipoEntrega,EstadoEntrega)

    // Validación de datos
    if (!TipoEntrega ||!IdUsuario || !IdCliente || !TipoDocumento || MontoPago === undefined || MontoCambio === undefined || MontoTotal === undefined || !MetodoPago || !IdSucursal || !DetalleVenta) {
        return res.status(400).send({
            success: false,
            mensaje: "Faltan datos requeridos en la solicitud."
        });
    }
  
    if (TipoEntrega== "Envio" && !IdDireccion) {
        return res.status(400).send({
            success: false,
            mensaje: "Faltan los datos del envio."
        });
    }

    MontoPago === '' ? MontoPago = 0 : MontoPago = MontoPago;
    
    // Añadimos el SubTotal a cada ítem de DetalleVenta
    const detalleVentaConSubTotal = DetalleVenta.map(item => ({
        ...item,
        SubTotal: item.Cantidad * item.PrecioVenta
    }));
  
    // Llamada al procedimiento almacenado para registrar la venta
    db.query('CALL sp_RegistrarVenta(?, ?,?, ?, ?, ?, ?, ?, ?, ?,?,?,?, @p_Resultado, @p_Mensaje)',
      [IdUsuario, TipoDocumento, IdCliente, MontoPago, MontoCambio, MontoTotal, MetodoPago,Estado, IdSucursal, JSON.stringify(detalleVentaConSubTotal),IdDireccion, TipoEntrega,EstadoEntrega],
      (error, results, fields) => {
          if (error) {  
              console.error('Error en el registro de la venta:', error);
              return res.status(500).send({
                  success: false,
                  mensaje: "Error al registrar la venta."
              });
          }
  
          // Recuperar los parámetros de salida
          db.query('SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje', (error, results) => {
              if (error) {
                  console.error('Error al recuperar parámetros de salida:', error);
                  return res.status(500).send({
                      success: false,
                      mensaje: "Error al recuperar parámetros de salida."
                  });
              }
  
              const resultado = results[0].Resultado;
              const mensaje = results[0].Mensaje;
              if (!resultado) {
                  return res.status(500).send({
                      success: false,
                      mensaje: mensaje
                  });
              }
  
              console.log(IdSucursal, JSON.stringify(detalleVentaConSubTotal));
  
              // Llamada al procedimiento almacenado para actualizar el stock
              db.query('CALL sp_ActualizarStock(?, ?)',
                  [IdSucursal, JSON.stringify(detalleVentaConSubTotal)],
                  (error, results) => {
                      if (error) {
                          console.error('Error al actualizar el stock:', error);
                          return res.status(500).send({
                              success: false,
                              mensaje: "Error al actualizar el stock."
                          });
                      }
  
                      // Verificar si el método de pago es "Cuenta Corriente"
                      if (MetodoPago === 'Cuenta Corriente') {
                          db.query('CALL SP_AumentarDeuda(?, ?, ?, @p_Resultado, @p_Mensaje)',
                              [IdCliente, IdUsuario, MontoTotal],
                              (error, results) => {
                                  if (error) {
                                      console.error('Error al aumentar la deuda:', error);
                                      return res.status(500).send({
                                          success: false,
                                          mensaje: "Error al aumentar la deuda del cliente."
                                      });
                                  }
  
                                  // Recuperar los parámetros de salida de SP_AumentarDeuda
                                  db.query('SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje', (error, results) => {
                                      if (error) {
                                          console.error('Error al recuperar parámetros de salida de SP_AumentarDeuda:', error);
                                          return res.status(500).send({
                                              success: false,
                                              mensaje: "Error al recuperar parámetros de salida de SP_AumentarDeuda."
                                          });
                                      }
  
                                      const resultadoDeuda = results[0].Resultado;
                                      const mensajeDeuda = results[0].Mensaje;
  
                                      if (!resultadoDeuda) {
                                          return res.status(500).send({
                                              success: false,
                                              mensaje: mensajeDeuda
                                          });
                                      }
  
                                      // Respuesta final de éxito
                                      return res.status(200).send({
                                          success: true,
                                          mensaje: `${mensaje} ${mensajeDeuda}`
                                      });
                                  });
                              }
                          );
                      } else {
                          // Respuesta final si no es "Cuenta Corriente"
                          return res.status(200).send({
                              success: true,
                              mensaje: mensaje
                          });
                      }
                  });
          });
      });
  };
  

const verDetalle = (req, res) => {
    const { nroVenta } = req.query;

    const query = `
      SELECT 
          v.IdVenta,
          v.NumeroDocumento,
          v.MontoTotal,
          v.TipoDocumento,
          DATE_FORMAT(v.FechaRegistro , '%Y-%m-%d') AS FechaRegistro,
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'Producto', COALESCE(p.Nombre, pa.Nombre),
                  'Cantidad', dv.Cantidad,
                  'PrecioVenta', dv.PrecioVenta,
                  'SubTotal', dv.SubTotal
              )
          ) AS Productos,
          u.NombreCompleto,
          u.Documento as DNI,
          c.NombreCompleto as Cliente,
          c.Documento as ClienteDocumento,
        v.IdSucursal
      FROM 
          DETALLE_VENTA dv
      LEFT JOIN PRODUCTO p ON p.IdProducto = dv.IdProducto
      LEFT JOIN PAQUETE pa ON pa.IdPaquete = dv.IdPaquete
      INNER JOIN VENTA v ON v.IdVenta = dv.IdVenta
      LEFT JOIN USUARIO u ON u.IdUsuario = v.IdUsuario
      LEFT JOIN CLIENTE c ON c.IdCliente = v.IdCliente
      WHERE v.NumeroDocumento = ?
      GROUP BY 
          v.NumeroDocumento, 
          v.MontoTotal, 
          v.FechaRegistro,
          v.IdVenta;
    `;

    db.query(query, [nroVenta], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error en la consulta");
        } else {
            res.send(result);
        }
    });
};


  const eliminar = (req, res) => {
    const idVenta = parseInt(req.params.id);

    if (isNaN(idVenta)) {
        return res.status(400).send({
            success: false,
            mensaje: "ID de venta inválido."
        });
    }

    // Llamar a la SP para actualizar el stock
    db.query(
        "CALL SumarStock(?);",
        [idVenta],
        (err, result) => {
            if (err) {
                console.error("Error al actualizar el stock:", err.message);
                return res.status(500).send({
                    success: false,
                    mensaje: "Error al actualizar el stock.",
                    detalle: err.message
                });
            }

            // Llamar a la SP para eliminar la venta
            db.query(
                "CALL SP_EliminarVenta(?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
                [idVenta],
                (err, result) => {
                    if (err) {
                        console.error("Error al eliminar la venta:", err.message);
                        return res.status(500).send({
                            success: false,
                            mensaje: "Error al eliminar la venta.",
                            detalle: err.message
                        });
                    }

                    const resultado = result[1][0].Resultado;
                    const mensaje = result[1][0].Mensaje;

                    if (resultado === 1) { 
                        res.status(200).send({
                            success: true,
                            mensaje: mensaje || "Venta eliminada exitosamente."
                        });
                    } else {
                        res.status(400).send({
                            success: false,
                            mensaje: mensaje || "No se pudo eliminar la venta."
                        });
                    }
                }
            );
        }
    );
};

  const validarToken = (req, res, next) => {
    const accessToken = req.query.accesstoken;
    if (!accessToken) {
      return res.send('Acceso denegado');  
    }
  
    jwt.verify(accessToken, process.env.SECRET, (err, Usuario) => {
      if (err) {
        return res.send('Acceso denegado, token expirado o incorrecto'); 
      } else {
        req.Usuario = Usuario;
        next();
      }
    });
  };
  
  
const Obtener = (req, res) => {
    const  IdCliente  = req.Usuario?.IdCliente; 
    if (!IdCliente) {
        return res.status(400).send({ error: 'El IdCliente es requerido.'});
    }
    // Estados de una entre {0: Pendiente, 1:Preparando el pedido , 2: En camino, 3: Entregado, 4:Cancelado }

    db.query(`
      SELECT 
    v.IdVenta,
    v.NumeroDocumento,
    v.FechaRegistro,
    v.MontoTotal,
    v.MetodoPago,
    v.Estado,
    e.TipoEntrega,
    e.Estado AS EstadoEntrega,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'NombreProducto', p.Nombre,
            'Cantidad', dv.Cantidad,
            'Precio', dv.PrecioVenta,
            'Imagen',p.Foto
        )
    ) AS Productos
FROM 
    VENTA v
JOIN 
    DETALLE_VENTA dv ON v.IdVenta = dv.IdVenta
JOIN 
    PRODUCTO p ON dv.IdProducto = p.IdProducto
LEFT JOIN 
    ENTREGA e ON v.IdVenta = e.IdVenta
WHERE 
    v.IdCliente = ?
GROUP BY 
    v.IdVenta, v.NumeroDocumento, v.FechaRegistro, v.MontoTotal, v.MetodoPago, e.TipoEntrega, e.Estado
ORDER BY 
    v.FechaRegistro DESC;

; 
    `, [IdCliente], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: 'Ocurrió un error en la consulta.' });
        }
        if (results.length === 0) {
            return res.status(404).send({ message: 'No se encontraron compras para el usuario.' });
        }
        res.status(200).json(results);
    });
};


module.exports = {eliminar,registrar,verDetalle,Obtener, validarToken}