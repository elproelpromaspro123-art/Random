-- Migración para agregar user_ip a reactions
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS user_ip VARCHAR(45);

-- Eliminar constraint anterior y crear uno nuevo
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_secret_id_type_key;
ALTER TABLE reactions ADD CONSTRAINT reactions_secret_id_type_user_ip_key UNIQUE(secret_id, type, user_ip);

-- Crear índice para búsquedas rápidas por IP (el UNIQUE constraint ya crea su índice automáticamente)
CREATE INDEX IF NOT EXISTS idx_reactions_user_ip ON reactions(user_ip);

-- Eliminar índice duplicado si existe
DROP INDEX IF EXISTS idx_reactions_secret_type_ip;
