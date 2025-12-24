import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const secretsResult = await query(`SELECT COUNT(*) as total FROM secrets WHERE parent_id IS NULL`);
    const repliesResult = await query(`SELECT COUNT(*) as total FROM secrets WHERE parent_id IS NOT NULL`);
    const reactionsResult = await query(`SELECT type, COUNT(*) as count FROM reactions GROUP BY type`);
    const categoriesResult = await query(
      `SELECT category, COUNT(*) as count FROM secrets WHERE parent_id IS NULL GROUP BY category ORDER BY count DESC`
    );

    const stats = {
      totalSecrets: parseInt(secretsResult.rows[0].total),
      totalReplies: parseInt(repliesResult.rows[0].total),
      reactions: reactionsResult.rows.reduce((acc, row) => {
        acc[row.type] = parseInt(row.count);
        return acc;
      }, {}),
      categories: categoriesResult.rows,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return res.status(500).json({ error: 'Error fetching stats' });
  }
}
