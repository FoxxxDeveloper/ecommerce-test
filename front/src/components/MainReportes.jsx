import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import { DataContext } from '../context/DataContext.jsx';
import  { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import es from 'date-fns/locale/es';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShop } from '@fortawesome/free-solid-svg-icons';
import { MDBInputGroup } from 'mdb-react-ui-kit';


const MainReportes = () => {

  
     //REPORTES
  const [ventasPorCategorias, setVentasPorCategorias] = useState([]);
  const [ventaPorMetodosPagos, setVentasPorMetodosPagos] = useState([]);
  const [clienteConMasCompras, setClienteConMasCompras] = useState([]);
 
  const [ventasPorUsuario, setVentasPorUsuario] = useState([])
  const [totalVentas, setTotalVentas] = useState(0)
  const [chartData, setChartData] = useState([])


  // ¿ENCONTRO REPORTES?
  const [encontroVentaPorCategoria, setEncontroVentaPorCategoria] = useState(false)
  const [encontroVentaPorMetodosPagos, setEncontroVentaPorMetodosPagos] = useState(false)
  const [encontroClienteConMasCompras, setEncontroClienteConMasCompras] = useState(false)
  const [encontroDatosGeneral, setEncontroDatosGeneral] = useState(false)
  const [encontroVentasPorUsuario, setEncontroVentasPorUsuario] = useState(false)

  
  const [fechaInicioSeleccionada, setFechaInicioSeleccionada] = useState(new Date());
  const [fechaFinSeleccionada, setFechaFinSeleccionada] = useState(new Date());
  const SuperAdmin = localStorage.getItem("SA") ==1? true:false;


  
  const Token = localStorage.getItem("Token");
  const {URL}  = useContext(DataContext)
  const [IdSucursal, setIdSucursal] = useState(localStorage.getItem("IdSucursal"));
  const [suc, setSuc] = useState([])


  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

 //ultimo dia 
 const ultimoDiaParaElegir = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);


  const traerVentasPorCategorias = () => {
    const formattedFechaInicio = formatDate(fechaInicioSeleccionada);
    const formattedFechaFin = formatDate(fechaFinSeleccionada);

    axios.get(`${URL}reporte/ventasporcategoria`, {
        params: {
            IdSucursal,         
            FechaInicio: formattedFechaInicio,
            FechaFin: formattedFechaFin,
            accesstoken: Token 
        }
    })
    .then((response) => {
        
        setVentasPorCategorias(response.data);
       
        const TotalVentasFormated = formatTooltipValue(response.data.reduce((total, item) => total + item.SubTotal, 0))
        setTotalVentas(TotalVentasFormated)
        setEncontroVentaPorCategoria(response.data.length>0)
    })
    .catch((error) => {
        console.log(error);
    });
};


const traerVentasPorMetodosDePago = () => {
  const formattedFechaInicio = formatDate(fechaInicioSeleccionada);
  const formattedFechaFin = formatDate(fechaFinSeleccionada);

  axios.get(`${URL}reporte/ventaspormetodopago`, {
      params: {
          IdSucursal,         
          FechaInicio: formattedFechaInicio,
          FechaFin: formattedFechaFin,
          accesstoken: Token 
      }
  })
  .then((response) => {
      setVentasPorMetodosPagos(response.data);
      setEncontroVentaPorMetodosPagos(response.data.length>0)
      
  })
  .catch((error) => {
      console.log(error);
  });
};

const traerClienteConMayorCompras = () => {
  const formattedFechaInicio = formatDate(fechaInicioSeleccionada);
  const formattedFechaFin = formatDate(fechaFinSeleccionada);

  axios.get(`${URL}reporte/clientesconmascompras`, {
      params: {
          IdSucursal,         
          FechaInicio: formattedFechaInicio,
          FechaFin: formattedFechaFin,
          accesstoken: Token 
      }
  })
  .then((response) => {
   
      
      setClienteConMasCompras(response.data);
      setEncontroClienteConMasCompras(response.data.length>0)
  })
  .catch((error) => {
      console.log(error);
  });
};


