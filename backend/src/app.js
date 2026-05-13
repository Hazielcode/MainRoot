import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import productRoutes from './routes/productRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

// Middlewares Globales
app.use(helmet()); // Seguridad de cabeceras HTTP
app.use(cors()); // Habilitar peticiones cruzadas
app.use(express.json()); // Parseo de Body JSON
app.use(morgan('dev')); // Logs de peticiones HTTP en consola

// Rutas de la Aplicación
app.use('/api/auth', authRoutes); // Endpoints de Autenticación (Login, Registro)
app.use('/api/roles', roleRoutes); // Endpoints de Roles (CRUD)
app.use('/api/users', userRoutes); // Endpoints de Administración de Personal
app.use('/api/stores', storeRoutes); // Endpoints de Tiendas/Sucursales
app.use('/api/products', productRoutes); // Endpoints de Inventario (ABAC)
app.use('/api/audit', auditRoutes); // Endpoints de Auditoría (Audit Trails)

// Endpoints Base para Testeo Inicial
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Mainroot Security API is running.',
    architecture: 'Clean Architecture / Express'
  });
});

// Fallback: 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Middleware Global de Manejo de Errores (DEBE ir al final, después de todas las rutas)
app.use(errorHandler);

export default app;
