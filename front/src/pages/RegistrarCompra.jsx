import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainRegistrarCompra from "../components/MainRegistrarCompra";


const RegistrarCompra = () => {
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
      <MainRegistrarCompra/>
      <Footer/>
    </div>
    
  )
}

export default RegistrarCompra
