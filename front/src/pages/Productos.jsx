import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainProductos from "../components/MainProductos";


const Productos = () => {
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
      <MainProductos/>
      <Footer/>
    </div>
    
  )
}

export default Productos
