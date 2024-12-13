import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MDBInputGroup } from 'mdb-react-ui-kit';
import { faAddressCard, faMagnifyingGlass,faTrash,faPrint, faFile, faCalendarDays, faDollarSign, faUser, faPhone, faFolderOpen  } from "@fortawesome/free-solid-svg-icons";
import { Button, Table} from 'react-bootstrap';
import  { useState,useContext  } from "react";
import { DataContext } from "../context/DataContext";
import axios from 'axios';
import Swal from 'sweetalert2'; 
import '../css/DetalleCompra.css';
import jsPDF from "jspdf";
import 'jspdf-autotable';

const MainDetalleCompra = () => {

  const [detalleCompras, setDetalleCompras] = useState([]);

  const [nroCompra, setNroCompra] = useState('');
  const [TipoDocumento, setTipoDocumento] = useState('')
  const [fechaCompra, setFechaCompra] = useState('')
  const [MontoTotal, setMontoTotal]= useState('')

  const[nombreProveedor, setNombreProveedor] = useState('')
  const[DocumentoProveedor, setDocumentoProveedor] = useState('')
  const[telefonoProveedor, setTelefonoProveedor] = useState('')
  const[compraEncontrada, setCompraEncontrada] = useState(false)
  const[nombreUsuario, setNombreUsuario] = useState('')
  const[DocumentoUsuario, setDocumentoUsuario] = useState('')
  const[NombreSucursal, setNombreSucursal] = useState('')
  const[CUIT, setCUIT] = useState('')
  const[Direccion, setDireccion] = useState('')
  

  const Token = localStorage.getItem("Token");
  const IdSucursal = localStorage.getItem("IdSucursal");
  const {URL} = useContext(DataContext);



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
  

  const traerLaCompra = () =>{
    obtenerDatosSucursal()
    limpiarCampos();
    axios.get(`${URL}compra/verDetalle`, {
        params: {accesstoken: Token, nroCompra: nroCompra, IdSucursal: IdSucursal  }
    })
    .then((response) => {
      if(response.data.length<=0){
        Swal.fire({
          icon: "error",
          title: "Compra no encontrada",
          text: "Verifique el número de documento de su compra, y que pertenezca a su sucursal."
      });
      return;
      }
      const productoss = response.data.map(compra => ({
        ...compra,
        Productos: JSON.parse(compra.Productos)
      }));
      setDetalleCompras(productoss);

      setTipoDocumento(response.data[0].TipoDocumento)
      setMontoTotal(response.data[0].MontoTotal)
      setFechaCompra(response.data[0].FechaRegistro)

      setNombreProveedor(response.data[0].RazonSocial)
      setTelefonoProveedor(response.data[0].Telefono)
      setDocumentoProveedor(response.data[0].CUIT)

      setNombreUsuario(response.data[0].NombreCompleto)
      setDocumentoUsuario(response.data[0].DNI)
      setCompraEncontrada(true)
    })
    .catch((error) => {
        console.log(error);
    });
  }

  const DescargarPDF = () => {
    const doc = new jsPDF();
    const logoUrl = '/sistemas/test/foxSoftware.png'; 
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30);  // aca tengop que chequear las coordenadas pa acomodarlo

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(NombreSucursal, doc.internal.pageSize.getWidth() / 2, 25, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`CUIT: ${CUIT}`, doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });
        doc.text(`Dirección: ${Direccion}`, doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });

        doc.autoTable({
          head: [['Tipo Documento', 'Número de Documento']],
          body: [[TipoDocumento, nroCompra]], 
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
          margin: { left: doc.internal.pageSize.getWidth() - 70 }, 
          tableWidth: 60,
      });

        doc.autoTable({
            body: [
                ["Documento Proveedor:", DocumentoProveedor], 
                ["Nombre Proveedor:", nombreProveedor], 
                ["Fecha Registro:", fechaCompra], 
                ["Usuario Registro:", nombreUsuario] 
              ],
              theme: 'plain',
              styles: { halign: 'left'},
              startY: 45,
          });
    

        doc.setLineWidth(0.5);
        doc.line(10, doc.autoTable.previous.finalY + 5, 200, doc.autoTable.previous.finalY + 5); 

       
        const productoData = detalleCompras[0].Productos.map(p => [
          p.Producto,
          p.PrecioCompra.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
          p.Cantidad,
          p.SubTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) 
      ]);

        doc.autoTable({
            head: [['Producto', 'Precio Compra', 'Cantidad', 'Sub Total']],
            body: productoData,
            theme: 'grid',
            styles: { halign: 'center' },
            margin: { top: doc.autoTable.previous.finalY + 10 },
             headStyles: { fillColor: '#FD6500', textColor: [0, 0, 0]},
        });

       
        doc.autoTable({
          head: [['Monto Total']],
          body: [[MontoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })]],
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
  


