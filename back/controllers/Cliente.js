const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');


const registrar = (req, res) => {
    const { Documento, Clave,NombreCompleto, Correo, Telefono, Deuda = 0, Estado } = req.body;
    const EstadoValor = Estado === "" ? 1 : parseInt(Estado);

    db.query(
        "CALL SP_RegistrarCliente(?, ?,?, ?, ?, ?, ?, @Resultado, @Mensaje); SELECT @Resultado AS Resultado, @Mensaje AS Mensaje;",
        [Documento, Clave,NombreCompleto, Correo, Telefono, Deuda, EstadoValor],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                const resultado = results[1][0].Resultado;
                const mensaje = results[1][0].Mensaje;

                if (resultado > 0) {
                    res.status(200).send({ success: true, mensaje: "Cliente creado con éxito", idCliente: resultado });
                } else {
                    res.status(400).send({ success: false, mensaje });
                }
            }
        }
    );
};

const registrarDireccion = (req, res) => {
    let IdCliente = req.query.IdCliente; 
    if (!IdCliente) {
        IdCliente = req.Usuario?.IdCliente; 
    }
    const {Provincia, Ciudad, CodigoPostal, Direccion } = req.body;
    db.query(
        "CALL SP_RegistrarDireccion(?, ?, ?, ?, ?, ?, @Resultado, @Mensaje); SELECT @Resultado AS Resultado, @Mensaje AS Mensaje;",
        [IdCliente, Provincia, Ciudad, CodigoPostal, Direccion, 1],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                const resultado = results[1][0].Resultado;
                const mensaje = results[1][0].Mensaje;

                if (resultado > 0) {
                    res.status(200).send({ success: true, mensaje: "Dirección registrada con éxito", idDireccion: resultado });
                } else {
                    res.status(400).send({ success: false, mensaje });
                }
            }
        }
    );
};


const mostrar = (req,res)=>{
    db.query("SELECT * from CLIENTE;",
    (err,result)=>{
        if(err){
        console.log(err)
    }else{
        res.send(result)
    }});
};


const editar = (req, res) => {
    const { IdCliente, Documento, Clave,NombreCompleto, Correo, Telefono, Deuda = 0, Estado } = req.body;
    const EstadoValor = Estado === "" ? 1 : parseInt(Estado);

    db.query(
        "CALL SP_ModificarCliente(?,?, ?, ?, ?, ?, ?, ?, @Resultado, @Mensaje); SELECT @Resultado AS Resultado, @Mensaje AS Mensaje;",
        [IdCliente, Documento,Clave, NombreCompleto, Correo, Telefono, Deuda, EstadoValor],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                const resultado = results[1][0].Resultado;
                const mensaje = results[1][0].Mensaje;

                if (resultado > 0) {
                    res.status(200).send({ success: true, mensaje: "Cliente actualizado correctamente" });
                } else {
                    res.status(400).send({ success: false, mensaje });
                }
            }
        }
    );
};


const eliminar = (req, res) => {
    const IdCliente = req.params.id;

    db.query(
        "CALL SP_ELIMINARCLIENTE(?, @Respuesta, @Mensaje); SELECT @Respuesta AS Respuesta, @Mensaje AS Mensaje;",
        [IdCliente],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                const respuesta = results[1][0].Respuesta;
                const mensaje = results[1][0].Mensaje;

                if (respuesta) {
                    res.status(200).send({ success: true, mensaje });
                } else {
                    res.status(400).send({ success: false, mensaje });
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
  
  const registrarPago = (req, res) => {
   console.log(req.body)
    const { IdCliente, Deuda, IdUsuario, MetodoPago } = req.body;
    console.log(IdCliente, Deuda, IdUsuario, MetodoPago)
    db.query(
        "CALL SP_BajarDeuda(?, ?, ?, ?, @Resultado, @Mensaje); SELECT @Resultado AS Resultado, @Mensaje AS Mensaje;",
        [IdCliente, Deuda, IdUsuario, MetodoPago],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                const resultado = results[1][0].Resultado;
                const mensaje = results[1][0].Mensaje;

                if (resultado > 0) {
                    res.status(200).send({ success: true, mensaje });
                } else {
                    res.status(400).send({ success: false, mensaje });
                }
            }
        }
    );
};

const eliminarPago = (req, res) => {
    const IdPago = req.params.id;

    db.query(
        "CALL SP_EliminarPago(?, @Resultado, @Mensaje); SELECT @Resultado AS Resultado, @Mensaje AS Mensaje;",
        [IdPago],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                const resultado = results[1][0].Resultado;
                const mensaje = results[1][0].Mensaje;

                if (resultado > 0) {
                    res.status(200).send({ success: true, mensaje });
                } else {
                    res.status(400).send({ success: false, mensaje });
                }
            }
        }
    );
};



