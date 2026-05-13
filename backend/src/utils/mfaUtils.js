import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generar una clave secreta y el link para el Google Authenticator
export const generateMfaSecret = (userEmail) => {
  const secret = speakeasy.generateSecret({
    name: `Mainroot Enterprise (${userEmail})`,
    length: 20
  });
  
  // El formato URI estándar que lee la cámara del celular
  const otpauthUrl = secret.otpauth_url;
  
  return { secret: secret.base32, otpauthUrl };
};

// Convertir la URI a un Código QR en formato Base64 para el Frontend
export const generateQRCodeDataURL = async (otpauthUrl) => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (err) {
    throw new Error('Error al generar el Código QR');
  }
};

// Validar matemáticamente si el código de 6 dígitos es correcto
export const verifyMfaToken = (token, secret) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Permite un margen de error de 30 segundos (antes o después)
    });
  } catch (err) {
    return false;
  }
};
