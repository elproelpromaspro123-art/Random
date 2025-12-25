import { query } from '../../lib/db';
import { verifyToken } from '../../lib/auth';
import { getUserIP } from '../../lib/ip';

// Rate limiting en memoria por IP (no persistente, se resetea con servidor)
const reactionRateLimit = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 segundo
const MAX_REACTIONS_PER_WINDOW = 1; // Máximo 1 reacción por segundo por IP

function checkRateLimit(userIP, secretId, reactionType) {
    const key = `${userIP}_${secretId}_${reactionType}`;
    const now = Date.now();
    const lastAttempt = reactionRateLimit.get(key);

    if (lastAttempt && now - lastAttempt < RATE_LIMIT_WINDOW) {
        return false; // Rate limit excedido
    }

    reactionRateLimit.set(key, now);
    return true; // OK
}

export default async function handler(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const isAdmin = verifyToken(token) !== null;

    // GET - Obtener respuestas anidadas
    if (req.method === 'GET') {
        try {
            const secretId = parseInt(req.query.secretId);
            if (isNaN(secretId)) {
                return res.status(400).json({ error: 'Invalid secret ID' });
            }
            const result = await query(
                `SELECT 
           s.id, s.content, s.parent_id, s.is_pinned, s.is_suspicious, s.is_admin_post, 
           s.category, s.user_gender, s.user_age, s.user_country, s.view_count, s.created_at,
           (SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = 'fire') as fire_count,
           (SELECT COUNT(*) FROM reactions WHERE secret_id = s.id AND type = 'heart') as heart_count,
           p.id as reply_to_id, p.content as reply_to_content, p.created_at as reply_to_created_at
         FROM secrets s
         LEFT JOIN secrets p ON s.parent_id = p.id
         WHERE s.parent_id = $1 OR (s.parent_id IS NOT NULL AND s.parent_id IN (SELECT id FROM secrets WHERE parent_id = $1))
         ORDER BY s.created_at DESC`,
                [secretId]
            );
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching replies:', error);
            return res.status(500).json({ error: 'Error fetching replies' });
        }
    }

    // POST - Agregar reacción o reporte
    if (req.method === 'POST') {
        try {
            const { action, secretId, reactionType, reason } = req.body;

            if (action === 'react') {
                const id = parseInt(secretId);
                if (isNaN(id) || !['fire', 'heart', 'laugh', 'wow', 'clap', '100', 'sad'].includes(reactionType)) {
                    return res.status(400).json({ error: 'Invalid reaction type or secret ID' });
                }

                const userIP = getUserIP(req);

                // Verificar rate limiting
                if (!checkRateLimit(userIP, id, reactionType)) {
                    return res.status(429).json({ error: 'Rate limit exceeded. Espera 1 segundo antes de reaccionar de nuevo.' });
                }

                // Verificar si ya existe la reacción
                const existing = await query(
                    `SELECT id FROM reactions WHERE secret_id = $1 AND type = $2 AND user_ip = $3`,
                    [id, reactionType, userIP]
                );

                if (existing.rows.length > 0) {
                    // Si existe, eliminar (toggle OFF)
                    await query(
                        `DELETE FROM reactions WHERE secret_id = $1 AND type = $2 AND user_ip = $3`,
                        [id, reactionType, userIP]
                    );
                    return res.status(200).json({ message: 'Reaction removed', added: false });
                } else {
                    // Si no existe, agregar (toggle ON)
                    await query(
                        `INSERT INTO reactions (secret_id, type, user_ip) VALUES ($1, $2, $3)`,
                        [id, reactionType, userIP]
                    );
                    return res.status(201).json({ message: 'Reaction added', added: true });
                }
            }

            if (action === 'report') {
                // Validar que reason no esté vacío y tenga límite de longitud
                if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
                    return res.status(400).json({ error: 'Report reason is required' });
                }
                
                const trimmedReason = reason.trim().substring(0, 1000); // Limitar a 1000 caracteres
                
                await query(
                    `INSERT INTO reports (secret_id, reason, created_at) VALUES ($1, $2, NOW())`,
                    [secretId, trimmedReason]
                );
                return res.status(201).json({ message: 'Report submitted' });
            }

            return res.status(400).json({ error: 'Invalid action' });
        } catch (error) {
            console.error('Error in interaction:', error);
            return res.status(500).json({ error: 'Error processing interaction' });
        }
    }

    // DELETE - Eliminar secreto (solo admin)
    if (req.method === 'DELETE') {
        if (!isAdmin) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const secretId = parseInt(req.query.secretId);
            if (isNaN(secretId)) {
                return res.status(400).json({ error: 'Invalid secret ID' });
            }
            await query(`DELETE FROM secrets WHERE id = $1`, [secretId]);
            return res.status(200).json({ message: 'Secret deleted' });
        } catch (error) {
            console.error('Error deleting secret:', error);
            return res.status(500).json({ error: 'Error deleting secret' });
        }
    }

    // PATCH - Fijar secreto (solo admin)
    if (req.method === 'PATCH') {
        if (!isAdmin) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const secretId = parseInt(req.body.secretId);
            if (isNaN(secretId) || typeof req.body.isPinned !== 'boolean') {
                return res.status(400).json({ error: 'Invalid parameters' });
            }
            await query(
                `UPDATE secrets SET is_pinned = $1 WHERE id = $2`,
                [req.body.isPinned, secretId]
            );
            return res.status(200).json({ message: 'Secret updated' });
        } catch (error) {
            console.error('Error updating secret:', error);
            return res.status(500).json({ error: 'Error updating secret' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
