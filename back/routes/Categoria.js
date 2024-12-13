const {Router} = require ('express')
const router = Router()

 const {mostrar, registrar, editar, eliminar, validarToken} = require ('../controllers/Categoria')

router.get("/",validarToken,mostrar)
router.post("/registrar",validarToken,registrar)
router.put("/editar",validarToken,editar)
router.delete("/eliminar/:id",validarToken,eliminar)

module.exports=router;