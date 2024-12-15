const mysql = require('mysql');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '698465xd00',
    database: 'ECOMMERCE_WEB',
    multipleStatements: true
};

let db;
function handleDisconnect() {
    db = mysql.createConnection(dbConfig);
  
    db.connect((err) => {
      if (err) {
        console.log('Error when connecting to DB:', err);
        setTimeout(handleDisconnect, 2000);
      } else {
        console.log('Connected to the database.');
      }
    });
  
    db.on('error', (err) => {
      console.log('DB error', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        handleDisconnect();
      } else {
        throw err;
      }
    });
  
    // Enviar una consulta cada 5 minutos para mantener la conexión activa
    setInterval(() => {
        db.query('SELECT 1', (err) => {
        if (err) {
          console.log('Keep-alive query error:', err);
        } else {
          console.log('Keep-alive query executed successfully');
        }
      });
    }, 300000); // 300000 ms = 5 minutos
  }
  
  handleDisconnect();
  
  module.exports = { db };
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '698465xd00',
//     database: 'DBSISTEMA_VENTA_WEB',
//     multipleStatements: true
// });
// db.connect(err => {
//     if (err) {
//         console.error('Error conectando a la base de datos:', err.stack);
//         return;
//     }
//     console.log('Conectado a la base de datos');
// });

// module.exports = { db };
