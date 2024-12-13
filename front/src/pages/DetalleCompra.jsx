import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainDetalleCompra from "../components/MainDetalleCompra";


const DetalleCompra = () => {
  const { isValid, isLoading } = useVerificarToken('menucompras');
  if (isLoading) {
    return <div>Cargando...</div>; 
  }

  if (!isValid) {
    return <SesionExpirada />;
  }

  return (
   
    <div>
      <Header/>
      <MainDetalleCompra/>
      <Footer/>
    </div>
    
  )
}

export default DetalleCompra
