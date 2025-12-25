import { query } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const isAdmin = verifyToken(token) !== null;

  if (!isAdmin) {
    return res.status(401).json({ error: 'Unauthorized - Admin only' });
  }

  try {
    const { content, category = 'general', created_at, fireCount = 0, heartCount = 0, laughCount = 0, wowCount = 0, clapCount = 0, count100 = 0, sadCount = 0 } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!created_at) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    // Validar categoría contra whitelist
    const validCategories = ['general', 'confesiones', 'consejos', 'historias', 'preguntas'];
    const validCategory = validCategories.includes(category) ? category : 'general';

    // Validar que la fecha sea válida
    const dateObj = new Date(created_at);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const result = await query(
      `INSERT INTO secrets (content, category, created_at, is_admin_post, is_suspicious, view_count, parent_id)
       VALUES ($1, $2, $3, FALSE, FALSE, 0, NULL)
       RETURNING id, content, category, created_at, is_admin_post, is_suspicious, is_pinned, parent_id,
                 (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = 'fire') as fire_count,
                 (SELECT COUNT(*) FROM reactions WHERE secret_id = secrets.id AND type = 'heart') as heart_count,
                 (SELECT COUNT(*) FROM secrets WHERE parent_id = secrets.id) as reply_count`,
      [content, validCategory, created_at]
    );

    const secretId = result.rows[0].id;

    // Agregar reacciones de fuego si se especifica
    if (fireCount > 0) {
      for (let i = 0; i < fireCount; i++) {
        await query(
          `INSERT INTO reactions (secret_id, type, user_ip) VALUES ($1, $2, $3)`,
          [secretId, 'fire', `admin_demo_${Date.now()}_${i}`]
        );
      }
    }

    // Agregar reacciones de corazón si se especifica
    if (heartCount > 0) {
      for (let i = 0; i < heartCount; i++) {
        await query(
          `INSERT INTO reactions (secret_id, type, user_ip) VALUES ($1, $2, $3)`,
          [secretId, 'heart', `admin_demo_${Date.now()}_heart_${i}`]
        );
      }
    }

    // Agregar reacciones de risa si se especifica
    if (laughCount > 0) {
      for (let i = 0; i < laughCount; i++) {
        await query(
          `INSERT INTO reactions (secret_id, type, user_ip) VALUES ($1, $2, $3)`,
          [secretId, 'laugh', `admin_demo_${Date.now()}_laugh_${i}`]
        );
      }
    }

    // Agregar reacciones de wow si se especifica
    if (wowCount > 0) {
      for (let i = 0; i < wowCount; i++) {
        await query(
          `INSERT INTO reactions (secret_id, type, user_ip) VALUES ($1, $2, $3)`,
          [secretId, 'wow', `admin_demo_${Date.now()}_wow_${i}`]
        );
      }
    }

    // Agregar reacciones de aplauso si se especifica
    if (clapCount > 0) {
      for (let i = 0; i < clapCount; i++) {
        await query(
          `INSERT INTO reactions (secret_id, type, user_ip) VALUES ($1, $2, $3)`,
          [secretId, 'clap', `admin_demo_${Date.now()}_clap_${i}`]
        );
      }
    }

    // Agregar reacciones de 100 si se especifica
    if (count100 > 0) {
      for (let i = 0; i < count100; i++) {
        await query(
          `INSERT INTO reactions (secret_id, type, user_ip) VALUES ($1, $2, $3)`,
          [secretId, '100', `admin_demo_${Date.now()}_100_${i}`]
        );
      }
    }

    // Agregar reacciones de tristeza si se especifica
    if (sadCount > 0) {
      for (let i = 0; i < sadCount; i++) {
        await query(
          `INSERT INTO reactions (secret_id, type, user_ip) VALUES ($1, $2, $3)`,
          [secretId, 'sad', `admin_demo_${Date.now()}_sad_${i}`]
        );
      }
    }

    // Recuperar el secreto actualizado con los conteos correctos
    const updatedResult = await query(
      `SELECT id, content, category, created_at, is_admin_post, is_suspicious, is_pinned, parent_id,
              (SELECT COUNT(*) FROM reactions WHERE secret_id = $1 AND type = 'fire') as fire_count,
              (SELECT COUNT(*) FROM reactions WHERE secret_id = $1 AND type = 'heart') as heart_count,
              (SELECT COUNT(*) FROM reactions WHERE secret_id = $1 AND type = 'laugh') as laugh_count,
              (SELECT COUNT(*) FROM reactions WHERE secret_id = $1 AND type = 'wow') as wow_count,
              (SELECT COUNT(*) FROM reactions WHERE secret_id = $1 AND type = 'clap') as clap_count,
              (SELECT COUNT(*) FROM reactions WHERE secret_id = $1 AND type = '100') as count_100,
              (SELECT COUNT(*) FROM reactions WHERE secret_id = $1 AND type = 'sad') as sad_count,
              (SELECT COUNT(*) FROM secrets WHERE parent_id = $1) as reply_count
       FROM secrets WHERE id = $1`,
      [secretId]
    );

    return res.status(201).json({
      message: 'Fake secret created successfully',
      secret: updatedResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating fake secret:', error);
    return res.status(500).json({ error: 'Error creating fake secret' });
  }
}
