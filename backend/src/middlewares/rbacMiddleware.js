export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    // req.user fue inyectado por authMiddleware previamente
    const { roles } = req.user; 
    
    // Verificamos si el JWT del usuario contiene al menos uno de los roles permitidos
    if (!roles || !roles.some(role => requiredRoles.includes(role))) {
      return res.status(403).json({ 
        error: 'Acceso Denegado (RBAC): No posee los privilegios suficientes para ejecutar esta acción.' 
      });
    }
    
    next();
  };
};
