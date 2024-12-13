const {Router} = require ('express')
const router = Router()
const {mostrar, registrar, editar, eliminar, login,MostrarUsuarioLog,validarToken,verificarToken, obtenerpermisos, permisos} = require ('../controllers/Usuario')



router.get("/",validarToken,mostrar)
router.post("/login",login)
router.get("/Userlog",validarToken, MostrarUsuarioLog)
router.post("/registrar",validarToken,registrar)
router.put("/editar",validarToken,editar)
router.delete("/eliminar/:id",validarToken,eliminar)
router.get("/verificar-token", verificarToken);

module.exports=router;