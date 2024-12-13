import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import { Button, Table ,Modal } from 'react-bootstrap';
import  { useState,useContext,useEffect } from "react";
import { DataContext } from "../../context/DataContext";
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { faAddressCard, faDollarSign, faUser, faClipboardList, faFolderOpen, faFile, faCalendarDays, faPrint  } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import 'jspdf-autotable';




const MainCuentaCorrienteCliente = () => {



  const [pagos, setPagos] = useState([])
  const[NombreSucursal, setNombreSucursal] = useState('')
  const[CUIT, setCUIT] = useState('')
  const[Direccion, setDireccion] = useState('')
  
  const[ventaEncontrada, setVentaEncontrada] = useState({})
  

  const [showModalDetalleVenta, setShowModalDetalleVenta] = useState(false)
  
  const handleShowModalDetalleVenta = () => setShowModalDetalleVenta(true);
  const handleCloseModalDetalleVenta = () => setShowModalDetalleVenta(false);

  
  const Token = localStorage.getItem("Token");
  const documentoCliente = localStorage.getItem("Documento");
  const nombreCliente = localStorage.getItem("Nombre");
  const deudaTotal = localStorage.getItem("Deuda");
  const {URL} = useContext(DataContext);


  const traerPagos = () => {

     axios.get(`${URL}cliente/obtenerpagos`, {
            params: {
                accesstoken: Token
            },
        })
        .then(response => {
            if (response.data.success) {
              const pagos = response.data.pagos;
                setPagos(pagos);
            } else {
              setPagos([]);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se encontraron datos de compras y pagos para el cliente ingresado.",
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
                        text: "Datos de compras y pagos no encontrados",
                        timer: 1500
                    });
                } else {
                    console.error('Error en la respuesta:', error.response.data);
                }
            } else {
                console.error('Error de red:', error.message);
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
          head: [['Producto', 'Precio', 'Cantidad', 'Sub Total']],
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




const obtenerDatosSucursal = (Id) => { 
  axios.get(`${URL}sucursal/obtenerdatos`, {
    params: {
      accesstoken: Token,
      IdSucursal: Id,
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
  setVentaEncontrada ({})
  axios.get(`${URL}venta/verDetalle`, {
      params: {accesstoken: Token, nroVenta: val.NumeroVenta }
  })
  .then((response) => {
    if(response.data.length<=0){
      Swal.fire({
        icon: "error",
        title: "Compra no encontrada",
        text: "Verifique el número de documento de su compra."
    });
    return;
    }
    const productoss = response.data.map(compra => ({
      ...compra,
      Productos: JSON.parse(compra.Productos)
    }));
    setVentaEncontrada(productoss[0]);
    obtenerDatosSucursal(productoss[0].IdSucursal)
  })
  .catch((error) => {
      console.log(error);
  });
}
 
useEffect(() => {
    traerPagos()
}, []); 


  return (
    <div >
      <br /><br /><br /><br /><br />
    <h2 className="mt-3"><strong>CUENTA CORRIENTE</strong></h2>
    <h4 className="naranja">Verifica todas las compras y los pagos que realizaste.</h4><br />

    <h4 style={{ color: "#000" }}><strong>INFORMACION CLIENTE</strong></h4>
    <div className='container'>
        <p>DOCUMENTO</p>
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faAddressCard} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='number' placeholder="Nro documento" readOnly value={documentoCliente} />
           
          </MDBInputGroup>

        <p>NOMBRE</p>
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faUser} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='text' placeholder="Nombre completo" readOnly value={nombreCliente}  />
          </MDBInputGroup>
      
       
        <p>DEUDA</p>
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faDollarSign} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='number' placeholder="Deuda total" readOnly value={deudaTotal} />

          </MDBInputGroup>
      

    </div><br />


    
   


<br /><br />
    <div className="container table table-responsive">
            <Table striped bordered hover className="custom-table">
              <thead className="custom-table-header">
                <tr>
                  <th>FECHA</th>
                  <th>NUMERO COMPRA</th>
                  <th>METODO PAGO</th>
                  <th>DEBE</th>
                  <th>HABER</th>
                  <th>SALDO</th>
                  <th>USUARIO REGISTRO</th>
                  <th>VER DETALLE</th>
                </tr>
              </thead>
              <tbody>
               {pagos.length>0 && pagos.map((p,index)=>(
                <tr key={index}>
                  <td>{p.FechaRegistro}</td>
                  <td>{p.NumeroVenta}</td>
                  <td>{p.MetodoPago}</td>
                  <td style={{ color: (new Date(p.Debe) >  0) ? 'red' : 'black' }} ><strong>{p.Debe.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong></td>
                  <td style={{ color: (new Date(p.Haber) >  0) ? 'green' : 'black' }}><strong>{p.Haber.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong></td>
                  <td>{p.Saldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                  <td>{p.NombreCompleto}</td>
                  <td> 
                  {p.NumeroVenta !='' && <Button className='bgNaranja' onClick={()=>{verDetalle(p)}} style={{marginRight:"10px"}}><FontAwesomeIcon icon={faClipboardList} size="lg" style={{color: "white"}}></FontAwesomeIcon></Button> } 

                  </td>
                </tr>

               ))}
              </tbody>
            </Table>
          </div>







 {/* MODAL PARA DETALLE DE LA VENTA  */}
 <Modal size='lg'  show={showModalDetalleVenta} onHide={handleCloseModalDetalleVenta} animation={false}>
        <Modal.Header closeVariant='white' closeButton >
          <Modal.Title>DETALLE COMPRA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventaEncontrada.IdVenta && <div className='container'>
      <div className="row">
      <h4 style={{ color: "#000" }}><strong>DATOS DE LA COMPRA</strong></h4>
        
      </div>

        <>
          <div className="row">
          <div className="col">
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faFolderOpen} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='number' placeholder="Nro documento" value={ventaEncontrada.NumeroDocumento} readOnly />
          </MDBInputGroup>
        </div>
            <div className="col">
              <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                  <FontAwesomeIcon icon={faFile} size="lg" style={{ color: "#FD6500" }} />
                </span>
                <input className="form-control inputss" type="text" placeholder="Tipo documento" value={ventaEncontrada.TipoDocumento} readOnly />
              </MDBInputGroup>
            </div>
            <div className="row">
            <div className="col">
              <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                  <FontAwesomeIcon icon={faCalendarDays} size="lg" style={{ color: "#FD6500" }} />
                </span>
                <input className="form-control inputss" type="text" placeholder="Fecha de Compra" value={ventaEncontrada.FechaRegistro} readOnly />
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
          </div>

       

          <br />
          <h4 style={{ color: "#000" }}><strong>DATOS DEL VENDEDOR</strong></h4>
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

              
            </div>
          </div>

          <div className="container table table-responsive">
            <Table striped bordered hover className="custom-table">
              <thead className="custom-table-header">
                <tr>
                  <th>PRODUCTO</th>
                  <th>CANTIDAD</th>
                  <th>PRECIO</th>
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
            <Button variant="warning" onClick={DescargarPDF}>
              <FontAwesomeIcon icon={faPrint} size="lg" style={{ color: "#fff" }} /> REIMPRIMIR BOLETA
            </Button>
          </div><br />
        </>
    </div>}


        </Modal.Body>
        <Modal.Footer >
          <Button variant='danger' onClick={handleCloseModalDetalleVenta}>CERRAR</Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}


export default MainCuentaCorrienteCliente
