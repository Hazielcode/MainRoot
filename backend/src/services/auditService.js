import auditModel from '../models/auditModel.js';

class AuditService {
  /**
   * Registra una acción crítica en la base de datos (Audit Trail)
   */
  async log(req, accion, entidad, entidadId, datosAnteriores = null, datosNuevos = null) {
    try {
      const usuarioId = req.user ? req.user.userId : null;
      // Extraer IP de forma segura considerando proxies o Load Balancers
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      await auditModel.createLog(
        usuarioId, 
        accion, 
        entidad, 
        entidadId, 
        datosAnteriores, 
        datosNuevos, 
        ipAddress
      );
    } catch (error) {
      // Un error en el log de auditoría no debería tumbar la petición HTTP principal,
      // pero debe imprimirse en consola para alertar al equipo de DevOps.
      console.error('[AuditService] Falla crítica al registrar log:', error);
    }
  }
}

export default new AuditService();
