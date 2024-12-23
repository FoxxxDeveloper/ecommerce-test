const {db } = require("../db/db.js")
const jwt = require('jsonwebtoken');

const registrar = (req, res) => {
  const { Codigo, Nombre, Descripcion,Foto, PrecioCompra, PrecioVenta, Stock, IdSucursal, IdCategoria, Estado } = req.body;

  db.query("CALL SP_RegistrarProducto(?, ?, ?, ?,?, ?, ?, ?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
  [Codigo, Nombre, Descripcion,Foto, PrecioCompra, PrecioVenta, Stock, IdSucursal, IdCategoria, Estado],
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
              res.status(200).send({ success: true, mensaje: "Producto registrado con éxito", id: resultado.Resultado });
          } else {
              res.status(400).send({ success: false, mensaje: resultado.Mensaje });
          }
      }
  });
};




const buscar = (req,res)=>{
    const codigo = req.query.Codigo;
    const IdSucursal = req.query.IdSucursal;
    if (!codigo) {
        res.status(400).send("Debes proporcionar el código del producto.");
        return;
      }

    db.query("SELECT p.IdProducto, Codigo, Nombre, p.Descripcion,p.Foto, c.IdCategoria, c.Descripcion as DescripcionCategoria, s.Cantidad as Stock, PrecioCompra, PrecioVenta, p.Estado FROM PRODUCTO p inner join CATEGORIA c on c.IdCategoria = p.IdCategoria inner join STOCK s on s.IdProducto = p.IdProducto where IdSucursal= ? and Codigo = ?", [IdSucursal,codigo],
    (err,result)=>{if (err) {
        console.log(err);
        res.status(500).send("Error al buscar el producto.");
      } else {
        if (result.length === 0) {
          res.status(404).send("Producto no encontrado.");
        } else {
          res.send(result[0]); 
        }
      }
    });
  };

  const detalles = (req, res) => {
    const IdProducto = parseInt(req.params.id);
    if (isNaN(IdProducto)) {
        return res.status(400).send("El Id del producto no es válido.");
    }

    db.query(`
        SELECT 
            P.IdProducto, 
            P.Nombre, 
            P.Descripcion, 
            P.Foto, 
            P.PrecioVenta,
            COALESCE(AVG(R.Calificacion), 0) AS PromedioCalificacion,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'IdResena', R.IdResena,
                    'IdCliente', R.IdCliente,
                    'Titulo', R.Titulo,
                    'Calificacion', R.Calificacion,
                    'Resena', R.Reseña,
                    'Estado', R.Estado,
                    'FechaRegistro', R.FechaRegistro
                )
            ) AS Reseñas
        FROM 
            PRODUCTO P
        LEFT JOIN RESENA R ON P.IdProducto = R.IdProducto AND R.Estado = 'Aprobada'
        WHERE 
            P.IdProducto = ?
        GROUP BY 
            P.IdProducto, P.Nombre, P.Descripcion, P.Foto, P.PrecioVenta;
    `, [IdProducto], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al buscar el producto.");
        }

        if (result.length === 0) {
            return res.status(404).send("Producto no encontrado.");
        }

        res.send(result[0]);
    });
};
const buscarProductos = (req, res) => {
    const terminoBusqueda = req.params.termino;
    if (!terminoBusqueda) {
        return res.status(400).send("El término de búsqueda es obligatorio.");
    }

    const sqlQuery = `
        SELECT 
            P.IdProducto, 
            P.Nombre, 
            P.Descripcion, 
            P.Foto, 
            P.PrecioVenta,
            C.Descripcion AS NombreCategoria,
            COALESCE(AVG(R.Calificacion), 0) AS PromedioCalificacion
        FROM 
            PRODUCTO P
        INNER JOIN 
            CATEGORIA C ON P.IdCategoria = C.IdCategoria
        LEFT JOIN 
            RESENA R ON P.IdProducto = R.IdProducto AND R.Estado = 'Aprobada'
        WHERE 
            P.Nombre LIKE ? OR P.Descripcion LIKE ?
        GROUP BY 
            P.IdProducto, P.Nombre, P.Descripcion, P.Foto, P.PrecioVenta, C.Descripcion;
    `;

    const buscador = `%${terminoBusqueda}%`;

    db.query(sqlQuery, [buscador, buscador], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error al buscar los productos.");
        }

        if (result.length === 0) {
            return res.status(404).send("No se encontraron productos que coincidan con la búsqueda.");
        }

        res.send(result);
    });
};

