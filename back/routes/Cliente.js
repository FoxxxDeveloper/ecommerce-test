const {Router} = require ('express')
const router = Router()
const {mostrar, registrar, editar,obtenerDirecciones, registrarDireccion,eliminar,registrarPago,eliminarPago,obtenerPagos,validarToken,Login,verificarToken} = require ('../controllers/Cliente')

router.get("/verificar-token", verificarToken);

router.post("/Login", Login)


router.get("/",validarToken,mostrar)
router.post("/registrar",validarToken,registrar)
router.put("/editar",validarToken,editar)
router.delete("/eliminar/:id",validarToken,eliminar)

//DIRECCIONES
router.get("/obtenerdirecciones",validarToken,obtenerDirecciones)
router.post("/registrarDireccion",validarToken,registrarDireccion)
//PAGOS
router.get("/obtenerpagos",validarToken,obtenerPagos)
router.post("/registrarpago",validarToken,registrarPago)
router.delete("/eliminarpago/:id",validarToken,eliminarPago)


module.exports=router;