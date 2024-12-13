const {Router} = require ('express')
const router = Router()
const {mostrar, registrar, editar, eliminar,registrarPago,eliminarPago,obtenerPagos,validarToken,Login,verificarToken} = require ('../controllers/Cliente')

router.get("/verificar-token", verificarToken);

router.post("/Login", Login)


router.get("/",validarToken,mostrar)
router.post("/registrar",validarToken,registrar)
router.put("/editar",validarToken,editar)
router.delete("/eliminar/:id",validarToken,eliminar)

//PAGOS
router.get("/obtenerpagos",validarToken,obtenerPagos)
router.post("/registrarpago",validarToken,registrarPago)
router.delete("/eliminarpago/:id",validarToken,eliminarPago)


module.exports=router;