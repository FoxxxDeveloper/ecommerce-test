import { Offcanvas, Navbar, Container, Nav, Form, FormControl, NavDropdown } from "react-bootstrap";
import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import Swal from 'sweetalert2' 
import { Modal, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHistory, faShoppingCart, faSignInAlt, faSignOutAlt, faUser, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { DataContext } from '../../context/DataContext.jsx';
import useVerificarTokenCliente from '../../hooks/useVerificarTokenCliente';
import '../../css/Clientes/HeaderCliente.css';
import { Link, useNavigate } from "react-router-dom";
import { CarritoContext } from '../../context/CarritoContext.jsx';
import {faDollar, faDollyBox, faMapMarkedAlt, faTruckFast,  } from "@fortawesome/free-solid-svg-icons";
import { MDBInputGroup } from 'mdb-react-ui-kit';

const HeaderClientes = () => {
  const [showCategories, setShowCategories] = useState(false); 
  const [metodoPago, setMetodosPago] = useState([]);
  const [showCart, setShowCart] = useState(false); 
  const [Categorias, setCategorias] = useState([]);
  const handleCloseCategories = () => setShowCategories(false);
  const handleShowCategories = () => setShowCategories(true);
  const { cart, quitarDelCarrito,vaciarCarrito } = useContext(CarritoContext);
  const handleCloseCart = () => setShowCart(false);
  const [porcentaje, setPorcentaje] = useState([]);
  const [MetodoPago, setMetodoPago] = useState('Efectivo')
  const handleShowCart = () => setShowCart(true);
  const [showModalFinalVenta, setShowModalFinalVenta] = useState(false)
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [TipoEntrega, setTipoEntrega] = useState('Retiro en local')
  const [DireccionSeleccionada, setDireccionSeleccionada] = useState(false);
  const [DireccionEnvio, setDireccionEnvio] = useState(0);
  const [Direcciones, setDirecciones] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const Token = localStorage.getItem('Token');

  const handleOpenAddModal = () => {setShowAddModal(true)
    setShowDireccionModal(false)
  };
  const handleCloseAddModal = () => {setShowAddModal(false)
    handleOpenDireccionModal()
  };
  const handleShowModalFinalVenta = () => setShowModalFinalVenta(true);
  const handleCloseModalFinalVenta = () => {
    setShowModalFinalVenta(false)
    setMetodoPago('Efectivo')
    setPorcentaje(0)
  };

  const handleOpenDireccionModal = () =>{   
    setShowModalFinalVenta(false)
    traerDirecciones()
    setShowDireccionModal(true);} 
  const handleCloseDireccionModal = () => {setShowDireccionModal(false)
    setShowModalFinalVenta(true)
  };

const navigate = useNavigate();




const FinalizarVenta = async () => {
  console.log(cart)
  if (cart.length < 1) {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "No puede realizar una venta sin productos"
      });
      return;
  }
  const montoTotal= cart
  .reduce((total, item) => total + item.PrecioVenta * item.Cantidad, 0)
  .toFixed(2);
  const ventaData = {
      TipoDocumento: "Boleta",
      MontoTotal: montoTotal,
      MetodoPago,
      IdDireccion: DireccionEnvio.IdDireccion,
      TipoEntrega,
      DetalleVenta: cart.map(item => ({
          IdProducto:item.IdProducto,
          NombreProducto: item.Nombre,
          Cantidad: item.Cantidad,
          PrecioVenta: item.PrecioVenta,
          TipoProducto: 1
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
          Swal.fire({
              title: "¡Éxito!",
              text: "Su pedido fue realizado con éxito, pronto nos comunicaremos contigo para finalizar la compra.",
              icon: "success",
              timer: 5000
          }).then(() => {
            navigate('/cli/historialcompras');
            vaciarCarrito();
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
    
    console.log(nuevadireccion)
    return axios.post(`${URL}cliente/registrardireccion?accesstoken=${Token}`, {
      Provincia: nuevadireccion.Provincia,
      Ciudad: nuevadireccion.Ciudad,
      CodigoPostal: nuevadireccion.CodigoPostal,
      Direccion: nuevadireccion.Direccion,
      Estado: 1  
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
  const AbrirModalFinalizar = () => {
   
    if(!isValid){
      navigate("/login")
    }
    else{
      handleShowModalFinalVenta();
    }
    }
  const traerMetodosPago = () => {
    axios.get(`${URL}metodo_pago`).then((response) => {
        setMetodosPago(response.data)
        console.log(response.data)
    }).catch((error) => {
        console.log('Error al traer los productos', error)
    })
  }
const traerDirecciones = () => {
  
      axios.get(`${URL}cliente/obtenerdirecciones`, {
          params: {
              accesstoken: Token,
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
  
};


  useEffect(() => {
    ObtenerCategorias();
    traerMetodosPago();
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
                <NavDropdown.Item href="/sistemas/test/cli/historialcompras">
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
      <button className="btn btn-custom btn-block mt-3" onClick={()=> AbrirModalFinalizar()}>Ir a Pagar</button>
    </div>
  ) : (
    <p className="empty-cart">Tu carrito está vacío.</p>
  )}
</Offcanvas.Body>

</Offcanvas>
<Modal show={showModalFinalVenta} onHide={handleCloseModalFinalVenta}>
            <Modal.Header closeButton>
              <Modal.Title>VER DETALLE DE COMPRA</Modal.Title>
            </Modal.Header>

    
            <Modal.Body>
            <h3><b>TOTAL: $  {cart
            .reduce((total, item) => total + item.PrecioVenta * item.Cantidad, 0)
            .toFixed(2)} </b></h3>
        
         
          <br /> <br /> 
          <label> Metodo de Pago:</label>
          <MDBInputGroup className='mb-3' >
          <span className="input-group-text inputss">
              <FontAwesomeIcon icon={faDollar} size="lg" style={{color: 'white'}} />
            </span>
          <select id="metodoPago" className='form-select inputss'   onChange={(e) => {
    const metodoSeleccionado = metodoPago.find(metodo => metodo.Descripcion === e.target.value);
    setMetodoPago(e.target.value);
    if (metodoSeleccionado) {
      setPorcentaje(metodoSeleccionado.Porcentaje);
    }
  }}
>
{metodoPago && metodoPago.length > 0 ? (
  metodoPago.map(metodo => (metodo.Descripcion!="Cuenta Corriente"&&
    <option key={metodo.IdMetodoPago} value={metodo.Descripcion}>
      {metodo.Descripcion}
    </option>
  ))
) : (
  <option disabled>No hay métodos de pago disponibles</option>
)}

          </select>  
          </MDBInputGroup>    
          <br /> 
     <br />
     <label>Tipo de entrega:</label>
        <MDBInputGroup className='mb-3' >
    <span className="input-group-text inputss   ">
      <FontAwesomeIcon icon={faDollyBox} size="lg" style={{color: 'white'}} />
    </span>
    <select aria-label="Estado" className="form-select inputss"  id='estado' value={TipoEntrega} onChange={(e)=>setTipoEntrega(e.target.value)}>   
                    <option value="Retiro en local">Retiro en local</option>
                    <option value="Envio">Envio</option>
    </select>
    </MDBInputGroup>
          
    <br />

    {TipoEntrega =='Envio' && <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Button style={{backgroundColor:'black'}} onClick={handleOpenDireccionModal}>
          <FontAwesomeIcon icon={faTruckFast} size="lg" style={{color: 'white'}} /> Seleccionar direccion
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
                <FontAwesomeIcon icon={faMapMarkedAlt} size="2x" style={{ color: "black" }} />
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
      className="btn btn-custom btn-block mt-3" 
      style={{ width: '400px', marginTop: '6px' }}  
      onClick={FinalizarVenta}
    >
      FINALIZAR COMPRA
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
                <FontAwesomeIcon icon={faMapMarkedAlt} size="2x" style={{ color: "black" }} />
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
      <Button className="btn btn-custom btn-block mt-3" onClick={handleOpenAddModal}>
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
      <Button type="submit" className="btn btn-custom btn-block mt-3">
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
    </>
  );
};

export default HeaderClientes;
