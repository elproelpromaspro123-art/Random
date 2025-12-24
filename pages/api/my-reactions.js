import { query } from '../../lib/db';
import { getUserIP } from '../../lib/ip';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userIP = getUserIP(req);
    
    // Obtener todas las reacciones del usuario actual
    const result = await query(
      `SELECT secret_id, type FROM reactions WHERE user_ip = $1`,
      [userIP]
    );
    
    // Convertir a formato más útil: { "secretId_reactionType": true }
    const myReactions = {};
    result.rows.forEach(row => {
      myReactions[`${row.secret_id}_${row.type}`] = true;
    });
    
    return res.status(200).json({ myReactions, userIP });
  } catch (error) {
    console.error('Error fetching my reactions:', error);
    return res.status(500).json({ error: 'Error fetching reactions' });
  }
}
