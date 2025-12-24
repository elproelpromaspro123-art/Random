-- Agregar columnas faltantes a la tabla secrets

-- Verificar si las columnas existen antes de agregarlas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'secrets' AND column_name = 'category'
  ) THEN
    ALTER TABLE secrets ADD COLUMN category VARCHAR(50) DEFAULT 'general';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'secrets' AND column_name = 'user_gender'
  ) THEN
    ALTER TABLE secrets ADD COLUMN user_gender VARCHAR(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'secrets' AND column_name = 'user_age'
  ) THEN
    ALTER TABLE secrets ADD COLUMN user_age INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'secrets' AND column_name = 'user_country'
  ) THEN
    ALTER TABLE secrets ADD COLUMN user_country VARCHAR(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'secrets' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE secrets ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Crear índices para las nuevas columnas para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_secrets_category ON secrets(category);
CREATE INDEX IF NOT EXISTS idx_secrets_user_gender ON secrets(user_gender);
CREATE INDEX IF NOT EXISTS idx_secrets_user_country ON secrets(user_country);
