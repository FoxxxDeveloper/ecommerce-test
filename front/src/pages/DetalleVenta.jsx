import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainDetalleVenta from "../components/MainDetalleVenta";


const DetalleVenta = () => {
  const { isValid, isLoading } = useVerificarToken('menuventas');
  if (isLoading) {
    return <div>Cargando...</div>; 
  }

  if (!isValid) {
    return <SesionExpirada />;
  }

  return (
   
    <div>
      <Header/>
      <MainDetalleVenta/>
      <Footer/>
    </div>
    
  )
}

export default DetalleVenta
