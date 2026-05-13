import auditModel from '../models/auditModel.js';

class AuditController {
  // GET /api/audit — Con soporte de filtros por query params
  async getLogs(req, res) {
    try {
      const { entidad, accion, usuario_id, desde, hasta, limit } = req.query;
      const filters = {
        entidad: entidad || null,
        accion: accion || null,
        usuario_id: usuario_id ? parseInt(usuario_id) : null,
        desde: desde || null,
        hasta: hasta || null,
        limit: limit ? Math.min(parseInt(limit), 500) : 100,
      };
      const logs = await auditModel.findAll(filters);
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/audit/stats — Estadísticas rápidas para el Dashboard
  async getStats(req, res) {
    try {
      const stats = await auditModel.getStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AuditController();
