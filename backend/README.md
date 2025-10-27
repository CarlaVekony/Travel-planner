# Vacation Planner Backend

Spring Boot REST API for the Vacation Planner application.

## Features

- **User Management**: Create and manage users with Firebase authentication
- **Itinerary Management**: CRUD operations for travel itineraries
- **Activity Management**: CRUD operations for activities within itineraries
- **Budget Calculation**: Calculate total costs for itineraries and daily costs
- **PostgreSQL Integration**: Persistent data storage
- **CORS Support**: Configured for Angular frontend

## Prerequisites

- Java 21
- PostgreSQL 9.8+
- Gradle 7.0+

## Setup

1. **Install PostgreSQL** and create a database:
   ```sql
   CREATE DATABASE vacation_planner;
   ```

2. **Update application.properties**:
   - Set your PostgreSQL credentials
   - Add your Google Maps API key

3. **Run the application**:
   ```bash
   ./gradlew bootRun
   ```

## API Endpoints

### Users
- `POST /api/users` - Create or update user
- `GET /api/users/firebase/{firebaseUid}` - Get user by Firebase UID

### Itineraries
- `GET /api/itineraries?userId={userId}` - Get itineraries by user
- `GET /api/itineraries/{id}` - Get itinerary by ID
- `POST /api/itineraries` - Create itinerary
- `PUT /api/itineraries/{id}` - Update itinerary
- `DELETE /api/itineraries/{id}` - Delete itinerary

### Activities
- `GET /api/activities?itineraryId={id}` - Get activities by itinerary
- `GET /api/activities/{id}` - Get activity by ID
- `POST /api/activities` - Create activity
- `PUT /api/activities/{id}` - Update activity
- `DELETE /api/activities/{id}` - Delete activity
- `GET /api/activities/budget/total/{itineraryId}` - Get total cost
- `GET /api/activities/budget/date/{itineraryId}?date={date}` - Get activities by date

## Database Schema

### Users Table
- id (Primary Key)
- firebase_uid (Unique)
- email
- name

### Itineraries Table
- id (Primary Key)
- name
- location
- start_date
- end_date
- notes
- user_id (Foreign Key)

### Activities Table
- id (Primary Key)
- name
- location
- start_time
- duration
- cost
- date
- latitude
- longitude
- notes
- itinerary_id (Foreign Key)

## Configuration

Update `src/main/resources/application.properties` with your database credentials and API keys.
