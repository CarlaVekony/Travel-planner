-- Create database (run this in pgAdmin 4)
CREATE DATABASE vacation_planner;

-- Connect to the vacation_planner database and run the following:

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create itineraries table
CREATE TABLE itineraries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create activities table
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    notes TEXT,
    itinerary_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_activities_itinerary_id ON activities(itinerary_id);
CREATE INDEX idx_activities_date ON activities(date);

-- Insert sample data for testing
INSERT INTO users (firebase_uid, email, name) VALUES 
('sample-firebase-uid-1', 'test@example.com', 'Test User');

INSERT INTO itineraries (name, location, start_date, end_date, notes, user_id) VALUES 
('Summer Trip to Rome', 'Rome, Italy', '2024-06-01', '2024-06-05', 'First time visiting Rome!', 1),
('Weekend in Paris', 'Paris, France', '2024-07-15', '2024-07-17', 'Romantic weekend getaway', 1);

INSERT INTO activities (name, location, start_time, duration, cost, date, latitude, longitude, notes, itinerary_id) VALUES 
('Visit Colosseum', 'Colosseum, Rome', '09:00:00', 120, 25.00, '2024-06-01', 41.8902, 12.4922, 'Book tickets in advance', 1),
('Lunch at Trattoria', 'Trattoria da Mario, Rome', '12:00:00', 90, 45.00, '2024-06-01', 41.9000, 12.5000, 'Try the carbonara', 1),
('Eiffel Tower Visit', 'Eiffel Tower, Paris', '10:00:00', 180, 30.00, '2024-07-15', 48.8584, 2.2945, 'Go to the top floor', 2);
