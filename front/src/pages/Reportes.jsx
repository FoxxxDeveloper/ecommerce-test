import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainReportes from "../components/MainReportes";


const Reportes = () => {
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
      <MainReportes/>
      <Footer/>
    </div>
    
  )
}

export default Reportes
