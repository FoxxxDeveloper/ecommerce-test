
import { Container, Row, Col, Card } from "react-bootstrap";
import { useState,useContext,useEffect } from "react";
import {useNavigate} from "react-router-dom";
import axios from 'axios';
import { DataContext } from '../../context/DataContext.jsx';
import '../../css/Clientes/HomeCliente.css'
const MainHome = () => {

  const [productosMasVendidos,setProductosMasVendidos] = useState([])
  const [productosMasRecientes,setProductosMasRecientes] = useState([])
  const {  URL } = useContext(DataContext);

  const Navigate = useNavigate();

const verProducto =(idProducto)=> {

Navigate('/detalleProducto?id='+idProducto)
}
const TraerProductos = () => {
  axios.get(`${URL}producto/top`).then((response) => {
    console.log(response.data)
    setProductosMasVendidos(response.data.topVendidos);
    setProductosMasRecientes(response.data.nuevosProductos);
  }).catch((error) => {
      console.log('Error al traer los productos', error)
  })
}
 useEffect(() => {
        TraerProductos()
    }, []); 

  return (
    <Container className="my-4">
      <h2 className="mb-4 text-center">Productos en tendencia</h2>
      <Row className="g-5" >
      {productosMasVendidos.map((product) => (
  <Col md={4} key={product.IdProducto}>
    <Card className="h-100 shadow-sm card" style={{ cursor: "pointer" }} onClick={() => { verProducto(product.IdProducto) }}>
      <Card.Img
        onError={(e) => {
          e.target.src = "https://cdn-icons-png.flaticon.com/512/468/468833.png";
        }}
        variant="top"
        src={product.Foto || "https://cdn-icons-png.flaticon.com/512/468/468833.png"}
        alt={product.Nombre}
      />
      <Card.Body className="d-flex flex-column jeje">
        <Card.Title>{product.Nombre}</Card.Title>
        <Card.Text>
          {product.Descripcion
            ? product.Descripcion.length > 100
              ? `${product.Descripcion.substring(0, 80)}...`
              : product.Descripcion
            : "No hay descripción disponible."}
        </Card.Text>
        <div className="card-footer2">
          <span className="card-price">${product.PrecioVenta}</span>
          <div className="d-flex align-items-center">
            {product.PromedioCalificacion !== undefined && product.PromedioCalificacion !== null ? (
              <>
                <span className="average-score">{product.PromedioCalificacion.toFixed(1)}</span>
                <span className="star filled me-1">★</span>
              </>
            ) : (
              "Aún no hay puntuación"
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
))}





      </Row>

      <hr className="my-5" />

      <h2 className="mb-4 text-center">Últimos lanzamientos</h2>
      <Row className="g-4">
      {productosMasRecientes.map((product) => (
  <Col md={4} key={product.IdProducto}>
    <Card className="h-100 shadow-sm card" style={{ cursor: "pointer" }} onClick={() => { verProducto(product.IdProducto) }}>
      <Card.Img
        onError={(e) => {
          e.target.src = "https://cdn-icons-png.flaticon.com/512/468/468833.png";
        }}
        variant="top"
        src={product.Foto || "https://cdn-icons-png.flaticon.com/512/468/468833.png"}
        alt={product.Nombre}
      />
      <Card.Body className="d-flex flex-column jeje">
        <Card.Title>{product.Nombre}</Card.Title>
        <Card.Text>
          {product.Descripcion
            ? product.Descripcion.length > 100
              ? `${product.Descripcion.substring(0, 80)}...`
              : product.Descripcion
            : "No hay descripción disponible."}
        </Card.Text>
        <div className="card-footer2">
          <span className="card-price">${product.PrecioVenta}</span>
          <div className="d-flex align-items-center">
            {product.PromedioCalificacion !== undefined && product.PromedioCalificacion !== null ? (
              <>
                <span className="average-score">{product.PromedioCalificacion.toFixed(1)}</span>
                <span className="star filled me-1">★</span>
              </>
            ) : (
              "Aún no hay puntuación"
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
))}



      </Row>
    </Container>
  );
};

export default MainHome;
