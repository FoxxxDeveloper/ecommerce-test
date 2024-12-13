const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registrar = (req, res) => {
    const { Documento, NombreCompleto, Correo, Clave, IdRol, IdSucursal, Estado } = req.body;
    const EstadoValor = Estado === "" ? 1 : parseInt(Estado);

    // Validar datos requeridos
    if (!Documento || !NombreCompleto || !Correo || !Clave || !IdRol || !IdSucursal) {
        return res.status(400).send({
            success: false,
            mensaje: "Faltan datos requeridos en la solicitud."
        });
    }

    db.query(
        "CALL SP_REGISTRARUSUARIO(?, ?, ?, ?, ?, ?, ?, @p_IdUsuarioResultado, @p_Mensaje); SELECT @p_IdUsuarioResultado AS IdUsuarioResultado, @p_Mensaje AS Mensaje;",
        [Documento, NombreCompleto, Correo, Clave, IdRol, EstadoValor, IdSucursal],
        (err, results) => {
            if (err) {
                console.error("Error al registrar el usuario:", err.message);
                return res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos.",
                    error: err.message
                });
            }

            const resultado = results[1][0].IdUsuarioResultado;
            const mensaje = results[1][0].Mensaje;

            if (resultado > 0) {
                res.status(200).send({
                    success: true,
                    mensaje: "Usuario creado con éxito",
                    idUsuario: resultado
                });
            } else {
                res.status(400).send({
                    success: false,
                    mensaje
                });
            }
        }
    );
};

const mostrar = (req, res) => {
    db.query(
        "SELECT u.IdUsuario, u.Documento, u.NombreCompleto, u.Correo, u.Clave, u.Estado, r.IdRol, r.Descripcion,s.IdSucursal,s.Nombre as Sucursal FROM USUARIO u INNER JOIN ROL r ON r.IdRol = u.IdRol INNER JOIN SUCURSAL s ON s.IdSucursal = u.IdSucursal;",
        (err, result) => {
            if (err) {
                console.error("Error al obtener usuarios:", err.message);
                return res.status(500).send({
                    mensaje: "Error al obtener usuarios.",
                    detalle: err.message
                });
            }
            res.status(200).send(result);
        }
    );
};

const MostrarUsuarioLog = (req, res) => {
    res.status(200).json({
        Usuario: req.Usuario
    });
};
const editar = (req, res) => {
    const { IdUsuario, Documento, NombreCompleto, Correo, Clave, IdRol, Estado, IdSucursal } = req.body;
    const EstadoValor = Estado === "" ? 1 : parseInt(Estado);

    if (!IdUsuario || !Documento || !NombreCompleto || !Correo || !Clave || !IdRol || !IdSucursal) {
        return res.status(400).send({
            success: false,
            mensaje: "Faltan datos requeridos en la solicitud."
        });
    }

    db.query(
        "CALL SP_EDITARUSUARIO(?, ?, ?, ?, ?, ?, ?, ?, @p_Respuesta, @p_Mensaje); SELECT @p_Respuesta AS Respuesta, @p_Mensaje AS Mensaje;",
        [IdUsuario, IdSucursal, Documento, NombreCompleto, Correo, Clave, IdRol, EstadoValor],
        (err, results) => {
            if (err) {
                console.error("Error al editar el usuario:", err.message);
                return res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos.",
                    detalle: err.message
                });
            }

            const respuesta = results[1][0].Respuesta;
            const mensaje = results[1][0].Mensaje;

            if (respuesta > 0) {
                res.status(200).send({
                    success: true,
                    mensaje: "Usuario editado con éxito"
                });
            } else {
                res.status(400).send({
                    success: false,
                    mensaje
                });
            }
        }
    );
};
const eliminar = (req, res) => {
    const IdUsuario = req.params.id;

    if (!IdUsuario) {
        return res.status(400).send({
            mensaje: "El ID del usuario es requerido."
        });
    }

    // Ejecutar el procedimiento almacenado
    db.query(
        "CALL SP_ELIMINARUSUARIO(?, @p_Respuesta, @p_Mensaje)",
        [IdUsuario],
        (err) => {
            if (err) {
                console.error("Error al ejecutar el procedimiento almacenado:", err.message);
                return res.status(500).send({
                    mensaje: "Error al ejecutar el procedimiento almacenado.",
                    detalle: err.message
                });
            }

            // Obtener los resultados de las variables de salida
            db.query(
                "SELECT @p_Respuesta AS Respuesta, @p_Mensaje AS Mensaje",
                (err, result) => {
                    if (err) {
                        console.error("Error al obtener el resultado de la eliminación:", err.message);
                        return res.status(500).send({
                            mensaje: "Error al obtener el resultado de la eliminación.",
                            detalle: err.message
                        });
                    }

                    console.log("Resultado de la consulta:", result);

                    // Verificar el resultado
                    if (!result || !result.length || !result[0]) {
                        console.error("Resultado inesperado de la consulta:", result);
                        return res.status(500).send({
                            mensaje: "Resultado inesperado de la consulta."
                        });
                    }

                    const { Respuesta, Mensaje } = result[0];

                    if (Respuesta) {
                        return res.status(200).send({
                            success: true,
                            mensaje: Mensaje
                        });
                    } else {
                        return res.status(400).send({
                            success: false,
                            mensaje: Mensaje || "No se pudo eliminar el usuario."
                        });
                    }
                }
            );
        }
    );
};




