const {Router} = require ('express')
const router = Router()

 const {mostrar, validarToken, obtenerDatos} = require ('../controllers/Sucursal')

router.get("/",mostrar)
router.get("/obtenerdatos",validarToken,obtenerDatos)


module.exports=router;