import  { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Button, Form,ButtonGroup } from 'react-bootstrap';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import { faAddressCard, faUser } from '@fortawesome/free-regular-svg-icons';
import {  faAt, faBan, faMagnifyingGlass, faPencil, faPhone, faPowerOff, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { DataContext } from '../context/DataContext.jsx';
import Swal from 'sweetalert2'


const MainProveedores = () => {

  
  
  const Token = localStorage.getItem("Token");
  const {URL}  = useContext(DataContext)


  const [Proveedores, setProveedores] = useState([])
  const[IdProveedor,setIdProveedor] = useState(0);
  const[Documento,setDocumento] = useState("");
  const[RazonSocial,setRazonSocial]= useState("");
  const [Correo, setCorreo] = useState("")
  const[Telefono,setTelefono] = useState("");
  const [seleccionarProveedor, setSeleccionarProveedor] = useState(false)
  const[buscar,setBuscar] = useState("");
  const[Estado,setEstado] = useState(""); 

  

  const buscador = (e) => {
    setBuscar(e.target.value)
  }
  let resultado = []
  if (!buscar) {
    resultado = Proveedores
  } else {
      resultado = Proveedores.filter((dato) =>
      dato.RazonSocial.toLowerCase().includes(buscar.toLowerCase()) | dato.Documento.includes(buscar)
    )
  }




const ObtenerProveedores = () =>{
axios.get(`${URL}proveedor?accesstoken=${Token}`).then((response)=>{
   setProveedores(response.data)
}).catch((error)=>{
  console.log('Error al obtener los proveedores', error)
})
}


const crearProveedor = () => {
  if (Documento.length === 0 || RazonSocial.length === 0 || Correo.length === 0 || Telefono.length === 0) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debe llenar todos los campos"
      });
  } else {
      axios.post(`${URL}proveedor/registrar?accesstoken=${Token}`, {
          Documento: Documento,
          RazonSocial: RazonSocial,
          Correo: Correo,
          Telefono: Telefono,
          Estado: 1
      }).then((response) => {
          const { success, mensaje } = response.data;

          if (success) {
              Swal.fire({
                  title: "¡Éxito!",
                  text: mensaje,
                  icon: "success",
                  timer: 2000
              }).then(() => {
                  limpiarCampos();
                  ObtenerProveedores();
              });
          } else {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: mensaje || "Error al crear el proveedor!"
              });
          }
      }).catch((error) => {
          const errorMessage = error.response?.data?.mensaje || error.message;
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Error al crear el proveedor!",
              footer: "Error: " + errorMessage
          });
      });
  }
};

const editarProveedor = () => {
  if (Documento.length === 0 || RazonSocial.length === 0 || Correo.length === 0 || Telefono.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debe llenar todos los campos"
    });
  } else {
    axios.put(`${URL}proveedor/editar?accesstoken=${Token}`, {
      IdProveedor: IdProveedor,
      Documento: Documento,
      RazonSocial: RazonSocial,
      Correo: Correo,
      Telefono: Telefono,
      Estado: Estado
    }).then((response) => {
      const { mensaje } = response.data;

      Swal.fire({
        title: "¡Éxito!",
        text: mensaje || "Proveedor editado con éxito!",
        icon: "success",
        timer: 2000
      }).then(() => {
        limpiarCampos();
        ObtenerProveedores();
      });
    }).catch((error) => {
      const errorMessage = error.response?.data?.mensaje || error.message;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al editar el Proveedor!",
        footer: "Error: " + errorMessage
      });
    });
  }
};
const eliminarProveedor = (val) => {
  Swal.fire({
    title: `¿Desea eliminar el proveedor '${val.RazonSocial}' ?`,
    text: "Esta acción no se podrá revertir",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar.",
    cancelButtonText: "Cancelar."
  }).then((result) => {
    if (result.isConfirmed) {
      axios.delete(`${URL}proveedor/eliminar/${val.IdProveedor}?accesstoken=${Token}`)
        .then((response) => {
          const { success, mensaje } = response.data;
          if (success) {
            Swal.fire({
              title: "Eliminado!",
              text: mensaje,
              icon: "success"
            });
            ObtenerProveedores(); // Refresca la lista de proveedores
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: mensaje
            });
          }
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Error del servidor",
            text: "No se pudo procesar la solicitud. Intente nuevamente más tarde.",
            footer: `Error: ${error.response?.data?.mensaje || error.message}`
          });
        });
    }
  });
};


