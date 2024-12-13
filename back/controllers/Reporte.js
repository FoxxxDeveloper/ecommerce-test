const {db} =require("../db/db.js")
const jwt = require('jsonwebtoken');


const ultimasCompras = (req, res) => {
  const { IdSucursal, Fecha } = req.query;

  const query = `
      SELECT 
          c.IdCompra,
          c.Documento,
          c.MontoTotal,
          c.FechaRegistro,
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'Producto', p.Nombre,
                  'Cantidad', dc.Cantidad
              )
          ) AS Productos
      FROM 
          DETALLE_COMPRA dc
      LEFT JOIN PRODUCTO p ON p.IdProducto = dc.IdProducto
      INNER JOIN COMPRA c ON c.IdCompra = dc.IdCompra
      WHERE c.IdSucursal = ? AND DATE(c.FechaRegistro) = ?
      GROUP BY 
          c.Documento, 
          c.MontoTotal, 
          c.FechaRegistro,
          c.IdCompra;
  `;

  db.query(query, [IdSucursal, Fecha], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send("Error en la consulta");
      } else {
          res.send(result);
      }
  });
};


const ultimasVentas = (req, res) => {
  const { IdSucursal, Fecha } = req.query; 

  const query = `
      SELECT 
          v.IdVenta,
          v.NumeroDocumento,
          v.MontoTotal,
          v.FechaRegistro,
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'Producto', COALESCE(p.Nombre, pa.Nombre),
                  'Cantidad', dv.Cantidad
              )
          ) AS Productos
      FROM 
          DETALLE_VENTA dv
      LEFT JOIN PRODUCTO p ON p.IdProducto = dv.IdProducto
      LEFT JOIN PAQUETE pa ON pa.IdPaquete = dv.IdPaquete
      INNER JOIN VENTA v ON v.IdVenta = dv.IdVenta
      WHERE v.IdSucursal = ? AND DATE(v.FechaRegistro) = ?
      GROUP BY 
          v.NumeroDocumento, 
          v.MontoTotal, 
          v.FechaRegistro,
          v.IdVenta;
  `;

  db.query(query, [IdSucursal, Fecha], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send("Error en la consulta");
      } else {
          res.send(result);
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

  const VentasPorCategorias = (req, res) => {
    const { IdSucursal, FechaInicio, FechaFin } = req.query;

    if (!IdSucursal || !FechaInicio || !FechaFin) {
        return res.status(400).send("Faltan parámetros requeridos.");
    }

    const query = `
        SELECT 
            COALESCE(c.Descripcion, 'Paquetes') AS Categoria,
            COUNT(CASE 
                WHEN dv.IdProducto IS NOT NULL THEN dv.IdProducto
                WHEN dv.IdPaquete IS NOT NULL THEN dv.IdPaquete
            END) AS CantidadVendida,
            SUM(dv.SubTotal) as SubTotal
        FROM 
            DETALLE_VENTA dv
        LEFT JOIN 
            PRODUCTO p ON dv.IdProducto = p.IdProducto
        LEFT JOIN 
            CATEGORIA c ON p.IdCategoria = c.IdCategoria
        LEFT JOIN 
            VENTA v ON dv.IdVenta = v.IdVenta
        LEFT JOIN 
            PAQUETE paq ON dv.IdPaquete = paq.IdPaquete
        WHERE 
            v.IdSucursal = ? AND
            DATE(v.FechaRegistro) BETWEEN ? AND ?
        GROUP BY 
            Categoria
        ORDER BY 
            CantidadVendida DESC;
    `;

    db.query(query, [IdSucursal, FechaInicio, FechaFin], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: "Error en la consulta", details: err });
        }
        res.send(result); 
    });
};

const TotalCompras = (req, res) => {
    const { IdSucursal, FechaInicio, FechaFin } = req.query;

    if (!IdSucursal || !FechaInicio || !FechaFin) {
        return res.status(400).send("Faltan parámetros requeridos.");
    }

    const query = `
       SELECT 
            COUNT(c.IdCompra) AS TotalCompras,
            SUM(c.MontoTotal) AS TotalMontoCompras
       FROM 
            COMPRA c
       JOIN 
            DETALLE_COMPRA dc ON c.IdCompra = dc.IdCompra
       JOIN 
            PRODUCTO p ON dc.IdProducto = p.IdProducto
       JOIN 
            CATEGORIA cat ON p.IdCategoria = cat.IdCategoria
       WHERE 
            c.IdSucursal = ? AND
            cat.Descripcion != 'Gastos' 
            AND DATE(c.FechaRegistro) BETWEEN ? AND ?;
    `;

    db.query(query, [IdSucursal, FechaInicio, FechaFin], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: "Error en la consulta", details: err });
        }
        res.send(result); 
    });
};


