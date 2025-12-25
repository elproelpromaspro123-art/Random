-- Crear tabla de secretos
CREATE TABLE IF NOT EXISTS secrets (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  parent_id INTEGER REFERENCES secrets(id) ON DELETE CASCADE,
  creator_viewer_id VARCHAR(100),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_suspicious BOOLEAN DEFAULT FALSE,
  is_admin_post BOOLEAN DEFAULT FALSE,
  category VARCHAR(50) DEFAULT 'general',
  user_gender VARCHAR(50),
  user_age INTEGER,
  user_country VARCHAR(50),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de reacciones
CREATE TABLE IF NOT EXISTS reactions (
  id SERIAL PRIMARY KEY,
  secret_id INTEGER NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('fire', 'heart', 'laugh', 'wow', 'clap', '100', 'sad')),
  user_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(secret_id, type, user_ip)
);

-- Crear tabla de reportes
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  secret_id INTEGER NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_secrets_parent_id ON secrets(parent_id);
CREATE INDEX IF NOT EXISTS idx_secrets_created_at ON secrets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_secrets_is_pinned ON secrets(is_pinned);
CREATE INDEX IF NOT EXISTS idx_secrets_category ON secrets(category);
CREATE INDEX IF NOT EXISTS idx_secrets_user_gender ON secrets(user_gender);
CREATE INDEX IF NOT EXISTS idx_secrets_user_country ON secrets(user_country);
CREATE INDEX IF NOT EXISTS idx_secrets_creator_viewer_id ON secrets(creator_viewer_id);
CREATE INDEX IF NOT EXISTS idx_reports_secret_id ON reports(secret_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(type);
CREATE INDEX IF NOT EXISTS idx_reactions_secret_type ON reactions(secret_id, type);
CREATE INDEX IF NOT EXISTS idx_reactions_user_ip ON reactions(user_ip);
