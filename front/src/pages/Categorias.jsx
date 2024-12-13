import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainCategorias from "../components/MainCategorias";


const Categorias = () => {
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
      <MainCategorias/>
      <Footer/>
    </div>
    
  )
}

export default Categorias
