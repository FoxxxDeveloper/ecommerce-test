const {Router} = require ('express')
const router = Router()

 const {mostrar,productosCat,buscarProductos, registrar,detalles,mostrarTop, editar, eliminar, buscar,subirPreciosMasivos, bajarPreciosMasivos,validarToken, cargarMasivamente} = require ('../controllers/Producto')
 
router.get("/top",mostrarTop)
router.get("/detalles/:id",detalles)
router.get("/categoria/:id",productosCat)
router.get("/buscador/:termino",buscarProductos)
router.get("/",validarToken,mostrar)
router.get("/buscar",validarToken,buscar)
router.post("/registrar",validarToken,registrar)
router.put("/editar",validarToken,editar)
router.delete("/eliminar/:id",validarToken,eliminar)
router.post("/subirprecios",validarToken,subirPreciosMasivos)
router.post("/bajarprecios",validarToken,bajarPreciosMasivos)
router.post("/cargarmasivamente",validarToken,cargarMasivamente)
module.exports=router;