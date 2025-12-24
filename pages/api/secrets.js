import { query } from '../../lib/db';
import { checkSuspiciousContent, sanitizeContent } from '../../lib/moderation';
import { verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
            const offset = Math.max(parseInt(req.query.offset) || 0, 0);
            const result = await query(
                `SELECT id, content, parent_id, is_pinned, is_suspicious, is_admin_post, category, user_gender, user_age, user_country, created_at, 
                (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = 'fire') as fire_count,
                (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = 'heart') as heart_count,
                (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = 'laugh') as laugh_count,
                (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = 'wow') as wow_count,
                (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = 'clap') as clap_count,
                (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = '100') as count_100,
                (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = 'sad') as sad_count
            FROM secrets 
            WHERE parent_id IS NULL
            ORDER BY is_pinned DESC, created_at DESC 
            LIMIT $1 OFFSET $2`,
                [limit, offset]
            );
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching secrets:', error);
            return res.status(500).json({ error: 'Error fetching secrets' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { content, parentId = null, category = 'general', gender = null, age = null, country = null, creatorViewerId = null } = req.body;

            if (!content || content.trim().length === 0) {
                return res.status(400).json({ error: 'Content is required' });
            }

            const sanitized = sanitizeContent(content);
            const isSuspicious = checkSuspiciousContent(sanitized);
            const token = req.headers.authorization?.split(' ')[1];
            const isAdminPost = verifyToken(token) !== null;

            console.log('Creating secret with:', { category, gender, age, country, creatorViewerId });

            const result = await query(
                `INSERT INTO secrets (content, parent_id, creator_viewer_id, is_suspicious, is_admin_post, category, user_gender, user_age, user_country, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING id, content, parent_id, creator_viewer_id, is_pinned, is_suspicious, is_admin_post, category, user_gender, user_age, user_country, created_at`,
                [sanitized, parentId, creatorViewerId, isSuspicious, isAdminPost, category, gender, age, country]
            );

            console.log('Secret created:', result.rows[0]);

            return res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating secret:', error);
            return res.status(500).json({ error: 'Error creating secret' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
