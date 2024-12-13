
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

const MainClientes = () => {

  
  
  const Token = localStorage.getItem("Token");
  const {URL}  = useContext(DataContext)


  const [Clientes, setClientes] = useState([])
  const[IdCliente,setIdCliente] = useState(0);
  const[DNI,setDNI] = useState("");
  const[NombreCompleto,setNombreCompleto]= useState("");
  const [Email, setEmail] = useState("")
  const[Telefono,setTelefono] = useState("");
  const [seleccionarCliente, setSeleccionarCliente] = useState(false)
  const[buscar,setBuscar] = useState("");
  const[Estado,setEstado] = useState(""); 

  

  const buscador = (e) => {
    setBuscar(e.target.value)
  }
  
  let resultado = []
  if (!buscar) {
    resultado = Clientes
  } else {
    resultado = Clientes.filter((dato) =>
      dato.NombreCompleto.toLowerCase().includes(buscar.toLowerCase())| dato.Documento.includes(buscar) 
    )
  }




const ObtenerClientes = () =>{
axios.get(`${URL}cliente?accesstoken=${Token}`).then((response)=>{
   setClientes(response.data)
}).catch((error)=>{
  console.log('Error al obtener los clientes', error)
})
}

  const crearClientes = () => {
      if (DNI.length === 0 || NombreCompleto.length === 0 || Email.length === 0 || Telefono.length === 0) {
          Swal.fire({
              icon: "error",
              title: "Error",
              text: "Debe llenar todos los campos"
          });
      } else {
          axios.post(`${URL}cliente/registrar?accesstoken=${Token}`, {
              Documento: DNI,
              NombreCompleto: NombreCompleto,
              Correo: Email,
              Telefono: Telefono,
              Estado: 1
          }).then((response) => {
              const { success, mensaje } = response.data;

              if (success) {
                  Swal.fire({
                      title: "¡Éxito!",
                      text: mensaje || "Cliente creado con éxito!",
                      icon: "success",
                      timer: 2000
                  });
                  limpiarCampos();
                  ObtenerClientes();
              } else {
                  Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: "Error al crear el Cliente!",
                      footer:mensaje
                  });
              }
          }).catch((error) => {
              const errorMessage = error.response && error.response.data ? error.response.data.mensaje : error.message;
              Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text:  "Error al crear el Cliente!",
                  footer: "Error: " + errorMessage
              });
          });
      }
  };


  const editarCliente = () => {
    if (DNI.length === 0 || NombreCompleto.length === 0 || Email.length === 0 || Telefono.length === 0) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debe llenar todos los campos"
        });
    } else {
        axios.put(`${URL}cliente/editar?accesstoken=${Token}`, {
            IdCliente: IdCliente,
            Documento: DNI,
            NombreCompleto: NombreCompleto,
            Correo: Email,
            Telefono: Telefono,
            Estado: Estado
        }).then((response) => {
            const { success, mensaje } = response.data;

            if (success) {
                Swal.fire({
                    title: "¡Éxito!",
                    text: mensaje || "Cliente editado con éxito!",
                    icon: "success",
                    timer: 2000
                });
                limpiarCampos();
                ObtenerClientes();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al editar el Cliente!",
                    footer: mensaje || "No se pudo completar la solicitud."
                });
            }
        }).catch((error) => {
            const errorMessage = error.response && error.response.data && error.response.data.mensaje ? error.response.data.mensaje : error.message;
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error al editar el Cliente!",
                footer: "Error: " + errorMessage
            });
        });
    }
};


