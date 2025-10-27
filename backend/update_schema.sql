-- Update the itineraries table to use country and city instead of location
ALTER TABLE itineraries ADD COLUMN country VARCHAR(255);
ALTER TABLE itineraries ADD COLUMN city VARCHAR(255);

-- Update existing data (if any) - you can modify this based on your needs
-- For now, we'll set default values since the table is empty
UPDATE itineraries SET country = 'Unknown', city = 'Unknown' WHERE country IS NULL;

-- Make the new columns NOT NULL
ALTER TABLE itineraries ALTER COLUMN country SET NOT NULL;
ALTER TABLE itineraries ALTER COLUMN city SET NOT NULL;

-- Drop the old location column
ALTER TABLE itineraries DROP COLUMN location;

-- Verify the changes
\d itineraries
