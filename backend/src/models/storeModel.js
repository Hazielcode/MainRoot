import { query } from '../config/db.js';

class StoreModel {
  async create(nombre, ubicacion) {
    const sql = `INSERT INTO tiendas (nombre, ubicacion) VALUES ($1, $2) RETURNING *;`;
    const result = await query(sql, [nombre, ubicacion]);
    return result.rows[0];
  }

  async findAll() {
    const sql = `SELECT * FROM tiendas ORDER BY id ASC;`;
    const result = await query(sql);
    return result.rows;
  }

  async findById(id) {
    const sql = `SELECT * FROM tiendas WHERE id = $1;`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  async update(id, nombre, ubicacion) {
    const sql = `UPDATE tiendas SET nombre = $1, ubicacion = $2 WHERE id = $3 RETURNING *;`;
    const result = await query(sql, [nombre, ubicacion, id]);
    return result.rows[0];
  }

  async delete(id) {
    // Si la tienda tiene productos o usuarios asignados, PostgreSQL bloqueará el borrado por el ON DELETE RESTRICT
    const sql = `DELETE FROM tiendas WHERE id = $1 RETURNING *;`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

export default new StoreModel();
