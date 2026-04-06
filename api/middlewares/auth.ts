import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_palabra_segura_mirage';

export const isAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Rol insuficiente.' });
    }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const isAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