const TotalGastos = (req, res) => {
    const { IdSucursal, FechaInicio, FechaFin } = req.query;

    if (!IdSucursal || !FechaInicio || !FechaFin) {
        return res.status(400).send("Faltan parámetros requeridos.");
    }

    const query = `
        SELECT 
            COUNT(c.IdCompra) AS TotalComprasGastos,
            SUM(c.MontoTotal) AS TotalMontoComprasGastos
        FROM 
            COMPRA c
        JOIN 
            DETALLE_COMPRA dc ON c.IdCompra = dc.IdCompra
        JOIN 
            PRODUCTO p ON dc.IdProducto = p.IdProducto
        JOIN 
            CATEGORIA cat ON p.IdCategoria = cat.IdCategoria
        WHERE 
            c.IdSucursal = ? AND
            cat.Descripcion = 'Gastos' 
            AND  DATE(c.FechaRegistro) BETWEEN ? AND ?;
    `;

    db.query(query, [IdSucursal, FechaInicio, FechaFin], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: "Error en la consulta", details: err });
        }
        res.send(result);  
    });
};

const ClientesConMasCompras = (req, res) => {
    const { IdSucursal, FechaInicio, FechaFin } = req.query;

    if (!IdSucursal || !FechaInicio || !FechaFin) {
        return res.status(400).send("Faltan parámetros requeridos.");
    }

    const query = `
        SELECT 
            cli.NombreCompleto,
            SUM(v.MontoTotal) AS TotalGastado
        FROM 
            VENTA v
        JOIN 
            CLIENTE cli ON v.IdCliente = cli.IdCliente
        WHERE 
            v.IdSucursal = ? AND
            DATE(v.FechaRegistro) BETWEEN ? AND ?
        GROUP BY 
            cli.NombreCompleto
        ORDER BY 
            TotalGastado DESC
        LIMIT 5;
    `;

    db.query(query, [IdSucursal, FechaInicio, FechaFin], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: "Error en la consulta", details: err });
        }
        res.send(result); 
    });
};

const TotalGanancias = (req, res) => {
    const { IdSucursal, FechaInicio, FechaFin } = req.query;

    if (!IdSucursal || !FechaInicio || !FechaFin) {
        return res.status(400).send("Faltan parámetros requeridos.");
    }

    const query = `
        SELECT 
            SUM(dv.Cantidad) AS CantidadVendida,
            SUM((dv.PrecioVenta - p.PrecioCompra) * dv.Cantidad) AS MargenGanancia
        FROM 
            DETALLE_VENTA dv
        JOIN 
            PRODUCTO p ON dv.IdProducto = p.IdProducto
        JOIN 
            VENTA v ON dv.IdVenta = v.IdVenta
        WHERE 
            v.IdSucursal = ? AND
            DATE(v.FechaRegistro) BETWEEN ? AND ?
        ORDER BY 
            MargenGanancia DESC;
    `;

    db.query(query, [IdSucursal, FechaInicio, FechaFin], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: "Error en la consulta", details: err });
        }
        res.send(result);  
    });
};
const VentasPorMetodoPago = (req, res) => {
    const { IdSucursal, FechaInicio, FechaFin } = req.query;

    if (!IdSucursal || !FechaInicio || !FechaFin) {
        return res.status(400).send("Faltan parámetros requeridos.");
    }

    const query = `
        SELECT 
            v.MetodoPago,
            COUNT(v.IdVenta) AS CantidadVentas,
            SUM(v.MontoTotal) AS MontoTotalVentas
        FROM 
            VENTA v
        WHERE 
            v.IdSucursal = ? AND
            DATE(v.FechaRegistro) BETWEEN ? AND ?
        GROUP BY 
            v.MetodoPago
        ORDER BY 
            MontoTotalVentas DESC;
    `;

    db.query(query, [IdSucursal, FechaInicio, FechaFin], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: "Error en la consulta", details: err });
        }
        res.send(result);  
    });
};


const VentasPorUsuario = (req, res) => {
    const { IdSucursal, FechaInicio, FechaFin } = req.query;

    if (!IdSucursal || !FechaInicio || !FechaFin) {
        return res.status(400).send("Faltan parámetros requeridos.");
    }

    const query = `
        SELECT 
            u.NombreCompleto AS Usuario,
            COUNT(CASE 
                WHEN dv.IdProducto IS NOT NULL THEN dv.IdProducto
                WHEN dv.IdPaquete IS NOT NULL THEN dv.IdPaquete
            END) AS CantidadVendida,
            SUM(dv.SubTotal) AS SubTotal
        FROM 
            DETALLE_VENTA dv
        LEFT JOIN 
            PRODUCTO p ON dv.IdProducto = p.IdProducto
        LEFT JOIN 
            CATEGORIA c ON p.IdCategoria = c.IdCategoria
        LEFT JOIN 
            VENTA v ON dv.IdVenta = v.IdVenta
        LEFT JOIN 
            PAQUETE paq ON dv.IdPaquete = paq.IdPaquete
        LEFT JOIN 
            USUARIO u ON v.IdUsuario = u.IdUsuario
        WHERE 
            v.IdSucursal = ? AND
            DATE(v.FechaRegistro) BETWEEN ? AND ?
        GROUP BY 
            Usuario
        ORDER BY 
            CantidadVendida DESC;
    `;

    db.query(query, [IdSucursal, FechaInicio, FechaFin], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: "Error en la consulta", details: err });
        }
        res.send(result); 
    });
};

module.exports = {ultimasVentas,ultimasCompras,VentasPorCategorias, TotalCompras,TotalGastos,ClientesConMasCompras,TotalGanancias,VentasPorUsuario,VentasPorMetodoPago,validarToken }