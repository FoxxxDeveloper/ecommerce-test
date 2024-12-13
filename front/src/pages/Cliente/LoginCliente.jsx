import '../../css/LoginCliente.css'
import {useState, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios';
import { DataContext } from '../../context/DataContext';
import logo from '../../assets/foxSoftware.png'
import Footer from '../../components/Footer';
const LoginCliente = () => {

    const {URL}  = useContext(DataContext)
    const navigate = useNavigate();
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage(''); 
        await delay(500);

        try {
            const response = await axios.post(`${URL}cliente/login/`, {
                Usuario: inputUsername,
                Clave: inputPassword,
            });

            const token = response.data.token;
            localStorage.setItem('Token', token);

            navigate('/cuentacliente');
        } catch (error) {
            setErrorMessage('Usuario y/o clave incorrecta'); 
        } finally {
            setLoading(false);
        }
    };
         
    
    
      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

  return (
    <>

  

    <div className="bodyclient fondoLogin ">
         
    <section>
        <form onSubmit={handleSubmit}>
        <img src={logo} alt="FoxVentas" className="logo2" />
            <h1>Ingreso</h1>
            <div className="inputbox">
                <ion-icon name="person-outline"></ion-icon>
                <input
                    type="text"
                    required
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                />
                <label htmlFor="">Email o Telefono</label>
            </div>
            <div className="inputbox">
                <ion-icon name="lock-closed-outline"></ion-icon>
                <input
                    type="password"
                    required
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                />
                <label htmlFor="">Clave</label>
            </div>
            {errorMessage && <p style={{color:'#fff'}} className="error-message">{errorMessage}</p>} {/* Mostrar mensaje de error */}
            <button className='buttonlogin' type="submit" disabled={loading}>
                {loading ? 'Cargando...' : 'Ingresar'}
            </button>
        </form>
    </section>
    
</div>
<Footer/>
</>
  )
}

export default LoginCliente 
