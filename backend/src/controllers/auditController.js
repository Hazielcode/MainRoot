import auditModel from '../models/auditModel.js';

class AuditController {
  async getLogs(req, res) {
    try {
      const logs = await auditModel.findAll();
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AuditController();
