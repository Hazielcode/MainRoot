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
    const sql = `SELECT p.*, t.nombre as tienda_nombre FROM productos p LEFT JOIN tiendas t ON p.tienda_id = t.id ORDER BY p.id DESC;`;
    const result = await query(sql);
    return result.rows;
  }

  async findByStore(tienda_id) {
    const sql = `SELECT p.*, t.nombre as tienda_nombre FROM productos p LEFT JOIN tiendas t ON p.tienda_id = t.id WHERE p.tienda_id = $1 ORDER BY p.id DESC;`;
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

  // Estadísticas para Dashboard KPIs
  async getStats() {
    const sql = `
      SELECT 
        COUNT(*)::int as total,
        COALESCE(SUM(stock), 0)::int as stock_total,
        COUNT(*) FILTER (WHERE es_premium = true)::int as premium,
        COUNT(*) FILTER (WHERE stock <= 10)::int as bajo_stock
      FROM productos;
    `;
    const byCategorySql = `
      SELECT categoria, COUNT(*)::int as count, COALESCE(SUM(stock), 0)::int as stock
      FROM productos 
      WHERE categoria IS NOT NULL
      GROUP BY categoria 
      ORDER BY count DESC
      LIMIT 10;
    `;
    const byStoreSql = `
      SELECT t.nombre as sucursal, COALESCE(SUM(p.stock), 0)::int as stock
      FROM tiendas t
      LEFT JOIN productos p ON t.id = p.tienda_id
      GROUP BY t.id, t.nombre
      ORDER BY stock DESC;
    `;

    const [statsRes, byCategoryRes, byStoreRes] = await Promise.all([
      query(sql),
      query(byCategorySql),
      query(byStoreSql),
    ]);

    return {
      ...statsRes.rows[0],
      byCategory: byCategoryRes.rows,
      byStore: byStoreRes.rows,
    };
  }
}

export default new ProductModel();
