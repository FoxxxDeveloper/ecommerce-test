import MainCuentaCorrienteCliente from "../../components/Clientes/MainCuentaCorrienteCliente";
import useVerificarTokenCliente from "../../hooks/useVerificarTokenCliente";
import { useNavigate } from "react-router-dom";
const HistorialPrestamos = () => {
  const { isValid, isLoading } = useVerificarTokenCliente();
  const navigate = useNavigate(); 

  if (isLoading) {
    return <div>Cargando...</div>; 
  }

  if (!isValid) {
    navigate("/");
    return null;
  }
  
  return (
    <MainCuentaCorrienteCliente/>
  )
}

export default HistorialPrestamos