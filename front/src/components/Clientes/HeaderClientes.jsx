import { Offcanvas, Navbar, Container, Nav, Form, FormControl, NavDropdown } from "react-bootstrap";
import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHistory, faShoppingCart, faSignInAlt, faSignOutAlt, faUser, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { DataContext } from '../../context/DataContext.jsx';
import useVerificarTokenCliente from '../../hooks/useVerificarTokenCliente';
import '../../css/Clientes/HeaderCliente.css';
import { Link, useNavigate } from "react-router-dom";
import { CarritoContext } from '../../context/CarritoContext.jsx';


const HeaderClientes = () => {
  const [showCategories, setShowCategories] = useState(false); 
  const [showCart, setShowCart] = useState(false); 
  const [Categorias, setCategorias] = useState([]);
  const handleCloseCategories = () => setShowCategories(false);
  const handleShowCategories = () => setShowCategories(true);
  const { cart, quitarDelCarrito } = useContext(CarritoContext);
  const handleCloseCart = () => setShowCart(false);
  const handleShowCart = () => setShowCart(true);
const navigate = useNavigate();

  const {URL}  = useContext(DataContext);
  const [buscadorValor, setBuscadorValor] = useState("");
  const ObtenerCategorias = () => {
    axios.get(`${URL}categoria`)
      .then((response) => {
        setCategorias(response.data);
      })
      .catch((error) => {
        console.log('Error al obtener las categorias', error);
      });
  };

  let { isValid } = useVerificarTokenCliente();

  const cerrarSesion = () => {
    localStorage.clear();
    window.location.reload();
  };
  const handleBuscadorSubmit = (e) => {
    e.preventDefault();
    if (buscadorValor.trim()) {
      navigate(`/cli/productos?buscar=${encodeURIComponent(buscadorValor)}`);
    }
  };
  

  useEffect(() => {
    ObtenerCategorias();
  }, []);

  return (
    <>
      <Navbar bg="light" expand="lg" className="py-2 shadow-sm cliente-header">
        <Container fluid>
          <button
            className="btn offcanvas-btn"
            onClick={handleShowCategories}
            style={{ border: "none", background: "none" }}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <Navbar.Brand href="/sistemas/test" className="mx-auto">
            FOX STORE
          </Navbar.Brand>
 {/* Buscador */}
 <Form className="d-flex mx-3 search-bar" onSubmit={handleBuscadorSubmit}>
            <FormControl
              type="search"
              placeholder="Buscar productos..."
              className="me-2"
              aria-label="Buscar"
              value={buscadorValor}
              onChange={(e) => setBuscadorValor(e.target.value)} 
            />
          </Form>
          {/* Íconos de carrito y usuario */}
          <Nav className="ms-auto d-flex align-items-center top-icons">
          <Nav.Link onClick={handleShowCart} style={{ cursor: "pointer"}} className="d-flex align-items-center">
  <FontAwesomeIcon icon={faShoppingCart} className="me-2" size="lg" />
  Carrito
</Nav.Link>


            {isValid ? (
              <NavDropdown
                title={<><FontAwesomeIcon icon={faUser} size="lg" /> Usuario</>}
                id="user-dropdown"
                align="end"
                className="cliente-header-dropdown"
              >
                <NavDropdown.Item href="/order-history">
                  <FontAwesomeIcon icon={faHistory} className="me-2" />Compras
                </NavDropdown.Item>
                <NavDropdown.Item href="/user-profile">
                  <FontAwesomeIcon icon={faUserAlt} className="me-2" /> Mi Perfil
                </NavDropdown.Item>
                <NavDropdown.Item onClick={cerrarSesion}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Salir
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link href="/sistemas/test/login" className="d-flex align-items-center">
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                Ingresar
              </Nav.Link>
            )}
          </Nav>

          
        </Container>
      </Navbar>

      {/* Offcanvas de categorías */}
      <Offcanvas
        show={showCategories}
        onHide={handleCloseCategories}
        placement="start"
        className="cliente-header"
      >
        <Offcanvas.Header closeButton>
       
        </Offcanvas.Header>
       
<Offcanvas.Body>
<Offcanvas.Title>CATEGORIAS</Offcanvas.Title>
<hr />
  {Categorias.map((categoria, index) => (
    categoria.Descripcion !== "Gastos" && (
      <Link
        key={index}
        to={`/cli/productos?id=${categoria.IdCategoria}`}
        className="d-flex align-items-center"
        onClick={handleCloseCategories}
      >
        {categoria.Descripcion}
      </Link>
    )
  ))}
</Offcanvas.Body>

      </Offcanvas>

<Offcanvas
  show={showCart}
  onHide={handleCloseCart}
  placement="end"
  className="cliente-header"
>
<Offcanvas.Header closeButton>
  <Offcanvas.Title> <FontAwesomeIcon icon={faShoppingCart} className="me-2" size="lg" /> Carrito de Compras</Offcanvas.Title>
</Offcanvas.Header>
<Offcanvas.Body>
  {cart.length > 0 ? (
    <div className="cart-container">
      <ul className="cart-list">
        {cart.map((item, index) => (
          <li key={index} className="cart-item d-flex align-items-center">
            <div className="cart-item-image">
              <img
                src={item.Foto || 'https://cdn-icons-png.flaticon.com/512/468/468833.png'}
                alt={item.Nombre}
                onError={(e) => {
                  e.target.src = 'https://cdn-icons-png.flaticon.com/512/468/468833.png';
                }}
              />
            </div>
            <div className="cart-item-details">
              <h5 className="cart-item-title">{item.Nombre}</h5>
              <p className="cart-item-price">Precio: ${item.PrecioVenta.toFixed(2)}</p>
              <p className="cart-item-quantity">Cantidad: {item.Cantidad}</p>
              <p className="cart-item-subtotal">
                Subtotal: ${(item.PrecioVenta * item.Cantidad).toFixed(2)}
              </p>
            </div>
            <button
              className="btn btn-danger btn-sm cart-item-remove"
              onClick={() => quitarDelCarrito(item.IdProducto)}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-total d-flex justify-content-between mt-3">
        <h3 className="cartTotal">Total:</h3>
        <h3 className="cartTotal">
          $
          {cart
            .reduce((total, item) => total + item.PrecioVenta * item.Cantidad, 0)
            .toFixed(2)}
        </h3>
      </div>
      <button className="btn btn-custom btn-block mt-3">Ir a Pagar</button>
    </div>
  ) : (
    <p className="empty-cart">Tu carrito está vacío.</p>
  )}
</Offcanvas.Body>

</Offcanvas>

    </>
  );
};

export default HeaderClientes;
