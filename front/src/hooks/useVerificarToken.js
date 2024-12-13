import { useContext,useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DataContext } from '../context/DataContext';
const useVerificarToken = (NombreMenu) => {
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
        const response = await axios.get(`${URL}usuario/verificar-token`, {
            params: {
              accesstoken: token,
              NombreMenu, 
            },
          });
        if (!response.data || !response.data.Usuario) {
          setIsValid(false);
        }
      } catch (error) {
        setIsValid(false);
      }

      setIsLoading(false);
    };

    verificarToken();
  }, [navigate,NombreMenu]);

  return { isValid, isLoading };
};

export default useVerificarToken;
