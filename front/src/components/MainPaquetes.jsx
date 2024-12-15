
import  { useState, useEffect, useContext,useRef } from 'react';
import axios from 'axios';
import { Modal,Button,ButtonGroup, Table } from 'react-bootstrap';
// import * as XLSX from 'xlsx';
import Badge from '@mui/material/Badge';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import {faClipboard, faCartShopping, faCheck, faDollar, faPencil, faTrash,faMagnifyingGlass,faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DataContext } from '../context/DataContext.jsx';
import Swal from 'sweetalert2'
import Paginacion from '../components/Paginacion';


const MainPaquetes = () => {
  const inputRef = useRef(null);
  const [Nombre, setNombre] = useState('');
  const [Descripcion, setDescripcion] = useState('');
  const [IdPaquete, setIdPaquete] = useState(0);
  const [Precio, setPrecio] = useState("");
  const [detallePaquete,  setDetallePaquete] = useState([]);
  const [paquetes,  setPaquetes] = useState([]);
  const [productos,  setProductos] = useState([]);
  const [editar, setEditar] = useState(true)
  const idSucursal = localStorage.getItem("IdSucursal");
  const [cantidades, setCantidades] = useState(1)

  const {  URL } = useContext(DataContext);
 
  const Token = localStorage.getItem("Token");
  const [showModalProductos, setShowModalProductos] = useState(false);
  const handleShowModalProductos= () => setShowModalProductos(true);
  const handleCloseModalProductos = () => setShowModalProductos(false);

  const crearPaquete =async ()  => {
  
    if (Nombre.length === 0 || Descripcion.length === 0 || Precio.length === 0 || detallePaquete.length === 0 ) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debe llenar todos los campos"
        });
        return;
    }
    
    const paqueteData = {
      Nombre,
      Descripcion, 
      Precio,
      DetallePaquete: detallePaquete.map(item => ({
          IdProducto:item.IdProducto,
          Cantidad: cantidades[item.IdProducto],
      }))
  };
  try {
    const response = await axios.post(`${URL}paquete/registrar?accesstoken=${Token}`, paqueteData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const { success, mensaje } = response.data;

    if (success) {
        Swal.fire({
            title: "¡Éxito!",
            text: mensaje,
            icon: "success",
            timer: 2000
        });
         limpiarDatos()
        TraerPaquetes()
    } else {
      
        Swal.fire({
            icon: "error",
            title: "Error",
            text: mensaje || "Error al registrar el paquete!"
        });
    }
} catch (error) {
 
    const errorMessage = error.response?.data?.mensaje || error.message;
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al registrar el paquete!",
        footer: "Error: " + errorMessage
    });
}
};

        const TraerProductos = () => {
            axios.get(`${URL}producto`,{
                params: {
                    IdSucursal:idSucursal,
                  accesstoken: Token,
                  
                },
              }).then((response) => {
                setProductos(response.data)
               // setTotal(response.data.length);
                
            }).catch((error) => {
                console.log('Error al traer los productos', error)
            })
        }

        const TraerPaquetes = () =>{
          axios.get(`${URL}paquete?accesstoken=${Token}`).then((response)=>{
            const paquetes = response.data.map(paquete => ({
              ...paquete,
              DetallesProducto: JSON.parse(paquete.DetallesProducto)
            }));

             setPaquetes(paquetes)
             setTotal(response.data.length);
          }).catch((error)=>{
            console.log('Error al obtener los paquetes', error)
          })
          }
          


    const Eliminar = (val) => {
        Swal.fire({
            title: `¿Desea eliminar el paquete '${val.Nombre}'?`,
            text: "Esta acción no se podrá revertir",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar.",
            cancelButtonText: "Cancelar."
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`${URL}paquete/eliminar/${val.IdPaquete}?accesstoken=${Token}`)
                    .then((response) => {
                        const { mensaje } = response.data;
    
                        Swal.fire({
                            title: "¡Eliminado!",
                            text: mensaje || "Paquete eliminado con éxito",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            TraerPaquetes();
                        });
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



    const editarPaquete =async ()  => {
      if (Nombre.length === 0 || Descripcion.length === 0 || Precio.length === 0 || detallePaquete.length === 0 ) {
          Swal.fire({
              icon: "error",
              title: "Error",
              text: "Debe llenar todos los campos"
          });
          return;
      }
      const paqueteData = {
        IdPaquete,
        Nombre,
        Descripcion, 
        Precio,
        DetallePaquete: detallePaquete.map(item => ({
            IdProducto:item.IdProducto,
            Cantidad: cantidades[item.IdProducto],
        }))
    };
    try {
      const response = await axios.put(`${URL}paquete/editar?accesstoken=${Token}`, paqueteData, {
          headers: {
              'Content-Type': 'application/json',
          }
      });
  
      const { success, mensaje } = response.data;
  
      if (success) {
          Swal.fire({
              title: "¡Éxito!",
              text: mensaje,
              icon: "success",
              timer: 2000
          });
           limpiarDatos()
          TraerPaquetes()
      } else {
          Swal.fire({
              icon: "error",
              title: "Error",
              text: mensaje || "Error al editar el paquete!"
          });
      }
  } catch (error) {
      const errorMessage = error.response?.data?.mensaje || error.message;
      Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error al editar el paquete!",
          footer: "Error: " + errorMessage
      });
  }
  };
   
  const limpiarDatos = () => {
  
    setNombre("")
    setDescripcion("")
    setPrecio(0)
    setIdPaquete(0)
    setDetallePaquete([])
    setCantidades([])

  } 
  const cargarProductosAlPaquete = (item) => {

    setDetallePaquete(prevLista => {
      const itemExistenteIndex = prevLista.findIndex(
        existingItem => existingItem.IdProducto === item.IdProducto
          
      );
  
      if (itemExistenteIndex !== -1) {
        const listaActualizada = [...prevLista];
        const itemExistente = listaActualizada[itemExistenteIndex];
        listaActualizada[itemExistenteIndex] = {
          ...itemExistente,
          Cantidad: itemExistente.Cantidad + 1
        };
        return listaActualizada;
      } else {
        const nuevoItem = {
          Cantidad: 1, 
          Nombre: item.Nombre,
          ...({ IdProducto: item.IdProducto })
        };
  
        return [...prevLista, nuevoItem];
      }
    });
  
    setCantidades(prevCantidades => ({
      ...prevCantidades,
      [item.IdProducto]: (prevCantidades[item.IdProducto] || 0) + 1 
    }));
  };

  const seePaquete = (val) => {
    setIdPaquete(val.IdPaquete);
    setNombre(val.Nombre);
    setDescripcion(val.Descripcion);
    setPrecio(val.Precio);
    

    setDetallePaquete(val.DetallesProducto); 
    setCantidades(val.DetallesProducto.reduce((acc, item) => {
        acc[item.IdProducto] = item.Cantidad; 
        return acc;
    }, {}));
    
    setEditar(false);
};


    useEffect(() => {
      if (showModalProductos && inputRef.current) {
        inputRef.current.focus();
      }

    }, [showModalProductos]);


    useEffect(() => {
        TraerProductos()
        TraerPaquetes()
    }, []); 

    const [buscar, setBuscar] = useState('');
    const buscador = (e) => {
        setBuscar(e.target.value);
    }



    const [buscar2, setBuscar2] = useState("");
    const buscador2 = (e) => {
      setBuscar2(e.target.value);
  }

    let resultado = [];
    if (!buscar) {
        resultado = paquetes;
    } else {
        resultado = paquetes.filter((dato) => {
            const nombreIncluye = dato.Nombre.toLowerCase().includes(buscar.toLowerCase());
             return nombreIncluye;
        });
    }

    let resultado2 = [];
    if (!buscar2) {
        resultado2 = productos;
    } else {
        resultado2 = productos.filter((dato) => {
            const nombreIncluye = dato.Nombre.toLowerCase().includes(buscar2.toLowerCase());
            const codProductoIncluye = dato.Codigo && dato.Codigo.toString().includes(buscar2.toLowerCase());
 
            return nombreIncluye|| codProductoIncluye;
        });
        
    }
      //Paginacion para modal productos
  const productPorPagina = 8
  const [actualPaginaProduct, setActualPaginaProduct] = useState(1)
  const ultimoIndexProduc = actualPaginaProduct * productPorPagina;
  const primerIndexProduc = ultimoIndexProduc - productPorPagina;
  const productosPaginados = resultado2.slice(primerIndexProduc, ultimoIndexProduc);
  const totalProductos = resultado2.length;


    //PAGINACION NUEVA
    const paquetesPorPagina =10
    const [actualPagina, setActualPagina] = useState(1)
    const [total, setTotal] = useState(0)
    const ultimoIndex = actualPagina * paquetesPorPagina;
    const primerIndex = ultimoIndex - paquetesPorPagina;


  return (
       <div className='body'>
            <h2 style={{color:'#000'}}><strong>GESTION PAQUETES</strong></h2>
            <h4 className='naranja'>Gestiona todos los paquetes de tu negocio</h4> <br /> 

          

            <div className="container">
              <br />
            <Button variant="dark" onClick={handleShowModalProductos}>
                    <Badge badgeContent={detallePaquete.length} color="warning">
                    PRODUCTOS <FontAwesomeIcon icon={faCartShopping} style={{ width: '25px', height: 'auto', marginLeft:'4px' }}/>
                    </Badge>
                </Button>
                <br /><br />
                {/* <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faBarcode} size="lg" style={{color: '#FD6500'}} />
                    </span>
                    <input type="text" className="form-control inputss" value={codProducto} onChange={(e) => setCodProducto(e.target.value)} placeholder="Escanea el codigo de barras"  />
                </MDBInputGroup> */}

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faClipboard} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="text" placeholder="Nombre" value={Nombre} onChange={(e) => setNombre(e.target.value)} />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faClipboard} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="text" placeholder="Descripcion" value={Descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faDollar} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="number" placeholder="Precio Venta" value={Precio} onChange={(e) => setPrecio(e.target.value)} />
                </MDBInputGroup>
                <Table striped bordered hover className='custom-table table-responsive'>
              <thead className='custom-table-header'>
                <tr>
                  <th scope="col">NOMBRE</th>
                  <th scope="col">CANTIDAD</th>
                  <th scope="col">ELIMINAR</th>  
                </tr>
              </thead>
              <tbody>
    {detallePaquete.map((item, index) => (
      <tr key={index}>
        <td>{item.Nombre || item.NombreProducto}</td>
        <td>
          <input
            type="number"
            value={cantidades[item.IdProducto]|| 1} 
            onChange={(e) => setCantidades(prevState => ({
              ...prevState,
              [item.IdProducto]: Number(e.target.value) 
            }))}
            min="1" 
          />
        </td>
        <td>
          <button type="button" className="btn btn-danger">ELIMINAR</button>
        </td>
      </tr>
    ))}
  </tbody>
            </Table>
                {editar ?  
                <> 
                 <br />
                <div className="row">
                    <div className="col">
                        <Button style={{color:'white'}} className="btn btn-danger m-2 bgnaranja" onClick={crearPaquete}>
                            <FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> GUARDAR PAQUETE
                        </Button>
                    </div>
                </div>
                </> :
                  <div className="row">
                        <div className="col">
                            <Button  style={{color:'white'}} className="btn btn-danger m-2 bgnaranja" onClick={editarPaquete}>
                                <FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> EDITAR PAQUETE
                            </Button>
                        </div>
                </div>
            }
               
              
            </div>
            <br />
            <div className='container'>
            <MDBInputGroup >
                <span className="input-group-text inputss">
                <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
                </span>
                <input value={buscar} onChange={buscador} type="text" placeholder='Busca un paquete...' className='form-control inputss '/>
           
            </MDBInputGroup>
            </div>
            <br /><br />

            <br />

            <div className="container table-responsive">
                <table className="table table-striped table-hover mt-5 shadow-lg">
                    <thead className='custom-table-header'>
                        <tr>
                            <th>NOMBRE</th>
                            <th>DESCRIPCION</th>
                            <th>PRECIO</th>
                            <th>DETALLE</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultado.slice(primerIndex, ultimoIndex).map((item,index) => (
                            <tr key={index}>        
                                       <td>{item.Nombre}</td>
                                          <td >{item.Descripcion}</td>
                                          <td className='precio'>${item.Precio}</td>
                                          <td>
                                          <ul style={{ padding: 0, margin: 0, marginLeft:'16px' ,display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                       {item.DetallesProducto && item.DetallesProducto.map((producto) => (
                                            <li key={producto.IdProducto}>  <span style={{ fontWeight: 'bold', color: 'red' }}>{producto.Cantidad}</span> x {producto.NombreProducto}</li>
                                               ))}
                                                     </ul>

                                          </td>
                                <td>{item.Estado===1?"Activo":"No Activo"}</td>
                                <td>
                                <ButtonGroup aria-label="Basic example">
                                    <Button onClick={()=>{seePaquete(item)}} className='bgnaranja' style={{marginRight:"10px"}}><FontAwesomeIcon  icon={faPencil} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button>
                                    <Button onClick={()=>{Eliminar(item)}} className='bgnaranja'style={{marginRight:"10px"}}><FontAwesomeIcon icon={faTrash} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> 
                                </ButtonGroup>
                                </td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{display:'flex',justifyContent:'center'}}>
                <Paginacion 
                    productosPorPagina={paquetesPorPagina} 
                    actualPagina={actualPagina} 
                    setActualPagina={setActualPagina} 
                    total={total}
                  />
                </div>
            </div>
         


















       {/* MODAL PARA BUSCAR PRODUCTOS */}

       <Modal
              show={showModalProductos} onHide={handleCloseModalProductos} 
              size="lg"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                  <h4>PRODUCTOS</h4>
                <input className='form-control' ref={inputRef} type="text" placeholder="Buscar un producto..." onChange={buscador2} /> 
                </Modal.Title>
              </Modal.Header>
          <Modal.Body>
          <div className='container table table-responsive'>
    <Table striped bordered hover className='custom-table '>
        <thead className='custom-table-header'>
            <tr>
                <th>CODIGO</th>
                <th>NOMBRE</th>
                <th>DESCRIPCIÓN</th>
                <th>PRECIO</th>
                <th>AGREGAR</th>
            </tr>
        </thead>
        <tbody>
            {buscar2.length > 0 ? (
                productosPaginados.map((producto, index) => (
                    <tr key={index}>
                            <>
                                <td>{producto.Codigo}</td>
                                <td>{producto.Nombre}</td>
                                <td>{producto.Descripcion}</td>
                                <td > ${producto.PrecioVenta}</td>
                                <td><button type="button" className="btn bgNaranja" onClick={() =>cargarProductosAlPaquete(producto)} ><FontAwesomeIcon icon={faCheck} size="lg" style={{color: 'black'}} /> </button></td>
          
          </>
                     
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="6" className="text-center">Por favor, comience a buscar para ver los resultados</td>
                </tr>
            )}
        </tbody>
    </Table>
</div>

            </Modal.Body>
            <Modal.Footer>
              
               {buscar && (
                  <Paginacion 
                    productosPorPagina={productPorPagina} 
                    actualPagina={actualPaginaProduct} 
                    setActualPagina={setActualPaginaProduct} 
                    total={totalProductos}
                  />
              )} 
              <Button variant="danger" onClick={handleCloseModalProductos}>CERRAR </Button>
            </Modal.Footer>
          </Modal>


    </div>
  )
}

export default MainPaquetes
