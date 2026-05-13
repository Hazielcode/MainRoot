import productModel from '../models/productModel.js';
import auditService from '../services/auditService.js';

// Helper ABAC: Determina si el usuario tiene jurisdicción sobre una tienda específica
const canManageProduct = (user, productTiendaId) => {
  if (user.roles && user.roles.includes('Admin')) return true;
  if (user.tiendaId === productTiendaId) return true;
  return false;
};

// Helper: Obtener el rol principal del usuario para las reglas ABAC
const getPrimaryRole = (user) => {
  if (!user.roles || user.roles.length === 0) return null;
  // Prioridad: Admin > Gerente > Empleado > Auditor
  if (user.roles.includes('Admin')) return 'Admin';
  if (user.roles.includes('Gerente')) return 'Gerente';
  if (user.roles.includes('Empleado')) return 'Empleado';
  if (user.roles.includes('Auditor')) return 'Auditor';
  return user.roles[0];
};

class ProductController {

  // === CREATE (§6.2 INSERT) ===
  async createProduct(req, res) {
    try {
      const role = getPrimaryRole(req.user);

      // Auditor no puede crear (§6.2)
      if (role === 'Auditor') {
        return res.status(403).json({ error: 'ABAC Denegado: El rol Auditor no tiene permisos de creación.' });
      }

      // Empleado no puede crear productos premium (§6.2)
      if (role === 'Empleado' && req.body.es_premium) {
        return res.status(403).json({ error: 'ABAC Denegado: Empleados no pueden registrar inventario Premium (alto valor).' });
      }

      // Determinar tienda destino
      let tienda_id = req.user.tiendaId; 
      if (role === 'Admin' && req.body.tienda_id) {
        tienda_id = req.body.tienda_id; // Admin puede asignar a cualquier tienda
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
      await auditService.log(req, 'CREATE', 'productos', newProduct.id, null, newProduct);

      res.status(201).json({ message: 'Producto registrado en el inventario', product: newProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // === READ (§6.2 SELECT) ===
  async getProducts(req, res) {
    try {
      const role = getPrimaryRole(req.user);
      let products;

      // Admin y Auditor ven TODO (acceso global)
      if (role === 'Admin' || role === 'Auditor') {
        products = await productModel.findAll();
      } else {
        // Gerente y Empleado solo ven productos de SU tienda (ABAC geográfico)
        if (!req.user.tiendaId) return res.status(200).json([]);
        products = await productModel.findByStore(req.user.tiendaId);
      }
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // === UPDATE (§6.2 UPDATE) ===
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const role = getPrimaryRole(req.user);
      const targetProduct = await productModel.findById(id);
      
      if (!targetProduct) return res.status(404).json({ error: 'Producto no encontrado' });

      // Auditor no puede modificar (§6.2)
      if (role === 'Auditor') {
        return res.status(403).json({ error: 'ABAC Denegado: El rol Auditor es estrictamente de solo lectura.' });
      }

      // Verificar jurisdicción ABAC (tienda)
      if (!canManageProduct(req.user, targetProduct.tienda_id)) {
        return res.status(403).json({ error: 'ABAC Denegado: Intento de violación de jurisdicción geográfica.' });
      }

      // Gerente: No puede modificar "categoria" (§6.2 UPDATE - Restricción de campo)
      if (role === 'Gerente' && req.body.categoria !== undefined) {
        return res.status(403).json({ error: 'ABAC Denegado: Gerentes no pueden modificar la categoría del producto (protección de catalogación corporativa).' });
      }

      // Empleado: Solo puede modificar "stock" (§6.2 UPDATE - Restricción de campo extrema)
      if (role === 'Empleado') {
        const allowedFields = ['stock'];
        const attemptedFields = Object.keys(req.body);
        const forbidden = attemptedFields.filter(f => !allowedFields.includes(f));
        if (forbidden.length > 0) {
          return res.status(403).json({ 
            error: `ABAC Denegado: Su rol de Empleado solo puede actualizar el campo "stock". Campos bloqueados: [${forbidden.join(', ')}]` 
          });
        }
      }

      const updatedProduct = await productModel.update(id, req.body);
      await auditService.log(req, 'UPDATE', 'productos', id, targetProduct, updatedProduct);

      res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // === DELETE (§6.2 DELETE) ===
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const role = getPrimaryRole(req.user);
      const targetProduct = await productModel.findById(id);
      
      if (!targetProduct) return res.status(404).json({ error: 'Producto no encontrado' });

      // Empleado y Auditor no pueden eliminar (§6.2)
      if (role === 'Empleado') {
        return res.status(403).json({ error: 'ABAC Denegado: Empleados no tienen permisos de eliminación de productos.' });
      }
      if (role === 'Auditor') {
        return res.status(403).json({ error: 'ABAC Denegado: Auditores no tienen permisos de modificación.' });
      }

      // Verificar jurisdicción ABAC (tienda)
      if (!canManageProduct(req.user, targetProduct.tienda_id)) {
        return res.status(403).json({ error: 'ABAC Denegado: No puedes eliminar un producto de otra sucursal.' });
      }

      // Gerente solo puede eliminar si es_premium == false (§6.2 DELETE)
      if (role === 'Gerente' && targetProduct.es_premium) {
        return res.status(403).json({ error: 'ABAC Denegado: Gerentes no pueden eliminar productos Premium. Requiere escalamiento al Administrador.' });
      }

      const deletedProduct = await productModel.delete(id);
      await auditService.log(req, 'DELETE', 'productos', id, targetProduct, null);

      res.status(200).json({ message: 'Producto eliminado del inventario', product: deletedProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // === STATS (Dashboard KPIs) ===
  async getStats(req, res) {
    try {
      const stats = await productModel.getStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ProductController();
