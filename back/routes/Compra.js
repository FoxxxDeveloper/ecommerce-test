const {Router} = require ('express')
const router = Router()
const {registrarCompra,verDetalle,eliminar,validarToken} = require ('../controllers/Compra')


router.post("/registrar",validarToken,registrarCompra)
router.delete("/eliminar/:id",validarToken,eliminar)
router.get("/verdetalle",validarToken,verDetalle)
module.exports=router;

module.exports=router;