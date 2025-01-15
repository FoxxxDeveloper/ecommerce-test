import  {useEffect, useState,useContext } from 'react'
import axios from 'axios';
import Swal from 'sweetalert2'
import logo from '../../assets/foxSoftware.png'
import '../../css/Clientes/HistorialCliente.css'
import { DataContext } from '../../context/DataContext.jsx';
import { Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBook} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const MainHistorialCompras = () => {
      
    const Token = localStorage.getItem("Token");
    const [ComprasCliente, setComprasCliente] = useState([]);
    const navigate = useNavigate();

  const {URL}  = useContext(DataContext);

    const clickVerDetalle = (IdVenta) => {
      navigate(`/cli/detallecompra/${IdVenta}`);
    };
    const enviarComprobante = (val) => {
      const numeroVenta = val.NumeroVenta;
            const mensajeWhatsApp = `Hola! Acabo de realizar una compra Nº${numeroVenta}\n` +
                                    `¿Me podrían brindar los datos para realizar el pago por favor?\n` +
                                    `El total a pagar es de $${val.MontoTotal}`;
        
            window.open(`whatsapp://send?phone=5493813627039&text=${encodeURIComponent(mensajeWhatsApp)}`, '_blank');
    };



    const ObtenerCompras = () => {
        axios.get(`${URL}venta/obtener?accesstoken=${Token}`).then((response) => {
          
const ComprasConProductos = response.data.map((c)=> ({

  ...c,
  Productos: JSON.parse(c.Productos)
}))
setComprasCliente(ComprasConProductos)


        }).catch((error) => {
          console.log(error)
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error al obtener las compras del cliente!",
            footer:error.response.data.message|| "Error: " + error.message
          });
        });
       
      }

      useEffect(() => {
        ObtenerCompras()
      }, []);
  return (
    <div>
    <div className=''>

    <div className="divlogo">
  <img src={logo} alt="FOX Store" className="logo" />
</div>
<br />
<h2 className='mt-3' style={{color:'black'}}><strong>HISTORIAL DE COMPRAS</strong></h2>
<h4 className=''>Información de las compras realizadas
</h4>
<div className="container-fluid">
<div className='container'>
<div className="row">
  <div className="col-3">
  </div>
  <div className="col-">
    <br /> <br />
    <div className="container-fluid">

    {ComprasCliente.length > 0 ? (
  <div className="table-responsive">
    <table className="table">
      <thead>
        <tr>
          <th>Nº COMPRA</th>
          <th>MONTO TOTAL</th>
          <th>METODO PAGO</th>
          <th>PRODUCTOS</th>
          <th>FECHA</th>
          <th>ESTADO</th>
          <th>TIPO ENTREGA</th>
          <th>ESTADO ENTREGA</th>
          <th>DETALLE COMPRA</th>
          <th>COMPROBANTE</th>
        </tr>
      </thead>
      <tbody>
        {ComprasCliente.map((val, index) => (
          <tr key={index}>
            <td>{val.NumeroDocumento}</td>
            <td>${val.MontoTotal}</td>
            <td>{val.MetodoPago}</td>
            <td>
              <ul>
                {val.Productos &&
                  val.Productos.map((producto) => (
                    <li key={producto.IdProducto}>
                      <strong style={{ color: "red" }}>{producto.Cantidad}</strong>{" "}
                      x {producto.NombreProducto}
                    </li>
                  ))}
              </ul>
            </td>
            <td>{new Date(val.FechaRegistro).toISOString().slice(0, 10)}</td>
            <td>
              <strong
                className={
                  val.Estado === 0
                    ? "orange"
                    : val.Estado === 1
                    ? "green"
                    : "red"
                }
              >
                {val.Estado === 0
                  ? "Pendiente"
                  : val.Estado === 1
                  ? "Aprobada"
                  : "Rechazada"}
              </strong>
            </td>
            <td>{val.TipoEntrega}</td>
            <td>
              <strong
                className={
                  val.EstadoEntrega === 0
                    ? "orange"
                    : val.EstadoEntrega === 1
                    ? "blue"
                    : val.EstadoEntrega === 2
                    ? "purple"
                    : val.EstadoEntrega === 3
                    ? "green"
                    : "red"
                }
              >
                {val.EstadoEntrega === 0
                  ? "Pendiente"
                  : val.EstadoEntrega === 1
                  ? "Preparando el pedido"
                  : val.EstadoEntrega === 2
                  ? "En camino"
                  : val.EstadoEntrega === 3
                  ? "Entregado"
                  : "Cancelado"}
              </strong>
            </td>
            <td>
              <Button className="btnTabla" onClick={() => clickVerDetalle(val.IdVenta)}>
                <FontAwesomeIcon icon={faBook} size="lg" />
              </Button>
            </td>
            <td>
              <Button
                className="btnTabla"
                onClick={() => enviarComprobante(val)}
                title="Enviar comprobante"
              >
                <i className="fab fa-whatsapp"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  <div className="mensaje-sin-compras">
    Usted no posee compras actualmente
  </div>
)}

           
   
      
       
           
      
      </div>
   
  </div>
</div>
</div>

</div>
<br />
<br />
<br />
<br />
<br />
<br />

</div>

    </div>
  )
}

export default MainHistorialCompras