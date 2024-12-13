import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainCodigoBarra from "../components/MainCodigoBarra";


const CodigoBarra = () => {
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
      <MainCodigoBarra/>
      <Footer/>
    </div>
    
  )
}

export default CodigoBarra
