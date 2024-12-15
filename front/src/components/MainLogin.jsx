import  { useState,useContext,useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from 'axios'; 
import "../css/Login.css";
import { useNavigate } from 'react-router-dom';
// import BackgroundImage from "../assets/background.webp";
import Logo from "../assets/foxSoftware.png";
import { DataContext } from "../context/DataContext";



const MainLogin = () => {
  const navigate = useNavigate();
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [idSucursal, setIdSucursal] = useState(1);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const {URL}  = useContext(DataContext)
  const [Sucursales, setSucursales] = useState([])

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await delay(500);
    try {
      
        const response = await axios.post(`${URL}usuario/login/`, {
            DNI: inputUsername,
            Clave: inputPassword,
            IdSucursal:idSucursal
        });
        
       
        const Token = response.data.token;
        const IdUsuario= response.data.IdUsuario;
        if(IdUsuario ==1){
          localStorage.setItem('SA', 1);
        }
        else{
          localStorage.setItem('SA', 0);
        }
        localStorage.setItem('Token', Token);
        localStorage.setItem('IdSucursal', idSucursal);
        localStorage.setItem('IdUsuario', IdUsuario);

          navigate('/ventas');
        
    } catch (error) {
        setShow(true);
    } finally {
        setLoading(false); 
    }
};


const ObtenerSucursales = () =>{
    axios.get(`${URL}sucursal`).then((response)=>{
       setSucursales(response.data)
    })
    }
    

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  useEffect(()=>{
    ObtenerSucursales()
  },[])
  return (
    <div
      className="sign-in__wrapper fondoLogin "
      // style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      
      {/* Form */}
      <Form className="shadow p-4 rounded formLogin " onSubmit={handleSubmit}>
        {/* Header */}
        <img
          className=" imgLogo mx-auto d-block mb-2"
          src={Logo}
          alt="logo"
        />
        
        <div className="h4 mb-2 mt-3 text-center imgLogo">Iniciar sesión</div>
        {/* ALert */}
        {show ? (
          <Alert
            className="mb-2"
            variant="danger"
            onClose={() => setShow(false)}
            dismissible
          >
            Usuario, clave y/o sucursal incorrecta.
          </Alert>
        ) : (
          <div />
        )}
        <Form.Group className="mb-2" controlId="username">
          <Form.Label >Sucursal</Form.Label>
          <Form.Select className='inputss' aria-label="Sucursal" id="idSucursal" value={idSucursal} onChange={(e)=>setIdSucursal(e.target.value)}>
            {Sucursales.map((suc)=>
              <option value={suc.IdSucursal} key={suc.IdSucursal}>{suc.Nombre}</option>
            )}


                        
                       
            </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2" controlId="username">
          <Form.Label >Usuario</Form.Label>
          <Form.Control
            type="text"
            value={inputUsername}
            placeholder="Usuario"
            onChange={(e) => setInputUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-5" controlId="password">
          <Form.Label>Clave</Form.Label>
          <Form.Control
            type="password"
            value={inputPassword}
            placeholder="Clave"
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
        </Form.Group>
      
        {!loading ? (
          <Button className="w-100 btnIng" variant="dark" type="submit">
            Ingresar
          </Button>
        ) : (
          <Button className="w-100 btnIng" variant="dark" type="submit" disabled>
            Ingresando...
          </Button>
        )}
         <div id="shopName" className="mt-3"><a href="https://foxsoftware.com.ar/"> <b style={{color: "white"}}>FOX</b>|<span style={{color: "rgb(253, 101, 0)"}}>Ventas</span> </a></div>
      </Form>

    </div>
  );
};

export default MainLogin;
