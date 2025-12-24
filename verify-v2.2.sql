-- ============================================
-- v2.2 Verification Script
-- ============================================
-- Run this AFTER the migration to verify everything is correct

\echo '======================================'
\echo 'Cementerio de Secretos v2.2 Verification'
\echo '======================================'
\echo ''

-- Check 1: Verify constraint exists
\echo '1️⃣  Checking reaction type constraint...'
SELECT 
    CASE 
        WHEN constraint_name LIKE '%type%' THEN '✅ Constraint exists'
        ELSE '❌ Constraint missing'
    END as status
FROM information_schema.table_constraints 
WHERE table_name = 'reactions' 
    AND constraint_type = 'CHECK'
LIMIT 1;

\echo ''

-- Check 2: Show constraint details
\echo '2️⃣  Constraint details:'
SELECT check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'reactions';

\echo ''

-- Check 3: Current reaction types in database
\echo '3️⃣  Existing reactions by type:'
SELECT 
    COALESCE(type, 'NONE') as "Reaction Type",
    COUNT(*) as "Total Count"
FROM reactions
GROUP BY type
ORDER BY "Total Count" DESC;

\echo ''

-- Check 4: Verify indexes
\echo '4️⃣  Reaction table indexes:'
SELECT 
    indexname,
    idx_scan as "Times Used",
    idx_tup_read as "Tuples Read"
FROM pg_stat_user_indexes 
WHERE relname = 'reactions'
ORDER BY indexname;

\echo ''

-- Check 5: Table structure
\echo '5️⃣  Reactions table structure:'
\d reactions

\echo ''

-- Check 6: Verify no invalid reaction types
\echo '6️⃣  Checking for invalid reaction types...'
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ All reactions are valid'
        ELSE '⚠️  Found ' || COUNT(*) || ' invalid reactions'
    END as status,
    STRING_AGG(DISTINCT type, ', ') as "Invalid Types"
FROM reactions
WHERE type NOT IN ('fire', 'heart', 'laugh', 'wow', 'clap', '100', 'sad');

\echo ''

-- Check 7: Statistics
\echo '7️⃣  Overall statistics:'
SELECT 
    'Total Reactions' as metric,
    COUNT(*) as value
FROM reactions
UNION ALL
SELECT 
    'Total Secrets',
    COUNT(*)
FROM secrets
WHERE parent_id IS NULL
UNION ALL
SELECT 
    'Total Replies',
    COUNT(*)
FROM secrets
WHERE parent_id IS NOT NULL;

\echo ''
\echo '======================================'
\echo '✅ Verification complete!'
\echo '======================================'
