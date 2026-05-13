import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/config/db.js';
import bcrypt from 'bcrypt';

async function runMigration() {
  try {
    console.log('[Mainroot] ⏳ Iniciando migración de esquema...');

    // 1. Alterar tabla usuarios
    await pool.query(`
      ALTER TABLE usuarios RENAME COLUMN nombre_completo TO nombres;
      ALTER TABLE usuarios ADD COLUMN apellidos VARCHAR(150) DEFAULT '';
      ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) DEFAULT '';
      ALTER TABLE usuarios ADD COLUMN fecha_nacimiento DATE NULL;
    `);
    console.log('[Mainroot] ✅ Columnas corporativas agregadas.');

    // 2. Crear las dos cuentas de Super Admin solicitadas
    const passwordHash = await bcrypt.hash('MainrootEnterprise2026!@#', 12);

    const admins = [
      { email: 'alfonsoadmi@mainroot.com', nombres: 'Alfonso', apellidos: 'Admin' },
      { email: 'galvanadmi@mainroot.com', nombres: 'Galvan', apellidos: 'Admin' }
    ];

    for (const admin of admins) {
      const res = await pool.query(
        'INSERT INTO usuarios (email, password_hash, nombres, apellidos, activo) VALUES ($1, $2, $3, $4, true) RETURNING id',
        [admin.email, passwordHash, admin.nombres, admin.apellidos]
      );
      const newUserId = res.rows[0].id;
      
      // Asignar el rol Admin (ID = 1, asumiendo que 1 es Admin, lo buscamos por si acaso)
      const roleRes = await pool.query("SELECT id FROM roles WHERE nombre = 'Admin'");
      if (roleRes.rows.length > 0) {
        await pool.query('INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)', [newUserId, roleRes.rows[0].id]);
        console.log(`[Mainroot] ✅ Cuenta creada y ascendida a Admin: ${admin.email}`);
      }
    }

    console.log('[Mainroot] 🎉 Migración completada exitosamente.');
  } catch (error) {
    console.error('[Mainroot] ❌ Error en la migración:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
