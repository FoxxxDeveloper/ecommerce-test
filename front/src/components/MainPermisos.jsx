import  { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import {
    MDBInputGroup,
  } from 'mdb-react-ui-kit';
  import { Button} from 'react-bootstrap';
  import { DataContext } from '../context/DataContext';
  import Form from 'react-bootstrap/Form';
  import Swal from 'sweetalert2'
  import {FormLabel, FormControl, FormGroup, FormControlLabel, FormHelperText, Switch} from '@mui/material'
  import '../css/MainPermisos.css'

const MainPermisos = () => {
  
    const Token = localStorage.getItem("Token");
    const {URL}  = useContext(DataContext)
  
  
    const [Usuarios, setUsuarios] = useState([])
    const [IdUsuario, setIdUsuario] = useState(0)
    const[menuusuario,setMenuUsuario] = useState(false);
    const[menuconfiguracion,setMenuConfiguracion] = useState(false);
    const[menuventas,setMenuVentas] = useState(false);
    const[menucompras,setMenuCompras] = useState(false);
    const[menuproveedores,setMenuProveedores] = useState(false);
    const[menuclientes,setMenuClientes] = useState(false);
    const[menureportes,setMenuReportes] = useState(false);

  
    const ObtenerUsuarios= () => {
      axios.get(`${URL}usuario?accesstoken=${Token}`).then((response)=>{
          setUsuarios(response.data)
      })
    }
  
  
  const modificarPermisos= () =>{     
    if(IdUsuario==0){
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar un usuario"
      });
        }else{
    const permisosArray = [];
    if (menuusuario) permisosArray.push('menuusuario');
    if (menuconfiguracion) permisosArray.push('menuconfiguracion');
    if (menuventas) permisosArray.push('menuventas');
    if (menucompras) permisosArray.push('menucompras');
    if (menuproveedores) permisosArray.push('menuproveedores');
    if (menuclientes) permisosArray.push('menuclientes');
    if (menureportes) permisosArray.push('menureportes');
      
       
              axios.post(`${URL}permisos/editar/${IdUsuario}?accesstoken=${Token}`,{
                  Permisos: permisosArray
              }).then(()=>{
                Swal.fire({
                  title: "¡Éxito!",
                  text: "Permisos modificados con exito!",
                  icon: "success",
                  timer:2000
                });
                  limpiarCampos()
              }).catch((error)=>{
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Error al modificar los permisos!",
                  footer: "Error: " + error.message
                });
                  
              })
            }
     
  }
  
  const handleChangeUsuario=(e)=>{

    setIdUsuario(e.target.value)

    ObtenerPermisos(e.target.value);

  }                                                                           

  
  const ObtenerPermisos=(idd)=>{

    axios.get(`${URL}permisos/${idd}?accesstoken=${Token}`).then((response)=>{
      
      const permisos = response.data.map(perm => perm.NombreMenu);

      permisos.includes('menuusuario') ? setMenuUsuario(true):setMenuUsuario(false)
      permisos.includes('menuconfiguracion')  ? setMenuConfiguracion(true):setMenuConfiguracion(false)
      permisos.includes('menuventas')  ? setMenuVentas(true):setMenuVentas(false)
      permisos.includes('menucompras')  ? setMenuCompras(true):setMenuCompras(false)
      permisos.includes('menuproveedores')  ? setMenuProveedores(true):setMenuProveedores(false)
      permisos.includes('menuclientes')  ? setMenuClientes(true):setMenuClientes(false)
      permisos.includes('menureportes')  ? setMenuReportes(true):setMenuReportes(false)
     
   })


  }
  
  const limpiarCampos = () =>{
    setMenuUsuario(false)
    setMenuConfiguracion(false)
    setMenuVentas(false)
    setMenuCompras(false)
    setMenuReportes(false)
    setMenuProveedores(false)
    setMenuClientes(false)
    setIdUsuario(0)
  }
  
  useEffect(()=>{
    ObtenerUsuarios()
  },[])
  
  


  return (
    <div>
    <div >

<div className='h3-ventas'>
</div>
<br />
<h2 className='mt-3'><strong>ADMINISTRACION DE PERMISOS</strong></h2>
<h4 className='naranja'>Control de accesos y permisos</h4>
<div className="container-fluid">
<div className='container'>
<div className="row">
  <div className="col-3">
  </div>
  <div className="col-">
    <br /> <br />
    <div className="container-fluid">




    <MDBInputGroup className='mb-3' >
        <span className="input-group-text inputss   ">
          <FontAwesomeIcon icon={faUser} size="lg" style={{color: '#FD6500'}} />
        </span>

        <Form.Select className='inputss' aria-label="Estado"  id='Sucursal' value={IdUsuario} onChange={(e)=>handleChangeUsuario(e)}>   
        <option disabled value="0" key="0">{"--Seleccionar Usuario--"}</option>
                        {Usuarios.map((usua)=>(
                             <option value={usua.IdUsuario} key={usua.IdUsuario}>{usua.NombreCompleto}</option>
                        ))}
        </Form.Select>
        </MDBInputGroup>
        <br />
<div className='container cajitaLinda'>
        <FormControl className='fcPermisos' component="fieldset" variant="standard">
      <FormLabel className='tituloPermisos' component="legend"><strong>ASIGNAR PERIMISOS</strong></FormLabel>
      <hr className='hrOrange'/>
      <FormGroup >
        
        <FormControlLabel 
          control={
            <Switch checked={menuclientes} onChange={(e)=>setMenuClientes(e.target.checked)} name="gilad" color="warning" />
          }
          label="Menu Clientes"
          className='textos'
        />
        <hr className='hrOrange'/>
        <FormControlLabel
          control={
            <Switch checked={menuproveedores} onChange={(e)=>setMenuProveedores(e.target.checked)} name="gilad" color="warning"/>
          }
          label="Menu Proveedores"
            className='textos'
        />
          <hr className='hrOrange' />
        <FormControlLabel
          control={
            <Switch checked={menuventas} onChange={(e)=>setMenuVentas(e.target.checked)} name="gilad"  color="warning"/>
          }
          label="Menu Ventas"
            className='textos'
        />
          <hr className='hrOrange' />
          
        <FormControlLabel
          control={
            <Switch checked={menucompras} onChange={(e)=>setMenuCompras(e.target.checked)} name="gilad" color="warning" />
          }
          label="Menu Compras"
           className='textos'
        />
          <hr className='hrOrange' />
        <FormControlLabel
          control={
            <Switch checked={menuusuario} onChange={(e)=>setMenuUsuario(e.target.checked)} name="gilad" color="warning" />
          }
          label="Menu Usuarios"
            className='textos'
        />
          
          <hr className='hrOrange' />
        <FormControlLabel
          control={
            <Switch checked={menuconfiguracion} onChange={(e)=>setMenuConfiguracion(e.target.checked)} name="gilad" color="warning" />
          }
          label="Menu Configuracion"
            className='textos'
        />
  <hr className='hrOrange' />
        <FormControlLabel
          control={
            <Switch checked={menureportes} onChange={(e)=>setMenuReportes(e.target.checked)} name="gilad" color="warning" />
          }
          label="Menu Reportes"
            className='textos'
        />
         <hr className='hrOrange' />

      </FormGroup>
      <FormHelperText style={{color:'#000'}}><strong>Activar los permisos segun sea necesario</strong></FormHelperText>
      <br />
      
      <Button onClick={modificarPermisos} className='bgnaranja'>GUARDAR PERMISOS</Button>
      <br />
    </FormControl>

    </div>
      </div>


      
  </div>
</div>
</div>

</div>
</div>
<br /><br />
    </div>
  )
}

export default MainPermisos