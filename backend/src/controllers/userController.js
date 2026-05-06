import userModel from '../models/userModel.js';

class UserController {
  // Lista todos los empleados/usuarios con sus roles inyectados
  async getAllUsers(req, res) {
    try {
      const users = await userModel.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Asigna un rol a un usuario
  async assignRoleToUser(req, res) {
    try {
      const { id } = req.params; // ID del usuario objetivo
      const { rol_id } = req.body;
      const asignadoPor = req.user.userId; // El Admin que está haciendo la petición

      if (!rol_id) return res.status(400).json({ error: 'El ID del rol a asignar es obligatorio.' });

      const assignment = await userModel.assignRole(id, rol_id, asignadoPor);
      if (!assignment) {
        return res.status(200).json({ message: 'Aviso: El rol especificado ya estaba asignado a este usuario.' });
      }

      res.status(200).json({ message: 'Rol asignado con éxito.', assignment });
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        return res.status(400).json({ error: 'Validación Fallida: El ID del usuario o el ID del rol no existen.' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Soft Delete: Desactiva un usuario sin borrar su data histórica (Auditoría)
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { activo } = req.body; // boolean

      if (typeof activo !== 'boolean') {
        return res.status(400).json({ error: 'El estado debe ser un booleano (true para activar, false para desactivar).' });
      }

      // Prevención de suicidio digital: El admin no puede desactivarse a sí mismo
      if (id == req.user.userId) {
        return res.status(403).json({ error: 'Acción Denegada: No puede desactivar su propia cuenta de administrador.' });
      }

      const updatedUser = await userModel.toggleActiveStatus(id, activo);
      if (!updatedUser) return res.status(404).json({ error: 'Usuario no encontrado en los registros.' });

      res.status(200).json({ 
        message: `Usuario ${activo ? 'activado' : 'desactivado y bloqueado'} exitosamente.`, 
        user: updatedUser 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController();
