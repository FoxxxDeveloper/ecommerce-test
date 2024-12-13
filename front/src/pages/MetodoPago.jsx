import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainMetodoPago from "../components/MainMetodoPago";


const MetodoPago = () => {
  const { isValid, isLoading } = useVerificarToken('menuconfiguracion');
  if (isLoading) {
    return <div>Cargando...</div>; 
  }

  if (!isValid) {
    return <SesionExpirada />;
  }

  return (
   
    <div>
      <Header/>
      <MainMetodoPago/>
      <Footer/>
    </div>
    
  )
}

export default MetodoPago
