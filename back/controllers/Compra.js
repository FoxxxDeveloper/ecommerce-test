const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');


const verDetalle = (req, res) => {
    const { IdSucursal, nroCompra } = req.query;
  console.log(IdSucursal, nroCompra)
    const query = `
        
SELECT 
          c.IdCompra,
          c.Documento,
          c.TipoDocumento,
          c.MontoTotal,
          DATE_FORMAT(c.FechaRegistro , '%Y-%m-%d') AS FechaRegistro,
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'Producto', p.Nombre,
                  'Cantidad', dc.Cantidad,
                  'PrecioCompra',dc.PrecioCompra,
                  'SubTotal',dc.MontoTotal
              )
          ) AS Productos,
          pr.RazonSocial,
          pr.Documento as CUIT,
          pr.Telefono,
          u.NombreCompleto,
          u.Documento as DNI
      FROM 
          DETALLE_COMPRA dc
      LEFT JOIN PRODUCTO p ON p.IdProducto = dc.IdProducto
      INNER JOIN COMPRA c ON c.IdCompra = dc.IdCompra
      INNER JOIN PROVEEDOR pr on pr.IdProveedor = c.IdProveedor
      INNER JOIN USUARIO u on u.IdUsuario = c.IdUsuario
      WHERE c.IdSucursal = ? AND c.Documento = ?
      GROUP BY 
          c.Documento, 
          c.MontoTotal, 
          c.FechaRegistro,
          c.IdCompra;
    `;
  
    db.query(query, [IdSucursal, nroCompra], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error en la consulta");
        } else {
            res.send(result);
        }
    });
  };



const registrarCompra = (req, res) => {
    const { IdUsuario, IdProveedor, TipoDocumento, MontoTotal, IdSucursal, DetalleCompra } = req.body;
   
    // Validación de datos
    if (!IdUsuario || !IdProveedor || !TipoDocumento || !MontoTotal || !IdSucursal || !DetalleCompra) {
        return res.status(400).send({
            mensaje: "Faltan datos requeridos en la solicitud."
        });
    }
   
    db.query(
        "CALL sp_RegistrarCompra(?, ?, ?, ?, ?, ?, @p_Resultado, @p_Mensaje)",
        [IdUsuario, IdProveedor, TipoDocumento, MontoTotal, IdSucursal, JSON.stringify(DetalleCompra)],
        (err, result) => {
            if (err) {
                console.error("Error al ejecutar el procedimiento almacenado para registrar la compra:", err.message);
                return res.status(500).send({
                    mensaje: "Error al registrar la compra.",
                    detalle: err.message
                });
            }

            db.query(
                "SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje",
                (err, result) => {
                    if (err) {
                        console.error("Error al obtener el resultado del procedimiento:", err.message);
                        return res.status(500).send({
                            mensaje: "Error al obtener el resultado del procedimiento.",
                            detalle: err.message
                        });
                    }

                    const resultado = result[0];
                    if (resultado.Resultado > 0) {
                        res.status(200).send({
                            mensaje: "Compra registrada con éxito",
                            id: resultado.Resultado
                        });
                    } else {
                        res.status(400).send({
                            mensaje: resultado.Mensaje
                        });
                    }
                }
            );
        }
    );
};

const eliminar = (req, res) => {
    const idCompra = parseInt(req.params.id);

    if (isNaN(idCompra)) {
        return res.status(400).send({
            success: false,
            mensaje: "ID de compra inválido."
        });
    }

    // Llamar al SP para eliminar la compra y actualizar el stock
    db.query(
        "CALL SP_EliminarCompra(?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [idCompra],
        (err, result) => {
            if (err) {
                console.error("Error al eliminar la compra:", err.message);
                return res.status(500).send({
                    success: false,
                    mensaje: "Error al eliminar la compra.",
                    detalle: err.message
                });
            }

            const resultado = result[1][0].Resultado;
            const mensaje = result[1][0].Mensaje;

            if (resultado === 1) { 
                res.status(200).send({
                    success: true,
                    mensaje: mensaje || "Compra eliminada exitosamente."
                });
            } else {
                res.status(400).send({
                    success: false,
                    mensaje: mensaje || "No se pudo eliminar la compra."
                });
            }
        }
    );
};

// const verDetalleCompra = (req, res) => {
//     const NumeroDocumento = req.query.NumeroDocumento;
//     if (!NumeroDocumento) {
//         res.status(400).send("Debes proporcionar el número de documento de la compra.");
//         return;
//     }

//     db.query("SELECT u.NombreCompleto AS UsuarioRegistro, c.IdCompra, DATE_FORMAT(c.FechaRegistro , '%Y-%m-%d') AS FechaRegistro, c.TipoDocumento, c.NumeroDocumento, c.MontoTotal, p.Nombre AS Producto, p.Codigo, dc.idDetalleCompra, dc.PrecioCompra, dc.PrecioVenta, dc.Cantidad, dc.MontoTotal FROM compra c INNER JOIN detalle_compra dc ON dc.IdCompra = c.IdCompra INNER JOIN Usuario u ON u.idusuario = c.idusuario INNER JOIN producto p ON p.idproducto = dc.idProducto WHERE c.NumeroDocumento = ?", [NumeroDocumento],
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 res.status(500).send("Error al buscar la compra.");
//             } else {
//                 if (result.length === 0) {
//                     res.status(404).send("Compra no encontrada.");
//                 } else {
//                     res.send(result);
//                 }
//             }
//         });
// };

const validarToken = (req, res, next) => {
    const accessToken = req.query.accesstoken;
    if (!accessToken) {
      return res.send('Acceso denegado');  // Aquí agregué 'return'
    }
  
    jwt.verify(accessToken, process.env.SECRET, (err, Usuario) => {
      if (err) {
        return res.send('Acceso denegado, token expirado o incorrecto');  // Aquí agregué 'return'
      } else {
        req.Usuario = Usuario;
        next();
      }
    });
  };
  


module.exports = {registrarCompra,verDetalle,eliminar,validarToken}