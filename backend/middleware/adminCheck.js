export const adminCheck = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.ADMIN_SECRET_TOKEN;

  if (!expectedToken) {
    return res.status(500).json({ 
      error: 'Server configuration error: ADMIN_SECRET_TOKEN not set' 
    });
  }

  const expectedAuth = `Bearer ${expectedToken}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return res.status(403).json({ 
      error: 'Acceso prohibido. Token de administrador requerido.' 
    });
  }

  next();
};

