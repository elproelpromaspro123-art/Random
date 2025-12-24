import { validateAdminLogin, generateToken } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (validateAdminLogin(username, password)) {
      const token = generateToken('admin');
      return res.status(200).json({ token, message: 'Login successful' });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
