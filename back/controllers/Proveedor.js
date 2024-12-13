const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');
const registrar = (req, res) => {
    const { Documento, RazonSocial, Correo, Telefono, Estado } = req.body;
    let EstadoValor = Estado === "" ? 1 : parseInt(Estado);

    db.query(
        "CALL SP_RegistrarProveedor(?, ?, ?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [Documento, RazonSocial, Correo, Telefono, EstadoValor],
        (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                const resultado = result[1][0];
                if (resultado.Resultado > 0) {
                    res.status(200).send({
                        success: true,
                        mensaje: "Proveedor registrado con éxito",
                        id: resultado.Resultado
                    });
                } else {
                    res.status(400).send({
                        success: false,
                        mensaje: resultado.Mensaje || "Error desconocido"
                    });
                }
            }
        }
    );
};



const mostrar= (req,res)=>{
    db.query("SELECT * from PROVEEDOR;",
    (err,result)=>{
        if(err){
        console.log(err)
    }else{
        res.send(result)
    }});
};
const editar = (req, res) => {
    const { IdProveedor, Documento, RazonSocial, Correo, Telefono, Estado } = req.body;
    let EstadoValor = Estado === "" ? 1 : parseInt(Estado);

    db.query(
        "CALL SP_ModificarProveedor(?, ?, ?, ?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [IdProveedor, Documento, RazonSocial, Correo, Telefono, EstadoValor],
        (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                const resultado = result[1][0];
                if (resultado.Resultado > 0) {
                    res.status(200).send({ mensaje: "Proveedor modificado con éxito" });
                } else {
                    res.status(400).send({ mensaje: resultado.Mensaje || "Error desconocido" });
                }
            }
        }
    );
};

const eliminar = (req, res) => {
    const IdProveedor = req.params.id;

    // Validación básica del ID del proveedor
    if (!IdProveedor || isNaN(IdProveedor)) {
        return res.status(400).send({ success: false, mensaje: "ID del proveedor no válido" });
    }

    db.query(
        "CALL SP_EliminarProveedor(?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [IdProveedor],
        (err, result) => {
            if (err) {
                console.error("Error al eliminar proveedor:", err);
                return res.status(500).send({ success: false, mensaje: "Error al procesar la solicitud. Intente nuevamente más tarde." });
            } else {
                const resultado = result[1][0];
                if (resultado.Resultado > 0) {
                    res.status(200).send({ success: true, mensaje: "Proveedor eliminado con éxito" });
                } else {
                    res.status(400).send({ success: false, mensaje: resultado.Mensaje });
                }
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
  


module.exports = {mostrar, registrar,editar,eliminar,validarToken }