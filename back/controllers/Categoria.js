const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');

const registrar = (req, res) => {
    const Descripcion = req.body.Descripcion;
    let Estado = req.body.Estado;

    Estado = Estado === "" ? 1 : parseInt(Estado, 10);

    db.query(
        "CALL SP_RegistrarCategoria(?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;", 
        [Descripcion, Estado],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    mensaje: "Error del servidor al registrar la categoría",
                    detalle: err.message
                });
            } else {
                const resultado = result[1][0];
                if (resultado.Resultado > 0) {
                    res.status(200).send({
                        success: true,
                        mensaje: "Categoría registrada con éxito",
                        id: resultado.Resultado
                    });
                } else {
                    res.status(400).send({
                        success: false,
                        mensaje: resultado.Mensaje || "No se pudo registrar la categoría."
                    });
                }
            }
        }
    );
};




const mostrar=(req,res)=>{
    db.query("SELECT * from CATEGORIA;",
    (err,result)=>{
        if(err){
        console.log(err)
    }else{
        res.send(result)
    }});
};



const editar = (req, res) => {
    const IdCategoria = req.body.IdCategoria;
    const Descripcion = req.body.Descripcion;
    let Estado = req.body.Estado;

    Estado = Estado === "" ? 1 : parseInt(Estado, 10);

    db.query(
        "CALL SP_EditarCategoria(?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;", 
        [IdCategoria, Descripcion, Estado],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error del servidor al editar la categoría",
                    detalle: err.message
                });
            } else {
                const resultado = result[1][0];
                if (resultado.Resultado > 0) {
                    res.status(200).send({
                        success: true,
                        mensaje: "Categoría editada con éxito"
                    });
                } else {
                    res.status(400).send({
                        success: false,
                        mensaje: resultado.Mensaje || "No se pudo editar la categoría."
                    });
                }
            }
        }
    );
};

const eliminar = (req, res) => {
    const IdCategoria = req.params.id;

    db.query(
        "CALL SP_EliminarCategoria(?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;", 
        [IdCategoria],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error del servidor al eliminar la categoría",
                    detalle: err.message
                });
            } else {
                const resultado = result[1][0];
                if (resultado.Resultado > 0) {
                    res.status(200).send({
                        success: true,
                        mensaje: "Categoría eliminada con éxito"
                    });
                } else {
                    res.status(400).send({
                        success: false,
                        mensaje: resultado.Mensaje || "No se pudo eliminar la categoría."
                    });
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
  

module.exports = {registrar, mostrar, editar, eliminar,validarToken}