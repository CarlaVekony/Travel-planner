# Database Setup Guide

## Step 1: Create Database in pgAdmin 4

1. **Open pgAdmin 4**
2. **Connect to your PostgreSQL server**
3. **Right-click on "Databases" → "Create" → "Database"**
4. **Name:** `vacation_planner`
5. **Click "Save"**

## Step 2: Run the SQL Script

1. **In pgAdmin 4, right-click on the `vacation_planner` database**
2. **Select "Query Tool"**
3. **Copy and paste the contents of `backend/database_setup.sql`**
4. **Click the "Execute" button (F5)**

## Step 3: Verify Tables Created

After running the script, you should see these tables:
- `users`
- `itineraries` 
- `activities`

## Step 4: Update Backend Configuration

Update `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/vacation_planner
spring.datasource.username=your_postgres_username
spring.datasource.password=your_postgres_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:4200
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*

# Google Maps API Key (replace with your actual API key)
google.maps.api.key=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

## Step 5: Test the Backend

1. **Open IntelliJ IDEA**
2. **Open the `backend` folder**
3. **Run `VacationPlannerApplication.java`**
4. **Check console for "Started VacationPlannerApplication"**

## Troubleshooting

### If tables don't appear:
- Make sure you're connected to the `vacation_planner` database
- Check that the SQL script ran without errors
- Verify your PostgreSQL server is running

### If backend won't start:
- Check your database credentials in `application.properties`
- Make sure PostgreSQL is running
- Verify the database `vacation_planner` exists
