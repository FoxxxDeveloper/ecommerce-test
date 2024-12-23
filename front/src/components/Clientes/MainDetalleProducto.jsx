import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DataContext } from '../../context/DataContext.jsx';
import '../../css/Clientes/Productos.css';
import { CarritoContext } from '../../context/CarritoContext';
const MainDetalleProducto = () => {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    comment: '',
    rating: 5,
  });
  const [rating, setRating] = useState(0);

  const id = new URLSearchParams(window.location.search).get('id');
  const { URL } = useContext(DataContext);
  const { agregarAlCarrito } = useContext(CarritoContext);

  


  useEffect(() => {
    axios
      .get(`${URL}producto/detalles/${id}`)
      .then((response) => {
        const data = response.data;
        setProduct(data);
        try {
          setReviews(JSON.parse(data.Reseñas) || []);
        } catch (e) {
          setReviews([]);
          console.error('Error parsing reviews:', e);
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [URL, id]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!product) {
    return <div className="loading-message">Cargando...</div>;
  }

  const handleAddReview = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  const calculateRatingSummary = () => {
    const summary = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      summary[review.Calificacion]++;
    });
    return summary;
  };

  const ratingSummary = calculateRatingSummary();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReview = {
      ...formData,
      FechaRegistro: new Date().toISOString(),
    };
    handleAddReview(newReview);
    setFormData({ name: '', title: '', comment: '', rating: 5 });
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) {
      return '#2ecc71'; 
    } else if (percentage >= 50) {
      return '#f39c12'; 
    } else {
      return '#e74c3c'; 
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  return (
    <div className="product-detail-container">
      <div className="product-info">
        <div className="product-image">
          <img src={product.Foto || '/assets/default.jpg'}   onError={(e) => {
          e.target.src = "https://cdn-icons-png.flaticon.com/512/468/468833.png"; 
        }} alt={product.Nombre} />
        </div>
        <div className="product-description">
          <h1>{product.Nombre}</h1>
          <p>{product.Descripcion}</p>
          <span className="price">${product.PrecioVenta}</span>
          <div className="quantity-control">
          <div className="quantity-text">
    <p>Cantidad: </p>
  </div>
  <input
  min={1}
  type="number"
  value={cantidad}
  onChange={(e) => setCantidad(parseInt(e.target.value, 10))}
/>
<button
  onClick={() => agregarAlCarrito({ ...product, Cantidad: cantidad })}
>
  Añadir al Carrito
</button>

          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Valoraciones y Reseñas</h2>
        <div className="rating-summary">
          <div className="average-rating">
            <div className="stars-container">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={`star ${index < Math.floor(product.PromedioCalificacion) ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
              <span className="average-score">{product.PromedioCalificacion.toFixed(1)}</span>
              <span> Basado en {reviews.length} reseñas</span>
            </div>
          </div>

          <div className="rating-bars">
            {Object.entries(ratingSummary).map(([stars, count]) => {
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={stars} className="rating-bar">
                  <span className="stars-label">{stars} Estrellas</span>
                  <div className="bar-container">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getProgressBarColor(percentage),
                      }}
                    />
                  </div>
                  <span className="percentage">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className="review-item">
              <h4>{review.Titulo}</h4>
              <p>{review.Resena}</p>
              <div className="review-meta">
                {/* Mostrar estrellas según la calificación */}
                <div className="stars-container">
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <span
                      key={starIndex}
                      className={`star ${starIndex < review.Calificacion ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <small>{new Date(review.FechaRegistro).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="add-review">
            <h5>Deja la reseña de este producto.</h5>
            <br />
          <form onSubmit={handleSubmit} className="review-form">
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="title"
              placeholder="Título de la reseña"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <textarea
              name="comment"
              placeholder="Escribe tu reseña"
              value={formData.comment}
              onChange={handleChange}
              required
            ></textarea>
           <div className="star-rating">
  {[1, 2, 3, 4, 5].map((star) => (
    <span
      key={star}
      className={`star ${star <= rating ? 'filled' : ''}`}
      onClick={() => handleRatingChange(star)}
      role="button"
      aria-label={`${star} estrellas`}
    >
      ★
    </span>
  ))}
  <input
    type="hidden"
    name="rating"
    value={rating}
    required
  />
</div>

            <button className="button" type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MainDetalleProducto;
