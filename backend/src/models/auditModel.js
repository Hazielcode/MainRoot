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

  /**
   * Consulta de logs con filtros opcionales
   * @param {Object} filters - { entidad, accion, usuario_id, desde, hasta, limit }
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT a.*, u.email as usuario_email 
      FROM audit_logs a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.entidad) {
      sql += ` AND a.entidad = $${paramIndex++}`;
      params.push(filters.entidad);
    }
    if (filters.accion) {
      sql += ` AND a.accion = $${paramIndex++}`;
      params.push(filters.accion);
    }
    if (filters.usuario_id) {
      sql += ` AND a.usuario_id = $${paramIndex++}`;
      params.push(filters.usuario_id);
    }
    if (filters.desde) {
      sql += ` AND a.fecha >= $${paramIndex++}`;
      params.push(filters.desde);
    }
    if (filters.hasta) {
      sql += ` AND a.fecha <= $${paramIndex++}`;
      params.push(filters.hasta);
    }

    sql += ` ORDER BY a.fecha DESC LIMIT $${paramIndex}`;
    params.push(filters.limit || 100);

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Estadísticas rápidas para el Dashboard
   * Retorna: total de logs, conteo por acción, actividad de las últimas 24h
   */
  async getStats() {
    const totalSql = `SELECT COUNT(*)::int as total FROM audit_logs;`;
    const byActionSql = `
      SELECT accion, COUNT(*)::int as count 
      FROM audit_logs 
      GROUP BY accion 
      ORDER BY count DESC;
    `;
    const last24hSql = `
      SELECT COUNT(*)::int as count 
      FROM audit_logs 
      WHERE fecha >= NOW() - INTERVAL '24 hours';
    `;

    const [totalRes, byActionRes, last24hRes] = await Promise.all([
      query(totalSql),
      query(byActionSql),
      query(last24hSql),
    ]);

    return {
      total: totalRes.rows[0].total,
      byAction: byActionRes.rows,
      last24h: last24hRes.rows[0].count,
    };
  }
}

export default new AuditModel();
