import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../context/DataContext.jsx";
import { Col, Card, Form, Row } from "react-bootstrap";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import '../../css/Clientes/ProductosCat.css';

const MainProductosCat = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [precioMin, setPrecioMin] = useState(1000);
  const [precioMax, setPrecioMax] = useState(3500);
  const [calificacionMin, setCalificacionMin] = useState(0);
  const [calificacionMax, setCalificacionMax] = useState(5);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
 
  const { URL } = useContext(DataContext);
  const Navigate = useNavigate();

  const verProducto = (idProducto) => {
    Navigate('/detalleProducto?id=' + idProducto);
  }
  const id = new URLSearchParams(window.location.search).get("id");
  const buscador = new URLSearchParams(window.location.search).get("buscar");

useEffect(() => {
  const endpoint = id 
    ? `${URL}producto/categoria/${id}` 
    : buscador 
      ? `${URL}producto/buscador/${buscador}`
      : null; 

  if (!endpoint) {
    setError("No se seleccionó una categoría ni término de búsqueda.");
    return;
  }

  axios
    .get(endpoint)
    .then((response) => {
      const data = response.data;
      setProductos(data);
      setProductosFiltrados(data);
      setPrecioMin(Math.min(...data.map((p) => p.PrecioVenta)));
      setPrecioMax(Math.max(...data.map((p) => p.PrecioVenta)));
      setCalificacionMin(Math.min(...data.map((p) => p.PromedioCalificacion || 0)));
    })
    .catch((error) => {
      setError(error.message);
    });
}, [URL, id, buscador]);


  useEffect(() => {
    handleFilter(); 
  }, [precioMin, precioMax, calificacionMin, calificacionMax]); 
  useEffect(() => {
    handleSort("nuevos");
  }, [productos]);
  const handleSort = (tipo) => {
    const sorted = [...productosFiltrados].sort((a, b) => {
      if (tipo === "precioAsc") return a.PrecioVenta - b.PrecioVenta;
      if (tipo === "precioDesc") return b.PrecioVenta - a.PrecioVenta;
      if (tipo === "nuevos") return b.IdProducto - a.IdProducto;
      return 0;
    });
    setProductosFiltrados(sorted);
  };

  const handleFilter = () => {
    const filtrados = productos.filter(
      (p) =>
        p.PrecioVenta >= precioMin &&
        p.PrecioVenta <= precioMax &&
        (p.PromedioCalificacion || 0) >= calificacionMin &&
        (p.PromedioCalificacion || 0) <= calificacionMax
    );
    setProductosFiltrados(filtrados);
  };

  if (error) {
    return  <div className="error-container"> <div className="error-mensaje-prod">Error: {error}</div></div>
  }

  if (!productos) {
    return <div className="loading-message">Cargando...</div>;
  }

  return (
    <div className="container mt-5">
      <Row style={{ justifyContent: 'center' }}>
        <Col md={3} className="productos-filtros">
          <h4 className="filtros-titulo">Filtros</h4>

          <Form.Group className="filtro-precio">
            <Form.Label>Precio</Form.Label>
            <Slider
              range
              min={Math.min(...productos.map((p) => p.PrecioVenta))}
              max={Math.max(...productos.map((p) => p.PrecioVenta))}
              value={[precioMin, precioMax]} 
              onChange={(value) => {
                setPrecioMin(value[0]);
                setPrecioMax(value[1]);
              }}
              step={10}
               className="custom-slider"
            />
            <div className="precio-max">
              Desde: ${precioMin} - Hasta: ${precioMax}
            </div>
          </Form.Group>

          <Form.Group className="filtro-calificacion">
            <Form.Label>Calificación</Form.Label>
            <Slider
              range
              min={0}
              max={5}
              step={0.1}
               className="custom-slider"
              value={[calificacionMin, calificacionMax]} 
              onChange={(value) => {
                setCalificacionMin(value[0]);
                setCalificacionMax(value[1]);
              }}
            />
            <div className="calificacion-min">
              Desde: {calificacionMin.toFixed(1)} - Hasta: {calificacionMax.toFixed(1)}
            </div>
          </Form.Group>

        </Col>

        <Col md={9} className="productos-contenido">
          <div className="productos-header">
            <div className="productos-info">
              Mostrando: {productosFiltrados.length} productos de {productos.length}
            </div>
            <div className="productos-sort">
             <div style={{width:'100%'}}>Ordenar por:{"  "}</div> 
              <Form.Select
                onChange={(e) => {
                  handleSort(e.target.value); 
                }}
                className="select-ordenar"
              >
                <option value="nuevos">Más nuevos</option>
                <option value="precioAsc">Precio: bajo a alto</option>
                <option value="precioDesc">Precio: alto a bajo</option>
              </Form.Select>
            </div>
          </div>
          <Row className="productos-lista">
            {productosFiltrados.map((product) => (
              <Col md={4} key={product.IdProducto} className="card-col">
                <Card className="h-100 shadow-sm" style={{ cursor: "pointer" }} onClick={() => { verProducto(product.IdProducto) }}>
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
        </Col>
      </Row>
    </div>
  );
};

export default MainProductosCat;
