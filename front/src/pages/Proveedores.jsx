import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainProveedores from "../components/MainProveedores";


const Proveedores = () => {
  const { isValid, isLoading } = useVerificarToken('menuproveedores');
  if (isLoading) {
    return <div>Cargando...</div>; 
  }

  if (!isValid) {
    return <SesionExpirada />;
  }

  return (
   
    <div>
      <Header/>
      <MainProveedores/>
      <Footer/>
    </div>
    
  )
}

export default Proveedores
