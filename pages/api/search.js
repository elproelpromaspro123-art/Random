import { query } from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { q = '', category = null, sort = 'recent', limit = 50, offset = 0 } = req.query;

        const limitInt = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
        const offsetInt = Math.max(parseInt(offset) || 0, 0);
        const searchTerm = q.replace(/'/g, "''").substring(0, 200);

        let sql = `
        SELECT s.id, s.content, s.parent_id, s.is_pinned, s.is_suspicious, s.is_admin_post, s.category, s.user_gender, s.user_age, s.user_country, s.created_at, s.view_count,
             COALESCE(fire_reactions.count, 0) as fire_count,
             COALESCE(heart_reactions.count, 0) as heart_count,
             COALESCE(laugh_reactions.count, 0) as laugh_count,
             COALESCE(wow_reactions.count, 0) as wow_count,
             COALESCE(clap_reactions.count, 0) as clap_count,
             COALESCE(count_100_reactions.count, 0) as count_100,
             COALESCE(sad_reactions.count, 0) as sad_count,
             COALESCE(reply_count.count, 0) as reply_count
        FROM secrets s
        LEFT JOIN (SELECT secret_id, COUNT(*) as count FROM reactions WHERE type = 'fire' GROUP BY secret_id) fire_reactions ON s.id = fire_reactions.secret_id
        LEFT JOIN (SELECT secret_id, COUNT(*) as count FROM reactions WHERE type = 'heart' GROUP BY secret_id) heart_reactions ON s.id = heart_reactions.secret_id
        LEFT JOIN (SELECT secret_id, COUNT(*) as count FROM reactions WHERE type = 'laugh' GROUP BY secret_id) laugh_reactions ON s.id = laugh_reactions.secret_id
        LEFT JOIN (SELECT secret_id, COUNT(*) as count FROM reactions WHERE type = 'wow' GROUP BY secret_id) wow_reactions ON s.id = wow_reactions.secret_id
        LEFT JOIN (SELECT secret_id, COUNT(*) as count FROM reactions WHERE type = 'clap' GROUP BY secret_id) clap_reactions ON s.id = clap_reactions.secret_id
        LEFT JOIN (SELECT secret_id, COUNT(*) as count FROM reactions WHERE type = '100' GROUP BY secret_id) count_100_reactions ON s.id = count_100_reactions.secret_id
        LEFT JOIN (SELECT secret_id, COUNT(*) as count FROM reactions WHERE type = 'sad' GROUP BY secret_id) sad_reactions ON s.id = sad_reactions.secret_id
        LEFT JOIN (SELECT parent_id, COUNT(*) as count FROM secrets WHERE parent_id IS NOT NULL GROUP BY parent_id) reply_count ON s.id = reply_count.parent_id
        WHERE s.parent_id IS NULL
        `;

        // Validar sort parameter para prevenir SQL injection
        let orderBy = 's.is_pinned DESC, s.created_at DESC';
        const validSortOptions = ['recent', 'trending', 'reactions', 'replies'];
        if (validSortOptions.includes(sort)) {
            if (sort === 'trending') {
                orderBy = 's.is_pinned DESC, (s.view_count + COALESCE(fire_reactions.count, 0) + COALESCE(heart_reactions.count, 0) + COALESCE(reply_count.count, 0)) DESC';
            } else if (sort === 'reactions') {
                orderBy = 's.is_pinned DESC, (COALESCE(fire_reactions.count, 0) + COALESCE(heart_reactions.count, 0)) DESC';
            } else if (sort === 'replies') {
                orderBy = 's.is_pinned DESC, COALESCE(reply_count.count, 0) DESC';
            }
        }

        const params = [];

        if (searchTerm) {
            sql += ` AND content ILIKE $${params.length + 1}`;
            params.push(`%${searchTerm}%`);
        }

        if (category && category !== 'todos') {
            sql += ` AND category = $${params.length + 1}`;
            params.push(category);
        }

        sql += ` ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limitInt, offsetInt);

        const result = await query(sql, params);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error searching secrets:', error);
        return res.status(500).json({ error: 'Error searching secrets' });
    }
}
