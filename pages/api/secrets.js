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

             // Validar categoría contra whitelist
             const validCategories = ['general', 'confesiones', 'consejos', 'historias', 'preguntas'];
             const validCategory = validCategories.includes(category) ? category : 'general';

             // Validar y limitar género
             const validGenders = ['masculino', 'femenino', 'otro', ''];
             const validGender = gender && validGenders.includes(gender.toLowerCase()) ? gender : null;

             // Validar y limitar edad (si se proporciona debe ser número entre 13 y 120)
             const validAge = age && !isNaN(age) && age >= 13 && age <= 120 ? parseInt(age) : null;

             // Validar y limitar país (máximo 100 caracteres)
             const validCountry = country && typeof country === 'string' && country.trim().length > 0 ? country.trim().substring(0, 100) : null;

             const sanitized = sanitizeContent(content);
             const isSuspicious = checkSuspiciousContent(sanitized);
             const token = req.headers.authorization?.split(' ')[1];
             const isAdminPost = verifyToken(token) !== null;

             console.log('Creating secret with:', { validCategory, validGender, validAge, validCountry, creatorViewerId });

             const result = await query(
                 `INSERT INTO secrets (content, parent_id, creator_viewer_id, is_suspicious, is_admin_post, category, user_gender, user_age, user_country, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
             RETURNING id, content, parent_id, creator_viewer_id, is_pinned, is_suspicious, is_admin_post, category, user_gender, user_age, user_country, created_at`,
                 [sanitized, parentId, creatorViewerId, isSuspicious, isAdminPost, validCategory, validGender, validAge, validCountry]
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