const obtenerPagos = (req, res) => {
   
    let IdCliente = req.query.IdCliente;
    console.log(req.body)
    if(!IdCliente){
    IdCliente=req.Usuario.IdCliente
    }
    console.log(IdCliente)
    
    db.query(
        `WITH PagosCte AS (
    SELECT 
        p.idPago, 
        p.Monto, 
        p.MetodoPago, 
        p.NumeroVenta, 
        DATE_FORMAT(p.FechaRegistro, '%d/%m/%Y') AS FechaRegistro, 
        u.NombreCompleto,
        CASE WHEN p.MetodoPago = '' THEN p.Monto ELSE 0 END AS Debe,
        CASE WHEN p.NumeroVenta = '' THEN p.Monto ELSE 0 END AS Haber
    FROM PAGO p
    INNER JOIN USUARIO u ON u.IdUsuario = p.IdUsuario
    WHERE p.IdCliente = ?
)
SELECT 
    idPago, 
    FechaRegistro, 
    MetodoPago, 
    NumeroVenta, 
    NombreCompleto, 
    Debe, 
    Haber, 
    SUM(Debe - Haber) OVER (ORDER BY idPago) AS Saldo
FROM PagosCte
ORDER BY idPago;`,
        [IdCliente],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                if (results.length > 0) {
                    res.status(200).send({ success: true, pagos: results });
                } else {
                    res.status(404).send({ success: false, mensaje: "No se encontraron pagos para el cliente especificado." });
                }
            }
        }
    );
};

const obtenerDirecciones = (req, res) => {
    let IdCliente = req.query.IdCliente; 
    if (!IdCliente) {
        IdCliente = req.Usuario?.IdCliente; 
    }

    console.log("IdCliente:", IdCliente);

    db.query(
        `SELECT 
            IdDireccion, 
            Provincia, 
            Ciudad, 
            CodigoPostal, 
            Direccion, 
            Estado, 
            DATE_FORMAT(FechaRegistro, '%d/%m/%Y') AS FechaRegistro
        FROM DIRECCION
        WHERE IdCliente = ? AND Estado = 1
        ORDER BY FechaRegistro DESC`, // Filtra por cliente y direcciones activas (Estado = 1)
        [IdCliente],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).send({
                    success: false,
                    mensaje: "Error en la base de datos",
                    error: err.message
                });
            } else {
                if (results.length > 0) {
                    res.status(200).send({ success: true, direcciones: results });
                } else {
                    res.status(404).send({ success: false, mensaje: "No se encontraron direcciones para el cliente especificado." });
                }
            }
        }
    );
};


const generarAccessToken = (Cliente)=>{
    return jwt.sign(Cliente, process.env.SECRET, {expiresIn:'30m'} )   
}

const Login = (req, res) => {
    const Documento = req.body.Documento;
    const Clave = req.body.Clave;
    // Validación básica de entrada
    if (!Documento || !Clave) {
        return res.status(400).send('Usuario y/o clave son requeridos');
    }

    db.query(
        "SELECT IdCliente, NombreCompleto, Estado, Correo,Documento,Clave, Telefono, Deuda FROM CLIENTE WHERE Documento = ? AND Clave = ?",
        [Documento, Clave],
        (error, results) => {
            if (error) {
                console.error("Error en la consulta:", error);
                return res.status(500).send("Error del servidor");
            } else {
                if (results.length > 0) {
                    const client = results[0];
                    const estado = client.Estado;
                    if (estado === 1) {
                        const Cliente = {
                            IdCliente: client.IdCliente,
                            NombreCompleto: client.NombreCompleto,
                            Correo: client.Correo,
                            Telefono: client.Telefono,
                            Deuda: client.Deuda,
                            Documento: client.Documento
                        };

                        const accessToken = generarAccessToken(Cliente);
                        res.header('auth', accessToken).json({
                            message: 'Cliente autorizado',
                            token: accessToken,
                            cliente: client
                        });
                    } else {
                        res.status(403).send('Cliente inactivo');
                    }
                } else {
                    res.status(400).send('Usuario y/o clave incorrecta');
                }
            }
        }
    );
}


const verificarToken = async (req, res) => {

    const accessToken = req.query.accesstoken || req.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
        return res.status(401).json({ message: 'Token vacío' });
    }   
    jwt.verify(accessToken, process.env.SECRET, (err, Cliente) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        
        if (!Cliente.IdCliente) {  
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
  

        res.json({ message: 'Token válido y permiso válido', Cliente });
    });
};


module.exports = {mostrar, registrar,editar,obtenerDirecciones,registrarDireccion,eliminar,registrarPago,eliminarPago,obtenerPagos,validarToken,Login,verificarToken }