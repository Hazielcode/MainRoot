/**
 * Middleware Global de Manejo de Errores (§10.5 — Error Handling Centralizado)
 * 
 * Captura cualquier error no manejado y devuelve una respuesta uniforme.
 * En producción, oculta los detalles internos del error.
 */
const errorHandler = (err, req, res, _next) => {
  console.error('[Mainroot] ❌ Error no manejado:', err.stack || err);

  // Errores de PostgreSQL conocidos
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Conflicto: El registro ya existe (violación de restricción UNIQUE).',
    });
  }
  if (err.code === '23503') {
    return res.status(409).json({
      error: 'Conflicto: No se puede completar la operación por dependencias existentes.',
    });
  }
  if (err.code === '23502') {
    return res.status(400).json({
      error: 'Datos incompletos: Falta un campo obligatorio.',
    });
  }

  // Error de validación manual
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor.'
      : err.message || 'Error interno del servidor.';

  res.status(statusCode).json({ error: message });
};

export default errorHandler;
