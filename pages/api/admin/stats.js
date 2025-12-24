import { query } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const secretsResult = await query(`SELECT COUNT(*) as total FROM secrets WHERE parent_id IS NULL`);
    const suspiciousResult = await query(`SELECT COUNT(*) as total FROM secrets WHERE is_suspicious = TRUE`);
    const reportsResult = await query(`SELECT COUNT(*) as total FROM reports`);
    const reactionsResult = await query(
      `SELECT type, COUNT(*) as count FROM reactions GROUP BY type`
    );

    const stats = {
      totalSecrets: parseInt(secretsResult.rows[0].total),
      suspiciousSecrets: parseInt(suspiciousResult.rows[0].total),
      totalReports: parseInt(reportsResult.rows[0].total),
      reactions: reactionsResult.rows.reduce((acc, row) => {
        acc[row.type] = parseInt(row.count);
        return acc;
      }, {}),
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Error fetching stats' });
  }
}