const login = (req, res) => {
    const DNI = req.body.DNI;
    const Clave = req.body.Clave;
    const IdSucursal = req.body.IdSucursal;
    db.query(
        "SELECT u.IdUsuario, u.NombreCompleto, u.Estado, r.Descripcion AS ROL, u.IdSucursal " +
        "FROM USUARIO u " +
        "INNER JOIN ROL r ON u.IdRol = r.IdRol " +
        "WHERE u.Documento = ? AND u.Clave = ?",
        [DNI, Clave],
        (error, results) => {
            if (error) {
                console.error("Error en la consulta:", error);
                return res.status(500).send("Error del servidor");
            }

            if (results.length > 0) {
                const user = results[0];
                const estado = user.Estado;
                const rol = user.ROL;

                if (estado === 1) {
                    // Verificar si el usuario no es Administrador
                    if (rol !== 'ADMINISTRADOR' && user.IdSucursal != IdSucursal) {
                        return res.status(403).send('Acceso denegado: No autorizado para esta sucursal');
                    }

                    // Obtener permisos
                    db.query(
                        "SELECT NombreMenu FROM PERMISO WHERE IdUsuario = ?",
                        [user.IdUsuario],
                        (permError, permResults) => {
                            if (permError) {
                                console.error("Error en la consulta de permisos:", permError);
                                return res.status(500).send("Error del servidor");
                            }

                            const permisos = permResults.map(perm => perm.NombreMenu);
                            const Usuario = {
                                IdUsuario: user.IdUsuario,
                                NombreCompleto: user.NombreCompleto,
                                Permisos: permisos
                            };

                            const accessToken = generarAccessToken(Usuario);
                            res.header('auth', accessToken).json({
                                message: 'Usuario autorizado',
                                token: accessToken,
                                rol: user.ROL,
                                idsucursal: user.IdSucursal,
                                IdUsuario: user.IdUsuario
                            });
                        }
                    );
                } else {
                    res.status(403).send('Usuario inactivo');
                }
            } else {
                res.status(400).send('DNI y/o contraseña incorrecta');
            }
        }
    );
};

const generarAccessToken = (Usuario)=>{
    return jwt.sign(Usuario, process.env.SECRET, {expiresIn:'12h'} )   
}


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
  const verificarToken = async (req, res) => {
    const accessToken = req.query.accesstoken || req.headers['authorization']?.split(' ')[1];
    const { NombreMenu } = req.query;

    if (!accessToken) {
        return res.status(401).json({ message: 'Token vacío' });
    }   

    jwt.verify(accessToken, process.env.SECRET, (err, Usuario) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        if (Usuario.IdCliente) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        if (!Usuario.Permisos.includes(NombreMenu)) {
            return res.status(403).json({ message: 'Permiso denegado' });
        }

        res.json({ message: 'Token válido y permiso válido', Usuario });
    });
};


module.exports = {registrar, mostrar, editar, eliminar, login, MostrarUsuarioLog,validarToken,verificarToken}