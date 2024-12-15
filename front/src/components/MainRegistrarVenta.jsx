
import { Modal, Button, Table} from 'react-bootstrap';
import axios from 'axios';
import '../css/venta.css'
import Badge from '@mui/material/Badge';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import es from 'date-fns/locale/es';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faBarcode, faBoxOpen, faCartShopping, faCashRegister, faCheck, faDollar, faDollyBox, faFloppyDisk, faMagnifyingGlass, faMapMarkedAlt, faTrash, faTruckFast,  } from "@fortawesome/free-solid-svg-icons";
import { MDBInputGroup } from 'mdb-react-ui-kit';
import  { useState,useContext,useEffect,useRef } from "react";
import { DataContext } from "../context/DataContext";
import Paginacion from '../components/Paginacion';
import Swal from 'sweetalert2' 

const MainRegistrarVenta = () => {

  const Token = localStorage.getItem("Token")
  const IdSucursal = localStorage.getItem("IdSucursal");
  const IdUsuario = localStorage.getItem("IdUsuario")

  const {URL} = useContext(DataContext)
  const inputRef = useRef(null);



  const [metodoPago, setMetodosPago] = useState([]);
  const [porcentaje, setPorcentaje] = useState([]);
  const [productos, setProductos] = useState([])
  const [clientes, setClientes] = useState([])
  const [Codigo, setCodigo] = useState("")
  const [listaParaVender, setListaParaVender] = useState([])
  const [ultimasVentas, setUltimasVentas] = useState([])
  const [cantidades, setCantidades] = useState(1)
  const [paquetes, setPaquetes] = useState([]);
  const [clienteElegido, setClienteElegido] = useState("Consumidor Final")
  const [IdCliente, setIdCliente] = useState(1)
  const [ventasGuardadas, setVentasGuardadas] = useState([])
  // const [TipoDocumento, setTipoDocument] = useState("")
  const [MontoCambio, setMontoCambio] = useState(0)
  const [MontoTotal, setMontoTotal] = useState(0)
  const [MontoTotalFinal, setMontoTotalFinal] = useState(0)
  const [MontoPago, setMontoPago] = useState(0)
  const [MetodoPago, setMetodoPago] = useState('Efectivo')
  const [TipoEntrega, setTipoEntrega] = useState('Retiro en local')
  const [DireccionSeleccionada, setDireccionSeleccionada] = useState(false);
  const [DireccionEnvio, setDireccionEnvio] = useState(0);
  const [Direcciones, setDirecciones] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const handleOpenAddModal = () => {setShowAddModal(true)
    setShowDireccionModal(false)
  };
  const handleCloseAddModal = () => {setShowAddModal(false)
    handleOpenDireccionModal()
  };

  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const handleOpenDireccionModal = () =>{   
    setShowModalFinalVenta(false)
    traerDirecciones()
    setShowDireccionModal(true);} 
  const handleCloseDireccionModal = () => {setShowDireccionModal(false)
    setShowModalFinalVenta(true)
  };

  const [ventaSeleccionada, setVentaSeleccionada] = useState();
  const [showModalProductos, setShowModalProductos] = useState(false);
  const [showModalPaquetes, setShowModalPaquetes] = useState(false);
  const [showModalVentasDelDia, setShowModalVentasDelDia] = useState(false);
  const [showModalFinalVenta, setShowModalFinalVenta] = useState(false)
  const [showModalClientes, setShowModalClientes] = useState(false)
  const [showModalVentasGuardadas, setShowModalVentasGuardadas] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const handleShowModalProductos= () => setShowModalProductos(true);
  const handleCloseModalProductos = () => setShowModalProductos(false);

  const handleShowModalPaquetes= () => setShowModalPaquetes(true);
  const handleCloseModalPaquetes = () => setShowModalPaquetes(false);


  const handleShowModalVentasDelDia= () => setShowModalVentasDelDia(true);
  const handleCloseModalVentasDelDia = () => setShowModalVentasDelDia(false);

  const handleShowModalFinalVenta = () => setShowModalFinalVenta(true);
  const handleCloseModalFinalVenta = () => {
    setShowModalFinalVenta(false)
    setMetodoPago('Efectivo')
    setPorcentaje(0)
  };

  const handleShowModalClientes = () => setShowModalClientes(true);
  const handleCloseModalClientes = () => setShowModalClientes(false);

  const handleShowModalVentasGuardadas = () => {
    setShowModalVentasGuardadas(true)
  }
 
  ;
  const handleCloseModalVentasGuardadas = () => setShowModalVentasGuardadas(false);

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
const agregarDireccion = (nuevadireccion) => {
  // Verificar que todos los campos necesarios estén completos
  if (!nuevadireccion.Provincia || !nuevadireccion.Ciudad || !nuevadireccion.CodigoPostal || !nuevadireccion.Direccion) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debe llenar todos los campos"
    });
    return Promise.reject("Campos incompletos");
  }
  if (IdCliente==0) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debe seleccionar un cliente"
    });
    return Promise.reject("Campos incompletos");
  }
  return axios.post(`${URL}cliente/registrardireccion?accesstoken=${Token}`, {
    IdCliente,
    Provincia: nuevadireccion.Provincia,
    Ciudad: nuevadireccion.Ciudad,
    CodigoPostal: nuevadireccion.CodigoPostal,
    Direccion: nuevadireccion.Direccion,
    Estado: 1  // El estado por defecto puede ser 1
  })
  .then((response) => {
    const { success, mensaje } = response.data;
    if (success) {
      handleOpenDireccionModal()
      return response.data; // Retornamos los datos de la respuesta si la operación es exitosa
    } else {
      // En caso de que no sea exitoso, retornamos un error
      return Promise.reject(mensaje || "Error al registrar la dirección!");
    }
  })
  .catch((error) => {
    const errorMessage = error.response && error.response.data ? error.response.data.mensaje : error.message;
    // Si hay un error, retornamos una promesa rechazada
    return Promise.reject(errorMessage);
  });
};




