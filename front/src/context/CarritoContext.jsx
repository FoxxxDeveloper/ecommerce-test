import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';  // Importar PropTypes

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(cart));
  }, [cart]);

  const agregarAlCarrito = (producto) => {
    setCart((prevCart) => {
      const productoExistente = prevCart.find((item) => item.IdProducto === producto.IdProducto);
      if (productoExistente) {
        return prevCart.map((item) =>
          item.IdProducto === producto.IdProducto
            ? { ...item, Cantidad: item.Cantidad + producto.Cantidad }
            : item
        );
      } else {
        return [...prevCart, producto];
      }
    });
  };
  

  const quitarDelCarrito = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.IdProducto !== productId));
  };

  return (
    <CarritoContext.Provider value={{ cart, agregarAlCarrito, quitarDelCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};

// Validar las props del componente
CarritoProvider.propTypes = {
  children: PropTypes.node.isRequired,  // Definir que children es requerido y es de tipo node
};
