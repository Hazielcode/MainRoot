import * as otplib from 'otplib';
const { authenticator } = otplib;
import QRCode from 'qrcode';

// Generar una clave secreta y el link para el Google Authenticator
export const generateMfaSecret = (userEmail) => {
  const secret = authenticator.generateSecret();
  // El formato URI estándar que lee la cámara del celular
  const otpauthUrl = authenticator.keyuri(userEmail, 'Mainroot Enterprise', secret);
  return { secret, otpauthUrl };
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
    return authenticator.verify({ token, secret });
  } catch (err) {
    return false;
  }
};
