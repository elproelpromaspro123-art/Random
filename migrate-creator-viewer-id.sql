-- Migración para agregar creator_viewer_id a secrets
ALTER TABLE secrets ADD COLUMN IF NOT EXISTS creator_viewer_id VARCHAR(100);

-- Crear índice para búsquedas rápidas de secretos por creador
CREATE INDEX IF NOT EXISTS idx_secrets_creator_viewer_id ON secrets(creator_viewer_id);
