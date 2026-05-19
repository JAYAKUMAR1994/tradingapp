import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const demoUser = {
  id: 'demo-user',
  name: 'Demo Trader',
  email: 'admin@tradesignal.local',
  passwordHash: bcrypt.hashSync('Admin@12345', 10)
};

export async function login(req, res) {
  const { email, password } = req.body;
  const valid = email === demoUser.email && (await bcrypt.compare(password, demoUser.passwordHash));

  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: demoUser.id, email: demoUser.email, name: demoUser.name },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  return res.json({ token, user: { id: demoUser.id, name: demoUser.name, email: demoUser.email } });
}

export function me(req, res) {
  res.json({ user: req.user });
}
