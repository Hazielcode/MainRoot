import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import productRoutes from './routes/productRoutes.js';

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

export default app;
