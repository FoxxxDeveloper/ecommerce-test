import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainFinanzas from "../components/MainFinanzas";


const Finanzas = () => {
  const { isValid, isLoading } = useVerificarToken('menureportes');
  if (isLoading) {
    return <div>Cargando...</div>; 
  }

  if (!isValid) {
    return <SesionExpirada />;
  }

  return (
   
    <div>
      <Header/>
      <MainFinanzas/>
      <Footer/>
    </div>
    
  )
}

export default Finanzas
