import storeModel from '../models/storeModel.js';

class StoreController {
  async createStore(req, res) {
    try {
      const { nombre, ubicacion } = req.body;
      if (!nombre) return res.status(400).json({ error: 'El nombre de la tienda es obligatorio.' });
      
      const newStore = await storeModel.create(nombre, ubicacion);
      res.status(201).json({ message: 'Tienda registrada con éxito.', store: newStore });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStores(req, res) {
    try {
      const stores = await storeModel.findAll();
      res.status(200).json(stores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStore(req, res) {
    try {
      const { id } = req.params;
      const { nombre, ubicacion } = req.body;
      const updatedStore = await storeModel.update(id, nombre, ubicacion);
      
      if (!updatedStore) return res.status(404).json({ error: 'Tienda no encontrada.' });
      res.status(200).json({ message: 'Datos de la tienda actualizados.', store: updatedStore });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteStore(req, res) {
    try {
      const { id } = req.params;
      const deletedStore = await storeModel.delete(id);
      
      if (!deletedStore) return res.status(404).json({ error: 'Tienda no encontrada.' });
      res.status(200).json({ message: 'Tienda eliminada del sistema.', store: deletedStore });
    } catch (error) {
      // 23503 es el código PG para violación de Foreign Key (ON DELETE RESTRICT)
      if (error.code === '23503') {
        return res.status(409).json({ 
          error: 'Acción Denegada: No se puede eliminar la tienda porque tiene usuarios o productos asignados a ella.' 
        });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

export default new StoreController();
