
import  { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Button, Form,ButtonGroup } from 'react-bootstrap';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import {  faBan, faMagnifyingGlass, faPencil, faPowerOff, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { DataContext } from '../context/DataContext.jsx';
import Swal from 'sweetalert2'

const MainCategorias = () => {

  
  
  const Token = localStorage.getItem("Token");
  const {URL}  = useContext(DataContext)


  const [Categorias, setCategorias] = useState([])
  const[IdCategoria,setIdCategoria] = useState(0);
  const[Descripcion,setDescripcion] = useState("");
  const [seleccionarCategoria, setSeleccionarCategoria] = useState(false)
  const[buscar,setBuscar] = useState("");
  const[Estado,setEstado] = useState(1); 

  

  const buscador = (e) => {
    setBuscar(e.target.value)
  }
  
  let resultado = []
  if (!buscar) {
    resultado = Categorias
  } else {
    resultado = Categorias.filter((dato) =>
      dato.Descripcion.toLowerCase().includes(buscar.toLowerCase())
    )
  }




const ObtenerCategorias = () =>{
axios.get(`${URL}categoria?accesstoken=${Token}`).then((response)=>{
   setCategorias(response.data)
}).catch((error)=>{
  console.log('Error al obtener las categorias', error)
})
}

const crearCategorias = () => {
  if (Descripcion.length === 0) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debe llenar todos los campos"
      });
  } else {
      axios.post(`${URL}categoria/registrar?accesstoken=${Token}`, {
          Descripcion: Descripcion,
          Estado: 1
      }).then((response) => {
          const { success, mensaje } = response.data;

          if (success) {
              Swal.fire({
                  title: "¡Éxito!",
                  text: mensaje || "Categoría creada con éxito!",
                  icon: "success",
                  timer: 2000
              });
              limpiarCampos();
              ObtenerCategorias();
          } else {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Error al crear la categoría!",
                  footer: mensaje
              });
          }
      }).catch((error) => {
          const errorMessage = error.response?.data?.mensaje || error.message;
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Error al crear la categoría!",
              footer: "Error: " + errorMessage
          });
      });
  }
};
const editarCategoria = () => {
  if (Descripcion.length === 0) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debe llenar todos los campos"
      });
  } else {
      axios.put(`${URL}categoria/editar?accesstoken=${Token}`, {
          IdCategoria: IdCategoria,
          Descripcion: Descripcion,
          Estado: Estado
      }).then((response) => {
          const { success, mensaje } = response.data;

          if (success) {
              Swal.fire({
                  title: "¡Éxito!",
                  text: mensaje || "Categoría editada con éxito!",
                  icon: "success",
                  timer: 2000
              });
              limpiarCampos();
              ObtenerCategorias();
          } else {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Error al editar la categoría!",
                  footer: mensaje || "No se pudo completar la solicitud."
              });
          }
      }).catch((error) => {
          const errorMessage = error.response?.data?.mensaje || error.message;
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Error al editar la categoría!",
              footer: "Error: " + errorMessage
          });
      });
  }
};
const eliminarCategoria = (val) => {
  Swal.fire({
      title: `¿Desea eliminar la categoría '${val.Descripcion}'?`,
      text: "Esta acción no se podrá revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar.",
      cancelButtonText: "Cancelar."
  }).then((result) => {
      if (result.isConfirmed) {
          axios.delete(`${URL}categoria/eliminar/${val.IdCategoria}?accesstoken=${Token}`)
              .then((response) => {
                  const { success, mensaje } = response.data;

                  if (success) {
                      Swal.fire({
                          title: "¡Eliminado!",
                          text: mensaje,
                          icon: "success"
                      });
                      ObtenerCategorias();
                  } else {
                      Swal.fire({
                          icon: "error",
                          title: "Error",
                          text: "No se pudo eliminar la categoría.",
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

const seeCategoria = (val) =>{
setSeleccionarCategoria(true)
setDescripcion(val.Descripcion)
setIdCategoria(val.IdCategoria)
setEstado(val.Estado)
}
const limpiarCampos = () =>{
setSeleccionarCategoria(false)
setDescripcion('')
setIdCategoria(0)
setEstado(1)
}

useEffect(()=>{
  ObtenerCategorias()
},[])


  return (
   <>
<h2 className='mt-3'><strong>ADMINISTRACION DE CATEGORIAS</strong></h2>
<h4 className='naranja'>Listado y gestión de categorias</h4>


    <div className="container">

    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss">
      <FontAwesomeIcon icon={faAddressCard} size="lg" style={{color: '#FD6500', backgroundColor:''}} />
    </span>
      <input className='form-control inputss' type='text' placeholder="Descripcion"  value={Descripcion} onChange={(e) => setDescripcion(e.target.value)}/>
    </MDBInputGroup>

    {seleccionarCategoria && (
    <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss   ">
      <FontAwesomeIcon icon={faPowerOff} size="lg" style={{color: '#FD6500'}} />
    </span>
    <Form.Select aria-label="Estado" className='inputss'  id='estado' value={Estado} onChange={(e)=>setEstado(e.target.value)}>   
                    <option value="1">Activo</option>
                    <option value="0">No Activo</option>
    </Form.Select>
    </MDBInputGroup>)}


          <div className='card-footer text-muted'>
            {
            seleccionarCategoria ? 
            <div >
            <Button style={{color:'white'}}  className="btn btn-warning m-2 bgnaranja" onClick={editarCategoria}><FontAwesomeIcon icon={faFloppyDisk} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> EDITAR CATEGORIA</Button>
          
            <Button className="btn btn-danger m-2 bgnaranja" onClick={limpiarCampos}><FontAwesomeIcon icon={faBan} size="lg" style={{color: "#fff"}}></FontAwesomeIcon> CANCELAR</Button>
            </div> 
            :
          
                <div > 
                <Button className="btn btn-success m-2 bgnaranja" onClick={crearCategorias}><FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> GUARDAR CATEGORIA</Button>
                </div> 
            }

              
             
          </div>




          <br /><br />
          <MDBInputGroup >
          <span className="input-group-text inputss">
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
          </span>
          <input value={buscar} onChange={buscador} type="text" placeholder='Busca una categoria...' className='form-control inputss'/>
          </MDBInputGroup>
      </div>



      <div className='container table-responsive'>
      <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
          <thead className='custom-table-header'>
              <tr>
                  <th>DESCRIPCION</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
              </tr>
          </thead>
          <tbody>
              {
                  resultado.map((val) => (
                    
                      <tr key={val.IdCategoria}>
                          <td>{val.Descripcion}</td>                                               
                          <td>{val.Estado===1?"Activo":"No Activo"}</td>             
                         <td className=''  aria-label="Basic example">
                         <ButtonGroup aria-label="Basic example">
                            <Button onClick={()=>{seeCategoria(val)}} className='bgnaranja' style={{marginRight:"10px"}}><FontAwesomeIcon  icon={faPencil} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button>
                            <Button onClick={()=>{eliminarCategoria(val)}} className='bgnaranja'style={{marginRight:"10px"}}><FontAwesomeIcon icon={faTrash} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> 
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

export default MainCategorias
