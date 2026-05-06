import { query } from '../config/db.js';

class ProductModel {
  async create(product) {
    const { nombre, descripcion, precio, stock, categoria, tienda_id, es_premium, creado_por } = product;
    const sql = `
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria, tienda_id, es_premium, creado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const result = await query(sql, [nombre, descripcion, precio, stock, categoria, tienda_id, es_premium || false, creado_por]);
    return result.rows[0];
  }

  async findAll() {
    const sql = `SELECT * FROM productos ORDER BY id DESC;`;
    const result = await query(sql);
    return result.rows;
  }

  async findByStore(tienda_id) {
    const sql = `SELECT * FROM productos WHERE tienda_id = $1 ORDER BY id DESC;`;
    const result = await query(sql, [tienda_id]);
    return result.rows;
  }

  async findById(id) {
    const sql = `SELECT * FROM productos WHERE id = $1;`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  async update(id, productData) {
    const { nombre, descripcion, precio, stock, categoria, es_premium } = productData;
    // Usamos COALESCE para actualizar solo los campos que vengan en el payload, manteniendo los existentes
    const sql = `
      UPDATE productos 
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          precio = COALESCE($3, precio),
          stock = COALESCE($4, stock),
          categoria = COALESCE($5, categoria),
          es_premium = COALESCE($6, es_premium),
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const result = await query(sql, [nombre, descripcion, precio, stock, categoria, es_premium, id]);
    return result.rows[0];
  }

  async delete(id) {
    const sql = `DELETE FROM productos WHERE id = $1 RETURNING *;`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

export default new ProductModel();
