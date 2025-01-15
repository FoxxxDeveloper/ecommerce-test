const {Router} = require ('express')
const router = Router()
 const {registrar,eliminar, Obtener,verDetalle, validarToken} = require ('../controllers/Venta')


router.post("/registrar",validarToken,registrar)
router.get("/obtener", validarToken, Obtener);
router.delete("/eliminar/:id",validarToken,eliminar)
router.get("/verdetalle",validarToken,verDetalle)
module.exports=router;