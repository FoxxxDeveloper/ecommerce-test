const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');
require('dotenv').config();


const Listar = (req,res) => {
    const IdUsuario= req.params.IdUsuario;
    db.query("SELECT * FROM PERMISO where IdUsuario = "+IdUsuario, (error,results)=>{
        if(error) throw error
        res.json(results)
    })
}







const Editar = (req, res) => {
    const IdUsuario = req.params.IdUsuario;
    const { Permisos } = req.body;
  
    if (!IdUsuario) {
      return res.status(400).json({ error: 'IdUsuario no está definido' });
    }
  
    if (!Array.isArray(Permisos)) {
      return res.status(400).json({ error: 'Permisos debe ser un array' });
    }
  
    db.query('DELETE FROM PERMISO WHERE IdUsuario = ?', [IdUsuario], (error, results) => {
      if (error) {
        console.error('Error al eliminar permisos:', error);
        return res.status(500).json({ error: error.message });
      }
  
      if (Permisos.length === 0) {
        return res.json({ message: "Permisos eliminados y ningún permiso nuevo agregado.", results });
      }
  
      const permisosValues = Permisos.map(permiso => [IdUsuario, permiso]);
  
  
      let insertQuery = 'INSERT INTO PERMISO (IdUsuario, NombreMenu) VALUES ?';
  
      db.query(insertQuery, [permisosValues], (insertError, insertResults) => {
        if (insertError) {
          console.error('Error al insertar permisos:', insertError);
          return res.status(500).json({ error: insertError.message });
        }
        res.json({ message: "Permisos actualizados con éxito.", insertResults });
      });
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

module.exports={Listar,Editar,validarToken}