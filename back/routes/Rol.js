const {Router} = require ('express')
const router = Router()
 const {mostrar,validarToken} = require ('../controllers/Rol')

router.get("/",validarToken,mostrar)


module.exports=router;