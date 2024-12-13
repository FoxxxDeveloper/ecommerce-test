const {db} = require("../db/db.js")
const jwt = require('jsonwebtoken');

const registrar = (req, res) => {
    const { Nombre, Descripcion, Precio, DetallePaquete } = req.body;
  
    if (!Nombre || !Descripcion || !Precio || !DetallePaquete) {
        return res.status(400).send({
            mensaje: "Faltan datos requeridos en la solicitud."
        });
    }
  
    db.query(
        "CALL sp_RegistrarPaquete(?, ?, ?, ?, @p_Resultado, @p_Mensaje)",
        [Nombre, Descripcion, Precio, JSON.stringify(DetallePaquete)],
        (err, result) => {
            if (err) {
                console.error("Error al registrar el paquete:", err.message);
                return res.status(500).send({
                    mensaje: "Error al registrar el paquete.",
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

                    const { Resultado, Mensaje } = result[0];
                    const success = Resultado === 1;

                    res.status(200).send({
                        success,
                        mensaje: Mensaje
                    });
                }
            );
        }
    );
};

  



 
  const mostrar = (req, res) => {
    db.query(`SELECT 
    pa.IdPaquete,
    pa.Nombre,
    pa.Descripcion,
    pa.Precio,
    pa.Estado,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'IdProducto', p.IdProducto,
            'CodigoProducto', p.Codigo,
            'NombreProducto', p.Nombre,
            'PrecioProducto', p.PrecioVenta,
            'Cantidad', dp.Cantidad
        )
    ) AS DetallesProducto
FROM 
    DETALLE_PAQUETE dp
INNER JOIN 
    PRODUCTO p ON p.IdProducto = dp.IdProducto
INNER JOIN 
    PAQUETE pa ON pa.IdPaquete = dp.IdPaquete
GROUP BY 
    pa.IdPaquete, pa.Nombre, pa.Descripcion, pa.Precio, pa.Estado;`, (err, result) => {
        if (err) {
            console.error("Error al mostrar los paquetes:", err.message);
            return res.status(500).send({
                mensaje: "Error al mostrar los paquetes.",
                detalle: err.message
            });
        }
        res.status(200).send(result);
    });
};



const editar = (req, res) => {
    const { IdPaquete,Nombre, Descripcion, Precio, DetallePaquete } = req.body;

    db.query(
        "CALL sp_EditarPaquete(?, ?, ?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [IdPaquete, Nombre, Descripcion, Precio, JSON.stringify(DetallePaquete)],
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send({
              success: false,
              mensaje: "Error en la base de datos",
              error: err.message,
            });
          } else {
            const resultado = result[1][0];
            if (resultado.Resultado > 0) {
              res.status(200).send({ success: true, mensaje: "Paquete editado con éxito" });
            } else {
              res.status(400).send({ success: false, mensaje: resultado.Mensaje });
            }
          }
        }
      );
      
};
const eliminar = (req, res) => {
    const IdPaquete = req.params.id;

    db.query("CALL SP_EliminarPaquete(?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;", 
    [IdPaquete], (err, result) => {
        if (err) {
            console.error("Error al eliminar el paquete:", err.message);
            return res.status(500).send({
                mensaje: "Error al eliminar el paquete.",
                detalle: err.message
            });
        }
        const resultado = result[1][0];
        if (resultado.Resultado > 0) {
            res.status(200).send({ mensaje: "Paquete eliminado con éxito" });
        } else {
            res.status(400).send({ mensaje: resultado.Mensaje });
        }
    });
};

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
  




module.exports = {registrar,mostrar, editar, eliminar,validarToken}