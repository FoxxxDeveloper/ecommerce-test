/* eslint-disable no-undef */
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { login,ventas, paquetes, categorias, clientes, codigobarra, cuentacorriente, detallecompra, detalleventa, finanzas,metodopago,permisos,productos,proveedores,compras,reportes,usuarios, home,loginCliente } from './routes/routes.js'
import DataProvider from './context/DataProvider.jsx'
import Login from './pages/Login.jsx'
import RegistrarVenta from './pages/RegistrarVenta.jsx'
import Categorias from './pages/Categorias.jsx'
import Clientes from './pages/Clientes.jsx'
import CodigoBarra from './pages/CodigoBarra.jsx'
import CuentaCorriente from './pages/CuentaCorriente.jsx'
import DetalleCompra from './pages/DetalleCompra.jsx'
import DetalleVenta from './pages/DetalleVenta.jsx'
import Finanzas from './pages/Finanzas.jsx'
import MetodoPago from './pages/MetodoPago.jsx'
import Permisos from './pages/Permisos.jsx'
import Productos from './pages/Productos.jsx'
import Proveedores from './pages/Proveedores.jsx'
import RegistrarCompra from './pages/RegistrarCompra.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Paquetes from './pages/Paquetes.jsx'
import Reportes from './pages/Reportes.jsx'
import LoginCliente from './pages/Cliente/LoginCliente.jsx'
import Home from './pages/Cliente/Home.jsx'

  


ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
  
    <BrowserRouter basename='/sistemas/test'>
   

    
      <DataProvider>
      
            <Routes>
              
                <Route path={login} element={<Login/>}/>
                <Route path={categorias} element={<Categorias/>}/>
                <Route path={clientes} element={<Clientes/>}/>
                <Route path={codigobarra} element={<CodigoBarra/>}/>
                <Route path={cuentacorriente} element={<CuentaCorriente/>}/>
                <Route path={detallecompra} element={<DetalleCompra/>}/>
                <Route path={detalleventa} element={<DetalleVenta/>}/>
                <Route path={finanzas} element={<Finanzas/>}/>
                <Route path={metodopago} element={<MetodoPago/>}/>
                <Route path={permisos} element={<Permisos/>}/>
                <Route path={productos} element={<Productos/>}/>
                <Route path={proveedores} element={<Proveedores/>}/>
                <Route path={compras} element={<RegistrarCompra/>}/>
                <Route path={ventas} element={<RegistrarVenta/>}/>
                <Route path={reportes} element={<Reportes/>}/>
                <Route path={usuarios} element={<Usuarios/>}/>
                <Route path={paquetes} element={<Paquetes/>}/>
               
                 {/*CLIENTES */ }
                <Route path={loginCliente} element={<LoginCliente/>}/>
                <Route path={home} element={<Home/>}/>
              </Routes>
        
      </DataProvider>
  
    </BrowserRouter>
   
  //</React.StrictMode>,
)