const eliminarCliente = (val) => {
  Swal.fire({
      title: `¿Desea eliminar el cliente '${val.NombreCompleto}'?`,
      text: "Esta acción no se podrá revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar.",
      cancelButtonText: "Cancelar."
  }).then((result) => {
      if (result.isConfirmed) {
          axios.delete(`${URL}cliente/eliminar/${val.IdCliente}?accesstoken=${Token}`)
              .then((response) => {
                  const { success, mensaje } = response.data;

                  if (success) {
                      Swal.fire({
                          title: "¡Eliminado!",
                          text: mensaje,
                          icon: "success"
                      });
                      ObtenerClientes();
                  } else {
                      Swal.fire({
                          icon: "error",
                          title: "Error",
                          text: "No se pudo eliminar el cliente.",
                          footer: mensaje || "No se pudo completar la solicitud."
                      });
                  }
              })
              .catch((error) => {
                  const errorMessage = error.response && error.response.data && error.response.data.mensaje ? error.response.data.mensaje : error.message;
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



const seeClientes = (val) =>{
setSeleccionarCliente(true)
setDNI(val.Documento)
setEmail(val.Correo)
setNombreCompleto(val.NombreCompleto)
setTelefono(val.Telefono)
setIdCliente(val.IdCliente)
setEstado(val.Estado)
}
const limpiarCampos = () =>{
setSeleccionarCliente(false)
setDNI('')
setEmail('')
setNombreCompleto('')
setTelefono('')
setEstado('')
}

useEffect(()=>{
  ObtenerClientes()
},[])


  return (
   <>
<h2 className='mt-3'><strong>ADMINISTRACION DE CLIENTES</strong></h2>
<h4 className='naranja'>Listado y gestión de clientes</h4>


    <div className="container">

    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faAddressCard} size="lg" style={{color: '#FD6500', backgroundColor:''}} />
    </span>
      <input className='form-control inputss' type='text' placeholder="DNI"  value={DNI} onChange={(e) => setDNI(e.target.value)}/>
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
      <input className='form-control inputss ' type='text' placeholder="Email"  value={Email} onChange={(e) => setEmail(e.target.value)}/>
    </MDBInputGroup>
    <MDBInputGroup className='mb-3'>
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faPhone} size="lg" style={{color: '#FD6500'}} />
    </span>
      <input className='form-control inputss' type='number' placeholder="Telefono"  value={Telefono} onChange={(e) => setTelefono(e.target.value)}/>
    </MDBInputGroup>

    {seleccionarCliente && (
    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss   ">
      <FontAwesomeIcon icon={faPowerOff} size="lg" style={{color: '#FD6500'}} />
    </span>
    <Form.Select aria-label="Estado" className='inputss' id='estado' value={Estado} onChange={(e)=>setEstado(e.target.value)}>   
                    <option value="1">Activo</option>
                    <option value="0">No Activo</option>
    </Form.Select>
    </MDBInputGroup>)}


          <div className='card-footer text-muted'>
            {
            seleccionarCliente ? 
            <div >
            <Button style={{color:'white'}}  className="btn btn-warning m-2 bgnaranja" onClick={editarCliente}><FontAwesomeIcon icon={faFloppyDisk} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> EDITAR CLIENTE</Button>
          
            <Button className="btn btn-danger m-2 bgnaranja" onClick={limpiarCampos}><FontAwesomeIcon icon={faBan} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> CANCELAR</Button>
            </div> 
            :
          
                <div > 
                <Button className="btn btn-success m-2 bgnaranja" onClick={crearClientes}><FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> GUARDAR CLIENTE</Button>
                </div> 
            }

              
             
          </div>




          <br /><br />
          <MDBInputGroup >
          <span className="input-group-text inputss">
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
          </span>
          <input value={buscar} onChange={buscador} type="text" placeholder='Busca un cliente...' className='form-control inputss'/>
          </MDBInputGroup>
      </div>



      <div className='container table-responsive'>
      <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
          <thead className='custom-table-header'>
              <tr>
                  <th>DNI</th>
                  <th>NOMBRE COMPLETO</th>
                  <th>EMAIL</th>
                  <th>TELEFONO</th>
                  <th>DEUDA</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
              </tr>
          </thead>
          <tbody>
              {
                  resultado.map((val) => (
                    
                      <tr key={val.IdCliente}>
                          <td>{val.Documento}</td>
                          <td>{val.NombreCompleto}</td>              
                          <td>{val.Correo}</td>       
                          <td>{val.Telefono}</td>
                          <td>{val.Deuda}</td>                                                
                          <td>{val.Estado===1?"Activo":"No Activo"}</td>             
                         <td className=''  aria-label="Basic example">
                         <ButtonGroup aria-label="Basic example">
                            <Button onClick={()=>{seeClientes(val)}} className='bgnaranja' style={{marginRight:"10px"}}><FontAwesomeIcon  icon={faPencil} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button>
                            <Button onClick={()=>{eliminarCliente(val)}} className='bgnaranja'style={{marginRight:"10px"}}><FontAwesomeIcon icon={faTrash} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> 
                        </ButtonGroup>
                          </td>
                      </tr>
                  ))
              }
          </tbody>
      </table> 
      </div>





  </>

  )
}

export default MainClientes
