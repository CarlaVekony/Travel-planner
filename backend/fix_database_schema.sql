-- Fix the database schema to match the reverted backend code
-- The backend now expects a single 'location' column, not 'country' and 'city'

-- First, let's check what columns currently exist
\d itineraries;

-- If there are 'country' and 'city' columns, we need to merge them back to 'location'
-- If there's already a 'location' column, we're good

-- Check if we need to add the location column back
DO $$
BEGIN
    -- Check if location column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'itineraries' AND column_name = 'location') THEN
        
        -- Add location column if it doesn't exist
        ALTER TABLE itineraries ADD COLUMN location VARCHAR(255);
        
        -- If country and city columns exist, merge them into location
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'itineraries' AND column_name = 'country') THEN
            UPDATE itineraries SET location = CONCAT(city, ', ', country) 
            WHERE location IS NULL AND city IS NOT NULL AND country IS NOT NULL;
            
            -- Drop the country and city columns
            ALTER TABLE itineraries DROP COLUMN IF EXISTS country;
            ALTER TABLE itineraries DROP COLUMN IF EXISTS city;
        END IF;
        
        -- Make location column NOT NULL
        ALTER TABLE itineraries ALTER COLUMN location SET NOT NULL;
    END IF;
END $$;

-- Verify the final schema
\d itineraries;