const traerDatosGeneral = () => {
    const formattedFechaInicio = formatDate(fechaInicioSeleccionada);
    const formattedFechaFin = formatDate(fechaFinSeleccionada);

    Promise.all([
      axios.get(`${URL}reporte/totalcompras`, {
        params: {
          IdSucursal,
          FechaInicio: formattedFechaInicio,
          FechaFin: formattedFechaFin,
          accesstoken: Token
        }
      }),
      axios.get(`${URL}reporte/totalganancias`, {
        params: {
          IdSucursal,
          FechaInicio: formattedFechaInicio,
          FechaFin: formattedFechaFin,
          accesstoken: Token
        }
      }),
      axios.get(`${URL}reporte/totalgastos`, {
        params: {
          IdSucursal,
          FechaInicio: formattedFechaInicio,
          FechaFin: formattedFechaFin,
          accesstoken: Token
        }
      })
    ])
    .then(([comprasResponse, gananciasResponse, gastosResponse]) => {

      
      

      const datos = [
        {
          name: 'Compras',
          Total: comprasResponse.data[0].TotalCompras || 0,
          Monto: comprasResponse.data[0].TotalMontoCompras || 0,
        },
        {
          name: 'Ganancias',
          Total: gananciasResponse.data[0].CantidadVendida || 0,
          Monto: gananciasResponse.data[0].MargenGanancia || 0,
        },
        {
          name: 'Gastos',
          Total: gastosResponse.data[0].TotalComprasGastos || 0,
          Monto: gastosResponse.data[0].TotalMontoComprasGastos || 0,
        },
      ];
setChartData(datos)
const hayDatos = datos.some(item => item.Total > 0);
setEncontroDatosGeneral(hayDatos);
    })
    .catch((error) => {
      console.log(error);
    });
  };










const traerVentasPorUsuario= () => {
  const formattedFechaInicio = formatDate(fechaInicioSeleccionada);
  const formattedFechaFin = formatDate(fechaFinSeleccionada);

  axios.get(`${URL}reporte/ventasporusuario`, {
      params: {
          IdSucursal,         
          FechaInicio: formattedFechaInicio,
          FechaFin: formattedFechaFin,
          accesstoken: Token 
      }
  })
  .then((response) => {
      setVentasPorUsuario(response.data);
      setEncontroVentasPorUsuario(response.data.length>0)
  })
  .catch((error) => {
      console.log(error);
  });

};


const generarReportes= () => {
  traerClienteConMayorCompras();
  traerVentasPorCategorias()
  traerVentasPorMetodosDePago()
  traerVentasPorUsuario()
  traerDatosGeneral()
  };
  


const Colors = [
  "#FF5733", // Tu color principal (naranja)
  "#FFC107", // Amarillo dorado
  "#4CAF50", // Verde
  "#2196F3", // Azul
  "#9C27B0", // Morado
  "#FF9800", // Naranja
  "#E91E63", // Rosa
  "#00BCD4", // Cian
];

