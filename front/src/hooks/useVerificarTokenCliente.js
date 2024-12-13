import { useContext,useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DataContext } from '../context/DataContext';
const useVerificarTokenCliente = () => {
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const {URL}  = useContext(DataContext)


  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem('Token');
      if (!token) {
        setIsValid(false);
        setIsLoading(false);    
        return;
      }
      
      try {
        const response = await axios.get(`${URL}cliente/verificar-token`, {
            params: {
              accesstoken: token
            },
          });
        if (!response.data || !response.data.Cliente) {
          setIsValid(false);
        }
        const Cliente = response.data.Cliente;
        localStorage.setItem('Documento', Cliente.Documento);
        localStorage.setItem('Deuda', Cliente.Deuda);
        localStorage.setItem('Nombre', Cliente.NombreCompleto);
      } catch (error) {
        setIsValid(false);
        console.log(error)
      }
      
      setIsLoading(false);
    };

    verificarToken();
  }, [navigate]);

  return { isValid, isLoading };
};

export default useVerificarTokenCliente;
