import HeaderClientes from "../../components/Clientes/HeaderClientes"
import FooterCliente from "../../components/Clientes/FooterCliente"
import LoginCliente from "./LoginCliente"
import MainDetalleCompraCliente from "../../components/Clientes/MainDetalleCompraCliente"
import useVerificarTokenCliente from "../../hooks/useVerificarTokenCliente";


const DetalleCompraCliente = () => {
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
       <MainDetalleCompraCliente/>  
       <FooterCliente/> 
    </div>
  )
}

export default DetalleCompraCliente