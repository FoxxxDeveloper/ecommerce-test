
import  { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Button, Form,ButtonGroup } from 'react-bootstrap';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import { faAddressCard, faUser } from '@fortawesome/free-regular-svg-icons';
import {  faAt, faBan, faMagnifyingGlass, faPencil, faLock, faPowerOff, faShop, faTags, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { DataContext } from '../context/DataContext.jsx';
import Swal from 'sweetalert2'

const MainUsuarios = () => {

  
  
  const Token = localStorage.getItem("Token");
  const {URL}  = useContext(DataContext)


  const [Usuarios, setUsuarios] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [roles, setRoles] = useState([])
  const[IdUsuario,setIdUsuario] = useState(0);
  const[Documento,setDocumento] = useState("");
  const[NombreCompleto,setNombreCompleto]= useState("");
  const [Correo, setCorreo] = useState("")
  const[Clave,setClave] = useState("");
  const[IdRol,setIdRol] = useState(0);
  const[IdSucursal,setIdSucursal] = useState(0);
  const [seleccionarUsuario, setSeleccionarUsuario] = useState(false)
  const[buscar,setBuscar] = useState("");
  const[Estado,setEstado] = useState(""); 

  

  const buscador = (e) => {
    setBuscar(e.target.value)
  }
  
  let resultado = []
  if (!buscar) {
    resultado = Usuarios
  } else {
    resultado = Usuarios.filter((dato) =>
      dato.NombreCompleto.toLowerCase().includes(buscar.toLowerCase())| dato.Documento.includes(buscar) 
    )
  }



  const traerSucursales = () =>{
    axios.get(`${URL}sucursal?accesstoken=${Token}`).then((response)=>{
        setSucursales(response.data)
    }).catch((error)=>{
        console.log('Error al obtener las sucursales', error)
    })
  }

  
  const traerRoles = () =>{
    axios.get(`${URL}rol?accesstoken=${Token}`).then((response)=>{
        setRoles(response.data)
    }).catch((error)=>{
        console.log('Error al obtener las sucursales', error)
    })
  }

const ObtenerUsuarios = () =>{
axios.get(`${URL}usuario?accesstoken=${Token}`).then((response)=>{
   setUsuarios(response.data)
}).catch((error)=>{
  console.log('Error al obtener los usuarios', error)
})
}

const crearUsuarios = () => {
  if (Documento.length === 0 || NombreCompleto.length === 0 || Correo.length === 0 || Clave.length === 0 || IdSucursal == 0 || IdRol == 0) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debe llenar todos los campos"
      });
  } else {
      axios.post(`${URL}usuario/registrar?accesstoken=${Token}`, {
          Documento: Documento,
          NombreCompleto: NombreCompleto,
          Correo: Correo,
          Clave: Clave,
          IdRol: IdRol,
          IdSucursal: IdSucursal,
          Estado: 1
      }).then((response) => {
          const { success, mensaje } = response.data;

          if (success) {
              Swal.fire({
                  title: "¡Éxito!",
                  text: mensaje || "Usuario creado con éxito!",
                  icon: "success",
                  timer: 2000
              });
              limpiarCampos();
              ObtenerUsuarios();
          } else {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Error al crear el Usuario!",
                  footer: mensaje
              });
          }
      }).catch((error) => {
          const errorMessage = error.response && error.response.data ? error.response.data.mensaje : error.message;
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Error al crear el Usuario!",
              footer: "Error: " + errorMessage
          });
      });
  }
};
const editarUsuario = () => {
  if (Documento.length === 0 || NombreCompleto.length === 0 || Correo.length === 0 || Clave.length === 0 || IdSucursal == 0 || IdRol == 0) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debe llenar todos los campos"
      });
  } else {
      axios.put(`${URL}usuario/editar?accesstoken=${Token}`, {
          IdUsuario: IdUsuario,
          Documento: Documento,
          NombreCompleto: NombreCompleto,
          Correo: Correo,
          Clave: Clave,
          IdSucursal: IdSucursal,
          IdRol: IdRol,
          Estado: Estado
      }).then((response) => {
          const { success, mensaje } = response.data;

          if (success) {
              Swal.fire({
                  title: "¡Éxito!",
                  text: mensaje || "Usuario editado con éxito!",
                  icon: "success",
                  timer: 2000
              });
              limpiarCampos();
              ObtenerUsuarios();
          } else {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: mensaje || "Error al editar el Usuario!"
              });
          }
      }).catch((error) => {
          const errorMessage = error.response && error.response.data && error.response.data.mensaje ? error.response.data.mensaje : error.message;
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Error al editar el Usuario!",
              footer: "Error: " + errorMessage
          });
      });
  }
};
const eliminarUsuario = (val) => {
  Swal.fire({
      title: `¿Desea eliminar el usuario '${val.NombreCompleto}'?`,
      text: "Esta acción no se podrá revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar.",
      cancelButtonText: "Cancelar."
  }).then((result) => {
      if (result.isConfirmed) {
          axios.delete(`${URL}usuario/eliminar/${val.IdUsuario}?accesstoken=${Token}`)
              .then((response) => {
                  const { success, mensaje } = response.data;

                  if (success) {
                      Swal.fire({
                          title: "¡Eliminado!",
                          text: mensaje,
                          icon: "success"
                      });
                      ObtenerUsuarios();
                  } else {
                      Swal.fire({
                          icon: "error",
                          title: "Error",
                          text: "No se pudo eliminar el usuario.",
                          footer: mensaje || "No se pudo completar la solicitud."
                      });
                  }
              })
              .catch((error) => {
                  const errorMessage = error.response?.data?.mensaje || error.message;
                  Swal.fire({
                      icon: "error",
                      title: "Error del servidor",
                      text: "No se pudo procesar la solicitud. Intente nuevamente más tarde.",
                      footer: "Error: " + errorMessage
                  });
              });
      }
  });
};


