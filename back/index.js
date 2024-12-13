const express = require("express")
const logger = require('morgan')
const compression = require ('compression')
const bodyParser = require ('body-parser')
const cors = require("cors")
const https = require('https');
const fs = require('fs');
const port = 4002;


//RUTAS
const usuario= require ('./routes/Usuario')
const proveedor= require ('./routes/Proveedor')
const rol= require ('./routes/Rol')
const categoria =require('./routes/Categoria')
const producto =require('./routes/Producto')
const compra =require('./routes/Compra')
const venta = require ('./routes/Venta')
const cliente = require('./routes/Cliente')
const metodo_pago = require('./routes/Metodo_Pago')
const sucursal = require('./routes/Sucursal')
const permisos = require('./routes/Permisos')
const paquete = require('./routes/Paquete')
const reporte = require('./routes/Reporte')
//CONFIG EXPRESS
 const app = express()
 app.use(bodyParser.json())
 app.use(compression())
 app.use(logger("dev"))
// app.use(cors())

// Configuración de CORS y middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({
    origin: '*',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

//CONFIG RUTAS
app.use("/usuario", usuario)
app.use("/proveedor", proveedor)
app.use("/rol", rol)
app.use("/categoria", categoria)
app.use("/producto", producto)
app.use("/compra", compra)
app.use("/venta", venta)
app.use("/cliente", cliente)
app.use("/metodo_pago",metodo_pago)
app.use("/sucursal",sucursal)
app.use("/permisos",permisos)
app.use("/paquete",paquete)
app.use("/reporte",reporte)

app.listen(port, ()=> {
    console.log("Corriendo en el puerto ",port)
})


// const keyFile = '/etc/letsencrypt/live/foxsoftware.com.ar/privkey.pem';
// const certFile = '/etc/letsencrypt/live/foxsoftware.com.ar/fullchain.pem';

// const privateKey = fs.readFileSync(keyFile, 'utf8');
// const certificate = fs.readFileSync(certFile, 'utf8');
// const credentials = { key: privateKey, cert: certificate };

// https.createServer(credentials, app).listen(port, '0.0.0.0', () => {
//     console.log(`Corriendo en el puerto ${port} con HTTPS`);
// });
