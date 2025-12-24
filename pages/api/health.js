import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query('SELECT NOW()');
    return res.status(200).json({
      status: 'ok',
      timestamp: result.rows[0].now,
      database: 'connected',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
}