const limpiarCampos=() => {
  setDetalleCompras([]);
  setTipoDocumento("")
  setMontoTotal("")
  setFechaCompra("")
  setNombreProveedor("")
  setTelefonoProveedor('')
  setDocumentoProveedor('')
  setNombreUsuario('')
  setDocumentoUsuario('')
  setCompraEncontrada(false)
}
 
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
                        traerLaCompra()
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



return (
  <>
    <br />
    <div className='h3-ventas'>
      <h2 style={{ color: '#000' }}><strong>DETALLE COMPRAS</strong></h2>
      <h4 className='naranja'>Controla y administra las compras de tu negocio</h4>
      <br />
    </div>
    
    <br />
    <h4 style={{ color: '#000' }}><strong>DATOS DE LA COMPRA</strong></h4>
    <div className='container'>
      <div className="row">
        <div className="col">
          <MDBInputGroup className='mb-3'>
            <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faFolderOpen} size="lg" style={{ color: '#FD6500' }} />
            </span>
            <input className='form-control inputss' type='number' placeholder="Nro documento" value={nroCompra} onChange={(e) => setNroCompra(e.target.value)} />
            <Button className='bgnaranja' onClick={traerLaCompra}>
              <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{ color: '#fff' }} />
            </Button>
          </MDBInputGroup>
        </div>
      </div>

      {compraEncontrada && (
        <>
          <div className="row">
            <div className="col">
              <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                  <FontAwesomeIcon icon={faFile} size="lg" style={{ color: "#FD6500" }} />
                </span>
                <input className="form-control inputss" type="text" placeholder="Tipo documento" value={TipoDocumento} readOnly />
              </MDBInputGroup>
            </div>

            <div className="col">
              <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                  <FontAwesomeIcon icon={faCalendarDays} size="lg" style={{ color: "#FD6500" }} />
                </span>
                <input className="form-control inputss" type="text" placeholder="Fecha de compra" value={fechaCompra} readOnly />
              </MDBInputGroup>
            </div>

                <div className="col">
              <MDBInputGroup className="mb-3">
                <span className="input-group-text inputss">
                  <FontAwesomeIcon icon={faDollarSign} size="lg" style={{ color: "#FD6500" }} />
                </span>
                <input className="form-control inputss" type="number" placeholder="Total de la compra" value={MontoTotal} readOnly />
              </MDBInputGroup>
            </div>
          </div>

       

          <br />
          <h4 style={{ color: "#000" }}><strong>DATOS DEL PROVEEDOR</strong></h4>
          <div className="container">
            <div className="row">
              <div className="col">
                <MDBInputGroup className="mb-3">
                  <span className="input-group-text inputss">
                    <FontAwesomeIcon icon={faUser} size="lg" style={{ color: "#FD6500" }} />
                  </span>
                  <input className="form-control inputss" type="text" placeholder="Razon social" value={nombreProveedor} readOnly />
                </MDBInputGroup>
              </div>

              <div className="col">
                <MDBInputGroup className="mb-3">
                  <span className="input-group-text inputss">
                    <FontAwesomeIcon icon={faAddressCard} size="lg" style={{ color: "#FD6500" }} />
                  </span>
                  <input className="form-control inputss" type="number" placeholder="Documento proveedor" value={DocumentoProveedor} readOnly />
                </MDBInputGroup>
              </div>

              <div className="col">
                <MDBInputGroup className="mb-3">
                  <span className="input-group-text inputss">
                    <FontAwesomeIcon icon={faPhone} size="lg" style={{ color: "#FD6500" }} />
                  </span>
                  <input className="form-control inputss" type="number" placeholder="Telefono proveedor" value={telefonoProveedor} readOnly />
                </MDBInputGroup>
              </div>
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
                  <input className="form-control inputss" type="text" placeholder="Nombre usuario" value={nombreUsuario} readOnly />
                </MDBInputGroup>
              </div>

              <div className="col">
                <MDBInputGroup className="mb-3">
                  <span className="input-group-text inputss">
                    <FontAwesomeIcon icon={faAddressCard} size="lg" style={{ color: "#FD6500" }} />
                  </span>
                  <input className="form-control inputss" type="number" placeholder="Documento usuario" value={DocumentoUsuario} readOnly />
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
                  <th>PRECIO COMPRA</th>
                  <th>SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {detalleCompras[0].Productos.map((detalle, index) => (
                  <tr key={index}>
                    <td>
                      {detalle.Producto}</td>
                    <td>
                      {detalle.Cantidad}
                    </td>
                    <td>
                    {detalle.PrecioCompra.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
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
            <Button variant="danger" className="me-2">
              <FontAwesomeIcon icon={faTrash} size="lg" style={{ color: "#fff" }}  onClick={()=>eliminarCompra(detalleCompras[0])}/> ELIMINAR COMPRA
            </Button>

            <Button variant="warning" onClick={DescargarPDF}>
              <FontAwesomeIcon icon={faPrint} size="lg" style={{ color: "#fff" }} /> REIMPRIMIR COMPRA
            </Button>
          </div><br />
        </>
      )}
    </div>
  </>
);

}



export default MainDetalleCompra
