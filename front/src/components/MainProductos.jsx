
import  { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Modal,Button, Form,ButtonGroup } from 'react-bootstrap';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faAnglesDown, faAnglesUp, faDollar, faDollyBox, faFileExcel, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { faScaleBalanced } from '@fortawesome/free-solid-svg-icons';
import { faTags } from '@fortawesome/free-solid-svg-icons';
import { faShop } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../context/DataContext.jsx';
import { faBarcode } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2'
import Paginacion from '../components/Paginacion';
import * as XLSX from 'xlsx';

const MainProductos = () => {

  const [nombre_producto, setNombre_Producto] = useState('');
  const [descripcion_producto, setDescripcion_Producto] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [Id_producto, setId_Producto] = useState(0);
  const [precioVenta, setPrecioVenta] = useState('');
  const [Id_categoria, setId_categoria] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [productosCargados, setProductosCargados] = useState([]);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [producto,  setProducto] = useState([]);
  const [codProducto, setCodProducto] = useState("")
  const [stock, setStock] = useState("")
  const [editar, setEditar] = useState(true)
  const [suc, setSuc] = useState([])
  const [showModalSubirPrecios, setShowModalSubirPrecios] = useState(false);
  const [showModalBajarPrecios, setShowModalBajarPrecios] = useState(false);
  const [showModalCargaMasiva, setShowModalCargaMasiva] = useState(false);
  const [porcentaje, setPorcentaje] = useState(0);
  const {  URL } = useContext(DataContext);
 
  const Token = localStorage.getItem("Token");
  const IdSucursal = localStorage.getItem("IdSucursal");

  const [idSucursal, setIdSucursal] = useState(IdSucursal)

  const handleShowModalSubirPrecios = () => setShowModalSubirPrecios(true);
  const handleCloseModalSubirPrecios = () => setShowModalSubirPrecios(false);

  const handleShowModalBajarPrecios = () => setShowModalBajarPrecios(true);
  const handleCloseModalBajarPrecios = () => setShowModalBajarPrecios(false);
  const handleShowModalCargaMasiva = () => setShowModalCargaMasiva(true);
  const handleCloseModalCargaMasiva = () =>{ setShowModalCargaMasiva(false);
                                            limpiarDatos();
                                            TraerProductos;
  }



  const crearProductos = () => {
    if (codProducto.length === 0 || nombre_producto.length === 0 || descripcion_producto.length === 0 || precioCompra.length === 0 || precioVenta.length === 0 || stock.length === 0 || Id_categoria === 0) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debe llenar todos los campos"
        });
        return;
    }

    axios.post(`${URL}producto/registrar?accesstoken=${Token}`, {
        Codigo: codProducto,
        Nombre: nombre_producto,
        Descripcion: descripcion_producto,
        PrecioCompra: parseFloat(precioCompra),
        PrecioVenta: parseFloat(precioVenta),
        Stock: stock,
        IdCategoria: Id_categoria,
        IdSucursal: IdSucursal,
        Estado: 1
    })
    .then((response) => {
        const { success, mensaje } = response.data;
        if (success) {
            Swal.fire({
                title: "¡Éxito!",
                text: mensaje || "Producto registrado con éxito!",
                icon: "success",
                timer: 2000
            });
            TraerProductos();
            limpiarDatos();
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: mensaje || "Error al registrar el producto!"
            });
            limpiarDatos();
        }
    })
    .catch((error) => {
        const errorMessage = error.response && error.response.data ? error.response.data.mensaje : error.message;
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error al registrar el producto!",
            footer: "Error: " + errorMessage
        });
    });
};

        const TraerProductos = () => {
            axios.get(`${URL}producto`,{
                params: {
                    IdSucursal:idSucursal,
                  accesstoken: Token,
                  
                },
              }).then((response) => {
                setProducto(response.data)
                setTotal(response.data.length);
                
            }).catch((error) => {
                console.log('Error al traer los productos', error)
            })
        }

       
        const subirMasivamente = () => {
            const CantidadProductosEnCategoria = producto.filter(prod => prod.IdCategoria === parseInt(Id_categoria)).length;
            if (Id_categoria === 0) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Debe seleccionar una categoria"
                });
                return;
            }
            if (porcentaje === 0|| !porcentaje) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Debe cargar un porcentaje"
                });
                return;
            }
    Swal.fire({
        title: `¿Desea subir los precios de la categoría ${nombreCategoria} en un ${porcentaje}%?`,
        text: `Esta acción modificará los precios de ${CantidadProductosEnCategoria} productos.` ,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, subir precios.",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post(`${URL}producto/subirprecios?accesstoken=${Token}`, {
                idCategoria:Id_categoria,
                porcentaje
            })
            .then(response => {
                const { mensaje } = response.data;

                Swal.fire({
                    title: `¡Precios de ${CantidadProductosEnCategoria} productos actualizados de la categoria ${nombreCategoria}!`,
                    text: mensaje || "Los precios se han actualizado con éxito",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    handleCloseModalSubirPrecios(); 
                    TraerProductos();
                    limpiarDatos();
                });
            })
            .catch(error => {
                const errorMessage = error.response?.data?.mensaje || error.message;
                
                Swal.fire({
                    icon: "error",
                    title: "Error del servidor",
                    text: "No se pudo actualizar los precios. Intente nuevamente más tarde.",
                    footer: "Error: " + errorMessage
                });
            });
        }
        else{
            limpiarDatos();
        }
    });
          }
            const bajarMasivamente = () => {
            const CantidadProductosEnCategoria = producto.filter(prod => prod.IdCategoria === parseInt(Id_categoria)).length;
            if (Id_categoria === 0) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Debe seleccionar una categoria"
                });
                return;
            }
            if (porcentaje === 0|| !porcentaje) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Debe cargar un porcentaje"
                });
                return;
            }
    Swal.fire({
        title: `¿Desea bajar los precios de la categoría ${nombreCategoria} en un ${porcentaje}%?`,
        text: `Esta acción modificará los precios de ${CantidadProductosEnCategoria} productos.` ,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, bajar precios.",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post(`${URL}producto/bajarprecios?accesstoken=${Token}`, {
                idCategoria:Id_categoria,
                porcentaje
            })
            .then(response => {
                const { mensaje } = response.data;

                Swal.fire({
                    title: `¡Precios de ${CantidadProductosEnCategoria} productos actualizados de la categoria ${nombreCategoria}!`,
                    text: mensaje || "Los precios se han actualizado con éxito",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    handleCloseModalBajarPrecios(); 
                    TraerProductos();
                    limpiarDatos();
                });
            })
            .catch(error => {
                const errorMessage = error.response?.data?.mensaje || error.message;
                
                Swal.fire({
                    icon: "error",
                    title: "Error del servidor",
                    text: "No se pudo actualizar los precios. Intente nuevamente más tarde.",
                    footer: "Error: " + errorMessage
                });
            });
        }
        else{
            limpiarDatos();
        }
    });
          }


        

    const verCategorias = () => {
        axios.get(`${URL}categoria?accesstoken=${Token}`)
            .then((response) => {
                setCategorias(response.data);
            })
            .catch((error) => {
                console.log('Error al obtener las categorías:', error);
            });
    };


    const Eliminar = (val) => {
        Swal.fire({
            title: `¿Desea eliminar el producto '${val.Nombre}'?`,
            text: "Esta acción no se podrá revertir",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar.",
            cancelButtonText: "Cancelar."
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`${URL}producto/eliminar/${val.IdProducto}?accesstoken=${Token}`)
                    .then((response) => {
                        const { mensaje } = response.data;
    
                        Swal.fire({
                            title: "¡Eliminado!",
                            text: mensaje || "Producto eliminado con éxito",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            TraerProductos();
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
    
    const editarProducto = () => {
        if (codProducto.length === 0 || nombre_producto.length === 0 || descripcion_producto.length === 0 || precioCompra.length === 0 || precioVenta.length === 0 || stock.length === 0 || Id_categoria === 0) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Debe llenar todos los campos"
            });
            return;
        }
    
        axios.put(`${URL}producto/editar?accesstoken=${Token}`, {
            IdProducto: Id_producto,
            Nombre: nombre_producto,
            Codigo: codProducto,
            Descripcion: descripcion_producto,
            PrecioCompra: parseFloat(precioCompra),
            PrecioVenta: parseFloat(precioVenta),
            Cantidad: stock,
            IdSucursal: IdSucursal,
            IdCategoria: Id_categoria,
            Estado:1
        })
        .then((response) => {
            if (response.status === 200) {
                Swal.fire({
                    title: "¡Éxito!",
                    text: response.data.mensaje || "Producto editado con éxito!",
                    icon: "success",
                    timer: 2000
                });
                TraerProductos();
                limpiarDatos()
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: 'Hubo un problema al editar el producto.'
                });
                console.log('Respuesta inesperada:', response);
            }
        })
        .catch((error) => {
            let errorMessage = 'Error al editar el producto!';
            if (error.response) {
                errorMessage = error.response.data.mensaje || errorMessage;
                console.log('Error de respuesta:', error.response.data);
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor.';
                console.log('Error de solicitud:', error.request);
            } else {
                errorMessage = 'Error al configurar la solicitud.';
                console.log('Error de configuración:', errorMessage);
            }
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error al editar el producto!",
                footer: error.response ? `Error: ${error.response.data.mensaje}` : undefined
            });
        });
    };
    

      
      const traerSucursales = () =>{
        axios.get(`${URL}sucursal?accesstoken=${Token}`).then((response)=>{
            setSuc(response.data)
        }).catch((error)=>{
            console.log('Error al obtener las sucursales', error)
        })
      }

    const seeProductos = (val) =>{
        setEditar(false)
        setId_Producto(val.IdProducto)
        setNombre_Producto(val.Nombre)
        setDescripcion_Producto(val.Descripcion)
        setPrecioCompra(val.PrecioCompra)
        setPrecioVenta(val.PrecioVenta)
        setStock(val.Stock)
        setId_categoria(val.IdCategoria)
        setCodProducto(val.Codigo)
    }

    useEffect(() => {
        verCategorias();
        traerSucursales()
    }, [URL]); 

    useEffect(() => {
        TraerProductos()
    }, [idSucursal]); 

    const [buscar, setBuscar] = useState('');

    const buscador = (e) => {
        setBuscar(e.target.value);
    }

    let resultado = [];
    if (!buscar) {
        resultado = producto;
    } else {
        resultado = producto.filter((dato) => {
            const nombreProductoIncluye = dato.Nombre.toLowerCase().includes(buscar.toLowerCase());
            const codProductoIncluye = dato.Codigo && dato.Codigo.toString().includes(buscar.toLowerCase());
            return nombreProductoIncluye || codProductoIncluye;
        });
    }




    // CARGA MASIVA DE PRODUCTOSS
    const descargarPlantilla = () => {
        const url = '/PlantillaProductos.xlsx';
        window.location.href = url;
      };

      const handleFileUpload = (e) => {
        const file = e.target.files[0];
        
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName]; 
      const productos = XLSX.utils.sheet_to_json(worksheet);

            if (!productos || productos.length === 0) {
              Swal.fire({
                title: 'Error',
                text: 'El archivo está vacío o no contiene datos en la hoja "Productos".',
                icon: 'error',
              });
              return;
            }
      
            const requiredColumns = ['Codigo', 'Producto', 'Descripcion', 'Precio Compra', 'Precio Venta', 'Stock'];
            const fileColumns = Object.keys(productos[0]); 
      
            const isValidFile = requiredColumns.every(col => fileColumns.includes(col));
      
            if (!isValidFile) {
              Swal.fire({
                title: 'Error',
                text: 'El archivo no tiene el formato correcto. Por favor asegúrate de que las columnas sean: Codigo, Producto, Descripcion, Precio Compra, Precio Venta, Stock.',
                icon: 'error',
              });
              return;
            }
      
            const productosConDatosCompletos = productos.map((producto) => ({
              Codigo: producto.Codigo,
              Nombre: producto.Producto,
              Descripcion: producto.Descripcion,
              PrecioCompra: producto['Precio Compra'],
              PrecioVenta: producto['Precio Venta'],
              Stock: producto.Stock
            }));
            setProductosCargados(productosConDatosCompletos);
          };
          reader.readAsBinaryString(file);
        }
      };
      
      const cargarMasivamente = () => {
        if (Id_categoria === 0) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debe seleccionar una categoría.",
          });
          return;
        }
      
        if (productosCargados.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se han cargado productos. Verifique el archivo cargado.",
          });
          return;
        }
      
        axios
          .post(`${URL}producto/cargarmasivamente?accesstoken=${Token}`, {
            IdCategoria: Id_categoria,
            IdSucursal,
            productos: productosCargados,
          })
          .then((response) => {
            const { mensaje } = response.data;
            Swal.fire({
              title: "¡Éxito!",
              text: mensaje || `Se han cargado ${productosCargados.length} productos.`,
              icon: "success",
            });
            handleCloseModalCargaMasiva();
          })
          .catch((error) => {
            const errorMessage = error.response
              ? error.response.data?.mensaje || error.message
              : "Error de red o servidor.";
            
            Swal.fire({
              title: "Error",
              text: "Hubo un error al procesar los productos. Intente nuevamente más tarde.",
              icon: "error",
              footer: `Detalles del error: ${errorMessage}`,
            });
          });
      };
      
    const limpiarDatos = () => {
        setCodProducto("")
        setNombre_Producto("")
        setDescripcion_Producto("")
        setPrecioCompra('')
        setPrecioVenta('')
        setStock(0)
        setId_categoria(0)
        setNombreCategoria("")
        setPorcentaje(0)
        setProductosCargados([])
    
      } 
    //PAGINACION NUEVA
    const productosPorPagina = 10
    const [actualPagina, setActualPagina] = useState(1)
    const [total, setTotal] = useState(0)
    const ultimoIndex = actualPagina * productosPorPagina;
    const primerIndex = ultimoIndex - productosPorPagina;

    const exportToExcel = () => {
        if (producto.length === 0) {
           Swal.fire({
              title: "Error",
              text: "No hay datos para exportar.",
              icon: "error",
            });
            return;
        }
        const ws = XLSX.utils.json_to_sheet(
            producto.map(item => ({
                "Codigo": item.Codigo,
                "Nombre": item.Nombre,
                "Descripcion": item.Descripcion,
                "Categoría": item.DescripcionCategoria,
                "Stock": item.Stock,
                "Precio Compra": item.PrecioCompra,
                "Precio Venta": item.PrecioVenta
            }))
        );
    
        const wsCols = [
            { wch: 15 }, 
            { wch: 25 },  
            { wch: 30 }, 
            { wch: 20 },  
            { wch: 10 },
            { wch: 10 },
            { wch: 10 }
        ];
    
        ws['!cols'] = wsCols;
    
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lista de Productos");
    
        XLSX.writeFile(wb, `ReporteProducto_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

  return (
       <>
            <h2 style={{color:'#000'}}><strong>GESTION PRODUCTOS</strong></h2>
            <h4 className='naranja'>Gestiona todos los productos de tu negocio</h4> <br /> 

          

            <div className="container">
                <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faBarcode} size="lg" style={{color: '#FD6500'}} />
                    </span>
                    <input type="text" className="form-control inputss" value={codProducto} onChange={(e) => setCodProducto(e.target.value)} placeholder="Escanea el codigo de barras"  />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faClipboard} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="text" placeholder="Nombre" value={nombre_producto} onChange={(e) => setNombre_Producto(e.target.value)} />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faClipboard} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="text" placeholder="Descripcion" value={descripcion_producto} onChange={(e) => setDescripcion_Producto(e.target.value)} />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faDollar} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="number" placeholder="Precio costo" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faDollar} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="number" placeholder="Precio venta" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faScaleBalanced} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="number" placeholder="Cantidad" value={stock} onChange={(e) => setStock(e.target.value)} />
                </MDBInputGroup>

                <MDBInputGroup>
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faTags} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <Form.Select key={Id_categoria} className="inputss" aria-label="Nombre Categoria" id="categoria" value={Id_categoria} onChange={(e)=> setId_categoria(e.target.value)}>
                        <option key={0} value="0" disabled >--Seleccione una categoria--</option>
                        {categorias.map((cat) => (     
                            <option key={cat.IdCategoria} value={cat.IdCategoria}>{cat.Descripcion}</option>
                        ))}
                    </Form.Select>
                </MDBInputGroup>
                {editar ?  
                <> 
                 <br />
                <div className="row">
                    <div className="col">
                        <Button style={{color:'white'}} className="btn btn-danger m-2 bgnaranja" onClick={crearProductos}>
                            <FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> GUARDAR PRODUCTO
                        </Button>
                    </div>
                </div>
                </> :
                  <div className="row">
                        <div className="col">
                            <Button  style={{color:'white'}} className="btn btn-danger m-2 bgnaranja" onClick={editarProducto}>
                                <FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> EDITAR PRODUCTO
                            </Button>
                        </div>
                </div>
            }
               
              
            </div>
            <br />
 
           
            <div className="container">
    <div className="control-masivo-container">
        <h3 className="control-masivo-title">Control Masivo de Productos</h3>
        <p className="control-masivo-subtitle">Realiza operaciones masivas en tus productos con un solo clic</p>
        <div className='contenedorBotonesss'>
            <Button variant="dark" onClick={handleShowModalCargaMasiva}>
                CARGAR PRODUCTOS <FontAwesomeIcon icon={faDollyBox} style={{ width: '25px', height: 'auto', marginLeft: '8px' }} />
            </Button>
            <Button variant="dark" onClick={handleShowModalSubirPrecios}>
                SUBIR PRECIOS <FontAwesomeIcon icon={faAnglesUp} style={{ width: '25px', height: 'auto', marginLeft: '8px' }} />
            </Button>
            <Button variant="dark" onClick={handleShowModalBajarPrecios}>
                BAJAR PRECIOS <FontAwesomeIcon icon={faAnglesDown} style={{ width: '25px', height: 'auto', marginLeft: '8px' }} />
            </Button>
        </div>
    </div>
</div>


              <br /><br />
            <div className='container'>
            <MDBInputGroup >
            <span className="input-group-text inputss">
                <FontAwesomeIcon icon={faShop} size="lg" style={{color: '#FD6500'}} />
             </span>
            <Form.Select  aria-label="Sucursal" className="inputss" id="sucursal" value={idSucursal} onChange={(e)=> setIdSucursal(e.target.value)}>
                        <option key={0} value="0" disabled >--Seleccione una sucursal--</option>
                        {suc.map((s) => (     
                        <option key={s.IdSucursal} value={s.IdSucursal}>{s.Nombre}</option>
                        ))}
            </Form.Select>
            </MDBInputGroup>
            </div>
            <br />

            <div className='container'>
            <MDBInputGroup >
                <span className="input-group-text inputss">
                <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{color: '#FD6500'}} />
                </span>
                <input value={buscar} onChange={buscador} type="text" placeholder='Busca un producto...' className='form-control inputss '/>
           
            </MDBInputGroup>
            </div>

            <div className="container table-responsive">
                <table className="table table-striped table-hover mt-5 shadow-lg">
                    <thead className='custom-table-header'>
                        <tr>
                            <th>COD PRODUCTO</th>
                            <th>NOMBRE</th>
                            <th>DESCRIPCION</th>
                            <th>PRECIO COSTO</th>
                            <th>PRECIO VENTA</th>
                            <th>CANTIDAD</th>
                            <th>CATEGORIA</th>
                            <th>GANANCIA</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultado.slice(primerIndex, ultimoIndex).map((val) => (
                            <tr key={val.IdProducto}>        
                                <td>{val.Codigo}</td>
                                <td>{val.Nombre}</td>
                                <td>{val.Descripcion}</td>
                                <td>{val.PrecioCompra}</td>
                                <td>{val.PrecioVenta}</td>
                                <td>{val.Stock}</td>
                                <td>{val.DescripcionCategoria}</td>                          
                                <td>${parseFloat(val.PrecioVenta - val.PrecioCompra).toFixed(2)}</td>
                                <td>{val.Estado===1?"Activo":"No Activo"}</td>
                                <td>
                                <ButtonGroup aria-label="Basic example">
                                    <Button onClick={()=>{seeProductos(val)}} className='bgnaranja' style={{marginRight:"10px"}}><FontAwesomeIcon  icon={faPencil} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button>
                                    <Button onClick={()=>{Eliminar(val)}} className='bgnaranja'style={{marginRight:"10px"}}><FontAwesomeIcon icon={faTrash} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> 
                                </ButtonGroup>
                                </td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{display:'flex',justifyContent:'center'}}>
                <Paginacion 
                    productosPorPagina={productosPorPagina} 
                    actualPagina={actualPagina} 
                    setActualPagina={setActualPagina} 
                    total={total}
                  />
                </div>
            </div>
         
            <button onClick={exportToExcel} style={{margin:'10px'}} className='btn btn-secondary'>Exportar a Excel</button>

             {/* Modal para Subir Precios */}
      <Modal
        show={showModalSubirPrecios}
        onHide={handleCloseModalSubirPrecios}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Subir Precios</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Label>Categoria</Form.Label>
            <MDBInputGroup className="mb-3">
                
              <span className="input-group-text ">
                <FontAwesomeIcon icon={faTags} size="lg" style={{ color: '#FD6500' }} />
              </span>
              <Form.Select 
    key={Id_categoria} 
    aria-label="Nombre Categoria" 
    id="categoria" 
    value={Id_categoria} 
    onChange={(e) => {
        const selectedCategoria = categorias.find(cat => cat.IdCategoria === parseInt(e.target.value));
        setId_categoria(e.target.value);
        setNombreCategoria(selectedCategoria ? selectedCategoria.Descripcion : '');
    }}>
    <option key={0} value="0" disabled >--Seleccione una categoria--</option>
    {categorias.map((cat) => (     
        <option key={cat.IdCategoria} value={cat.IdCategoria}>{cat.Descripcion}</option>
    ))}
</Form.Select>
            </MDBInputGroup>
            <Form.Group controlId="porcentaje">
              <Form.Label>Porcentaje a Subir</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese el porcentaje"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModalSubirPrecios}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={subirMasivamente}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>

       {/* Modal para Bajar Precios */}
       <Modal
        show={showModalBajarPrecios}
        onHide={handleCloseModalBajarPrecios}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Bajar Precios</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Label>Categoria</Form.Label>
            <MDBInputGroup className="mb-3">
                
              <span className="input-group-text ">
                <FontAwesomeIcon icon={faTags} size="lg" style={{ color: '#FD6500' }} />
              </span>
              <Form.Select 
    key={Id_categoria} 
    aria-label="Nombre Categoria" 
    id="categoria" 
    value={Id_categoria} 
    onChange={(e) => {
        const selectedCategoria = categorias.find(cat => cat.IdCategoria === parseInt(e.target.value));
        setId_categoria(e.target.value);
        setNombreCategoria(selectedCategoria ? selectedCategoria.Descripcion : '');
    }}>
    <option key={0} value="0" disabled >--Seleccione una categoria--</option>
    {categorias.map((cat) => (     
        <option key={cat.IdCategoria} value={cat.IdCategoria}>{cat.Descripcion}</option>
    ))}
</Form.Select>
            </MDBInputGroup>
            <Form.Group controlId="porcentaje">
              <Form.Label>Porcentaje a Bajar</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese el porcentaje"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModalBajarPrecios}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={bajarMasivamente}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>





  {/* MODAL CARGA MAASIVA */}

  <Modal
  show={showModalCargaMasiva}
  onHide={handleCloseModalCargaMasiva}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Carga Masiva de Productos</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      {/* Select de categoría */}
      <Form.Label>Categoría</Form.Label>
      <MDBInputGroup className="mb-3">
        <span className="input-group-text ">
          <FontAwesomeIcon icon={faTags} size="lg" style={{ color: '#FD6500' }} />
        </span>
        <Form.Select 
          key={Id_categoria} 
          aria-label="Nombre Categoria" 
          id="categoria" 
          value={Id_categoria} 
          onChange={(e) => {
            const selectedCategoria = categorias.find(cat => cat.IdCategoria === parseInt(e.target.value));
            setId_categoria(e.target.value);
            setNombreCategoria(selectedCategoria ? selectedCategoria.Descripcion : '');
          }}
        >
          <option key={0} value="0" disabled >--Seleccione una categoría--</option>
          {categorias.map((cat) => (     
            <option key={cat.IdCategoria} value={cat.IdCategoria}>{cat.Descripcion}</option>
          ))}
        </Form.Select>
      </MDBInputGroup>

      {/* Botón para descargar la plantilla */}
      <Button variant="success" onClick={descargarPlantilla}>
        Descargar plantilla <FontAwesomeIcon icon={faFileExcel} style={{ marginLeft: '8px' }} />
      </Button>

      {/* Input para cargar el archivo Excel */}
      <Form.Group controlId="formFile" className="mb-3 mt-3">
        <Form.Label>Subir archivo de productos</Form.Label>
        <Form.Control type="file" onChange={handleFileUpload} />
      </Form.Group>

      {/* Mostrar cantidad de productos reconocidos */}
      {productosCargados.length > 0 && (
        <div className="mt-3">
         <p style={{ fontWeight: 'bold', color: '#28a745', fontSize: '18px' }}>
  Productos reconocidos: {productosCargados.length}
</p>
        </div>
      )}

    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseModalCargaMasiva}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={cargarMasivamente}>
      Procesar
    </Button>
  </Modal.Footer>
</Modal>
    </>
  )
}

export default MainProductos
