import app from './app.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Nota: Aquí validaremos la conexión a la Base de Datos PostgreSQL próximamente
    // await database.connect();
    
    app.listen(PORT, () => {
      console.log(`[Mainroot] 🚀 Servidor de Seguridad iniciado en el puerto ${PORT}`);
      console.log(`[Mainroot] 🛡️  Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Mainroot] ❌ Error crítico al arrancar el servidor:', error);
    process.exit(1); // Finalizar proceso en caso de error
  }
};

startServer();