const traerClientes = () => {
  axios.get(`${URL}cliente`,{
      params: {
        accesstoken: Token,
        
      },
    }).then((response) => {
      setClientes(response.data)
      
  }).catch((error) => {
      console.log('Error al traer los productos', error)
  })
}



const traerMetodosPago = () => {
  axios.get(`${URL}metodo_pago`,{
      params: {
        accesstoken: Token,
        
      },
    }).then((response) => {
      setMetodosPago(response.data)
      
  }).catch((error) => {
      console.log('Error al traer los productos', error)
  })
}


const traerPaquetes = () => {
  axios.get(`${URL}paquete`, {
    params: { accesstoken: Token },
  }).then((response) => {
    // Parsear DetallesProducto de cada paquete
    const paquetes = response.data.map(paquete => ({
      ...paquete,
      DetallesProducto: JSON.parse(paquete.DetallesProducto)
    }));
    setPaquetes(paquetes);
    setTotalPaquetes(response.data.length)
  }).catch((error) => {
    console.log('Error al traer los productos', error);
  });
};


const traerDirecciones = () => {
      if (IdCliente !== 0) {
          axios.get(`${URL}cliente/obtenerdirecciones`, {
              params: {
                  accesstoken: Token,
                  IdCliente
              },
          })
          .then(response => {
              if (response.data.success) {
                const direcciones = response.data.direcciones;
                  if (direcciones.length > 0) {
                    setDirecciones(direcciones);
                } else {
                  setDirecciones([]);
                }
              } else {
                setDirecciones([]);
              }
          })
          .catch(error => {
              if (error.response) {
                  if (error.response.status === 404) {
                    setDirecciones([]);
                      Swal.fire({
                          icon: "error",
                          title: "Error",
                          text: "Direcciones no encontradas",
                          timer: 1500
                      });
                  } else {
                      console.error('Error en la respuesta:', error.response.data);
                  }
              } else {
                  console.error('Error de red:', error.message);
              }
          });
      }
  };

const guardarVenta = () => {
  if (listaParaVender.length === 0) {
    Swal.fire('Debe tener al menos un producto en la lista!', '', 'warning');
  } else {
    let ventaAGuardar = {
      IdVentaGuardada: ventasGuardadas.length + 1,
      ListaParaVender: listaParaVender,
      Cantidades: cantidades
    };
    
    setVentasGuardadas((prevVentas) => [...prevVentas, { ...ventaAGuardar }]);
    Swal.fire('Venta guardada con éxito!', '', 'success');
    setListaParaVender([]);
    setCantidades([]);
  }
};


