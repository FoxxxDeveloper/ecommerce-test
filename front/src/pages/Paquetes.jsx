import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainPaquetes from "../components/MainPaquetes";



const Paquetes = () => {
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
      <MainPaquetes/>
      <Footer/>
    </div>
    
  )
}

export default Paquetes