const seeUsuario = (val) =>{
setSeleccionarUsuario(true)
setDocumento(val.Documento)
setCorreo(val.Correo)
setNombreCompleto(val.NombreCompleto)
setClave(val.Clave)
setIdUsuario(val.IdUsuario)
setIdRol(val.IdRol)
setIdSucursal(val.IdSucursal)
setEstado(val.Estado)
}
const limpiarCampos = () =>{
setSeleccionarUsuario(false)
setDocumento('')
setCorreo('')
setNombreCompleto('')
setClave('')
setIdRol(0)
setIdSucursal(0)
setIdUsuario(0)
setEstado(1)
}

useEffect(()=>{
  ObtenerUsuarios()
  traerRoles()
  traerSucursales()
},[])


  return (
   <div className='body'>
<h2 className='mt-3'><strong>ADMINISTRACION DE USUARIOS</strong></h2>
<h4 className='naranja'>Listado y gestión de usuarios</h4>


    <div className="container">

    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faAddressCard} size="lg" style={{color: '#FD6500', backgroundColor:''}} />
    </span>
      <input className='form-control inputss' type='text' placeholder="Documento"  value={Documento} onChange={(e) => setDocumento(e.target.value)}/>
    </MDBInputGroup>

    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss ">
      <FontAwesomeIcon icon={faUser} size="lg" style={{color: '#FD6500'}} />
    </span>
      <input className='form-control inputss' type='text' placeholder="Nombre Completo" value={NombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)}/>
    </MDBInputGroup>

    <MDBInputGroup className='mb-3'>
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faAt} size="lg" style={{color: '#FD6500'}} />
    </span>
      <input className='form-control inputss ' type='text' placeholder="Correo"  value={Correo} onChange={(e) => setCorreo(e.target.value)}/>
    </MDBInputGroup>
    <MDBInputGroup className='mb-3'>
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faLock} size="lg" style={{color: '#FD6500'}} />
    </span>
      <input className='form-control inputss' type='password' placeholder="Clave"  value={Clave} onChange={(e) => setClave(e.target.value)}/>
    </MDBInputGroup>
    <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
                <FontAwesomeIcon icon={faShop} size="lg" style={{color: '#FD6500'}} />
             </span>
            <Form.Select  aria-label="Sucursal" className="inputss" id="sucursal" value={IdSucursal} onChange={(e)=> setIdSucursal(e.target.value)}>
                        <option key={0} value="0" disabled >--Seleccione una sucursal--</option>
                        {sucursales.map((s) => (     
                        <option key={s.IdSucursal} value={s.IdSucursal}>{s.Nombre}</option>
                        ))}
            </Form.Select>
            </MDBInputGroup>
            <MDBInputGroup className='mb-3'>
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faTags} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <Form.Select key={IdRol} className="inputss" aria-label="ROL" id="rol" value={IdRol} onChange={(e)=> setIdRol(e.target.value)}>
                        <option key={0} value="0" disabled >--Seleccione un ROL--</option>
                        {roles.map((rol) => (     
                            <option key={rol.IdRol} value={rol.IdRol}>{rol.Descripcion}</option>
                        ))}
                    </Form.Select>
                </MDBInputGroup>
    {seleccionarUsuario && (
    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss   ">
      <FontAwesomeIcon icon={faPowerOff} size="lg" style={{color: '#FD6500'}} />
    </span>
    <Form.Select aria-label="Estado" className="inputss"  id='estado' value={Estado} onChange={(e)=>setEstado(e.target.value)}>   
                    <option value="1">Activo</option>
                    <option value="0">No Activo</option>
    </Form.Select>
    </MDBInputGroup>)}


          <div className='card-footer text-muted'>
            {
            seleccionarUsuario ? 
            <div >
            <Button style={{color:'white'}}  className="btn btn-warning m-2 bgnaranja" onClick={editarUsuario}><FontAwesomeIcon icon={faFloppyDisk} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> EDITAR USUARIO</Button>
          
            <Button className="btn btn-danger m-2 bgnaranja" onClick={limpiarCampos}><FontAwesomeIcon icon={faBan} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> CANCELAR</Button>
            </div> 
            :
          
                <div > 
                <Button className="btn btn-success m-2 bgnaranja" onClick={crearUsuarios}><FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> GUARDAR USUARIO</Button>
                </div> 
            }

              
             
          </div>




          <br /><br />
          <MDBInputGroup >
          <span className="input-group-text inputss">
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
          </span>
          <input value={buscar} onChange={buscador} type="text" placeholder='Busca un usuario...' className='form-control inputss'/>
          </MDBInputGroup>
      </div>



      <div className='container table-responsive'>
      <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
          <thead className='custom-table-header'>
              <tr>
                  <th>DOCUMENTO</th>
                  <th>NOMBRE COMPLETO</th>
                  <th>CORREO</th>
                  <th>ROL</th>
                  <th>ESTADO</th>
                  <th>SUCURSAL</th>
                  <th>ACCIONES</th>
              </tr>
          </thead>
          <tbody>
              {
                  resultado.map((val) => (
                    
                      <tr key={val.IdUsuario}>
                          <td>{val.Documento}</td>
                          <td>{val.NombreCompleto}</td>              
                          <td>{val.Correo}</td>    
                          <td>{val.Descripcion}</td>                                               
                          <td>{val.Estado===1?"Activo":"No Activo"}</td>   
                          <td>{val.Sucursal}</td>           
                         <td className=''  aria-label="Basic example">
                         <ButtonGroup aria-label="Basic example">
                            <Button onClick={()=>{seeUsuario(val)}} className='bgnaranja' style={{marginRight:"10px"}}><FontAwesomeIcon  icon={faPencil} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button>
                            <Button onClick={()=>{eliminarUsuario(val)}} className='bgnaranja'style={{marginRight:"10px"}}><FontAwesomeIcon icon={faTrash} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> 
                        </ButtonGroup>
                          </td>
                      </tr>
                  ))
              }
          </tbody>
      </table> 
      </div>





  </div>

  )
}

export default MainUsuarios
