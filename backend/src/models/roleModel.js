import { query } from '../config/db.js';

class RoleModel {
  async create(nombre, descripcion) {
    const sql = `INSERT INTO roles (nombre, descripcion) VALUES ($1, $2) RETURNING *;`;
    const result = await query(sql, [nombre, descripcion]);
    return result.rows[0];
  }

  async findAll() {
    const sql = `SELECT * FROM roles ORDER BY id ASC;`;
    const result = await query(sql);
    return result.rows;
  }

  async findById(id) {
    const sql = `SELECT * FROM roles WHERE id = $1;`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  async update(id, nombre, descripcion) {
    const sql = `UPDATE roles SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *;`;
    const result = await query(sql, [nombre, descripcion, id]);
    return result.rows[0];
  }

  async delete(id) {
    // Si el rol está en uso por la tabla usuario_roles, PostgreSQL lo bloqueará automáticamente
    const sql = `DELETE FROM roles WHERE id = $1 RETURNING *;`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

export default new RoleModel();
