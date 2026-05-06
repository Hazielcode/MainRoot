import authService from '../services/authService.js';

class AuthController {
  async register(req, res) {
    try {
      const newUser = await authService.register(req.body);
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      // Si el usuario tiene TOTP configurado
      if (result.mfaRequired) {
        return res.status(200).json({
          message: 'Verificación de dos pasos requerida',
          mfaRequired: true,
          userId: result.userId,
          email: result.email
        });
      }

      // Si el acceso fue concedido directamente
      res.status(200).json({
        message: 'Login exitoso',
        token: result.token,
        user: result.user
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}

export default new AuthController();