const productosCat = (req, res) => {
    const IdCategoria = parseInt(req.params.id);
    if (isNaN(IdCategoria)) {
        return res.status(400).send("El Id de la categoría no es válido.");
    }

    db.query(`
        SELECT 
            P.IdProducto, 
            P.Nombre, 
            P.Descripcion, 
            P.Foto, 
            P.PrecioVenta,
            C.Descripcion AS NombreCategoria,
            COALESCE(AVG(R.Calificacion), 0) AS PromedioCalificacion
        FROM 
            PRODUCTO P
        INNER JOIN 
            CATEGORIA C ON P.IdCategoria = C.IdCategoria
        LEFT JOIN 
            RESENA R ON P.IdProducto = R.IdProducto AND R.Estado = 'Aprobada'
        WHERE 
            P.IdCategoria = ?
        GROUP BY 
            P.IdProducto, P.Nombre, P.Descripcion, P.Foto, P.PrecioVenta, C.Descripcion;
    `, [IdCategoria], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error al buscar los productos.");
        }

        if (result.length === 0) {
            return res.status(404).send("No se encontraron productos para esta categoría.");
        }

        res.send(result);
    });
};



  const mostrarTop = (req, res) => {
    const queryTopVendidos = `
        SELECT 
            P.IdProducto, 
            P.Nombre, 
            P.Descripcion, 
            P.Foto, 
            P.PrecioVenta,
            COALESCE(AVG(R.Calificacion), 0) AS PromedioCalificacion
        FROM 
            PRODUCTO P
        INNER JOIN (
            SELECT 
                DV.IdProducto, 
                SUM(DV.Cantidad) AS CantidadTotal
            FROM 
                DETALLE_VENTA DV
            GROUP BY 
                DV.IdProducto
            ORDER BY 
                CantidadTotal DESC
            LIMIT 3
        ) TOP_VENDIDOS ON P.IdProducto = TOP_VENDIDOS.IdProducto
        LEFT JOIN RESENA R ON P.IdProducto = R.IdProducto AND R.Estado = 'Aprobada'
        GROUP BY 
            P.IdProducto, P.Nombre, P.Descripcion, P.Foto, P.PrecioVenta;
    `;

    const queryNuevosProductos = `
        SELECT 
            P.IdProducto, 
            P.Nombre, 
            P.Descripcion, 
            P.Foto, 
            P.PrecioVenta,
            COALESCE(AVG(R.Calificacion), 0) AS PromedioCalificacion
        FROM 
            PRODUCTO P
        LEFT JOIN RESENA R ON P.IdProducto = R.IdProducto AND R.Estado = 'Aprobada'
        GROUP BY 
            P.IdProducto, P.Nombre, P.Descripcion, P.Foto, P.PrecioVenta
        ORDER BY 
            P.FechaRegistro DESC
        LIMIT 3;
    `;

    // Realiza la primera consulta
    db.query(queryTopVendidos, (err, topVendidos) => {
        if (err) {
            console.error("Error en la consulta de productos más vendidos:", err);
            return res.status(500).send("Error al ejecutar la consulta de productos más vendidos.");
        }

        // Realiza la segunda consulta
        db.query(queryNuevosProductos, (err, nuevosProductos) => {
            if (err) {
                console.error("Error en la consulta de nuevos productos:", err);
                return res.status(500).send("Error al ejecutar la consulta de nuevos productos.");
            }

            // Verifica que los resultados sean arreglos
            if (!Array.isArray(topVendidos) || !Array.isArray(nuevosProductos)) {
                return res.status(500).send("Uno de los resultados no es un arreglo.");
            }

            // Envía la respuesta
            res.json({
                topVendidos,
                nuevosProductos,
            });
        });
    });
};




const mostrar =(req,res)=>{
  const { IdSucursal } = req.query;
    db.query("SELECT p.IdProducto, Codigo, Nombre, p.Descripcion,p.Foto, c.IdCategoria, c.Descripcion as DescripcionCategoria, s.Cantidad as Stock, PrecioCompra, PrecioVenta, p.Estado FROM PRODUCTO p inner join CATEGORIA c on c.IdCategoria = p.IdCategoria inner join STOCK s on s.IdProducto = p.IdProducto where IdSucursal="+IdSucursal,
    (err,result)=>{
        if(err){
        console.log(err)
    }else{
        res.send(result)
    }});
};
const editar = (req, res) => {
    const { IdProducto, IdSucursal, Codigo, Nombre, Descripcion,Foto, PrecioCompra, PrecioVenta, Cantidad, IdCategoria, Estado } = req.body;

    db.query("CALL SP_ModificarProducto(?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
    [IdProducto, IdSucursal, Codigo, Nombre, Descripcion,Foto, PrecioCompra, PrecioVenta, Cantidad, IdCategoria, Estado],
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
                res.status(200).send({ success: true, mensaje: "Producto editado con éxito" });
            } else {
                res.status(400).send({ success: false, mensaje: resultado.Mensaje });
            }
        }
    });
};


