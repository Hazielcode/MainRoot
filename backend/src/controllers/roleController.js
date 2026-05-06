import roleModel from '../models/roleModel.js';

class RoleController {
  async createRole(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre) return res.status(400).json({ error: 'El nombre del rol es obligatorio.' });
      
      const newRole = await roleModel.create(nombre, descripcion);
      res.status(201).json({ message: 'Rol creado', role: newRole });
    } catch (error) {
      if (error.code === '23505') { // Código PG para violación de restricción UNIQUE
        return res.status(400).json({ error: 'El nombre del rol ya existe en el sistema.' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getRoles(req, res) {
    try {
      const roles = await roleModel.findAll();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      const updatedRole = await roleModel.update(id, nombre, descripcion);
      
      if (!updatedRole) return res.status(404).json({ error: 'Rol no encontrado.' });
      res.status(200).json({ message: 'Rol actualizado', role: updatedRole });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const deletedRole = await roleModel.delete(id);
      
      if (!deletedRole) return res.status(404).json({ error: 'Rol no encontrado.' });
      res.status(200).json({ message: 'Rol eliminado con éxito', role: deletedRole });
    } catch (error) {
      // 23503 es el código PG para violación de Foreign Key (ON DELETE RESTRICT)
      if (error.code === '23503') {
        return res.status(409).json({ 
          error: 'Acción Denegada: No se puede eliminar este rol porque actualmente está asignado a uno o más usuarios.' 
        });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

export default new RoleController();
