import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainPermisos from "../components/MainPermisos";


const Permisos = () => {
  const { isValid, isLoading } = useVerificarToken('menuusuario');
  if (isLoading) {
    return <div>Cargando...</div>; 
  }

  if (!isValid) {
    return <SesionExpirada />;
  }

  return (
   
    <div>
      <Header/>
      <MainPermisos/>
      <Footer/>
    </div>
    
  )
}

export default Permisos
