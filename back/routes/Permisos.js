const {Router} = require('express')
const router = Router()


const { Listar, Editar, validarToken } = require('../controllers/Permisos')

router.get("/:IdUsuario",validarToken, Listar)
router.post("/Editar/:IdUsuario", validarToken, Editar)



module.exports = router