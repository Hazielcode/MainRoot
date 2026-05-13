/**
 * Middleware ABAC (Attribute-Based Access Control)
 * 
 * Provee funciones reutilizables de verificación de atributos (tienda, campos, premium).
 * Se usa en conjunto con RBAC para lograr control de acceso granular.
 */

/**
 * Obtener el rol de mayor privilegio del usuario
 * Prioridad: Admin > Gerente > Empleado > Auditor
 */
export const getPrimaryRole = (user) => {
  if (!user.roles || user.roles.length === 0) return null;
  if (user.roles.includes('Admin')) return 'Admin';
  if (user.roles.includes('Gerente')) return 'Gerente';
  if (user.roles.includes('Empleado')) return 'Empleado';
  if (user.roles.includes('Auditor')) return 'Auditor';
  return user.roles[0];
};

/**
 * Verificar si el usuario tiene jurisdicción sobre una tienda (ABAC Geográfico)
 * Admin tiene jurisdicción global.
 */
export const hasStoreJurisdiction = (user, targetTiendaId) => {
  if (user.roles && user.roles.includes('Admin')) return true;
  return user.tiendaId === targetTiendaId;
};

/**
 * Middleware: Bloquear acceso de solo lectura para Auditores
 */
export const denyAuditorWrites = (req, res, next) => {
  const role = getPrimaryRole(req.user);
  if (role === 'Auditor') {
    return res.status(403).json({
      error: 'ABAC Denegado: El rol Auditor es estrictamente de solo lectura.',
    });
  }
  next();
};

/**
 * Middleware: Restringir campos editables para Empleados
 * @param {string[]} allowedFields - Campos que el Empleado puede modificar
 */
export const restrictEmployeeFields = (allowedFields) => {
  return (req, res, next) => {
    const role = getPrimaryRole(req.user);
    if (role !== 'Empleado') return next();

    const attemptedFields = Object.keys(req.body);
    const forbidden = attemptedFields.filter((f) => !allowedFields.includes(f));
    if (forbidden.length > 0) {
      return res.status(403).json({
        error: `ABAC Denegado: Su rol de Empleado solo puede actualizar los campos [${allowedFields.join(', ')}]. Campos bloqueados: [${forbidden.join(', ')}]`,
      });
    }
    next();
  };
};
