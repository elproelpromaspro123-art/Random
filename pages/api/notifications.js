import { query } from '../../lib/db';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'GET') {
        try {
            const { viewerId } = req.query;
            if (!viewerId) {
                return res.status(400).json({ error: 'Viewer ID required' });
            }

            const result = await query(
                `SELECT n.*, 
          s.content as parent_content,
          r.content as reply_content,
          r.created_at as reply_created_at
         FROM notifications n
         JOIN secrets s ON n.secret_id = s.id
         JOIN secrets r ON n.reply_id = r.id
         WHERE n.viewer_id = $1
         ORDER BY n.created_at DESC`,
                [viewerId]
            );

            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ error: 'Error fetching notifications' });
        }
    }

    if (method === 'POST') {
        try {
            const { secretId, replyId } = req.body;

            if (!secretId || !replyId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Obtener el creador del secreto o respuesta padre
            const parentResult = await query(
                `SELECT creator_viewer_id FROM secrets WHERE id = $1`,
                [secretId]
            );

            if (!parentResult.rows.length || !parentResult.rows[0].creator_viewer_id) {
                // Si no hay creador registrado, no crear notificación
                return res.status(400).json({ error: 'Creator not found' });
            }

            const creatorViewerId = parentResult.rows[0].creator_viewer_id;

            await query(
                `INSERT INTO notifications (secret_id, reply_id, viewer_id, is_read)
         VALUES ($1, $2, $3, FALSE)
         ON CONFLICT (secret_id, reply_id, viewer_id) DO NOTHING`,
                [secretId, replyId, creatorViewerId]
            );

            return res.status(201).json({ message: 'Notification created', notifiedViewerId: creatorViewerId });
        } catch (error) {
            console.error('Error creating notification:', error);
            return res.status(500).json({ error: 'Error creating notification' });
        }
    }

    if (method === 'PATCH') {
        try {
            const { viewerId } = req.query;
            if (!viewerId) {
                return res.status(400).json({ error: 'Viewer ID required' });
            }

            await query(
                `UPDATE notifications SET is_read = TRUE WHERE viewer_id = $1 AND is_read = FALSE`,
                [viewerId]
            );

            return res.status(200).json({ message: 'Notifications marked as read' });
        } catch (error) {
            console.error('Error updating notifications:', error);
            return res.status(500).json({ error: 'Error updating notifications' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
