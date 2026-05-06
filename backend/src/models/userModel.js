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
}

export default new UserModel();
