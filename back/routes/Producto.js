const {Router} = require ('express')
const router = Router()

 const {mostrar, registrar, editar, eliminar, buscar,subirPreciosMasivos, bajarPreciosMasivos,validarToken, cargarMasivamente} = require ('../controllers/Producto')

router.get("/",validarToken,mostrar)
router.get("/buscar",validarToken,buscar)
router.post("/registrar",validarToken,registrar)
router.put("/editar",validarToken,editar)
router.delete("/eliminar/:id",validarToken,eliminar)
router.post("/subirprecios",validarToken,subirPreciosMasivos)
router.post("/bajarprecios",validarToken,bajarPreciosMasivos)
router.post("/cargarmasivamente",validarToken,cargarMasivamente)
module.exports=router;