/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React from 'react';
import Pagination from 'react-bootstrap/Pagination';

const Paginacion = ({productosPorPagina, total, actualPagina, setActualPagina}) => {

    const numeroPagina = []

    for (let i = 1;i<= Math.ceil(total/productosPorPagina);i++){
        numeroPagina.push(i)
    }


    const onPaginaAnterior = () =>{
        setActualPagina (actualPagina-1)
    }

    const onPaginaSiguiente = () =>{
        setActualPagina (actualPagina+1)
    }

    const onPaginaEspecifica=(n) =>{
        setActualPagina(n)
    }

  return (  <Pagination>
    {actualPagina !== 1 && (
      <Pagination.Prev onClick={onPaginaAnterior} />
    )}
{actualPagina === 1 || actualPagina===2 ? 
       <></>: <Pagination.Item
       key={1}
       active={1 === actualPagina}
       onClick={() => onPaginaEspecifica(1)}
     >
       1
     </Pagination.Item>
    }
    

    {actualPagina > 3 && <Pagination.Ellipsis />}

    {numeroPagina.map((noPage) => {
      if (noPage > actualPagina - 2 && noPage < actualPagina + 2) {
        return (
          <Pagination.Item
            key={noPage}
            active={noPage === actualPagina}
            onClick={() => onPaginaEspecifica(noPage)}
          >
            {noPage}
          </Pagination.Item>
        );
      }
      return null;
    })}

    {actualPagina < numeroPagina.length - 2 && <Pagination.Ellipsis />}



    {actualPagina === numeroPagina.length || actualPagina===numeroPagina.length-1 ? 
       <></>:  <Pagination.Item
       key={numeroPagina.length}
       active={numeroPagina.length === actualPagina}
       onClick={() => onPaginaEspecifica(numeroPagina.length)}
     >
       {numeroPagina.length}
     </Pagination.Item>
    }



   

    {actualPagina < numeroPagina.length && (
      <Pagination.Next onClick={onPaginaSiguiente} />
    )}
  </Pagination>
  );
};

export default Paginacion;