const seleccionarVenta = (venta) => {
  setVentaSeleccionada(venta);
  handleShowModalVentasGuardadas(); 
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
      cargarItemParaVender(response.data, 'producto'); 
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



const verVentaGuardada = (venta) => {
  setListaParaVender(venta.ListaParaVender); 
  setCantidades(venta.Cantidades);

  setVentasGuardadas(prevVentas => prevVentas.filter(v => v.IdVentaGuardada !== venta.IdVentaGuardada))

  handleCloseModalVentasGuardadas();
};


const eliminarVentaGuardada = (index) => {
  setVentasGuardadas(prevVentas => {
    return prevVentas.filter((_, i) => i !== index);
  })
  setListaParaVender([])
  setCantidades([])
  handleCloseModalVentasGuardadas()

};

  const cargarItemParaVender = (item, tipo) => {
    const idItem = tipo === 'producto' ? item.IdProducto : `paquete_${item.IdPaquete}`;
    if(tipo === 'producto'){
      if(item.Stock<1){
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No puede vender un producto que no dispone en stock"
      });
      return;
      }
    }
    // Verifica si el ítem ya está en la lista
    setListaParaVender(prevLista => {
      // Revisa si el ítem ya existe en la lista
      const itemExistenteIndex = prevLista.findIndex(
        existingItem => tipo === 'producto'
          ? existingItem.IdProducto === item.IdProducto
          : existingItem.IdPaquete === item.IdPaquete
      );
  
      // Si el ítem ya existe, actualiza la cantidad
      if (itemExistenteIndex !== -1) {
        // Actualiza la cantidad del ítem existente
        const listaActualizada = [...prevLista];
        const itemExistente = listaActualizada[itemExistenteIndex];
        listaActualizada[itemExistenteIndex] = {
          ...itemExistente,
          SubTotal: (cantidades[idItem]+1) * (tipo === 'producto' ? item.PrecioVenta : item.Precio),
          TipoProducto: tipo === 'producto' ? 1: 2
        };
        return listaActualizada;
      } else {
        // Crear un nuevo ítem para la lista
        const nuevoItem = {
          TipoProducto: tipo === 'producto' ? 1 : 2,
          Nombre: item.Nombre,
          Codigo: tipo === 'producto' ? item.Codigo : "PAQUETE",
          PrecioVenta: tipo === 'producto' ? item.PrecioVenta : item.Precio,
          Stock: tipo === 'producto' ? item.Stock : 1000,
          SubTotal: 1 * (tipo === 'producto' ? item.PrecioVenta : item.Precio),
          ...(tipo === 'producto' ? { IdProducto: item.IdProducto } : { IdPaquete: item.IdPaquete })
        };
  
        return [...prevLista, nuevoItem];
      }
    });
    setCantidades(prevCantidades => {
      const cantidadActual = prevCantidades[idItem] || 0;
  
      const nuevaCantidad = tipo === 'producto'
        ? Math.min(cantidadActual + 1, item.Stock)
        : cantidadActual + 1;
  
      return {
        ...prevCantidades,
        [idItem]: nuevaCantidad
      };
    });
  };
 
    
  const FinalizarVenta = async () => {
    if (listaParaVender.length < 1) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No puede realizar una venta sin productos"
        });
        return;
    }

    const ventaData = {
        IdUsuario,
        IdCliente,
        TipoDocumento: "Boleta",
        MontoPago,
        MontoCambio,
        MontoTotal: MontoTotalFinal,
        MetodoPago,
        IdSucursal,
        DetalleVenta: listaParaVender.map(item => ({
            IdProducto: item.TipoProducto === 1 ? item.IdProducto : null,
            IdPaquete: item.TipoProducto === 2 ? item.IdPaquete : null,
            NombreProducto: item.Nombre,
            Cantidad: item.TipoProducto === 1 ? cantidades[item.IdProducto] : cantidades[`paquete_${item.IdPaquete}`],
            PrecioVenta: item.PrecioVenta,
            TipoProducto: item.TipoProducto
        }))
    };

    try {
        const response = await axios.post(`${URL}venta/registrar?accesstoken=${Token}`, ventaData, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const { success, mensaje } = response.data;

        if (success) {
            const NumeroTicket = mensaje.match(/\d+/)[0];
            Swal.fire({
                title: "¡Éxito!",
                text: mensaje,
                icon: "success",
                timer: 2000
            }).then(() => {
                Swal.fire({
                    title: '¿Deseas imprimir el ticket?',
                    showDenyButton: true,
                    confirmButtonText: 'Sí',
                    denyButtonText: 'No',
                }).then((result) => {
                    if (result.isConfirmed) {
                        imprimirTicket(ventaData, NumeroTicket);
                    }
                    limpiarDatos();
                    traerUltimaVentas();
                    traerProductos();
                });
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: mensaje || "Error al registrar la venta!"
            });
        }
    } catch (error) {
        const errorMessage = error.response?.data?.mensaje || error.message;
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error al registrar la venta!",
            footer: "Error: " + errorMessage
        });
    }
};



  
  const EliminarProductoDeLista = (item) => {
    const idItem = item.TipoProducto === 1 ? item.IdProducto.toString() : `paquete_${item.IdPaquete}`;
    setListaParaVender(prevLista => {
      const listaActualizada = prevLista.filter(existingItem => {
        const existingId = existingItem.TipoProducto === 1
          ? existingItem.IdProducto.toString() 
          : `paquete_${existingItem.IdPaquete}`;
        return existingId !== idItem;
      });
      return listaActualizada;
    });
    setCantidades(prevCantidades => {
      const updatedCantidades = { ...prevCantidades };
      delete updatedCantidades[idItem];
      return updatedCantidades;
    });
  };
  
  
  

  const eliminarVenta = (venta) => {
    Swal.fire({
        title: `¿Desea eliminar la venta con el número de documento '${venta.NumeroDocumento}'?`,
        text: "Esta acción no se podrá revertir",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar.",
        cancelButtonText: "Cancelar."
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`${URL}venta/eliminar/${venta.IdVenta}?accesstoken=${Token}`)
                .then((response) => {
                    const { mensaje } = response.data;

                    Swal.fire({
                        title: "¡Eliminado!",
                        text: mensaje || "Venta eliminada con éxito",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                      traerUltimaVentas()
                      traerProductos()
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
  
    setMontoCambio(0)
    setMontoTotal(0)
    setMontoTotalFinal(0)
    setMontoPago(0)
    setMetodoPago('Efectivo')
    setTipoEntrega('Retiro en local')
    setDireccionEnvio({})
    setDireccionSeleccionada(false)
    setIdCliente(1)
    setClienteElegido("Consumidor Final")
    setListaParaVender([])
    setCantidades([])
    handleCloseModalFinalVenta()
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


  const [buscarClientes, setBuscarClientes] = useState("");

  const buscadorClientes = (e) => {
    setBuscarClientes(e.target.value);
  } 
  let resultadoClientes = [];
  if (!buscarClientes) {
    resultadoClientes = clientes;
  } else {
    resultadoClientes = clientes.filter((dato) => {
      const nombreClienteIncluye = dato.NombreCompleto.toLowerCase().includes(buscarClientes.toLowerCase());
      const DocumentoClienteIncluye = dato.Documento.toLowerCase().includes(buscarClientes.toLowerCase());
      return nombreClienteIncluye || DocumentoClienteIncluye;
    });
  }


  const [buscarPaquetes, setBuscarPaquetes] = useState("");

  const buscadorPaquetes = (e) => {
    setBuscarPaquetes(e.target.value);
  } 
  let resultadoPaquetes = [];
  if (!buscarPaquetes) {
    resultadoPaquetes = paquetes;
  } else {
    resultadoPaquetes = paquetes.filter((dato) => {
      const nombreProductoIncluye = dato.Nombre.toLowerCase().includes(buscarPaquetes.toLowerCase());
      return nombreProductoIncluye ;
    });
  }


  
  const calcularTotal = () => {
    let MontoTotal = 0;
    setMontoTotal(0);
  
    if (listaParaVender.length > 0) {
      listaParaVender.forEach((p) => {
        if (p.TipoProducto === 1) {
          MontoTotal += (p.PrecioVenta * cantidades[p.IdProducto]);
        } else {
          MontoTotal += (p.PrecioVenta * cantidades[`paquete_${p.IdPaquete}`]);
        }
      });
  
      setMontoTotal(MontoTotal);
  
      let MontoTotalFinal = MontoTotal;
  console.log(porcentaje)
      if (porcentaje) {
        MontoTotalFinal = MontoTotal + (MontoTotal * (porcentaje / 100));
      }
      setMontoTotalFinal(MontoTotalFinal);
    } else {
      return 0;
    }
  };

  const selectCliente = (val) =>{
    setClienteElegido(val.NombreCompleto)
    setIdCliente(val.IdCliente)
    handleCloseModalClientes()
  }




  useEffect(()=>{
    traerPaquetes()
    traerProductos()
    traerMetodosPago()
    traerClientes()
    
  },[])

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    traerUltimaVentas()
}, [fechaSeleccionada]); 


  const traerUltimaVentas = () =>{
    const formattedDate = formatDate(fechaSeleccionada);

    axios.get(`${URL}reporte/ultimasventas`, {
        params: {
            IdSucursal,         
            Fecha: formattedDate,
            accesstoken: Token 
        }
    })
    .then((response) => {
      const ultimasventas = response.data.map(venta => ({
        ...venta,
        Productos: JSON.parse(venta.Productos)
      }));
      setTotalVentasDelDia(response.data.length)
      setUltimasVentas(ultimasventas);
    })
    .catch((error) => {
        console.log(error);
    });
  }



  useEffect(() => {
    if (showModalProductos && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModalProductos]);


  useEffect(() => {
    calcularTotal()
  }, [listaParaVender, cantidades,MetodoPago]);



  useEffect(() => {
    if (showModalPaquetes && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModalPaquetes]);

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


    //Paginacion para modal ventas del dia
    const ventasDelDiaPorPagina= 10
    const [actualPaginaVentasDelDia ,setActualPaginaVentasDelDia]= useState(1)
    const [totalVentasDelDia, setTotalVentasDelDia] = useState(0)
    const ultimoIndexVentasDelDia = actualPaginaVentasDelDia * ventasDelDiaPorPagina;
    const primerIndexVentasDelDia = ultimoIndexVentasDelDia - ventasDelDiaPorPagina;

    //Paginacion para modal paquetes
    const paquetesPorPaginas= 10
    const [actualPaginaPorPaquete ,setActualPaginaPorPaquete]= useState(1)
    const [totalPaqutes, setTotalPaquetes] = useState(0)
    const ultimoIndexPaquete = actualPaginaPorPaquete * paquetesPorPaginas;
    const primerIndexPauqete = ultimoIndexPaquete - ventasDelDiaPorPagina;
    
    useEffect(() => {
      const manejarKeyDown = (event) => {
        if (event.key === 'F1') {
          event.preventDefault();
          handleShowModalProductos()
        }
        if (event.key === 'F2') {
          event.preventDefault();
          handleShowModalPaquetes();
        }
        if (event.key === 'F8') {
          event.preventDefault();
          handleShowModalVentasDelDia();
        }
        if (event.key === 'F9') {
          event.preventDefault();
          guardarVenta();
        }
       
      };
    document.addEventListener('keydown', manejarKeyDown);
    return () => {
      document.removeEventListener('keydown', manejarKeyDown);
    };
  }, [listaParaVender]);




  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const intervalID = setInterval(() => {
      setTime(new Date());
    }, 1000); 
  
    return () => clearInterval(intervalID);
  }, []);

  const imprimirTicket = (ventaData, NumeroTicket) => {
   console.log(ventaData)
    if (!Array.isArray(productos)) {
      console.error('Error: productos no es un array.');
      return;
    }
    let ticketWindow = window.open('', 'PRINT', 'height=400,width=500');
    ticketWindow.document.write('<html><head><title>FOX SOFTWARE</title>');
    ticketWindow.document.write('<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>');
    ticketWindow.document.write('</head><body style="margin: 0; padding: 0; font-family: monospace;">');
    
    // Agregar el resto del contenido del ticket...
    ticketWindow.document.write(`<div style="text-align: center;">`);
    ticketWindow.document.write('</div>');
    ticketWindow.document.write(`<h2 style="text-align: center; margin-bottom:-12px !important">FOX SOFTWARE</h2>`);
    ticketWindow.document.write('<h4 style="margin-left: 0px; margin-bottom:-12px !important">Direccion: Italia 214</h4>');
    ticketWindow.document.write(`<h4 style="margin-left: 0px; margin-bottom:-12px !important">${formatDate(time)}</h4>`);
    ticketWindow.document.write(`<div style="text-align: center">`);
    ticketWindow.document.write(`<h4 style=" margin-bottom:-5px !important">Ticket Venta #${NumeroTicket}</h4>`);
    ticketWindow.document.write('</div>');

    
    ticketWindow.document.write('<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">');
    ticketWindow.document.write('<thead><tr><th style="padding: 5px; text-align: center;">Producto</th><th style="padding: 5px; text-align: right;">SubTotal</th></tr></thead>');
    ticketWindow.document.write('<tbody>');
    
    ventaData.DetalleVenta.forEach((item) => {
      let nombreItem = item.NombreProducto;
      let cantidadVendida = item.Cantidad || 0;
      let precioItem = item.PrecioVenta || 0;
      
        // Nombre del producto a toda la fila
    ticketWindow.document.write(`<tr><td style="padding: 5px; width: 100%;" colspan="3">${nombreItem}</td></tr>`);
    
    // Cantidad, Precio, Subtotal alineados
    ticketWindow.document.write(`<tr>
      <td style="padding: 5px; text-align: left;">${cantidadVendida} x ${precioItem.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
      <td style="padding: 5px; text-align: right;" colspan="2">${(precioItem * cantidadVendida).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
    </tr>`);
  });
    
    ticketWindow.document.write('</tbody>');
    ticketWindow.document.write('</table>');
    
    ticketWindow.document.write('<hr style="width: 100%; box-sizing: border-box;"/>');
    ticketWindow.document.write('<div style="text-align: center;">');
    ticketWindow.document.write(`<p>Total: ${ventaData.MontoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>`);
    ticketWindow.document.write('</div>');
    ticketWindow.document.write('<hr style="width: 100%; box-sizing: border-box;"/>');
    ticketWindow.document.write('<div style="text-align: center;">');
    ticketWindow.document.write('<h4>www.foxsoftware.com.ar</h4>');
    ticketWindow.document.write('<h7>***No válido como factura***</h7>');
    ticketWindow.document.write('</div>');
    
    
    ticketWindow.document.write('</body></html>');
    ticketWindow.document.close();


    // Esperar a que la ventana se cargue antes de imprimir
    ticketWindow.onload = function() {
   
      ticketWindow.print();
    };
  
  };




  return (
    <div className='body'>
      <div className='h3-ventas'>
      <h2 style={{color:'#000'}}><strong>REGISTRO DE VENTAS</strong></h2>
            <h4 className='naranja'>Registra y administra las ventas de tu negocio</h4> <br /> 

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
            {ventasGuardadas.map((ventas, index) => (
                    <div key={index}>
                      <Button onClick={() => seleccionarVenta(ventas)} className='bgnaranja' style={{ marginRight: "10px" }}>
                        VENTA {index + 1}
                      </Button>
                      
                    </div>
                  ))}
              </div>
            </div>

              <div className="container">
              <div className='contenedorBotones' style={{marginTop: '50px'}}> 
                <Button variant="dark" onClick={handleShowModalProductos}>
                    <Badge badgeContent={listaParaVender.length} color="warning">
                    F1-PRODUCTOS <FontAwesomeIcon icon={faCartShopping} style={{ width: '25px', height: 'auto', marginLeft:'4px' }}/>
                    </Badge>
                </Button>
                <Button variant="dark" onClick={handleShowModalPaquetes}>
                    <Badge color="warning">
                    F2- PROMOS <FontAwesomeIcon icon={faBoxOpen} style={{ width: '25px', height: 'auto', marginLeft:'4px' }}/>
                    </Badge>
                </Button>

                <Button variant="dark" onClick={handleShowModalVentasDelDia}>
                   
                    F8- VENTAS DEL DIA <FontAwesomeIcon icon={faBoxOpen} style={{ width: '25px', height: 'auto', marginLeft:'4px' }}/>
                  
                </Button>
                <Button variant="dark" onClick={guardarVenta}>
                   
                    F9-GUARDAR VENTA <FontAwesomeIcon icon={faFloppyDisk} style={{ width: '20px', height: 'auto', marginLeft:'4px' }}/>
                  
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
                  <th scope="col" >PRECIO</th>
                  <th scope="col">CANTIDAD</th>
                  <th scope="col">ELIMINAR</th>  
                </tr>
              </thead>
              <tbody>
              
    {listaParaVender.map((item, index) => (
     
      <tr key={index}>
        <td>{item.Codigo}</td>
        <td>{item.Nombre}</td>
        <td className='precio'>{item.PrecioVenta.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
        <td>
          <input
            type="number"
            value={cantidades[item.IdProducto] || cantidades[`paquete_${item.IdPaquete}`] || 1} 
            onChange={(e) => setCantidades(prevState => ({
              ...prevState,
              [item.IdProducto || `paquete_${item.IdPaquete}`]: Number(e.target.value) // Usa IdProducto si existe, sino IdPaquete
            }))}
            min="1" // Evita que el usuario ingrese valores menores a 1
            max={item.Stock}
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
                <th>PRECIO</th>
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
                                <td > {producto.PrecioVenta.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                <td>{producto.Stock}</td>
                                <td><button type="button" className="btn bgNaranja" onClick={() =>cargarItemParaVender(producto,'producto')} ><FontAwesomeIcon icon={faCheck} size="lg" style={{color: 'black'}} /> </button></td>
          
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








 {/* MODOL PAQUETES */}

 <Modal
              show={showModalPaquetes} onHide={handleCloseModalPaquetes} 
              size="lg"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                <h4>PROMOS</h4>
                <input  onChange={buscadorPaquetes} ref={inputRef} type="text" placeholder='Busca un paquete...' className='form-control' />  
                </Modal.Title>
              </Modal.Header>
          <Modal.Body>
          <div className='container table-responsive'>
              <Table striped bordered hover className='custom-table table-responsive'>
                  <thead className='custom-table-header'>
                      <tr>
                          <th>NOMBRE</th>
                          <th>PRECIO</th>
                          <th>DESCRIPCION</th>
                          <th>DETALLE</th>
                          <th>AGREGAR</th>
                      </tr>
                  </thead>
                  <tbody>
                      {buscadorPaquetes.length > 0 ? (
                          resultadoPaquetes.slice(primerIndexPauqete, ultimoIndexPaquete).map((item, index) => (
                              <tr key={index}>
                                      <>
                                          <td>{item.Nombre}</td>
                                          <td className='precio'>{item.Precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                          <td >{item.Descripcion}</td>
                                          <td>
                                          <ul style={{ padding: 0, margin: 0, marginLeft:'16px' ,display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                       {item.DetallesProducto && item.DetallesProducto.map((producto) => (
                                            <li key={producto.IdProducto}>  <span style={{ fontWeight: 'bold', color: 'red' }}>{producto.Cantidad}</span> x {producto.NombreProducto}</li>
                                               ))}
                                                     </ul>

                                          </td>
                                          <td><button type="button" className="btn bgNaranja" onClick={() =>cargarItemParaVender(item,'paquete')} ><FontAwesomeIcon icon={faCheck} size="lg" style={{color: 'black'}} /> </button></td>
                                         
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
              <Paginacion 
              productosPorPagina={paquetesPorPaginas} 
              actualPagina={actualPaginaPorPaquete} 
              setActualPagina={setActualPaginaPorPaquete} 
              total={totalPaqutes}
              />
          </div>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={handleCloseModalPaquetes}>
                CERRAR
              </Button>
             
            </Modal.Footer>
          </Modal>




        {/* VENTAS DEL DIA */}
          <Modal show={showModalVentasDelDia} onHide={handleCloseModalVentasDelDia} dialogClassName="custom-modal" >
            <Modal.Header closeButton>
              <Modal.Title>VENTAS DEL DIA</Modal.Title>
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
                <th>NUM DE VENTA</th>
                <th>CANTIDAD VENDIDA</th>
                <th>MONTO TOTAL</th>
                <th>FECHA DE VENTA</th>
                <th>ELIMINAR VENTA</th>
              </tr>
            </thead>
            <tbody>
            
  {ultimasVentas.length > 0 ? (
    ultimasVentas.slice(primerIndexVentasDelDia, ultimoIndexVentasDelDia).map((detalle, index) => (
      <tr key={index}>
        <td>
          {detalle.Productos && Array.isArray(detalle.Productos) && detalle.Productos.map((producto, index) => (
            <li key={index}>{producto.Producto}</li>
          ))}
        </td>
        <td>{detalle.NumeroDocumento}</td>
        <td>
          {detalle.Productos.map((producto, Index) => (
            <p key={Index}>Cantidad: {parseInt(producto.Cantidad)}</p>
          ))}
        </td>
        <td>{detalle.MontoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
        <td>{new Date(detalle.FechaRegistro).toLocaleString()}</td>
        <td>
          <Button className="btn btn-danger" onClick={() => eliminarVenta(detalle)}>
            <FontAwesomeIcon icon={faTrash} size="lg" style={{ color: '#FD6500' }} />
          </Button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6">No hay ventas disponibles.</td>
    </tr>
  )}
</tbody>

 
          </Table>

          <Paginacion 
              productosPorPagina={ventasDelDiaPorPagina} 
              actualPagina={actualPaginaVentasDelDia} 
              setActualPagina={setActualPaginaVentasDelDia} 
              total={totalVentasDelDia}
          />
          </div>
          

         
          
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={handleCloseModalVentasDelDia}>
                CERRAR
              </Button>
             
            </Modal.Footer>
          </Modal>


          <Modal show={showModalFinalVenta} onHide={handleCloseModalFinalVenta}>
            <Modal.Header closeButton>
              <Modal.Title>VER DETALLE VENTA</Modal.Title>
            </Modal.Header>

    
            <Modal.Body>
            <h3><b>TOTAL: ${MontoTotal} </b></h3>
            <h3><b>TOTAL FINAL: ${MontoTotalFinal} </b></h3>
          <label>Abona con:</label>
          <MDBInputGroup className='mb-3' >
          <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faCashRegister} size="lg" style={{color: '#FD6500'}} />
            </span>
              <input type="number" placeholder='$ 0.00' value={MontoPago} className='form-control inputss' onChange={(e) => {
                  setMontoPago(e.target.value); 
                  setMontoCambio(e.target.value - MontoTotal); 
                }} />
           </MDBInputGroup>
          <label ><strong>Cambio: ${MontoCambio}</strong></label>
          <br /> <br /> 
          <label> Metodo de Pago:</label>
          <MDBInputGroup className='mb-3' >
          <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faDollar} size="lg" style={{color: '#FD6500'}} />
            </span>
          <select id="metodoPago" className='form-select inputss'   onChange={(e) => {
    const metodoSeleccionado = metodoPago.find(metodo => metodo.Descripcion === e.target.value);
    setMetodoPago(e.target.value);
    if (metodoSeleccionado) {
      setPorcentaje(metodoSeleccionado.Porcentaje);
    }
  }}
>
             {metodoPago.map(metodo => (
              <option  key={metodo.IdMetodoPago} value={metodo.Descripcion}>{metodo.Descripcion}</option>
            ))} 
          </select>  
          </MDBInputGroup>    
          <br /> 

          <label>Cliente:</label>
          <MDBInputGroup className='mb-3' >
        <span className="input-group-text inputss">
          <FontAwesomeIcon icon={faAddressCard} size="lg" style={{color: '#FD6500'}} />
        </span>
          <input  className='form-control inputss' type='text' placeholder="Cliente" readOnly value={clienteElegido} />

          <Button className='bgnaranja' onClick={handleShowModalClientes}>
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#fff'}} />
        </Button>
        </MDBInputGroup>
     <br />
     <label>Tipo de entrega:</label>
        <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss   ">
      <FontAwesomeIcon icon={faDollyBox} size="lg" style={{color: '#FD6500'}} />
    </span>
    <select aria-label="Estado" className="form-select inputss"  id='estado' value={TipoEntrega} onChange={(e)=>setTipoEntrega(e.target.value)}>   
                    <option value="Retiro en local">Retiro en local</option>
                    <option value="Envio">Envio</option>
    </select>
    </MDBInputGroup>
          
    <br />

    {TipoEntrega =='Envio' && <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Button onClick={handleOpenDireccionModal}>
          <FontAwesomeIcon icon={faTruckFast} size="lg" style={{color: '#fff'}} /> Seleccionar direccion
        </Button>
        </div>
    </>

    }
    <br />
    {DireccionSeleccionada && TipoEntrega == 'Envio' ? (
      <>

<div className="card horizontal-card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="card-icon">
                <FontAwesomeIcon icon={faMapMarkedAlt} size="2x" style={{ color: "#007bff" }} />
              </div>
              <div className="card-info ms-3">
                <h5 className="card-title">{DireccionEnvio.Direccion}</h5>
                <p className="card-text mb-1">
                  <strong>Provincia:</strong> {DireccionEnvio.Provincia}
                </p>
                <p className="card-text mb-1">
                  <strong>Ciudad:</strong> {DireccionEnvio.Ciudad}
                </p>
                <p className="card-text">
                  <strong>Código Postal:</strong> {DireccionEnvio.CodigoPostal}
                </p>
              </div>
            </div>
          </div>
  </>
  ) : null}
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      
  {(TipoEntrega === 'Envio' && DireccionSeleccionada) || TipoEntrega !== 'Envio' ? (
      <>
    <Button 
      className="btn btn-danger m-2 bgnaranja" 
      style={{ width: '400px', marginTop: '6px' }}  
      onClick={FinalizarVenta}
    >
      FINALIZAR VENTA
    </Button></>
  ) : null}
</div>
       



            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={handleCloseModalFinalVenta}>
                CERRAR
              </Button>
            </Modal.Footer>
          </Modal>




  


          {/* MODAL PARA CLIENTES  */}
          <Modal size='lg'  show={showModalClientes} onHide={handleCloseModalClientes} animation={false}>
        <Modal.Header closeVariant='white' closeButton >
          <Modal.Title>CLIENTES</Modal.Title>
        </Modal.Header>
        <Modal.Body>

         <MDBInputGroup >
              <span className="input-group-text">
              <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
              </span>
              <input value={buscarClientes} onChange={buscadorClientes} type="text" placeholder='Busca un cliente...' className='form-control'/>
          </MDBInputGroup>
         <div className='table-responsive'>
          <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
              <thead className='custom-table-header'>
                  <tr>
                      <th>DNI</th>
                      <th>NOMBRE COMPLETO</th>
                      <th>TELEFONO</th>
                      <th>SELECCIONAR</th>
                 
                  </tr>
              </thead>
              <tbody>
                  {
                      resultadoClientes.map((val) => (
                        
                          <tr key={val.IdCliente}>
                            {val.Estado === 1 ?
                             <>
                              <td>{val.Documento}</td>
                              <td>{val.NombreCompleto}</td>       
                              <td>{val.Telefono}</td>           
                              <td>
                              <Button className='bgnaranja'  onClick={()=> selectCliente(val)}>
                                <FontAwesomeIcon icon={faCheck} size="lg" style={{ color: '#fff' }} />
                              </Button>
                              </td>
                             </>
                             :
                             <td>CLIENTE INACTIVO</td>
                          }
                                     
                          </tr>
                      ))
                  }
              </tbody>
          </table> 
          </div>
        </Modal.Body>
        <Modal.Footer >
          <Button variant='danger' onClick={handleCloseModalClientes}>CERRAR</Button>
        </Modal.Footer>
      </Modal>




                {/* MODAL PARA VENTAS GUARDADAS  */}
                <Modal size='lg'  show={showModalVentasGuardadas} onHide={handleCloseModalVentasGuardadas} animation={false}>
        <Modal.Header closeVariant='white' closeButton >
          <Modal.Title>VENTAS GUARDADAS</Modal.Title>
        </Modal.Header>
        <Modal.Body> 
         <div className='table-responsive'>
          <table  className='table table-striped table-hover mt-5 shadow-lg custom-table'>
              <thead className='custom-table-header'>
                  <tr>
                      <th>CODIGO</th>
                      <th>PRODUCTO</th>
                      <th>CANTIDAD</th>
                      <th>PRECIO</th>
                  </tr>
              </thead>
              <tbody>
  {ventaSeleccionada?.ListaParaVender.map((producto, indexProducto) => {
    // Determinar el idItem basado en el tipo de producto
    let idItem = producto.TipoProducto === 1 ? producto.IdProducto : `paquete_${producto.IdPaquete}`;

    return (
      <tr key={indexProducto}>
        <td>{producto.Codigo}</td>
        <td>{producto.Nombre}</td>
        <td>
          {ventaSeleccionada.Cantidades[idItem] || 1}
        </td>
        <td>
           {producto.PrecioVenta.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
        </td>
      </tr>
    );
  })}
</tbody>
          </table> 
          </div>


          <div className="d-flex justify-content-between mt-3">
            <Button variant='danger' onClick={() => eliminarVentaGuardada(ventasGuardadas.indexOf(ventaSeleccionada))}>
            <FontAwesomeIcon icon={faTrash} size="lg" style={{ color: '#fff' }} /> Eliminar Venta
            </Button>
            
 
            <Button className='bgnaranja' onClick={() => verVentaGuardada(ventaSeleccionada)}>
              <FontAwesomeIcon icon={faCheck} size="lg" style={{ color: '#fff' }} /> Cargar Venta
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer >
          <Button variant='danger' onClick={handleCloseModalVentasGuardadas}>CERRAR</Button>
        </Modal.Footer>
      </Modal>            


      <Modal size="lg" show={showDireccionModal} onHide={handleCloseDireccionModal} animation={false}>
  <Modal.Header closeVariant="white" closeButton>
    <Modal.Title>Seleccionar Dirección</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="d-flex flex-column align-items-center gap-4">
      {Direcciones.length > 0 ? (
        Direcciones.map((direccion, index) => (
          <div
            key={index}
            className="card horizontal-card shadow-sm"
            onClick={() => {setDireccionSeleccionada(true)
              
              handleCloseDireccionModal()
              setDireccionEnvio(direccion)
            }}
          >
            <div className="card-body d-flex align-items-center">
              <div className="card-icon">
                <FontAwesomeIcon icon={faMapMarkedAlt} size="2x" style={{ color: "#007bff" }} />
              </div>
              <div className="card-info ms-3">
                <h5 className="card-title">{direccion.Direccion}</h5>
                <p className="card-text mb-1">
                  <strong>Provincia:</strong> {direccion.Provincia}
                </p>
                <p className="card-text mb-1">
                  <strong>Ciudad:</strong> {direccion.Ciudad}
                </p>
                <p className="card-text">
                  <strong>Código Postal:</strong> {direccion.CodigoPostal}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">No hay direcciones disponibles.</p>
      )}
    </div>
    <div className="mt-4 text-center">
      <Button variant="primary" onClick={handleOpenAddModal}>
        Agregar Nueva Dirección
      </Button>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="danger" onClick={handleCloseDireccionModal}>
      Cerrar
    </Button>
  </Modal.Footer>
</Modal>


      {/* Modal para agregar nueva dirección */}
      <Modal size="md" show={showAddModal} onHide={handleCloseAddModal} animation={false}>
  <Modal.Header closeVariant="white" closeButton>
    <Modal.Title>Agregar Dirección</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const nuevaDireccion = {
          Provincia: e.target.Provincia.value,
          Ciudad: e.target.Ciudad.value,
          CodigoPostal: e.target.CodigoPostal.value,
          Direccion: e.target.Direccion.value,
        };

        try {
          await agregarDireccion(nuevaDireccion);
          handleCloseAddModal();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error || "Error al registrar la dirección!",
          });
        }
      }}
    >
      <div className="mb-3">
        <label>Provincia</label>
        <input className="form-control" name="Provincia" required />
      </div>
      <div className="mb-3">
        <label>Ciudad</label>
        <input className="form-control" name="Ciudad" required />
      </div>
      <div className="mb-3">
        <label>Código Postal</label>
        <input className="form-control" name="CodigoPostal" required />
      </div>
      <div className="mb-3">
        <label>Dirección</label>
        <input className="form-control" name="Direccion" required />
      </div>
      <Button type="submit" variant="success">
        Guardar
      </Button>
    </form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="danger" onClick={handleCloseAddModal}>
      Cerrar
    </Button>
  </Modal.Footer>
</Modal>







          <div className='col'><Button  className='gradient-button2' style={{width: '190px', marginTop:'10px', color: '#fff'}} onClick={handleShowModalFinalVenta} >F12-COBRAR</Button></div>

    </div>
  )
}
export default MainRegistrarVenta

