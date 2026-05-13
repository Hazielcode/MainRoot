import userModel from '../models/userModel.js';
import auditService from '../services/auditService.js';

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userModel.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async assignRoleToUser(req, res) {
    try {
      const { id } = req.params;
      const { rol_id } = req.body;
      const asignadoPor = req.user.userId;

      if (!rol_id) return res.status(400).json({ error: 'El ID del rol a asignar es obligatorio.' });

      const assignment = await userModel.assignRole(id, rol_id, asignadoPor);
      if (!assignment) {
        return res.status(200).json({ message: 'Aviso: El rol especificado ya estaba asignado a este usuario.' });
      }

      // LOG DE AUDITORÍA
      await auditService.log(req, 'ASSIGN_ROLE', 'usuarios', id, null, { rol_id });

      res.status(200).json({ message: 'Rol asignado con éxito.', assignment });
    } catch (error) {
      if (error.code === '23503') { 
        return res.status(400).json({ error: 'Validación Fallida: El ID del usuario o el ID del rol no existen.' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Revocar un rol de un usuario (DELETE /api/users/:id/roles/:rolId)
  async revokeRoleFromUser(req, res) {
    try {
      const { id, rolId } = req.params;

      // Protección: No se puede auto-revocar el rol Admin si eres el único Admin
      if (parseInt(id) === req.user.userId) {
        const roleName = await userModel.getRoleNameById(rolId);
        if (roleName === 'Admin') {
          return res.status(403).json({ 
            error: 'Acción Denegada: No puede revocar su propio rol de Administrador.' 
          });
        }
      }

      const result = await userModel.removeRole(id, rolId);
      if (!result) {
        return res.status(404).json({ error: 'La asignación de rol especificada no existe.' });
      }

      // LOG DE AUDITORÍA
      await auditService.log(req, 'REVOKE_ROLE', 'usuarios', id, { rol_id: rolId }, null);

      res.status(200).json({ message: 'Rol revocado exitosamente.', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (typeof activo !== 'boolean') {
        return res.status(400).json({ error: 'El estado debe ser un booleano (true/false).' });
      }

      if (id == req.user.userId) {
        return res.status(403).json({ error: 'Acción Denegada: No puede desactivar su propia cuenta de administrador.' });
      }

      const updatedUser = await userModel.toggleActiveStatus(id, activo);
      if (!updatedUser) return res.status(404).json({ error: 'Usuario no encontrado en los registros.' });

      // LOG DE AUDITORÍA
      await auditService.log(req, 'TOGGLE_STATUS', 'usuarios', id, { activo: !activo }, { activo });

      res.status(200).json({ 
        message: `Usuario ${activo ? 'activado' : 'desactivado y bloqueado'} exitosamente.`, 
        user: updatedUser 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/users/stats — Conteo rápido para KPIs del Dashboard
  async getStats(req, res) {
    try {
      const stats = await userModel.getStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController();
