import { useNavigate } from 'react-router-dom';
import '../css/modal.css';

const SesionExpirada = () => {
  const navigate = useNavigate();

  const handleAceptar = () => {
    navigate('/admin');
  };

  return (
    <div className="fondoExpirado">
      <div className="modal-expirado">
        <h2>Sesión Expirada</h2>
        <p>Tu sesión ha finalizado o no tienes permisos suficientes para acceder. Por favor, inicia sesión nuevamente.</p>
        <button onClick={handleAceptar}>Aceptar</button>
      </div>
    </div>
  );
};

export default SesionExpirada;
