import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainCuentaCorriente from "../components/MainCuentaCorriente";


const CuentaCorriente = () => {
  const { isValid, isLoading } = useVerificarToken('menuclientes');
  if (isLoading) {
    return <div>Cargando...</div>; 
  }

  if (!isValid) {
    return <SesionExpirada />;
  }

  return (
   
    <div>
      <Header/>
      <MainCuentaCorriente/>
      <Footer/>
    </div>
    
  )
}

export default CuentaCorriente
