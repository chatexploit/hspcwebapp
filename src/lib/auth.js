import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, role_id: user.role_id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Utility to enforce Super Admin role
// Note: In a production app, we would query the database to confirm the role ID belongs to 'Super Admin'
// or include the role name in the JWT payload.
export function requireSuperAdmin(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);

  // Basic check for role_id 1 (Super Admin).
  if (user && user.role_id === 1) {
      return user;
  }
  return null;
}
