import { useState,useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/Clientes/LoginCliente.css";

import { DataContext } from '../../context/DataContext.jsx';

const LoginCliente = () => {
  const navigate = useNavigate();
  const {URL}  = useContext(DataContext)
  const [inputDocumento, setInputDocumento] = useState("");
  const [inputClave, setInputClave] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputDireccion, setInputDireccion] = useState("");
  const [inputNombreCompleto, setInputNombreCompleto] = useState("");
  const [inputTelefono, setInputTelefono] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [cardHeight, setCardHeight] = useState("440px");
  const [registrando, setRegistrando] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar la visibilidad de la contraseña
  const [error, setError] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('');
  const [errorClave, setErrorClave] = useState('');
 
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Alterna la visibilidad
  };


  
  const handleRegistrarse = () => {
    if (inputDocumento.length > 0 && (inputDocumento.length < 7 || inputDocumento.length > 8)) {
      return;
    } 
    if (inputDocumento.length > 0 && (inputDocumento.length < 7 || inputDocumento.length > 8)) {
      return;
    } 
    if (errorMessage!=""||errorClave!=""||errorTelefono!="" ) {
      return;
    } 
    setErrorMessage2("");
    if (
      inputDocumento.length === 0 ||
      inputNombreCompleto.length === 0 ||
      inputClave.length === 0 ||
      inputEmail.length === 0 ||
      inputDireccion.length === 0 ||
      inputTelefono.length === 0
    ) {
      setErrorMessage2("Todos los campos son obligatorios.");
    } else {
      axios
        .post(`${URL}cliente/registrar`, {
          Documento: inputDocumento,
          Clave: inputClave,
          NombreCompleto: inputNombreCompleto,
          Email: inputEmail,
          Telefono: inputTelefono,
          Direccion: inputDireccion,
        })
        .then((response) => {
          const { success, mensaje } = response.data;

          if (success) {  
            handleSubmit();
          } else {
            setErrorMessage2(mensaje);
          }
        })
        .catch((error) => {
          const errorMessage =
            error.response && error.response.data
              ? error.response.data.mensaje
              : error.message;

          setErrorMessage2(errorMessage);
        });
    }
  };
  const handleDocumentoChange = (e) => {
    const { value } = e.target;

    const documentoRegex = /^[0-9]{0,8}$/;

    if (documentoRegex.test(value)) {
      setInputDocumento(value);
      
      if (value.length > 0 && (value.length < 7 || value.length > 8)) {
        setError('Ingrese un DNI válido.');
      } else {
        setError(''); 
      }
    }
  };
  const handleCheckboxChange = (event) => {
    setErrorMessage("");
    setErrorMessage2("");
    setRegistrando(event.target.checked);
    if (event.target.checked) {
      setCardHeight("600px");
    } else {
      setCardHeight("400px");
    }
  };

  const handleClaveChange = (e) => {
    const { value } = e.target;
  
    const claveRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  
    setInputClave(value);
  
    if (claveRegex.test(value)) {
      setErrorClave(''); 
    } else {
      setErrorClave('La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número.');
    }
  };
  
  const handleTelefonoChange = (e) => {
    const { value } = e.target;
  
    const telefonoRegex = /^[0-9]{0,10}$/;
  
    if (telefonoRegex.test(value)) {
      setInputTelefono(value);
  
      if (value.length === 10) {
        if (value.startsWith('0')) {
          setErrorTelefono('Ingrese un número de celular válido (sin 0 ni 15).');
        } else {
          setErrorTelefono(''); 
        }
      } else {
        setErrorTelefono('Ingrese un número de celular válido de 10 digitos.');
      }
    }
  };
  
  const handleSubmit = async () => {
    if (inputDocumento.length > 0 && (inputDocumento.length < 7 || inputDocumento.length > 8)) {
      return;
    } 
    setErrorMessage("");
    try {
      const response = await axios.post(`${URL}cliente/login/`, {
        Documento: inputDocumento,
        Clave: inputClave,
      });
      console.log(response.data)
      const Token = response.data.token;
      const IdCliente = response.data.cliente.IdCliente;

      localStorage.setItem("Token", Token);
      localStorage.setItem("IdCliente", IdCliente);

      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage("DNI y/o contraseña incorrectos");
      } else if (error.response && error.response.status === 403) {
        setErrorMessage("Usuario inactivo");
      } else {
        setErrorMessage("Error del servidor. Inténtalo más tarde.");
      }
    }
  };

  return (
    <div className="section bodylogin">
      <div className="container">
        <div className="row full-height justify-content-center">
          <div className="col-12 text-center align-self-center py-5">
            <div className="section pb-5 pt-5 pt-sm-2 text-center">
              <h6 className="mb-0 pb-3" onClick={() => document.getElementById('reg-log').click()}>
                <span >Iniciar Sesion </span>
                <span>Registrarse</span>
              </h6>

              <input
                className="checkbox"
                type="checkbox"
                id="reg-log"
                name="reg-log"
                onChange={handleCheckboxChange}
                
              />
              <label htmlFor="reg-log"></label>
              <div
                className="card-3d-wrap mx-auto"
                style={{ height: cardHeight }}
              >
                <div className="card-3d-wrapper">
                  {!registrando ? 
                    <div className="card-front">
                    <div className="center-wrap">
                      <div className="section text-center">
                        <h4 className="mb-4 pb-3 blacktext">Iniciar Sesion</h4>

                        <div className="form-group">
                          <input
                            type="text"
                            name="dni"
                            value={inputDocumento}
                            onChange={handleDocumentoChange}
                            className="form-style"
                            placeholder="Documento / DNI"
                          />
                           <i className="perso input-icon uil uil-postcard"></i>
                           {error && <span className="error-message2">{error}</span>}
                        </div>
                        <div className="form-group mt-2 mb-3">
                          <input
                            type={showPassword ? "text" : "password"} // Cambia el tipo de input
                            value={inputClave}
                            onChange={(e) => setInputClave(e.target.value)}
                            className="form-style"
                            placeholder="Contraseña"
                          />
                          <i
                            className="perso input-icon uil uil-lock-alt"
                            onClick={togglePasswordVisibility}
                          ></i>
                          {/* Ícono para mostrar/ocultar contraseña */}
                          <i
                            className={`perso2 input-icon uil ${
                              showPassword ? "uil-eye-slash" : "uil-eye"
                            }`}
                            onClick={togglePasswordVisibility}
                          ></i>
                        </div>
                        {errorMessage && (
                          <div className="error-message">{errorMessage}</div>
                        )}
                        <button onClick={handleSubmit} className="btnlogin btn mt-4">
                          Ingresar
                        </button>
                        <p className="mb-0 mt-4 text-center">
                          <a
                            href="Link a wsp para pedir el cambio"
                            className="link"
                          >
                            ¿Perdiste tu contraseña?
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>:<div></div>
                  

                  }
                  {registrando ? (
                    <div className="card-back">
                      <div className="center-wrap">
                        <div className="section text-center">
                          <h4 className="mb-3 pb-3 blacktext">Registrarse</h4>
                          <div className="form-group">
                            <input
                              type="number"
                              name="dni"
                              min={1000000}
                              value={inputDocumento}
                              onChange={handleDocumentoChange}
                              
                              className="form-style"
                              placeholder="Documento / DNI"
                            />
                            <i className="perso input-icon uil uil-postcard"></i>
                            {error && <span className="error-message2">{error}</span>}
                          </div>
                          <div className="form-group mt-2 mb-3">
  <input
    type={showPassword ? "text" : "password"} // Cambia el tipo de input
    value={inputClave}
    onChange={handleClaveChange}  // Cambié a handleClaveChange
    className="form-style"
    placeholder="Contraseña"
  />
  <i
    className="perso input-icon uil uil-lock-alt"
    onClick={togglePasswordVisibility}
  ></i>
  <i
    className={`perso2 input-icon uil ${showPassword ? "uil-eye-slash" : "uil-eye"}`}
    onClick={togglePasswordVisibility}
  ></i>
  {errorClave && <span className="error-message2">{errorClave}</span>} {/* Muestra el error */}
</div>

                          <div className="form-group mt-2">
                            <input
                              type="text"
                              name="name"
                              value={inputNombreCompleto}
                              onChange={(e) =>
                                setInputNombreCompleto(e.target.value)
                              }
                              className="form-style"
                              placeholder="Nombre Completo"
                            />
                            <i className="perso input-icon uil uil-user"></i>
                          </div>
                          <div className="form-group mt-2">
                            <input
                              type="text"
                              name="email"
                              value={inputEmail}
                              onChange={(e) => setInputEmail(e.target.value)}
                              className="form-style"
                              placeholder="Email"
                            />
                            <i className="perso input-icon uil uil-at"></i>
                          </div>
                         
<div className="form-group mt-2">
  <input
    type="text"
    name="tel"
    value={inputTelefono}
    onChange={handleTelefonoChange}
    className="form-style"
    placeholder="Número de Teléfono"
  />
  <i className="perso input-icon uil uil-phone"></i>
  {errorTelefono && <span className="error-message2">{errorTelefono}</span>}
</div>


                          <div className="form-group mt-2">
                            <input
                             type="text"
                             name="direccion"
                              value={inputDireccion}
                              onChange={(e) =>
                                setInputDireccion(e.target.value)
                              }
                              className="form-style"
                              placeholder="Direccion"
                            />
                            <i className="perso input-icon uil uil-location-point"></i>
                          </div>
                          {errorMessage2 && (
                            <div className="error-message">{errorMessage2}</div>
                          )}
                          <button
                            onClick={handleRegistrarse}
                            className="btnlogin btn mt-4"
                          >
                            Registrarse
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCliente;
