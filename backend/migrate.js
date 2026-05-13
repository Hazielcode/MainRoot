import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('[Mainroot] ⏳ Leyendo esquema SQL...');
    const sqlFilePath = path.join(__dirname, '../database/database.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('[Mainroot] 🚀 Ejecutando esquema en Supabase...');
    await pool.query(sql);

    console.log('[Mainroot] ✅ ¡Tablas y datos iniciales creados exitosamente!');
  } catch (error) {
    console.error('[Mainroot] ❌ Error al ejecutar el SQL:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
