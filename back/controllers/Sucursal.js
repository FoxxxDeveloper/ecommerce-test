const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');


const mostrar=(req,res)=>{
    db.query("SELECT * from SUCURSAL;",
    (err,result)=>{
        if(err){
        console.log(err)
    }else{
        res.send(result)
    }});
};
const obtenerDatos = (req,res)=>{
    const IdSucursal = req.query.IdSucursal;
    db.query("SELECT * FROM SUCURSAL where IdSucursal= ?", [IdSucursal],
    (err,result)=>{if (err) {
        console.log(err);
        res.status(500).send("Error al buscar la sucursal.");
      } else {
        if (result.length === 0) {
          res.status(404).send("Sucursal no encontrada.");
        } else {
          res.send(result[0]); 
        }
      }
    });
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
module.exports = {mostrar, obtenerDatos,validarToken}