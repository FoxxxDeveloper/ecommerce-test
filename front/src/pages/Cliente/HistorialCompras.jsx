import HeaderClientes from "../../components/Clientes/HeaderClientes"
import FooterCliente from "../../components/Clientes/FooterCliente"
import MainHistorialCompras from "../../components/Clientes/MainHistorialCompras"
import useVerificarTokenCliente from "../../hooks/useVerificarTokenCliente";
import LoginCliente from "./LoginCliente"


const HistorialCompras = () => {

    const { isValid, isLoading } = useVerificarTokenCliente();
    if (isLoading) {
      return <div>Cargando...</div>; 
    }
  
    if (!isValid) {
      return <LoginCliente/>;
    }


  return (
    <div>
       <HeaderClientes/>
       <MainHistorialCompras/>  
       <FooterCliente/> 
    </div>
  )
}

export default HistorialCompras