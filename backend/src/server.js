import app from './app.js';
import pool from './config/db.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Verificar conexión a PostgreSQL antes de arrancar
    const dbResult = await pool.query('SELECT NOW() AS server_time');
    console.log(`[Mainroot] 📦 PostgreSQL conectado. Hora del servidor DB: ${dbResult.rows[0].server_time}`);

    app.listen(PORT, () => {
      console.log(`[Mainroot] 🚀 Servidor de Seguridad iniciado en el puerto ${PORT}`);
      console.log(`[Mainroot] 🛡️  Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Mainroot] 📋 Endpoints: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('[Mainroot] ❌ Error crítico al arrancar el servidor:', error.message);
    console.error('[Mainroot] 💡 ¿Está PostgreSQL corriendo? ¿Son correctas las credenciales en .env?');
    process.exit(1); // Finalizar proceso en caso de error
  }
};

startServer();
