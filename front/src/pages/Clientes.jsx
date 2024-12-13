import Footer from "../components/Footer"
import Header from "../components/Header"
import useVerificarToken from "../hooks/useVerificarToken";
import SesionExpirada from "../components/SesionExpirada"
import MainClientes from "../components/MainClientes";


const Clientes = () => {
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
      <MainClientes/>
      <Footer/>
    </div>
    
  )
}

export default Clientes