const eliminar = (req, res) => {
  const IdProducto = req.params.id;

  db.query("CALL SP_EliminarProducto(?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
  [IdProducto],
  (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send(err);
      } else {
          const resultado = result[1][0];
          if (resultado.Resultado > 0) {
              res.status(200).send({ mensaje: "Producto eliminado con éxito" });
          } else {
              res.status(400).send({ mensaje: resultado.Mensaje });
          }
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
  

  const subirPreciosMasivos = (req, res) => {
    const { idCategoria, porcentaje } = req.body;

    if (!idCategoria || !porcentaje) {
        return res.status(400).send({
            success: false,
            mensaje: "Faltan parámetros necesarios."
        });
    }

    db.query(
        "CALL SP_SubirMasivo(?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [idCategoria, porcentaje],
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
                    res.status(200).send({ success: true, mensaje: resultado.Mensaje });
                } else {
                    res.status(400).send({ success: false, mensaje: resultado.Mensaje });
                }
            }
        }
    );
};

const bajarPreciosMasivos = (req, res) => {
    const { idCategoria, porcentaje } = req.body;

    if (!idCategoria || !porcentaje) {
        return res.status(400).send({
            success: false,
            mensaje: "Faltan parámetros necesarios."
        });
    }

    db.query(
        "CALL SP_BajarMasivo(?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
        [idCategoria, porcentaje],
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
                    res.status(200).send({ success: true, mensaje: resultado.Mensaje });
                } else {
                    res.status(400).send({ success: false, mensaje: resultado.Mensaje });
                }
            }
        }
    );
};

const cargarMasivamente = (req, res) => {
  const { productos, IdSucursal, IdCategoria } = req.body;
  if (!productos || productos.length === 0) {
      return res.status(400).send({
          success: false,
          mensaje: "No se han cargado productos. Verifique el archivo cargado."
      });
  }

  db.query(
      "SELECT Codigo FROM PRODUCTO WHERE Codigo IN (?)",
      [productos.map(p => p.Codigo)],
      (err, existingProducts) => {
          if (err) {
              console.log(err);
              return res.status(500).send({
                  success: false,
                  mensaje: "Error en la base de datos",
                  error: err.message
              });
          }

          const existingCodes = new Set(existingProducts.map(p => p.Codigo));
          const productosParaActualizar = productos.filter(p => existingCodes.has(p.Codigo));
          const productosParaInsertar = productos.filter(p => !existingCodes.has(p.Codigo));

          let updateCount = 0;

          const updatePromises = productosParaActualizar.map(p => {
              return new Promise((resolve, reject) => {
                  db.query(
                      "CALL SP_ActualizarProductoIndividual(?, ?, ?, ?, ?, ?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
                      [p.Codigo, p.Nombre, p.Descripcion, p.PrecioCompra, p.PrecioVenta, p.Stock, IdSucursal, IdCategoria],
                      (err, results) => {
                          if (err) {
                              console.log(err);
                              reject(err);
                          } else {
                              const resultSet = results[1][0];
                              if (resultSet.Resultado === 1) {
                                  updateCount++;
                                  resolve();
                              } else {
                                  reject(new Error(resultSet.Mensaje));
                              }
                          }
                      }
                  );
              });
          });

          Promise.all(updatePromises)
              .then(() => {
                  db.query(
                      "CALL SP_InsertarProductos(?, ?, ?, @p_Resultado, @p_Mensaje); SELECT @p_Resultado AS Resultado, @p_Mensaje AS Mensaje;",
                      [JSON.stringify(productosParaInsertar), IdCategoria, IdSucursal],
                      (err, results) => {
                          if (err) {
                              console.log(err);
                              return res.status(500).send({
                                  success: false,
                                  mensaje: `Error en la inserción: ${err.message}`
                              });
                          } else {
                              const resultSet = results[1][0];
                              if (resultSet.Resultado === 1) {
                                  res.status(200).send({
                                      success: true,
                                      mensaje: `Se han insertado ${productosParaInsertar.length} productos y actualizado ${updateCount} productos.`
                                  });
                              } else {
                                  res.status(500).send({
                                      success: false,
                                      mensaje: `Error en la inserción: ${resultSet.Mensaje}`
                                  });
                              }
                          }
                      }
                  );
              })
              .catch(err => {
                  console.log(err);
                  res.status(500).send({
                      success: false,
                      mensaje: `Error en la actualización: ${err.message}`
                  });
              });
      }
  );
};



module.exports = {registrar,buscarProductos,detalles,productosCat,buscar,mostrar,mostrarTop, editar, eliminar, subirPreciosMasivos,cargarMasivamente, bajarPreciosMasivos,validarToken}