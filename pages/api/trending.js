import { query } from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { category = null, days = 1 } = req.query;
        const daysInt = Math.min(Math.max(parseInt(days) || 1, 1), 30);

        let sql = `
        SELECT 
        s.id, s.content, s.category, s.created_at, s.is_pinned, s.is_suspicious, s.is_admin_post,
        s.user_gender, s.user_age, s.user_country, s.view_count,
        COALESCE((SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = 'fire'), 0) as fire_count,
        COALESCE((SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = 'heart'), 0) as heart_count,
        COALESCE((SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = 'laugh'), 0) as laugh_count,
        COALESCE((SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = 'wow'), 0) as wow_count,
        COALESCE((SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = 'clap'), 0) as clap_count,
        COALESCE((SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = '100'), 0) as count_100,
        COALESCE((SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = 'sad'), 0) as sad_count,
        COALESCE((SELECT COUNT(*) FROM secrets WHERE parent_id = s.id), 0) as reply_count,
        (s.view_count + COALESCE((SELECT COUNT(*) FROM reactions WHERE secret_id = s.id), 0) + COALESCE((SELECT COUNT(*) FROM secrets WHERE parent_id = s.id), 0)) as score
        FROM secrets s
        WHERE s.parent_id IS NULL 
        AND s.created_at >= NOW() - INTERVAL '1 day' * $1
        `;

        const params = [daysInt];

        if (category && category !== 'todos') {
            sql += ` AND s.category = $2`;
            params.push(category);
        }

        sql += ` ORDER BY score DESC LIMIT 20`;

        const result = await query(sql, params);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching trending:', error);
        return res.status(500).json({ error: 'Error fetching trending' });
    }
}