const formatTooltipValue = (value) => `$${value.toLocaleString()}`;
const traerSucursales = () =>{
    axios.get(`${URL}sucursal?accesstoken=${Token}`).then((response)=>{
        setSuc(response.data)
    }).catch((error)=>{
        console.log('Error al obtener las sucursales', error)
    })
  }
  useEffect(() => {
        traerSucursales()
    }, []); 

    
  return (
    <>
  <h2 className="mt-3"><strong>REPORTE DE SUCURSAL</strong></h2>
  <h4 className="naranja">Gráficos e información sobre tu negocio</h4>
  <div className='container'>
 
  <div className="control-masivo-container">
  <h3 className="control-masivo-title">Generación de reporte.</h3>
  <p className="control-masivo-subtitle">Seleccione los datos necesarios para obtener el reporte correspondiente.</p>
  {SuperAdmin && (
    <>
     <p style={{color:'#fff'}}>SUCURSAL</p>
  <MDBInputGroup>
    
    <span className="input-group-text ">
      <FontAwesomeIcon icon={faShop} size="lg" style={{ color: '#FD6500' }} />
    </span>
   
    <Form.Select aria-label="Sucursal"  id="sucursal" value={IdSucursal} onChange={(e) => setIdSucursal(e.target.value)}>
      <option key={0} value="0" disabled>--Seleccione una sucursal--</option>
      {suc.map((s) => (
        <option key={s.IdSucursal} value={s.IdSucursal}>{s.Nombre}</option>
      ))}
    </Form.Select>
  </MDBInputGroup>
  </>
)}

   <div className='container'>
      <div className='row'>
        <div className='col'><br />
          <p style={{color:'#fff'}}>FEHCA INICIO</p>
            <DatePicker
              selected={fechaInicioSeleccionada}
              onChange={(date) => setFechaInicioSeleccionada(date)}
              className="form-control custom-date-picker custom-datepicker-wrapper"
              dateFormat="yyyy/MM/d"
              placeholderText="Ingrese una fecha"
              maxDate={ultimoDiaParaElegir}
              locale={es}
            />
        </div>
        <div className='col'><br />
        <p  style={{color:'#fff'}}>FECHA FIN</p>
        <DatePicker
          selected={fechaFinSeleccionada}
          onChange={(date) => setFechaFinSeleccionada(date)}
          className="form-control custom-date-picker custom-datepicker-wrapper"
          dateFormat="yyyy/MM/d"
          placeholderText="Ingrese una fecha"
          maxDate={ultimoDiaParaElegir}
          locale={es}
        />
        </div>
      </div>
    
    </div>        
            
       
        <div className='contenedorBotonesss'>
        <Button style={{color:'white'}} className="btn btn-danger m-2 bgnaranja" onClick={generarReportes}>
                            <FontAwesomeIcon icon={faSearch} style={{color: '#fff'}} size="lg"></FontAwesomeIcon> BUSCAR
                        </Button>
        </div>
    </div>
 

                       
            </div>
 <br />
 <br />
 <br />
  {/* VENTAS TOTALES POR CATEGORÍA */}
<div>
  {encontroVentaPorCategoria ? (
    <>
      <h2 >VENTAS TOTALES POR CATEGORÍA</h2>
      <div className="row" style={{ justifyContent: 'center' }}>
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                dataKey="SubTotal" 
                nameKey="Categoria" 
                data={ventasPorCategorias}
                innerRadius={120}
                outerRadius={200}
                fill="#82ca9d"
                labelLine={false} // Desactiva las líneas de etiquetas
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Personaliza la etiqueta
              >
                {ventasPorCategorias.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltipValue} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p style={{textAlign:'center', color:'red'}}><strong>TOTAL DE VENTAS: {totalVentas}</strong> </p>
      </div>
    </>
  ) : (
    <h5>No se encontraron datos de ventas por categoría para la fecha seleccionada.</h5>
  )}
</div>


  {/* VENTAS POR MÉTODO DE PAGO */}
  <div>
    {encontroVentaPorMetodosPagos ? (
     <>
     <h2>VENTAS POR MÉTODO DE PAGO</h2>
     <div className="row" style={{ justifyContent: 'center' }}>
       <div className="col-xl-6 col-lg-8 col-md-8 col-sm-10" style={{ display: 'flex', justifyContent: 'center' }}>
         <ResponsiveContainer width="100%" height={400}>
           <BarChart data={ventaPorMetodosPagos}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey="MetodoPago" />
             <YAxis domain={[0, 'auto']} />
             <Tooltip formatter={(value) => `$${value}`} />
             <Legend />
             <Bar 
               dataKey="MontoTotalVentas" 
               name="Monto" 
               barSize={70}
             >
               {ventaPorMetodosPagos.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
               ))}
             </Bar>
           </BarChart>
         </ResponsiveContainer>
       </div>
     </div>
   </>
    ) : (
      <h5>No se encontraron datos de ventas por método de pago para la fecha seleccionada.</h5>
    )}
  </div>

  {/* CLIENTE CON MÁS COMPRAS */}
  <div>
    {encontroClienteConMasCompras ? (
      <>
      <h2>CLIENTE CON MÁS COMPRAS</h2>
          <div className="row" style={{ justifyContent: 'center' }}>
            <div className="col-xl-6 col-lg-8 col-md-8 col-sm-10">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={clienteConMasCompras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="NombreCompleto" />
                  <YAxis domain={[0, 'auto']} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Bar 
                    dataKey="TotalGastado" 
                    name="Total en compras" 
                    fill="#8884d8" 
                    barSize={70}
                  >
                    {clienteConMasCompras.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
      </>
    ) : (
      <h5>No se encontraron datos del cliente con más compras para la fecha seleccionada.</h5>
    )}
  </div>

  {/* DATOS GENERAL */}
<div>
  {encontroDatosGeneral ? (
    <>
      <h2>REPORTE GENERAL</h2>
      <div className="row" style={{ justifyContent: 'center' }}>
        <div className="col-xl-6 col-lg-8 col-md-8 col-sm-10">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 'auto']} />
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend />
              <Bar dataKey="Total" name="Total" fill="#FF5733" barSize={70} />
              <Bar dataKey="Monto" name="Monto" fill="#FF8C00" barSize={70} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  ) : (
    <h5>No se encontraron datos de compras para la fecha seleccionada.</h5>
  )}
</div>

 {/* VENTAS POR USUARIO */}
<div>
  {encontroVentasPorUsuario ? (
    <>
      <h2>VENTAS POR USUARIO</h2>
      <div className="row" style={{ justifyContent: 'center' }}>
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                dataKey="SubTotal" 
                nameKey="Usuario" 
                data={ventasPorUsuario}
                innerRadius={120}
                outerRadius={200}
                fill="#82ca9d"
                labelLine={false} // Desactiva las líneas de etiquetas
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Personaliza la etiqueta
              >
                {ventasPorUsuario.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltipValue} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  ) : (
    <h5>No se encontraron datos de ventas por usuario para la fecha seleccionada.</h5>
  )}
</div>
</>

    
  )
}

export default MainReportes
