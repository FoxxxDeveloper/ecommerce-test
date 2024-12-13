
import  { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Button,ButtonGroup } from 'react-bootstrap';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import {  faBan, faMagnifyingGlass, faPencil, faTrash,faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { DataContext } from '../context/DataContext.jsx';
import Swal from 'sweetalert2'

const MainMetodoPago = () => {

  
  
  const Token = localStorage.getItem("Token");
  const {URL}  = useContext(DataContext)


  const [MetodoPago, setMetodoPago] = useState([])
  const[IdMetodoPago,setIdMetodoPago] = useState(0);
  const[Descripcion,setDescripcion] = useState("");
  const[Porcentaje,setPorcentaje] = useState("");
  const [seleccionarMetodoPago, setSeleccionarMetodoPago] = useState(false)
  const[buscar,setBuscar] = useState("");

  

  const buscador = (e) => {
    setBuscar(e.target.value)
  }
  
  let resultado = []
  if (!buscar) {
    resultado = MetodoPago
  } else {
    resultado = MetodoPago.filter((dato) =>
      dato.Descripcion.toLowerCase().includes(buscar.toLowerCase())
    )
  }




const ObtenerMetodoPago = () =>{
axios.get(`${URL}metodo_pago?accesstoken=${Token}`).then((response)=>{
   setMetodoPago(response.data)
}).catch((error)=>{
  console.log('Error al obtener los metodos de pago', error)
})
}
const crearMetodoPago = () => {
  if (Descripcion.length === 0 || Porcentaje.length === 0) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debe llenar todos los campos"
      });
  } else {
      axios.post(`${URL}metodo_pago/registrar?accesstoken=${Token}`, {
          Descripcion: Descripcion,
          Porcentaje: Porcentaje,
          Estado: 1
      }).then((response) => {
          const { success, mensaje } = response.data;

          if (success) {
              Swal.fire({
                  title: "¡Éxito!",
                  text: mensaje || "Método de pago creado con éxito!",
                  icon: "success",
                  timer: 2000
              });
              limpiarCampos();
              ObtenerMetodoPago();
          } else {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Error al crear el método de pago.",
                  footer: mensaje
              });
          }
      }).catch((error) => {
          const errorMessage = error.response?.data?.mensaje || error.message;
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Error al crear el método de pago.",
              footer: "Error: " + errorMessage
          });
      });
  }
};



const editarMetodoPago = () => {
  if (Descripcion.length === 0 || Porcentaje.length === 0) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debe llenar todos los campos"
      });
  } else {
      axios.put(`${URL}metodo_pago/editar?accesstoken=${Token}`, {
          IdMetodoPago: IdMetodoPago,
          Descripcion: Descripcion,
          Porcentaje: Porcentaje
      }).then((response) => {
          const { success, mensaje } = response.data;

          if (success) {
              Swal.fire({
                  title: "¡Éxito!",
                  text: mensaje || "Metodo de pago editado con éxito!",
                  icon: "success",
                  timer: 2000
              });
              limpiarCampos();
              ObtenerMetodoPago();
          } else {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Error al editar el meetodo de pago!",
                  footer: mensaje || "No se pudo completar la solicitud."
              });
          }
      }).catch((error) => {
          const errorMessage = error.response?.data?.mensaje || error.message;
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Error al editar el metodo de pago!",
              footer: "Error: " + errorMessage
          });
      });
  }
};




const eliminarMetodoPago = (val) => {
  Swal.fire({
      title: `¿Desea eliminar el metodo pago: '${val.Descripcion}'?`,
      text: "Esta acción no se podrá revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar.",
      cancelButtonText: "Cancelar."
  }).then((result) => {
      if (result.isConfirmed) {
          axios.delete(`${URL}metodo_pago/eliminar/${val.IdMetodoPago}?accesstoken=${Token}`)
              .then((response) => {
                  const { success, mensaje } = response.data;

                  if (success) {
                      Swal.fire({
                          title: "¡Eliminado!",
                          text: mensaje,
                          icon: "success"
                      });
                      ObtenerMetodoPago();
                  } else {
                      Swal.fire({
                          icon: "error",
                          title: "Error",
                          text: "No se pudo eliminar el metodo de pago.",
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


const seeMetodoPago = (val) =>{
setSeleccionarMetodoPago(true)
setDescripcion(val.Descripcion)
setIdMetodoPago(val.IdMetodoPago)
setPorcentaje(val.Porcentaje)
}
const limpiarCampos = () =>{
setSeleccionarMetodoPago(false)
setDescripcion('')
setIdMetodoPago(0)
setPorcentaje(0)
}

useEffect(()=>{
  ObtenerMetodoPago()
},[])


  return (
   <>
<h2 className='mt-3'><strong>ADMINISTRACION DE METODOS DE  PAGOS</strong></h2>
<h4 className='naranja'>Listado y gestión de metodos de pago</h4>


    <div className="container">

    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faAddressCard} size="lg" style={{color: '#FD6500', backgroundColor:''}} />
    </span>
      <input className='form-control inputss' type='text' placeholder="Descripcion"  value={Descripcion} onChange={(e) => setDescripcion(e.target.value)}/>
    </MDBInputGroup>

    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faAddressCard} size="lg" style={{color: '#FD6500', backgroundColor:''}} />
    </span>
      <input className='form-control inputss' type='numer' placeholder="Porcentaje"  value={Porcentaje} onChange={(e) => setPorcentaje(e.target.value)}/>
    </MDBInputGroup>



          <div className='card-footer text-muted'>
            {
            seleccionarMetodoPago ? 
            <div >
            <Button style={{color:'white'}}  className="btn btn-warning m-2 bgnaranja" onClick={editarMetodoPago}><FontAwesomeIcon icon={faFloppyDisk} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> EDITAR METODO PAGO</Button>
          
            <Button className="btn btn-danger m-2 bgnaranja" onClick={limpiarCampos}><FontAwesomeIcon icon={faBan} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> CANCELAR</Button>
            </div> 
            :
          
                <div > 
                <Button className="btn btn-success m-2 bgnaranja" onClick={crearMetodoPago}><FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> GUARDAR METODO DE PAGO</Button>
                </div> 
            }

              
             
          </div>




          <br /><br />
          <MDBInputGroup >
          <span className="input-group-text inputss">
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
          </span>
          <input value={buscar} onChange={buscador} type="text" placeholder='Busca un metodo de pago...' className='form-control inputss'/>
          </MDBInputGroup>
      </div>



      <div className='container table-responsive'>
      <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
          <thead className='custom-table-header'>
              <tr>
                  <th>DESCRIPCION</th>
                  <th>Porcentaje</th>
                  <th>ACCIONES</th>
              </tr>
          </thead>
          <tbody>
              {
                  resultado.map((val) => (
                    
                      <tr key={val.IdMetodoPago}>
                          <td>{val.Descripcion}</td>                                               
                          <td>{val.Porcentaje}</td>             
                         <td className=''  aria-label="Basic example">
                         <ButtonGroup aria-label="Basic example">
                            <Button onClick={()=>{seeMetodoPago(val)}} className='bgnaranja' style={{marginRight:"10px"}}><FontAwesomeIcon  icon={faPencil} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button>
                            <Button onClick={()=>{eliminarMetodoPago(val)}} className='bgnaranja'style={{marginRight:"10px"}}><FontAwesomeIcon icon={faTrash} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> 
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

export default MainMetodoPago
