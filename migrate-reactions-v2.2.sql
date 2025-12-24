-- Migration: Add new reaction types (laugh, wow, clap, 100, sad)
-- Version: 2.2
-- Purpose: Support 7 types of reactions instead of just 2

-- Note: The reactions table already exists from previous versions.
-- This migration doesn't need to modify the schema since the 'type' column
-- is already VARCHAR and can accommodate the new reaction types.

-- However, we'll add a CHECK constraint to ensure data integrity
-- First, check if the constraint exists and drop it if it does
ALTER TABLE reactions 
DROP CONSTRAINT IF EXISTS valid_reaction_type;

-- Add the updated constraint with all 7 reaction types
ALTER TABLE reactions
ADD CONSTRAINT valid_reaction_type CHECK (type IN ('fire', 'heart', 'laugh', 'wow', 'clap', '100', 'sad'));

-- Optional: Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(type);
CREATE INDEX IF NOT EXISTS idx_reactions_secret_type ON reactions(secret_id, type);

-- Verify the constraint was added successfully
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'reactions' AND constraint_name LIKE 'valid_reaction_type';

-- Show all reaction types that currently exist in the database (for verification)
SELECT DISTINCT type FROM reactions ORDER BY type;

-- Migration complete
COMMIT;
