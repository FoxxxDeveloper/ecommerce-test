
import { Modal, Button, Table} from 'react-bootstrap';
import axios from 'axios';
import Badge from '@mui/material/Badge';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import es from 'date-fns/locale/es';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faBarcode, faCartShopping, faCashRegister, faCheck, faFloppyDisk, faMagnifyingGlass, faTrash,  } from "@fortawesome/free-solid-svg-icons";
import { MDBInputGroup } from 'mdb-react-ui-kit';
import  { useState,useContext,useEffect,useRef } from "react";
import { DataContext } from "../context/DataContext";
import Paginacion from '../components/Paginacion';
import Swal from 'sweetalert2' 


const MainRegistrarCompra = () => {

  const Token = localStorage.getItem("Token")
  const IdSucursal = localStorage.getItem("IdSucursal");
  const IdUsuario = localStorage.getItem("IdUsuario")

  const {URL} = useContext(DataContext)
  const inputRef = useRef(null);




  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [Codigo, setCodigo] = useState("")
  const [listaParaComprar, setListaParaComprar] = useState([])
  const [ultimasCompras, setUltimasCompras] = useState([])
  const [cantidades, setCantidades] = useState([])
  const [proveedorElegido, setProveedoresElegido] = useState("")
  const [IdProveedor, setIdProveedor] = useState(0)
  const [preciosCompras, setPreciosCompras] = useState([])
  const [preciosVentas, setPreciosVentas]= useState([])
    const [comprasGuardadas, setComprasGuardadas] = useState([])
  // const [TipoDocumento, setTipoDocument] = useState("")
  const [MontoTotal, setMontoTotal] = useState(0)
  const [compraSeleccionada, setCompraSeleccionada] = useState();
  const [showModalProductos, setShowModalProductos] = useState(false);
  const [showModalComprasDelDia, setShowModalComprasDelDia] = useState(false);
  const [showModalFinalCompra, setShowModalFinalCompra] = useState(false)
  const [showModalProveedores, setShowModalProveedores] = useState(false)
  const [showModalComprasGuardadas, setShowModalComprasGuardadas] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const handleShowModalProductos= () => setShowModalProductos(true);
  const handleCloseModalProductos = () => setShowModalProductos(false);

  const handleShowModalComprasDelDia= () => setShowModalComprasDelDia(true);
  const handleCloseModalComprasDelDia = () => setShowModalComprasDelDia(false);

  const handleShowModalFinalCompra = () => setShowModalFinalCompra(true);
  const handleCloseModalFinalCompra = () => setShowModalFinalCompra(false);

  const handleShowModalProveedores = () => setShowModalProveedores(true);
  const handleCloseModalProveedores = () => setShowModalProveedores(false);

  const handleShowModalComprasGuardadas = () => setShowModalComprasGuardadas(true);
  const handleCloseModalComprasGuardadas = () => setShowModalComprasGuardadas(false);

  const traerProductos = () => {
    axios.get(`${URL}producto`,{
        params: {
            IdSucursal: IdSucursal,
          accesstoken: Token,
          
        },
      }).then((response) => {
        setProductos(response.data)
        
    }).catch((error) => {
        console.log('Error al traer los productos', error)
    })
}


const traerProveedores = () => {
  axios.get(`${URL}proveedor`,{
      params: {
        accesstoken: Token,
        
      },
    }).then((response) => {
      setProveedores(response.data)
      
  }).catch((error) => {
      console.log('Error al traer los productos', error)
  })
}


const guardarCompra = () => {
  if (listaParaComprar.length === 0) {
    Swal.fire('Debe tener al menos un producto en la lista!', '', 'warning');
  } else {
    let compraAGuardar = {
      IdCompraGuardada: comprasGuardadas.length + 1,
      ListaParaComprar: listaParaComprar,
      Cantidades: cantidades,
      PreciosCompras:preciosCompras,
      PreciosVentas:preciosVentas
    };
    
    setComprasGuardadas((prevCompras) => [...prevCompras, { ...compraAGuardar }]);
    Swal.fire('Compra guardada con éxito!', '', 'success');
    setListaParaComprar([]);
    setCantidades([]);
    setPreciosCompras([]);
    setPreciosVentas([]);
  }
};


const seleccionarCompra = (compra) => {
  setCompraSeleccionada(compra);
  handleShowModalComprasGuardadas(); 
};

const handleEscaneoProducto = async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const codigo = document.getElementById('codigo-input').value;

    try {
      const response = await axios.get(`${URL}producto/buscar`, {
        params: {
          accesstoken: Token,
          Codigo: codigo,
          IdSucursal: IdSucursal,
        },
      });
      cargarItemParaComprar(response.data); 
      setCodigo(""); 
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Producto no encontrado",
            timer:1500
        });
        } else {
          console.error('Error:', error.response.data); 
        }
      } else {
        console.error('Error de red:', error.message); 
      }
    }
  }
};



