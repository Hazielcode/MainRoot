import productModel from '../models/productModel.js';

// Helper ABAC: Determina si el usuario tiene jurisdicción sobre una tienda específica
const canManageProduct = (user, productTiendaId) => {
  // Los administradores tienen jurisdicción global (Pase Libre)
  if (user.roles && user.roles.includes('Admin')) return true;
  
  // Para gerentes y empleados, su TiendaID (en su JWT) debe ser igual al TiendaID del producto
  if (user.tiendaId === productTiendaId) return true;

  return false;
};

class ProductController {

  async createProduct(req, res) {
    try {
      // Magia ABAC: El usuario no envía su tienda, el backend la deduce de su identidad segura (JWT)
      let tienda_id = req.user.tiendaId; 
      
      // Solo si es un Admin, se le permite inyectar el producto en OTRA tienda diferente a la suya
      if (req.user.roles && req.user.roles.includes('Admin') && req.body.tienda_id) {
        tienda_id = req.body.tienda_id; 
      }

      if (!tienda_id) {
        return res.status(400).json({ error: 'Creación abortada: El usuario no pertenece a ninguna sucursal y no se especificó una destino.' });
      }

      const productData = {
        ...req.body,
        tienda_id: tienda_id,
        creado_por: req.user.userId
      };

      const newProduct = await productModel.create(productData);
      res.status(201).json({ message: 'Producto registrado en el inventario', product: newProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProducts(req, res) {
    try {
      let products;
      // Filtro Geográfico de Visualización (ABAC Passivo)
      if (req.user.roles && req.user.roles.includes('Admin')) {
        products = await productModel.findAll(); // El Admin ve el inventario mundial
      } else {
        if (!req.user.tiendaId) return res.status(200).json([]);
        products = await productModel.findByStore(req.user.tiendaId); // El local solo ve su local
      }
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const targetProduct = await productModel.findById(id);
      
      if (!targetProduct) return res.status(404).json({ error: 'Producto no encontrado' });

      // ---- EJECUCIÓN ABAC ----
      if (!canManageProduct(req.user, targetProduct.tienda_id)) {
        return res.status(403).json({ 
          error: 'ABAC Denegado: Intento de violación de jurisdicción. No puedes editar productos de otra sucursal.' 
        });
      }

      // ---- EJECUCIÓN RBAC MICROSCÓPICO ----
      // Regla de Negocio: Un 'Empleado' no puede tocar los precios, solo stock o descripciones
      if (req.user.roles && req.user.roles.includes('Empleado') && req.body.precio) {
        return res.status(403).json({
          error: 'RBAC Denegado: Su rol de Empleado no tiene la autoridad necesaria para modificar precios.'
        });
      }

      const updatedProduct = await productModel.update(id, req.body);
      res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const targetProduct = await productModel.findById(id);
      
      if (!targetProduct) return res.status(404).json({ error: 'Producto no encontrado' });

      // ---- EJECUCIÓN ABAC ----
      if (!canManageProduct(req.user, targetProduct.tienda_id)) {
        return res.status(403).json({ 
          error: 'ABAC Denegado: No puedes eliminar un producto que pertenece al inventario de otra sucursal.' 
        });
      }

      const deletedProduct = await productModel.delete(id);
      res.status(200).json({ message: 'Producto eliminado del inventario', product: deletedProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ProductController();
