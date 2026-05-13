import { query } from '../config/db.js';

class UserModel {
  async create(user) {
    const { email, password_hash, nombre_completo, tienda_id } = user;
    const sql = `
      INSERT INTO usuarios (email, password_hash, nombre_completo, tienda_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, nombre_completo, tienda_id, mfa_habilitado, activo, fecha_creacion;
    `;
    const result = await query(sql, [email, password_hash, nombre_completo, tienda_id || null]);
    return result.rows[0];
  }

  async findByEmail(email) {
    const sql = `SELECT * FROM usuarios WHERE email = $1;`;
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  async findById(id) {
    const sql = `SELECT * FROM usuarios WHERE id = $1;`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  async updateMfa(userId, secret, habilitado) {
    const sql = `
      UPDATE usuarios 
      SET mfa_secret = $1, mfa_habilitado = $2 
      WHERE id = $3 
      RETURNING id, email, mfa_habilitado;
    `;
    const result = await query(sql, [secret, habilitado, userId]);
    return result.rows[0];
  }

  // --- MÉTODOS DE ADMINISTRACIÓN (FASE 2: RBAC) ---

  async findAll() {
    // Retorna todos los usuarios e incluye un Array con los roles que tienen asignados usando JSON_AGG
    const sql = `
      SELECT u.id, u.email, u.nombre_completo, u.tienda_id, u.mfa_habilitado, u.activo, u.fecha_creacion,
             json_agg(json_build_object('id', r.id, 'nombre', r.nombre)) FILTER (WHERE r.nombre IS NOT NULL) as roles_detail,
             json_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL) as roles
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      GROUP BY u.id
      ORDER BY u.id ASC;
    `;
    const result = await query(sql);
    return result.rows;
  }

  async assignRole(usuarioId, rolId, asignadoPorId) {
    const sql = `
      INSERT INTO usuario_roles (usuario_id, rol_id, asignado_por)
      VALUES ($1, $2, $3)
      ON CONFLICT (usuario_id, rol_id) DO NOTHING
      RETURNING *;
    `;
    const result = await query(sql, [usuarioId, rolId, asignadoPorId]);
    return result.rows[0];
  }

  async removeRole(usuarioId, rolId) {
    const sql = `
      DELETE FROM usuario_roles 
      WHERE usuario_id = $1 AND rol_id = $2
      RETURNING *;
    `;
    const result = await query(sql, [usuarioId, rolId]);
    return result.rows[0];
  }

  async getRolesByUserId(userId) {
    const sql = `
      SELECT r.nombre FROM roles r
      INNER JOIN usuario_roles ur ON r.id = ur.rol_id
      WHERE ur.usuario_id = $1;
    `;
    const result = await query(sql, [userId]);
    return result.rows.map(r => r.nombre);
  }

  async getRoleNameById(rolId) {
    const sql = `SELECT nombre FROM roles WHERE id = $1;`;
    const result = await query(sql, [rolId]);
    return result.rows[0]?.nombre || null;
  }

  async toggleActiveStatus(id, estadoActivo) {
    const sql = `UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, email, activo;`;
    const result = await query(sql, [estadoActivo, id]);
    return result.rows[0];
  }

  // Estadísticas para Dashboard KPIs
  async getStats() {
    const sql = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE activo = true)::int as activos,
        COUNT(*) FILTER (WHERE activo = false)::int as bloqueados,
        COUNT(*) FILTER (WHERE mfa_habilitado = true)::int as con_mfa
      FROM usuarios;
    `;
    const result = await query(sql);
    return result.rows[0];
  }
}

export default new UserModel();
