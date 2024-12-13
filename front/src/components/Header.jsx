import axios from 'axios'
import { Button, Navbar,Nav,NavDropdown,Container} from 'react-bootstrap'
import { useEffect, useState,useContext } from 'react';
import { ventas, categorias, clientes, codigobarra, cuentacorriente, detallecompra, detalleventa,metodopago,permisos,productos,proveedores,compras,reportes,usuarios, paquetes } from '../routes/routes.js'
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import '../css/Header.css'


const Header = () => {
    const navigate = useNavigate();
    const {URL}  = useContext(DataContext)


    const [nombreCompleto, setNombreCompleto] = useState("");
    const [Permisos, setPermisos] = useState([]);
    const [time, setTime] = useState(new Date());
    const Base = '/sistemas/test'

    const ObtenerUsuario = () =>{
        
        const Token = localStorage.getItem("Token");
        axios.get(`${URL}usuario/userlog?accesstoken=${Token}`).then((response)=>{
            setNombreCompleto(response.data.Usuario.NombreCompleto)
            setPermisos(response.data.Usuario.Permisos)
        })
      
    }

    

    const handleCerrarSesion = () => {
        localStorage.clear();
        navigate('/admin');
      };
    useEffect(()=>{
      ObtenerUsuario()
    },[])



   


    useEffect(() => {
        const intervalID = setInterval(() => {
          setTime(new Date());
        }, 1000); 
      
        return () => clearInterval(intervalID);
      }, []);

      const verificarPermiso = (permiso) => Permisos.includes(permiso);



    






  return (
    <div>
    <Navbar className='navB' bg="light" expand="lg">
      <Container fluid>
        <Navbar.Brand href={`${Base}${ventas}`}>
          <div id="shopName"><b style={{ color: "white" }}>FOX|</b><span style={{ color: "rgb(253, 101, 0)" }}>Ventas</span></div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className='me-auto flex-wrap'>   
            {verificarPermiso("menuventas") && (
              <NavDropdown title={<span className="dropdown-title">VENTAS</span>} className='m-2 btn-jsx2'>
                <NavDropdown.Item href={`${Base}${ventas}`} className="dropdown-item-custom">
                  <h3 className='m-2 btn-jsx'>REGISTRAR</h3>
                </NavDropdown.Item>
                <NavDropdown.Item href={`${Base}${detalleventa}`} className="dropdown-item-custom">
                  <h3 className='m-2 btn-jsx'>VER DETALLE</h3>
                </NavDropdown.Item>
              </NavDropdown>
            )}
                {verificarPermiso("menucompras") && (
              <NavDropdown title={<span className="dropdown-title">COMPRAS</span>} id="basic-nav-dropdown" className='m-2 btn-jsx2'>
                <NavDropdown.Item href={`${Base}${compras}`}>
                  <h3 className='m-2 btn-jsx'>REGISTRAR</h3>
                </NavDropdown.Item>
                <NavDropdown.Item href={`${Base}${detallecompra}`}>
                  <h3 className='m-2 btn-jsx'>VER DETALLES</h3>
                </NavDropdown.Item>
                
              </NavDropdown>
            )}
             {verificarPermiso("menuclientes") && (
              <NavDropdown title={<span className="dropdown-title">CLIENTES</span>} id="basic-nav-dropdown" className='m-2 btn-jsx2'>
                <NavDropdown.Item href={`${Base}${clientes}`}>
                  <h3 className='m-2 btn-jsx'>LISTADO</h3>
                </NavDropdown.Item>
                <NavDropdown.Item href={`${Base}${cuentacorriente}`}>
                  <h3 className='m-2 btn-jsx'>CUENTAS CORRIENTES</h3>
                </NavDropdown.Item>
              </NavDropdown>
            )}
             {verificarPermiso("menuproveedores") && (
              <Nav.Link href={`${Base}${proveedores}`} style={{padding:'17px'}} className='m-2 btn-jsx2-proveedores'>
               PROVEEDORES
              </Nav.Link>
            )}
            {verificarPermiso("menuusuario") && (
              <NavDropdown title={<span className="dropdown-title">USUARIOS</span>} id="basic-nav-dropdown" className='m-2 btn-jsx2'>
                <NavDropdown.Item href={`${Base}${usuarios}`}>
                  <h3 className='m-2 btn-jsx'>USUARIOS</h3>
                </NavDropdown.Item>
                <NavDropdown.Item href={`${Base}${permisos}`}>
                  <h3 className='m-2 btn-jsx'>PERMISOS</h3>
                </NavDropdown.Item>
              </NavDropdown>
            )}

            {verificarPermiso("menuconfiguracion") && (
              <NavDropdown title={<span className="dropdown-title">CONFIGURACION</span>} id="basic-nav-dropdown" className='m-2 btn-jsx2'>
                <NavDropdown.Item href={`${Base}${productos}`}>
                  <h3 className='m-2 btn-jsx'>PRODUCTOS</h3>
                </NavDropdown.Item>
                <NavDropdown.Item href={`${Base}${paquetes}`}>
                  <h3 className='m-2 btn-jsx'>PAQUETES</h3>
                </NavDropdown.Item>
                <NavDropdown.Item href={`${Base}${categorias}`}>
                  <h3 className='m-2 btn-jsx'>CATEGORIAS</h3>
                </NavDropdown.Item>
                <NavDropdown.Item href={`${Base}${metodopago}`}>
                  <h3 className='m-2 btn-jsx'>METODOS DE PAGO</h3>
                </NavDropdown.Item>
                <NavDropdown.Item href={`${Base}${codigobarra}`}>
                  <h3 className='m-2 btn-jsx'>CODIGOS DE BARRA</h3>
                </NavDropdown.Item>
              </NavDropdown>
            )}
          
           

            {verificarPermiso("menureportes") && (
               <Nav.Link href={`${Base}${reportes}`} style={{padding:'17px'}} className='m-2 btn-jsx2-proveedores'>
               REPORTES
              </Nav.Link>
            )}
          </Nav>
          <Nav className='ms-auto'>
            <Button className='btn-cerrarT' onClick={handleCerrarSesion}>
              CERRAR SESIÓN
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <div className='container-fluid datos'>
      <div className='row'>
        <div className='col'><h4 >USUARIO: {nombreCompleto}</h4></div>
        <div className='col'><h5>FECHA Y HORA: {time.toLocaleString()}</h5></div>
      </div>
    </div>
  </div>
  )
}

export default Header
