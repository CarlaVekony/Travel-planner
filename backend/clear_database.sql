-- Clear all data from the database
DELETE FROM activities;
DELETE FROM itineraries;
DELETE FROM users;

-- Reset the sequences to start from 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE itineraries_id_seq RESTART WITH 1;
ALTER SEQUENCE activities_id_seq RESTART WITH 1;

-- Verify the tables are empty
SELECT 'Users count:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Itineraries count:', COUNT(*) FROM itineraries
UNION ALL
SELECT 'Activities count:', COUNT(*) FROM activities;
