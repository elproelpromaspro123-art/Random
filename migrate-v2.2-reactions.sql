-- ============================================
-- Migration: v2.2 - New Reaction Types
-- ============================================
-- Purpose: Upgrade reaction system from 2 types to 7 types
-- New Types: laugh, wow, clap, 100, sad (+ existing fire, heart)
-- Date: 2025-12-24

BEGIN;

-- Step 1: Drop the old constraint
ALTER TABLE reactions 
DROP CONSTRAINT IF EXISTS reactions_type_check;

-- Step 2: Update the CHECK constraint to support all 7 reaction types
ALTER TABLE reactions
ADD CONSTRAINT reactions_type_check CHECK (type IN ('fire', 'heart', 'laugh', 'wow', 'clap', '100', 'sad'));

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(type);
CREATE INDEX IF NOT EXISTS idx_reactions_secret_id ON reactions(secret_id);
CREATE INDEX IF NOT EXISTS idx_reactions_secret_type ON reactions(secret_id, type);

-- Step 4: Verify the changes
-- These queries will show you the current state:

-- Check constraint exists and is valid
SELECT 
    constraint_name, 
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'reactions' 
    AND constraint_name LIKE '%type%';

-- Show total reactions by type (for current data verification)
SELECT 
    type, 
    COUNT(*) as total_reactions
FROM reactions
GROUP BY type
ORDER BY total_reactions DESC;

-- Show index information
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'reactions'
ORDER BY indexname;

-- Step 5: Update notificación
-- ✅ Migration complete! Your database now supports:
-- 🔥 fire - Hot/Controversial
-- ❤️ heart - Love/Care
-- 😂 laugh - Funny/Amusing
-- 😮 wow - Surprising/Amazing
-- 👏 clap - Inspiring/Great
-- 💯 100 - Perfect
-- 😢 sad - Sad/Empathetic

COMMIT;
