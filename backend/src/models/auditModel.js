import { query } from '../config/db.js';

class AuditModel {
  async createLog(usuarioId, accion, entidad, entidadId, datosAnteriores, datosNuevos, ipAddress) {
    const sql = `
      INSERT INTO audit_logs (usuario_id, accion, entidad, entidad_id, datos_anteriores, datos_nuevos, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const result = await query(sql, [
      usuarioId || null, 
      accion, 
      entidad, 
      entidadId || null, 
      datosAnteriores ? JSON.stringify(datosAnteriores) : null, 
      datosNuevos ? JSON.stringify(datosNuevos) : null, 
      ipAddress || null
    ]);
    return result.rows[0];
  }

  async findAll() {
    // Obtenemos los últimos 100 registros con el email del usuario para que sea legible
    const sql = `
      SELECT a.*, u.email as usuario_email 
      FROM audit_logs a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.fecha DESC LIMIT 100;
    `;
    const result = await query(sql);
    return result.rows;
  }
}

export default new AuditModel();
