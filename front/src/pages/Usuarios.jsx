import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainUsuarios from "../components/MainUsuarios";


const Usuarios = () => {
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
      <MainUsuarios/>
      <Footer/>
    </div>
    
  )
}

export default Usuarios
