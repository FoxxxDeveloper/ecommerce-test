const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');
const registrar = (req, res) => {
    const { Descripcion, Porcentaje } = req.body;

    if (!Descripcion || Porcentaje === undefined) {
        return res.status(400).send({
            success: false,
            mensaje: "Faltan datos requeridos en la solicitud."
        });
    }

    db.query(
        "CALL SP_RegistrarMetodoPago(?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [Descripcion, Porcentaje],
        (err, result) => {
            if (err) {
                console.error("Error al registrar el método de pago:", err.message);
                return res.status(500).send({
                    success: false,
                    mensaje: "Error al registrar el método de pago.",
                    detalle: err.message
                });
            }

            const resultado = result[1][0];
            if (resultado.Resultado > 0) {
                res.status(200).send({
                    success: true,
                    mensaje: resultado.Mensaje,
                    id: resultado.Resultado
                });
            } else {
                res.status(400).send({
                    success: false,
                    mensaje: resultado.Mensaje
                });
            }
        }
    );
};

const mostrar = (req, res) => {
    db.query(
        "SELECT * FROM METODO_PAGO;",
        (err, result) => {
            if (err) {
                console.error("Error al obtener métodos de pago:", err.message);
                return res.status(500).send({
                    mensaje: "Error al obtener métodos de pago.",
                    detalle: err.message
                });
            }
            res.status(200).send(result);
        }
    );
};
const editar = (req, res) => {
    const { IdMetodoPago, Descripcion, Porcentaje } = req.body;

    if (!IdMetodoPago || !Descripcion || Porcentaje === undefined) {
        return res.status(400).send({
            success: false,
            mensaje: "Faltan datos requeridos en la solicitud."
        });
    }

    db.query(
        "CALL SP_EditarMetodoPago(?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [IdMetodoPago, Descripcion, Porcentaje],
        (err, result) => {
            if (err) {
                console.error("Error al editar el método de pago:", err.message);
                return res.status(500).send({
                    success: false,
                    mensaje: "Error al editar el método de pago.",
                    detalle: err.message
                });
            }

            const resultado = result[1][0];
            if (resultado.Resultado > 0) {
                res.status(200).send({
                    success: true,
                    mensaje: "Método de pago editado con éxito"
                });
            } else {
                res.status(400).send({
                    success: false,
                    mensaje: resultado.Mensaje
                });
            }
        }
    );
};
const eliminar = (req, res) => {
    const IdMetodoPago = req.params.id;

    if (!IdMetodoPago) {
        return res.status(400).send({
            success: false,
            mensaje: "El ID del método de pago es requerido."
        });
    }

    db.query(
        "CALL SP_EliminarMetodoPago(?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [IdMetodoPago],
        (err, result) => {
            if (err) {
                console.error("Error al eliminar el método de pago:", err.message);
                return res.status(500).send({
                    success: false,
                    mensaje: "Error al eliminar el método de pago.",
                    detalle: err.message
                });
            }

            const resultado = result[1][0];
            if (resultado.Resultado > 0) {
                res.status(200).send({
                    success: true,
                    mensaje: "Método de pago eliminado con éxito"
                });
            } else {
                res.status(400).send({
                    success: false,
                    mensaje: resultado.Mensaje
                });
            }
        }
    );
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
  


module.exports = {registrar, mostrar, editar, eliminar,validarToken}