const verCompraGuardada = (compra) => {
  setListaParaComprar(compra.ListaParaComprar); 
  setCantidades(compra.Cantidades);
setPreciosCompras(compra.PreciosCompras);
setPreciosVentas(compra.PreciosVentas);
  setComprasGuardadas(prevCompras => prevCompras.filter(c => c.IdCompraGuardada !== c.IdCompraGuardada))

  handleCloseModalComprasGuardadas();
};


const eliminarCompraGuardada = (index) => {
  setComprasGuardadas(prevCompras => {
    return prevCompras.filter((_, i) => i !== index);
  })
  setListaParaComprar([])
  setCantidades([])
  setPreciosCompras([])
  setPreciosVentas([])
  handleCloseModalComprasGuardadas()

};

  const cargarItemParaComprar = (item) => {
   
    setListaParaComprar(prevLista => {
      // Revisa si el ítem ya existe en la lista
      const itemExistenteIndex = prevLista.findIndex(
        existingItem => existingItem.IdProducto === item.IdProducto
         
      );
  
      if (itemExistenteIndex !== -1) {
        const listaActualizada = [...prevLista];
        const itemExistente = listaActualizada[itemExistenteIndex];
        listaActualizada[itemExistenteIndex] = {
          ...itemExistente,
          SubTotal: (cantidades[item.IdProducto]+1) * (preciosCompras[item.IdProducto])
        };
        return listaActualizada;
      } else {
        const nuevoItem = {
          Nombre: item.Nombre,
          Codigo:  item.Codigo,
          PrecioVenta: item.PrecioVenta,
          PrecioCompra: item.PrecioCompra,
          Stock: item.Stock,
          SubTotal: 1 * item.PrecioCompra ,
          ...{ IdProducto: item.IdProducto }
        };
  
        return [...prevLista, nuevoItem];
      }
    });
    setCantidades(prevCantidades => {
      const cantidadActual = prevCantidades[item.IdProducto] || 0;
  
      const nuevaCantidad = (cantidadActual + 1);
  
      return {
        ...prevCantidades,
        [item.IdProducto]: nuevaCantidad
      };
    });

    setPreciosCompras(prevPreciosCompras => {
      const precioCompraActual = prevPreciosCompras[item.IdProducto] || item.PrecioCompra;
      return {
        ...prevPreciosCompras,
        [item.IdProducto]: precioCompraActual
      };
    });

    setPreciosVentas(prevPreciosVentas => {
      const precioVentaActual = prevPreciosVentas[item.IdProducto] || item.PrecioVenta;
      return {
        ...prevPreciosVentas,
        [item.IdProducto]: precioVentaActual
      };
    });



  };
  
 
    
  const FinalizarCompra = async () => {
    if (!IdUsuario || !IdProveedor || !MontoTotal || !IdSucursal) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Datos incompletos para registrar la compra."
        });
        return;
    }

    if (listaParaComprar.length < 1) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No puede realizar una compra sin productos"
        });
        return;
    }

    const compraData = {
        IdUsuario, 
        IdProveedor, 
        TipoDocumento: "Boleta", 
        MontoTotal, 
        IdSucursal, 
        DetalleCompra: listaParaComprar.map(item => ({
            IdProducto: item.IdProducto,
            Cantidad: cantidades[item.IdProducto],
            PrecioCompra: preciosCompras[item.IdProducto],
            PrecioVenta: preciosVentas[item.IdProducto],
            MontoTotal: (cantidades[item.IdProducto] * preciosCompras[item.IdProducto]).toFixed(2), 
        }))
    };

    try {
        const response = await axios.post(`${URL}compra/registrar?accesstoken=${Token}`, compraData, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const { id, mensaje } = response.data; 

        if (id) {
            Swal.fire({
                title: "¡Éxito!",
                text: mensaje || "Compra registrada con éxito",
                icon: "success",
                timer: 2000
            });
            limpiarDatos();  
            traerLasUltimasCompras()
            traerProductos()
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: mensaje || "Error al registrar la compra!"
            });
        }
    } catch (error) {
        const errorMessage = error.response?.data?.mensaje || error.message;
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error al registrar la compra!",
            footer: "Error: " + errorMessage
        });
    }
};



  
  const EliminarProductoDeLista = (item) => {
    const idItem =item.IdProducto.toString();
    setListaParaComprar(prevLista => {
      const listaActualizada = prevLista.filter(existingItem => {
        const existingId = existingItem.IdProducto.toString() 
        return existingId !== idItem;
      });
      return listaActualizada;
    });
    setCantidades(prevCantidades => {
      const updatedCantidades = { ...prevCantidades };
      delete updatedCantidades[idItem];
      return updatedCantidades;
    });
    setPreciosCompras(prevPreciosCompras => {
      const updatedPreciosCompras = { ...prevPreciosCompras };
      delete updatedPreciosCompras[idItem];
      return updatedPreciosCompras;
    });
    setPreciosVentas(prevPreciosVentas => {
      const updatedPreciosVentas = { ...prevPreciosVentas };
      delete updatedPreciosVentas[idItem];
      return updatedPreciosVentas;
    });
  };
  
  
  

  const eliminarCompra = (compra) => {
    Swal.fire({
        title: `¿Desea eliminar la compra con el número de documento '${compra.Documento}'?`,
        text: "Esta acción no se podrá revertir",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar.",
        cancelButtonText: "Cancelar."
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`${URL}compra/eliminar/${compra.IdCompra}?accesstoken=${Token}`)
                .then((response) => {
                    const { mensaje } = response.data;

                    Swal.fire({
                        title: "¡Eliminado!",
                        text: mensaje || "Compra eliminada con éxito",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        traerProductos()
                        traerLasUltimasCompras()
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




  const [buscar, setBuscar] = useState("");


  const limpiarDatos = () => {
  
    setMontoTotal(0)
    setIdProveedor(1)
    setListaParaComprar([])
    setCantidades([])
    setPreciosVentas([])
    setPreciosCompras([])
    handleCloseModalFinalCompra()
    if (inputRef.current) {
      inputRef.current.focus();
    }
  } 

  const buscador = (e) => {
    setBuscar(e.target.value);
  } 
  let resultado = [];
  if (!buscar) {
    resultado = productos;
  } else {
    resultado = productos.filter((dato) => {
      const nombreProductoIncluye = dato.Nombre.toLowerCase().includes(buscar.toLowerCase());
      return nombreProductoIncluye ;
    });
  }


  const [buscarProveedores, setBuscarProveedores] = useState("");

  const buscadorProveedores = (e) => {
    setBuscarProveedores(e.target.value);
  } 
  let resultadoProveedores = [];
  if (!buscarProveedores) {
    resultadoProveedores = proveedores;
  } else {
    resultadoProveedores = proveedores.filter((dato) => {
      const razonSocialIncluye = dato.RazonSocial.toLowerCase().includes(buscarProveedores.toLowerCase());
      const DocumentoProveedorIncluye = dato.Documento.toLowerCase().includes(buscarProveedores.toLowerCase());
      return razonSocialIncluye || DocumentoProveedorIncluye;
    });
  }






  const calcularTotal = ()=>{
    let MontooTotal = 0;
    setMontoTotal(0)
   
    if (listaParaComprar.length>0){
      listaParaComprar.map((p)=> (
        MontooTotal += (preciosCompras[p.IdProducto] * cantidades[p.IdProducto])
      ))
    
    
      setMontoTotal(MontooTotal)

    }
    else{
      return 0;
    }
  }
  


  const selectProveedor = (val) =>{
    setProveedoresElegido(val.RazonSocial)
    setIdProveedor(val.IdProveedor)
    handleCloseModalProveedores()
  }

  useEffect(()=>{
    traerProductos()
    traerProveedores()
  },[])

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const traerLasUltimasCompras = ( ) =>{
    const formattedDate = formatDate(fechaSeleccionada);

    axios.get(`${URL}reporte/ultimasCompras`, {
        params: {
            IdSucursal,         
            Fecha: formattedDate,
            accesstoken: Token 
        }
    })
    .then((response) => {
      const ultimascompras = response.data.map(compra => ({
        ...compra,
        Productos: JSON.parse(compra.Productos)
      }));
      setTotalComprasDelDia(response.data.length)
      setUltimasCompras(ultimascompras);
    })
    .catch((error) => {
        console.log(error);
    });
  }

  useEffect(() => {
    traerLasUltimasCompras()
}, [fechaSeleccionada]); 




  useEffect(() => {
    if (showModalProductos && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModalProductos]);


  useEffect(() => {
    calcularTotal()
  }, [listaParaComprar, cantidades, preciosCompras]);



  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
 
  //Paginacion para modal productos
  const productPorPagina = 6
  const [actualPaginaProduct, setActualPaginaProduct] = useState(1)
  const ultimoIndexProduc = actualPaginaProduct * productPorPagina;
  const primerIndexProduc = ultimoIndexProduc - productPorPagina;
  const productosPaginados = resultado.slice(primerIndexProduc, ultimoIndexProduc);
  const totalProductos = resultado.length;


    //Paginacion para modal compras del dia
    const comprasDelDiaPorPagina= 10
    const [actualPaginaComprasDelDia ,setActualPaginaComprasDelDia]= useState(1)
    const [totalComprasDelDia, setTotalComprasDelDia] = useState(0)
    const ultimoIndexComprasDelDia = actualPaginaComprasDelDia * comprasDelDiaPorPagina;
    const primerIndexComprasDelDia = ultimoIndexComprasDelDia - comprasDelDiaPorPagina;


    
    useEffect(() => {
      const manejarKeyDown = (event) => {
        if (event.key === 'F1') {
          event.preventDefault();
          handleShowModalProductos()
        }
     
        if (event.key === 'F8') {
          event.preventDefault();
          handleShowModalComprasDelDia();
        }
        if (event.key === 'F9') {
          event.preventDefault();
          guardarCompra();
        }
       
      };
    document.addEventListener('keydown', manejarKeyDown);
    return () => {
      document.removeEventListener('keydown', manejarKeyDown);
    };
  }, [listaParaComprar]);

  return (
    <>
  
      <div className='h3-ventas'>
      <h2 style={{color:'#000'}}><strong>REGISTRO DE COMPRAS</strong></h2>
            <h4 className='naranja'>Registra y administra las compras de tu negocio</h4> <br /> 

      </div>
      <div className='container-fluid'>
            <div className='row'>
         
            <div className='col'><br />
            <div id="shopName2" className='container'>
              <div className="row">
                <div className="col">  
                   <h4 className='textoVenta'><b style={{color: "#fff !important"}}>FOX|</b><span className='naranjita'>Software</span></h4></div>
                </div>
              </div>
     

            <div className='container-fluid'>
            <div className='container horizontal-list'>
            {comprasGuardadas.map((compras, index) => (
                    <div key={index}>
                      <Button onClick={() => seleccionarCompra(compras)} className='bgnaranja' style={{ marginRight: "10px" }}>
                        COMPRA {index + 1}
                      </Button>
                      
                    </div>
                  ))}
              </div>
            </div>

              <div className="container">
              <div className='contenedorBotones' style={{marginTop: '50px'}}> 
                <Button variant="dark" onClick={handleShowModalProductos}>
                    <Badge badgeContent={listaParaComprar.length} color="warning">
                    F1-PRODUCTOS <FontAwesomeIcon icon={faCartShopping} style={{ width: '25px', height: 'auto', marginLeft:'4px' }}/>
                    </Badge>
                </Button>
                

                <Button variant="dark" onClick={handleShowModalComprasDelDia}>
                   
                    F8- COMPRAS DEL DIA <FontAwesomeIcon icon={faCashRegister} style={{ width: '25px', height: 'auto', marginLeft:'4px' }}/>
                  
                </Button>
                <Button variant="dark" onClick={guardarCompra}>
                   
                    F9-GUARDAR COMPRA <FontAwesomeIcon icon={faFloppyDisk} style={{ width: '22px', height: 'auto', marginLeft:'4px' }}/>
                  
                </Button>
            
                 </div> 
              </div>
              
            </div>
            </div>
        </div>


    <br />
    
      <div className='container d-flex' >
        <div className='row'>
              <MDBInputGroup className='mb-3 ' >
                <span className="input-group-text codigo">
                  <FontAwesomeIcon icon={faBarcode} size="lg" style={{color: 'black'}} />
                </span>
                  <input onChange={(e) => setCodigo(e.target.value)}  value={Codigo} id="codigo-input" onKeyDown={handleEscaneoProducto} className='form-control codigo' ref={inputRef} type='text' placeholder="Codigo"/>
                  
                </MDBInputGroup>
                
          
            </div>
        </div>

        
        <div className='container table-responsive'>
          <Table striped bordered hover className='custom-table table-responsive'>
              <thead className='custom-table-header'>
                <tr>
                  <th scope="col">CODIGO</th>
                  <th scope="col">NOMBRE PRODUCTOS</th>
                  <th scope="col" >PRECIO COMPRA</th>
                  <th scope="col" >PRECIO VENTA</th>
                  <th scope="col">CANTIDAD</th>
                  <th scope="col">ELIMINAR</th>  
                </tr>
              </thead>
              <tbody>
              
    {listaParaComprar.map((item, index) => (
     
      <tr key={index}>
        <td>{item.Codigo}</td>
        <td>{item.Nombre}</td>
        <td>
        <input
  className='form-control'
  type="number"
  value={preciosCompras[item.IdProducto] || 1}
  onChange={(e) => {
    const value = Number(e.target.value);
    setPreciosCompras(prevState => ({
      ...prevState,
      [item.IdProducto]: value > 0 ? value : 1
    }));
  }}
  min="1"
/>

        </td>
        <td>
        <input
  className='form-control'
  type="number"
  value={preciosVentas[item.IdProducto]|| 1}
  onChange={(e) => {
    const value = Number(e.target.value);
    setPreciosVentas(prevState => ({
      ...prevState,
      [item.IdProducto]: value > 0 ? value : 1
    }));
  }}
  min="1"
/>

        </td>
      
        <td>
        <input
  className='form-control'
  type="number"
  value={cantidades[item.IdProducto] || 1}
  onChange={(e) => {
    const value = Number(e.target.value);
    setCantidades(prevState => ({
      ...prevState,
      [item.IdProducto]: value > 0 ? value : 1
    }));
  }}
  min="1"
/>
        </td>
        <td>
          <button type="button" className="btn btn-danger" onClick={()=>EliminarProductoDeLista(item)}>ELIMINAR</button>
        </td>
      </tr>
    ))}
  </tbody>
            </Table>
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
                <input className='form-control' ref={inputRef} type="text" placeholder="Buscar un producto..." onChange={buscador} /> 
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
                <th>PRECIO COMPRA</th>
                <th>PRECIO VENTA</th>
                <th>STOCK</th>
                <th>AGREGAR</th>
            </tr>
        </thead>
        <tbody>
            {buscar.length > 0 ? (
                productosPaginados.map((producto, index) => (
                    <tr key={index}>
                            <>
                                <td>{producto.Codigo}</td>
                                <td>{producto.Nombre}</td>
                                <td>{producto.Descripcion}</td>
                                <td > {producto.PrecioCompra.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                <td > {producto.PrecioVenta.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                <td>{producto.Stock}</td>
                                <td><button type="button" className="btn bgNaranja" onClick={() =>cargarItemParaComprar(producto)} ><FontAwesomeIcon icon={faCheck} size="lg" style={{color: 'black'}} /> </button></td>
          
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








        {/* COMPRAS DEL DIA */}
          <Modal show={showModalComprasDelDia} onHide={handleCloseModalComprasDelDia} dialogClassName="custom-modal" >
            <Modal.Header closeButton>
              <Modal.Title>COMPRAS DEL DIA</Modal.Title>
            </Modal.Header>   
            <Modal.Body>
            <label className='lbl-corte'>Reporte iniciado de la fecha: {formatDate(fechaSeleccionada)}</label><br />
              
            <DatePicker
              selected={fechaSeleccionada}
              onChange={(date) => {
                setFechaSeleccionada(date);
              }}
              className="form-control custom-date-picker custom-datepicker-wrapper"
              dateFormat="yyyy/MM/d"
              locale={es}
              placeholderText="Ingrese una fecha"
              maxDate={new Date()} // Desactiva fechas futuras
            />

              <br /> <br />
            <div className='container table table-responsive'>
            <Table striped bordered hover>
            <thead>
           
              <tr>
                <th>PRODUCTO</th>
                <th>Nº DE COMPRA</th>
                <th>CANTIDAD COMPRADA</th>
                <th>MONTO TOTAL</th>
                <th>FECHA DE COMPRA</th>
                <th>ELIMINAR COMPRA</th>
              </tr>
            </thead>
            <tbody>
            
  {ultimasCompras.length > 0 ? (
    ultimasCompras.slice(primerIndexComprasDelDia, ultimoIndexComprasDelDia).map((detalle, index) => (
      <tr key={index}>
        <td>
          {detalle.Productos && Array.isArray(detalle.Productos) && detalle.Productos.map((producto, index) => (
            <li key={index}>{producto.Producto}</li>
          ))}
        </td>
        <td>{detalle.Documento}</td>
        <td>
          {detalle.Productos.map((producto, Index) => (
            <p key={Index}>Cantidad: {parseInt(producto.Cantidad)}</p>
          ))}
        </td>
        <td>{detalle.MontoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
        <td>{new Date(detalle.FechaRegistro).toLocaleString()}</td>
        <td>
          <Button className="btn btn-danger" onClick={() => eliminarCompra(detalle)}>
            <FontAwesomeIcon icon={faTrash} size="lg" style={{ color: '#FD6500' }} />
          </Button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6">No hay compras disponibles.</td>
    </tr>
  )}
</tbody>

 
          </Table>

          <Paginacion 
              productosPorPagina={comprasDelDiaPorPagina} 
              actualPagina={actualPaginaComprasDelDia} 
              setActualPagina={setActualPaginaComprasDelDia} 
              total={totalComprasDelDia}
          />
          </div>
          

         
          
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={handleCloseModalComprasDelDia}>
                CERRAR
              </Button>
             
            </Modal.Footer>
          </Modal>


          <Modal show={showModalFinalCompra} onHide={handleCloseModalFinalCompra}>
            <Modal.Header closeButton>
              <Modal.Title>VER DETALLE COMPRA</Modal.Title>
            </Modal.Header>

    
            <Modal.Body>
            <h3><b>TOTAL: {MontoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} </b></h3>

          <label>Proveedor:</label>
          <MDBInputGroup className='mb-3' >
        <span className="input-group-text inputss">
          <FontAwesomeIcon icon={faAddressCard} size="lg" style={{color: '#FD6500'}} />
        </span>
          <input  className='form-control inputss' type='text' placeholder="Proveedor" readOnly value={proveedorElegido} />

          <Button className='bgnaranja' onClick={handleShowModalProveedores}>
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#fff'}} />
        </Button>
        </MDBInputGroup>
    <br />
    <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
        className="btn btn-danger m-2 bgnaranja" 
        style={{ width: '400px', marginTop: '6px' }}  
        onClick={FinalizarCompra}
        >
       FINALIZAR COMPRA
      </Button>
    </div>
       



            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={handleCloseModalFinalCompra}>
                CERRAR
              </Button>
            </Modal.Footer>
          </Modal>




  


          {/* MODAL PARA PROVEEDORES  */}
          <Modal size='lg'  show={showModalProveedores} onHide={handleCloseModalProveedores} animation={false}>
        <Modal.Header closeVariant='white' closeButton >
          <Modal.Title>PROVEEDORES</Modal.Title>
        </Modal.Header>
        <Modal.Body>

         <MDBInputGroup >
              <span className="input-group-text">
              <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
              </span>
              <input value={buscarProveedores} onChange={buscadorProveedores} type="text" placeholder='Busca un proveedor...' className='form-control'/>
          </MDBInputGroup>
         <div className='table-responsive'>
          <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
              <thead className='custom-table-header'>
                  <tr>
                      
                      <th>DNI</th>
                      <th>RAZON SOCIAL</th>
                      <th>TELEFONO</th>
                      <th>SELECCIONAR</th>
                  </tr>
              </thead>
              <tbody>
                  {
                      resultadoProveedores.map((val) => (
                        
                          <tr key={val.IdProveedor}>
                            {val.Estado === 1 ?
                             <>
                              <td>{val.Documento}</td>
                              <td>{val.RazonSocial}</td>       
                              <td>{val.Telefono}</td> 
                              <td><Button className='bgnaranja' onClick={()=> selectProveedor(val)}>   <FontAwesomeIcon icon={faCheck} size="lg" style={{color: '#fff'}} /></Button></td>
                                        
                             </>
                             :
                             <td>PROVEEDOR INACTIVO</td>
                          }
                                     
                          </tr>
                      ))
                  }
              </tbody>
          </table> 
          </div>
        </Modal.Body>
        <Modal.Footer >
          <Button variant='danger' onClick={handleCloseModalProveedores}>CERRAR</Button>
        </Modal.Footer>
      </Modal>




                {/* MODAL PARA COMPRAS GUARDADAS  */}
                <Modal size='lg'  show={showModalComprasGuardadas} onHide={handleCloseModalComprasGuardadas} animation={false}>
        <Modal.Header closeVariant='white' closeButton >
          <Modal.Title>COMPRAS GUARDADAS</Modal.Title>
        </Modal.Header>
        <Modal.Body> 
         <div className='table-responsive'>
          <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
              <thead className='custom-table-header'>
                  <tr>
                      <th>CODIGO</th>
                      <th>PRODUCTO</th>
                      <th>CANTIDAD</th>
                      <th>PRECIO COMPRA</th>
                      
                  </tr>
              </thead>
              <tbody>
              {compraSeleccionada?.ListaParaComprar.map((producto, indexProducto) => (
                <tr key={indexProducto}>
                  <td>{producto.Codigo}</td>
                  <td>{producto.Nombre}</td>
                  
            <td>
             {compraSeleccionada.Cantidades[producto.IdProducto] || 1}
            </td>
            <td>
            {compraSeleccionada.PreciosCompras[producto.IdProducto].toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || "N/A"}
            </td>
                  
                </tr>
              ))}
            </tbody>
          </table> 
          </div>


          <div className="d-flex justify-content-between mt-3">
            <Button variant='danger' onClick={() => eliminarCompraGuardada(comprasGuardadas.indexOf(compraSeleccionada))}>
            <FontAwesomeIcon icon={faTrash} size="lg" style={{ color: '#fff' }} /> Eliminar compra
            </Button>
            
 
            <Button className='bgnaranja' onClick={() => verCompraGuardada(compraSeleccionada)}>
              <FontAwesomeIcon icon={faCheck} size="lg" style={{ color: '#fff' }} /> Cargar compra
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer >
          <Button variant='danger' onClick={handleCloseModalComprasGuardadas}>CERRAR</Button>
        </Modal.Footer>
      </Modal>            










          <div className='col'><Button  className='gradient-button2' style={{width: '190px', marginTop:'10px', color: '#fff'}} onClick={handleShowModalFinalCompra} >F12-COMPRAR</Button></div>

    </>
  )
}
export default MainRegistrarCompra

