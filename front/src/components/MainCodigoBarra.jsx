
import  { useState, useEffect, useContext,useRef } from 'react';
import axios from 'axios';
import { Modal,Button, Table } from 'react-bootstrap';
import Badge from '@mui/material/Badge';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faCartShopping, faCheck, faHashtag} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { DataContext } from '../context/DataContext.jsx';
import { faBarcode } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2'
import Paginacion from '../components/Paginacion';
// import Barcode from 'react-barcode'
// import jsPDF from 'jspdf';
// import JsBarcode from 'jsbarcode';


const MainCodigoBarra = () => {

  const inputRef = useRef(null);
  const [Codigo, setCodigo] = useState('');
  const [NombreProducto, setNombreProducto] = useState('');
  const [Cantidad, setCantidad] = useState("");
  const [productos,  setProductos] = useState([]);
  // const [total, setTotal] = useState(0);
  const {  URL } = useContext(DataContext);
  const idSucursal = localStorage.getItem("IdSucursal");
 
  const Token = localStorage.getItem("Token");
  const [showModalProductos, setShowModalProductos] = useState(false);
  const handleShowModalProductos= () => setShowModalProductos(true);
  const handleCloseModalProductos = () => setShowModalProductos(false);


  const crearBarcode = async () => {
    if (NombreProducto.length === 0 || Codigo.length === 0 || Cantidad <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe llenar todos los campos, seleccionar un producto y asegurarse de que la cantidad sea mayor a 0."
      });
      return;
    }
  
    // Crear una nueva ventana para imprimir
    let ticketWindow = window.open('', 'PRINT', 'height=800,width=600');
    ticketWindow.document.write('<html><head><title>Códigos de Barras</title>');
    ticketWindow.document.write('<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>');
    ticketWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } td { padding: 10px; text-align: center; border: 1px solid #ddd; vertical-align: top; width: 33%; box-sizing: border-box; } svg { width: 100%; max-height: 100px; height: auto; }</style>');
    ticketWindow.document.write('</head><body style="margin: 20px; font-family: monospace;">');
  
    // Número máximo de códigos por páginaç
    let maxItemsPerPage =0;
   if(Codigo.length>0){
     maxItemsPerPage = 3*6;
   }
   if(Codigo.length>15){
     maxItemsPerPage = 3*10;
   }
    if(Codigo.length>30){
    maxItemsPerPage = 3*12;
  }
  if(Codigo.length>50){
    maxItemsPerPage = 3*15;
  }
    const itemsPerRow = 3; // Número de columnas
    const rowsPerPage = Math.ceil(maxItemsPerPage / itemsPerRow); // Número de filas por página
    let currentPage = 1;
  
    // Función para generar una nueva página
    const createPage = (startIndex) => {
      ticketWindow.document.write('<h2 style="text-align: center;">Página ' + currentPage + '</h2>');
      ticketWindow.document.write('<table>');
  
      for (let i = 0; i < rowsPerPage; i++) {
        ticketWindow.document.write('<tr>');
        for (let j = 0; j < itemsPerRow; j++) {
          const index = startIndex + i * itemsPerRow + j;
          if (index < Cantidad) {
            const nombreItem = NombreProducto || 'Nombre no disponible';
  
            ticketWindow.document.write('<td>');
            ticketWindow.document.write(`<div style="text-align: center;"><strong>${nombreItem}</strong></div>`);
            ticketWindow.document.write(`<svg id="barcode-${index}" style="width: 100%; max-height: 100px; height: auto;"></svg>`);
            ticketWindow.document.write('</td>');
          } else {
            // Rellenar con una celda vacía si no hay más códigos para mostrar
            // ticketWindow.document.write('<td></td>');
          }
        }
        ticketWindow.document.write('</tr>');
      }
  
      ticketWindow.document.write('</table>');
  
      // Si hay más productos, crear una nueva página
      if (startIndex + maxItemsPerPage < Cantidad) {
        ticketWindow.document.write('<div style="page-break-after: always;"></div>');
        currentPage++;
        createPage(startIndex + maxItemsPerPage);
      }
    };
  
    createPage(0);
  
    // Esperar a que la ventana se cargue antes de imprimir
    ticketWindow.document.write('<script>');
    ticketWindow.document.write(`window.onload = function() { 
      // Generar el código de barras después de que la ventana se haya cargado
      const totalItems = ${Cantidad};
      for (let i = 0; i < totalItems; i++) {
        JsBarcode("#barcode-" + i, "${Codigo}", { format: "CODE128", displayValue: true, width: 1, height: 40 });
      }
      window.print(); 
    };`);
    ticketWindow.document.write('</script>');
  
    ticketWindow.document.write('</body></html>');
    ticketWindow.document.close();
    limpiarDatos()
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

          

   
  const limpiarDatos = () => {
    setNombreProducto("")
    setCodigo("")
    setCantidad(0)
  } 



    useEffect(() => {
      if (showModalProductos && inputRef.current) {
        inputRef.current.focus();
      }
    }, [showModalProductos]);
    
    useEffect(() => {
        TraerProductos()
    }, []); 


    const cargarDatos = (val) =>{
        setCodigo(val.Codigo)
        setNombreProducto(val.Nombre)
    }


    const [buscar2, setBuscar2] = useState("");
    const buscador2 = (e) => {
      setBuscar2(e.target.value);
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
  const productPorPagina = 6
  const [actualPaginaProduct, setActualPaginaProduct] = useState(1)
  const ultimoIndexProduc = actualPaginaProduct * productPorPagina;
  const primerIndexProduc = ultimoIndexProduc - productPorPagina;
  const productosPaginados = resultado2.slice(primerIndexProduc, ultimoIndexProduc);
  const totalProductos = resultado2.length;

  


  return (
       <>
            <h2 style={{color:'#000'}}><strong>GESTION DE CODIGO DE BARRA</strong></h2>
            <h4 className='naranja'>Crea todos los codigos de barra de tus productos</h4> <br /> 

          

            <div className="container">
              <br />
            <Button variant="dark" onClick={handleShowModalProductos}>
                    <Badge color="warning">
                    PRODUCTOS <FontAwesomeIcon icon={faCartShopping} style={{ width: '25px', height: 'auto', marginLeft:'4px' }}/>
                    </Badge>
                </Button>
                <br /><br />
                <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faBarcode} size="lg" style={{color: '#FD6500'}} />
                    </span>
                    <input type="text" className="form-control inputss" value={Codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Codigo del producto"  />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faClipboard} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="text" placeholder="Nombre" value={NombreProducto} onChange={(e) => setNombreProducto(e.target.value)} />
                </MDBInputGroup>

                <MDBInputGroup className="mb-3">
                    <span className="input-group-text inputss">
                        <FontAwesomeIcon icon={faHashtag} size="lg"  style={{color: '#FD6500'}} />
                    </span>
                    <input className="form-control inputss" type="number" placeholder="Cantidad" value={Cantidad} onChange={(e) => setCantidad(e.target.value)} />
                </MDBInputGroup>
               
                <> 
                 <br />
                <div className="row">
                    <div className="col">
                        <Button style={{color:'white'}} className="btn btn-danger m-2 bgnaranja" onClick={crearBarcode}>
                            <FontAwesomeIcon icon={faFloppyDisk} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> GENERAR CODIGO DE BARRA
                        </Button>
                    </div>
                </div>
                </> 
            </div>
            <br />
           

            <br />

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
                                <td><button type="button" className="btn bgNaranja" onClick={() =>cargarDatos(producto)} ><FontAwesomeIcon icon={faCheck} size="lg" style={{color: 'black'}} /> </button></td>
          
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
              
               {buscar2 && (
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


    </>
  )
}

export default MainCodigoBarra