const seeProveedor = (val) =>{
setSeleccionarProveedor(true)
setDocumento(val.Documento)
setCorreo(val.Correo)
setRazonSocial(val.RazonSocial)
setTelefono(val.Telefono)
setIdProveedor(val.IdProveedor)
setEstado(val.Estado)
}
const limpiarCampos = () =>{
setSeleccionarProveedor(false)
setDocumento('')
setCorreo('')
setRazonSocial('')
setTelefono('')
setEstado('')
}

useEffect(()=>{
  ObtenerProveedores()
},[])



  return (
    <div className='body'>
<h2 className='mt-3'><strong>ADMINISTRACION DE PROVEEDORES</strong></h2>
<h4 className='naranja'>Listado y gestión de proveedores</h4>


    <div className="container">

    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faAddressCard} size="lg" style={{color: '#FD6500'}} />
    </span>
      <input className='form-control inputss' type='text' placeholder="Documento"  value={Documento} onChange={(e) => setDocumento(e.target.value)}/>
    </MDBInputGroup>

    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faUser} size="lg" style={{color: '#FD6500'}} />
    </span>
      <input className='form-control inputss' type='text' placeholder="Razon Social" value={RazonSocial} onChange={(e) => setRazonSocial(e.target.value)}/>
    </MDBInputGroup>

    <MDBInputGroup className='mb-3'>
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faAt} size="lg" style={{color: '#FD6500'}} />
    </span>
      <input className='form-control inputss' type='text' placeholder="Correo Electronico"  value={Correo} onChange={(e) => setCorreo(e.target.value)}/>
    </MDBInputGroup>
    <MDBInputGroup className='mb-3'>
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faPhone} size="lg" style={{color: '#FD6500'}} />
    </span>
      <input className='form-control inputss' type='number' placeholder="Telefono"  value={Telefono} onChange={(e) => setTelefono(e.target.value)}/>
    </MDBInputGroup>

    {seleccionarProveedor && (
    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss   ">
      <FontAwesomeIcon icon={faPowerOff} size="lg" style={{color: '#FD6500'}} />
    </span>
    <Form.Select className='inputss' aria-label="Estado"  id='estado' value={Estado} onChange={(e)=>setEstado(e.target.value)}>   
                    <option value="1">Activo</option>
                    <option value="0">No Activo</option>
    </Form.Select>
    </MDBInputGroup>)}


          <div className='card-footer text-muted'>
            {
            seleccionarProveedor ? 
            <div >
            <Button style={{color:'white'}}  className="btn btn-warning m-2 bgnaranja" onClick={editarProveedor}><FontAwesomeIcon icon={faFloppyDisk} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> EDITAR PROVEEDOR</Button>
          
            <Button className="btn btn-danger m-2 bgnaranja" onClick={limpiarCampos}><FontAwesomeIcon icon={faBan} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> CANCELAR</Button>
            </div> 
            :
          
                <div > 
                <Button className="btn btn-success m-2 bgnaranja" onClick={crearProveedor}><FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> GUARDAR PROVEEDOR</Button>
                </div> 
            }

              
             
          </div>




          <br /><br />
          <MDBInputGroup >
          <span className="input-group-text inputss">
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
          </span>
          <input value={buscar} onChange={buscador} type="text" placeholder='Busca un proveedor...' className='form-control inputss'/>
          </MDBInputGroup>
      </div>



      <div className='container table-responsive'>
      <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
          <thead className='custom-table-header'>
              <tr>
                  <th>DOCUMENTO</th>
                  <th>RAZON SOCIAL</th>
                  <th>CORREO</th>
                  <th>TELEFONO</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
              </tr>
          </thead>
          <tbody>
              {
                  resultado.map((val) => (
                    
                      <tr key={val.IdProveedor}>
                          <td>{val.Documento}</td>
                          <td>{val.RazonSocial}</td>              
                          <td>{val.Correo}</td>       
                          <td>{val.Telefono}</td>                                                
                          <td>{val.Estado===1?"Activo":"No Activo"}</td>             
                         <td className=''  aria-label="Basic example">
                         <ButtonGroup aria-label="Basic example">
                            <Button onClick={()=>{seeProveedor(val)}} className='bgnaranja' style={{marginRight:"10px"}}><FontAwesomeIcon  icon={faPencil} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button>
                            <Button onClick={()=>{eliminarProveedor(val)}} className='bgnaranja'style={{marginRight:"10px"}}><FontAwesomeIcon icon={faTrash} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> 
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

export default MainProveedores
