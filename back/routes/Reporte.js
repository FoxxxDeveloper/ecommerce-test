const {Router} = require ('express')
const router = Router()

 const {ultimasVentas,ultimasCompras,VentasPorCategorias,VentasPorUsuario, TotalCompras,TotalGastos,ClientesConMasCompras,TotalGanancias,VentasPorMetodoPago,validarToken} = require ('../controllers/Reporte')


//VENTAS

router.get("/ultimasventas",validarToken,ultimasVentas)
router.get("/ventasporcategoria",validarToken,VentasPorCategorias)
router.get("/totalganancias",validarToken,TotalGanancias)
router.get("/ventaspormetodopago",validarToken,VentasPorMetodoPago)

//COMPRAS
router.get("/ultimascompras",validarToken,ultimasCompras)
router.get("/totalcompras",validarToken,TotalCompras)
router.get("/totalgastos",validarToken,TotalGastos)

//GENERAL
router.get("/clientesconmascompras",validarToken,ClientesConMasCompras)
router.get("/ventasporusuario",validarToken,VentasPorUsuario)
module.exports=router;