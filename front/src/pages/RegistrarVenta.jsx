import Footer from "../components/Footer"
import Header from "../components/Header"
import MainRegistrarVenta from "../components/MainRegistrarVenta"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"


const RegistrarVenta = () => {
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
      <MainRegistrarVenta/>
      <Footer/>
    </div>
    
  )
}

export default RegistrarVenta
