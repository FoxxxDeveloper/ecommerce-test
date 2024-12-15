import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import { Button, Table ,Modal } from 'react-bootstrap';
import  { useState,useContext,useEffect } from "react";
import { DataContext } from "../context/DataContext";
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { faAddressCard, faMagnifyingGlass,faCheck, faDollarSign, faUser,faDollar, faTrash, faClipboardList, faFolderOpen, faFile, faCalendarDays, faPrint  } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import 'jspdf-autotable';




const MainCuentaCorriente = () => {


  const IdUsuario = localStorage.getItem("IdUsuario");

  const [documentoCliente, setDocumentoCliente ] = useState("")
  const [nombreCliente, setNombreCliente ] = useState("")
  const [IdCliente, setIdCliente ] = useState(0)
  const [deudaTotal, setDeudaTotal] = useState(0)
  const [montoAPagar, setMontoAPagar] = useState(0)
  const [pagos, setPagos] = useState([])
  const [clientes, setClientes]= useState([])
  const [MetodoPago, setMetodoPago] = useState("Efectivo")
  const [metodosDePago, setMetodosDePago] = useState([])

  const IdSucursal = localStorage.getItem("IdSucursal");
  const[NombreSucursal, setNombreSucursal] = useState('')
  const[CUIT, setCUIT] = useState('')
  const[Direccion, setDireccion] = useState('')
  
  const[ventaEncontrada, setVentaEncontrada] = useState({})
  

  const [showModalClientes, setShowModalClientes] = useState(false)
  
  const handleShowModalClientes = () => setShowModalClientes(true);
  const handleCloseModalClientes = () => setShowModalClientes(false);

  const [showModalDetalleVenta, setShowModalDetalleVenta] = useState(false)
  
  const handleShowModalDetalleVenta = () => setShowModalDetalleVenta(true);
  const handleCloseModalDetalleVenta = () => setShowModalDetalleVenta(false);

  
  const Token = localStorage.getItem("Token");
  const {URL} = useContext(DataContext);

  const traerMetodosPago = () => {
    axios.get(`${URL}metodo_pago`,{
        params: {
          accesstoken: Token,
          
        },
      }).then((response) => {
        setMetodosDePago(response.data)
        
    }).catch((error) => {
        console.log('Error al traer los productos', error)
    })
  }

  const traerPagos = (Id) => {
console.log(Id)
    if (Id !== 0) {
        axios.get(`${URL}cliente/obtenerpagos`, {
            params: {
                accesstoken: Token,
                IdCliente: Id
            },
        })
        .then(response => {
            if (response.data.success) {
              const pagos = response.data.pagos;
                setPagos(pagos);
                if (pagos.length > 0) {
                  const ultimoSaldo = pagos[pagos.length - 1].Saldo;
                  setDeudaTotal(ultimoSaldo);
              } else {
                  setDeudaTotal(0);
              }
            } else {
              setPagos([]);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se encontraron pagos para el cliente especificado.",
                    timer: 1500
                });
            }
        })
        .catch(error => {
            if (error.response) {
                if (error.response.status === 404) {
                  setPagos([]);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Pagos no encontrados",
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
                      traerPagos(IdCliente)
                      traerClientes()
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

const DescargarPDF = () => {
  const doc = new jsPDF();
  const logoUrl = '/foxSoftware.png'; 
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30); // aca tengop que chequear las coordenadas pa acomodarlo

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(NombreSucursal, doc.internal.pageSize.getWidth() / 2, 25, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`CUIT: ${CUIT}`, doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });
      doc.text(`Dirección: ${Direccion}`, doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });

      doc.autoTable({
        head: [['Tipo Documento', 'Número de Documento']],
        body: [[ventaEncontrada.TipoDocumento, ventaEncontrada.NumeroDocumento]], 
        theme: 'grid',
        styles: {
            halign: 'center', 
            fillColor: '#CACACA', 
            textColor: [0, 0, 0], 
            lineColor: [0, 0, 0], 
            lineWidth: 0.5 
        },
        headStyles: {
            fillColor: '#FD6500', 
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0], // Color de las líneas de borde en el encabezado
            lineWidth: 0.5 // Ancho de las líneas de borde en el encabezado
        },
        margin: { left: doc.internal.pageSize.getWidth() - 70 }, 
        tableWidth: 60,
    });

      doc.autoTable({
          body: [
              ["Documento Cliente:", ventaEncontrada.ClienteDocumento], 
              ["Nombre Cliente:", ventaEncontrada.Cliente], 
              ["Fecha Registro:", ventaEncontrada.FechaRegistro], 
              ["Usuario Registro:", ventaEncontrada.NombreCompleto] 
          ],
          theme: 'plain',
          styles: { halign: 'left'},
          startY: 45,
      });

      doc.setLineWidth(0.5);
      doc.line(10, doc.autoTable.previous.finalY + 5, 200, doc.autoTable.previous.finalY + 5); 

     
      const productoData = ventaEncontrada.Productos.map(p => [
        p.Producto,
        p.PrecioVenta.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
        p.Cantidad,
        p.SubTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) 
    ]);
      doc.autoTable({
          head: [['Producto', 'Precio Venta', 'Cantidad', 'Sub Total']],
          body: productoData,
          theme: 'grid',
          styles: { halign: 'center'},
          margin: { top: doc.autoTable.previous.finalY + 10 },
           headStyles: { fillColor: '#FD6500', textColor: [0, 0, 0]},
      });

     
      doc.autoTable({
        head: [['Monto Total']],
        body: [[ventaEncontrada.MontoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })]],
        theme: 'grid',
        styles: {
            halign: 'center', 
            fillColor: '#CACACA', 
            textColor: [0, 0, 0], 
            lineColor: [0, 0, 0],
            lineWidth: 0.5 
        },
        headStyles: {
            fillColor: '#FD6500', 
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0], 
            lineWidth: 0.5
        },
        margin: { top: doc.autoTable.previous.finalY + 10, left: 160 }, 
        tableWidth: 40,
    });

      window.open(doc.output('bloburl'), '_blank');
  };

  img.onerror = () => {
      console.error('No se pudo cargar el logo.');
  };
};




  const registrar = () => {
    Swal.fire({
        title: `¿Desea registrar el pago del cliente ${nombreCliente} por '$${montoAPagar}' a traves del metodo ${MetodoPago}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, registrar.",
        cancelButtonText: "Cancelar."
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await axios.post(`${URL}cliente/registrarpago?accesstoken=${Token}`, {
                    IdCliente,
                    Deuda: montoAPagar,     
                    IdUsuario,  
                    MetodoPago, 
                });

                const { mensaje } = response.data;

                Swal.fire({
                    title: "¡Registrado!",
                    text: mensaje || "Pago registrado con éxito.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                  traerPagos(IdCliente); 
                  traerClientes();
                });
            } catch (error) {
                const errorMessage = error.response?.data?.mensaje || error.message;
                Swal.fire({
                    icon: "error",
                    title: "Error del servidor",
                    text: "No se pudo procesar la solicitud. Intente nuevamente más tarde.",
                    footer: "Error: " + errorMessage
                });
            }
        }
    });
};


  const Eliminar = (pago) => {
    Swal.fire({
        title: `¿Desea eliminar el pago del cliente ${nombreCliente} por '$${pago.Monto}'?`,
        text: "Esta acción no se podrá revertir",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar.",
        cancelButtonText: "Cancelar."
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`${URL}cliente/eliminarpago/${pago.idPago}?accesstoken=${Token}`)
                .then((response) => {
                    const { mensaje } = response.data;

                    Swal.fire({
                        title: "¡Eliminado!",
                        text: mensaje || "Pago eliminado con éxito",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                      traerPagos(IdCliente) 
                      traerClientes()
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



const obtenerDatosSucursal = () => { 
  const IdSucursal = localStorage.getItem("IdSucursal");
  
  axios.get(`${URL}sucursal/obtenerdatos`, {
    params: {
      accesstoken: Token,
      IdSucursal: IdSucursal,
    },
  })
  .then(response => {
    setNombreSucursal(response.data.Nombre); 
    setCUIT(response.data.CUIT); 
    setDireccion(response.data.Direccion); 
  })
  .catch(error => {
    if (error.response) {
      if (error.response.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Sucursal no encontrada",
          timer:1500
        });
      } else {
        console.error('Error:', error.response.data); 
      }
    } else {
      console.error('Error de red:', error.message); 
    }
  });
};


const verDetalle = (val) =>{
  handleShowModalDetalleVenta()
  obtenerDatosSucursal()
  setVentaEncontrada ({})
  axios.get(`${URL}venta/verDetalle`, {
      params: {accesstoken: Token, nroVenta: val.NumeroVenta, IdSucursal: IdSucursal  }
  })
  .then((response) => {
    if(response.data.length<=0){
      Swal.fire({
        icon: "error",
        title: "Venta no encontrada",
        text: "Verifique el número de documento de su venta, y que pertenezca a su sucursal."
    });
    return;
    }
    const productoss = response.data.map(compra => ({
      ...compra,
      Productos: JSON.parse(compra.Productos)
    }));
    setVentaEncontrada(productoss[0]);
console.log(productoss[0])
    // setTipoDocumento(response.data[0].TipoDocumento)
    // setMontoTotal(response.data[0].MontoTotal)
    // setFechaVenta(response.data[0].FechaRegistro)


    // setNombreCliente(response.data[0].Cliente)
    // setDocumentoCliente(response.data[0].ClienteDocumento)

    // setNombreUsuario(response.data[0].NombreCompleto)
    // setDocumentoUsuario(response.data[0].DNI)

    // setVentaEncontrada(true)
  })
  .catch((error) => {
      console.log(error);
  });
}
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


  
  const selectCliente = (val) =>{
    setNombreCliente(val.NombreCompleto)
    setIdCliente(val.IdCliente)
    setDocumentoCliente(val.Documento)
    setDeudaTotal(val.Deuda)
    handleCloseModalClientes()
    traerPagos(val.IdCliente)
  }

  

  useEffect(()=>{
    traerMetodosPago()
    traerClientes()
  },[])

  return (
    <div className='body'>
    <h2 className="mt-3"><strong>CUENTAS CORRIENTES</strong></h2>
    <h4 className="naranja">Administra todas las deudas de tus clientes</h4><br />

    <h4 style={{ color: "#000" }}><strong>INFORMACION CLIENTE</strong></h4>
    <div className='container'>
      <div className="row">
        <div className="col">
        <p>DOCUMENTO</p>
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faAddressCard} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='number' placeholder="Nro documento" readOnly value={documentoCliente} />
            <Button className='bgnaranja' onClick={handleShowModalClientes} >
              <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{ color: '#fff' }} />
            </Button>
          </MDBInputGroup>
        </div>

        <div className="col">
        <p>NOMBRE</p>
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faUser} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='text' placeholder="Nombre completo" readOnly value={nombreCliente}  />
          </MDBInputGroup>
        </div>
       
        <div className="col">
        <p>DEUDA</p>
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faDollarSign} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='number' placeholder="Deuda total" readOnly value={deudaTotal} />

          </MDBInputGroup>
        </div>

      </div>
    </div><br />


    <h4 style={{ color: "#000" }}><strong>INFORMACION PAGO</strong></h4>
    <div className='container'>
      <div className="row">
        <div className="col">
        <p>MONTO A PAGAR</p>
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faDollarSign} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='number' placeholder="Nuevo pago" value={montoAPagar} onChange={(e) => setMontoAPagar(e.target.value)}  />
   
          </MDBInputGroup>
        </div>

        <div className="col">
        <p>METODO DE PAGO</p>
        <MDBInputGroup className='mb-3' >
          <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faDollar} size="lg" style={{color: '#FD6500'}} />
            </span>
          <select id="metodoPago" className='form-select inputss'  onChange={(e) => setMetodoPago(e.target.value)} >
             {metodosDePago.map(metodo => (
             metodo.Descripcion!="Cuenta Corriente" && <option  key={metodo.IdMetodoPago} value={metodo.Descripcion}>{metodo.Descripcion}</option>
            ))} 
          </select>  
          </MDBInputGroup>  
        </div>
        <p></p>
        <div className="col">
       
            <Button className='bgnaranja' onClick={registrar}>
              <FontAwesomeIcon icon={faDollarSign} size="lg" style={{ color: '#fff' }} /> Registrar pago
            </Button>
        </div>
      </div>
    </div>



<br /><br />
    <div className="container table table-responsive">
            <Table striped bordered hover className="custom-table">
              <thead className="custom-table-header">
                <tr>
                  <th>FECHA</th>
                  <th>NUMERO VENTA</th>
                  <th>METODO PAGO</th>
                  <th>DEBE</th>
                  <th>HABER</th>
                  <th>SALDO</th>
                  <th>USUARIO REGISTRO</th>
                  <th>GESTION</th>
                </tr>
              </thead>
              <tbody>
               {pagos.length>0 && pagos.map((p,index)=>(
                <tr key={index}>
                  <td>{p.FechaRegistro}</td>
                  <td>{p.NumeroVenta}</td>
                  <td>{p.MetodoPago}</td>
                  <td>{p.Debe}</td>
                  <td>{p.Haber}</td>
                  <td>{p.Saldo}</td>
                  <td>{p.NombreCompleto}</td>
                  <td> 
                  {p.NumeroVenta =='' ?
                  <Button onClick={()=>{Eliminar(p)}} className='bgnaranja'style={{marginRight:"10px"}}><FontAwesomeIcon icon={faTrash} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> 
                :  <Button onClick={()=>{verDetalle(p)}} style={{marginRight:"10px"}}><FontAwesomeIcon icon={faClipboardList} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> } 

                  </td>
                </tr>

               ))}
              </tbody>
            </Table>
          </div>







 {/* MODAL PARA DETALLE DE LA VENTA  */}
 <Modal size='lg'  show={showModalDetalleVenta} onHide={handleCloseModalDetalleVenta} animation={false}>
        <Modal.Header closeVariant='white' closeButton >
          <Modal.Title>DETALLE VENTA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventaEncontrada.IdVenta && <div className='container'>
      <div className="row">
      <h4 style={{ color: "#000" }}><strong>DATOS DE LA VENTA</strong></h4>
        <div className="col">
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faFolderOpen} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='number' placeholder="Nro documento" value={ventaEncontrada.NumeroDocumento} readOnly />
          </MDBInputGroup>
        </div>
      </div>

        <>
          <div className="row">
            
            <div className="col">
              <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                  <FontAwesomeIcon icon={faFile} size="lg" style={{ color: "#FD6500" }} />
                </span>
                <input className="form-control inputss" type="text" placeholder="Tipo documento" value={ventaEncontrada.TipoDocumento} readOnly />
              </MDBInputGroup>
            </div>

            <div className="col">
              <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                  <FontAwesomeIcon icon={faCalendarDays} size="lg" style={{ color: "#FD6500" }} />
                </span>
                <input className="form-control inputss" type="text" placeholder="Fecha de venta" value={ventaEncontrada.FechaRegistro} readOnly />
              </MDBInputGroup>
            </div>

                <div className="col">
              <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                  <FontAwesomeIcon icon={faDollarSign} size="lg" style={{ color: "#FD6500" }} />
                </span>
                <input className="form-control inputss" type="number" placeholder="Total de la compra" value={ventaEncontrada.MontoTotal} readOnly />
              </MDBInputGroup>
            </div>
          </div>

       

          <br />
          <h4 style={{ color: "#000" }}><strong>DATOS DEL USUARIO</strong></h4>
          <div className="container">
            <div className="row">
              <div className="col">
                <MDBInputGroup className="mb-3">
                  <span className="input-group-text inputss">
                    <FontAwesomeIcon icon={faUser} size="lg" style={{ color: "#FD6500" }} />
                  </span>
                  <input className="form-control inputss" type="text" placeholder="Nombre usuario" value={ventaEncontrada.NombreCompleto} readOnly />
                </MDBInputGroup>
              </div>

              <div className="col">
                <MDBInputGroup className="mb-3">
                  <span className="input-group-text inputss">
                    <FontAwesomeIcon icon={faAddressCard} size="lg" style={{ color: "#FD6500" }} />
                  </span>
                  <input className="form-control inputss" type="number" placeholder="Documento usuario" value={ventaEncontrada.DNI} readOnly />
                </MDBInputGroup>
              </div>
            </div>
          </div>

          <div className="container table table-responsive">
            <Table striped bordered hover className="custom-table">
              <thead className="custom-table-header">
                <tr>
                  <th>PRODUCTO</th>
                  <th>CANTIDAD</th>
                  <th>PRECIO VENTA</th>
                  <th>SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {ventaEncontrada.Productos.map((detalle, index) => (
                  <tr key={index}>
                    <td>
                      {detalle.Producto}</td>
                    <td>
                      {detalle.Cantidad}
                    </td>
                    <td>
                    {detalle.PrecioVenta.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </td>
                    <td>
                    {detalle.SubTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="container text-start">
            <Button variant="danger" className="me-2" onClick={()=>eliminarVenta(ventaEncontrada)}>
              <FontAwesomeIcon icon={faTrash} size="lg" style={{ color: "#fff" }}  /> ELIMINAR VENTA
            </Button>

            <Button variant="warning" onClick={DescargarPDF}>
              <FontAwesomeIcon icon={faPrint} size="lg" style={{ color: "#fff" }} /> REIMPRIMIR VENTA
            </Button>
          </div><br />
        </>
    </div>}


        </Modal.Body>
        <Modal.Footer >
          <Button variant='danger' onClick={handleCloseModalDetalleVenta}>CERRAR</Button>
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
                                <FontAwesomeIcon icon={faCheck} size="lg" style={{ color: '#fff' }} />ELEGIR
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
    </div>
  )
}


export default MainCuentaCorriente
