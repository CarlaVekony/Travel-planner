# Travel Planner Application

A comprehensive travel planning application built with Angular frontend and Spring Boot backend, featuring Firebase authentication, PostgreSQL database, and Google Maps integration.

## Features

### ✅ Authentication & User Management
- Firebase Authentication for secure login/register
- User profile management
- Protected routes with auth guards

### ✅ Itinerary Management
- Create, read, update, delete itineraries
- Set trip duration, location, and notes
- User-specific itinerary storage

### ✅ Activity Planning
- Add activities to specific days
- GPS coordinates support for location tracking
- Time and duration management
- Personal notes for each activity

### ✅ Budget Management
- Real-time cost calculation
- Daily and total budget tracking
- Cost breakdown by day and activity

### ✅ Travel Time Integration
- Google Maps Distance Matrix API integration
- Travel time calculation between activities
- Distance estimation

## Technology Stack

### Frontend
- **Angular 20.3.0** - Modern web framework
- **TypeScript** - Type-safe development
- **Firebase** - Authentication service
- **RxJS** - Reactive programming
- **CSS3** - Modern styling with gradients and animations

### Backend
- **Spring Boot 3.5.6** - Java framework
- **Spring Data JPA** - Database abstraction
- **PostgreSQL** - Relational database
- **Gradle** - Build automation
- **WebFlux** - Reactive web client for Google Maps API

### Database
- **PostgreSQL 9.8** - Primary database
- **pgAdmin4** - Database administration

## Project Structure

```
Travel-planner/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/             # Main application pages
│   │   │   ├── login/         # Authentication pages
│   │   │   ├── itineraries/   # Itinerary management
│   │   │   └── activities/    # Activity planning
│   │   ├── services/          # API and business logic
│   │   └── register/          # User registration
│   └── environments/          # Configuration files
└── backend/
    └── src/main/java/com/example/vacationPlanner/
        ├── controller/        # REST API endpoints
        ├── model/            # Data entities and DTOs
        ├── repository/        # Data access layer
        └── service/          # Business logic
```

## Getting Started

### Prerequisites
- Node.js v22.20.2+
- npm v10.9.3+
- Java 21+
- PostgreSQL 9.8+
- Gradle (included)

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd Travel-planner
   npm install
   ```

2. **Configure Firebase**
   - Update `src/environments/firebase-config.ts` with your Firebase project credentials

3. **Start development server**
   ```bash
   ng serve
   ```
   Application will be available at `http://localhost:4200`

### Backend Setup

1. **Database Configuration**
   ```sql
   CREATE DATABASE travel_planner;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE travel_planner TO postgres;
   ```

2. **Update application.properties**
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/travel_planner
   spring.datasource.username=postgres
   spring.datasource.password=password
   ```

3. **Run the application**
   ```bash
   cd backend
   ./gradlew bootRun
   ```
   Backend will be available at `http://localhost:8080`

### Google Maps Integration

1. **Get API Key**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Distance Matrix API
   - Create API key

2. **Configure Backend**
   ```properties
   google.maps.api.key=YOUR_API_KEY_HERE
   ```

## API Endpoints

### Authentication
- `POST /api/users` - Create/update user
- `GET /api/users/firebase/{uid}` - Get user by Firebase UID

### Itineraries
- `GET /api/itineraries?userId={id}` - Get user itineraries
- `GET /api/itineraries/{id}` - Get specific itinerary
- `POST /api/itineraries?userId={id}` - Create itinerary
- `PUT /api/itineraries/{id}` - Update itinerary
- `DELETE /api/itineraries/{id}` - Delete itinerary

### Activities
- `GET /api/activities?itineraryId={id}` - Get itinerary activities
- `POST /api/activities` - Create activity
- `PUT /api/activities/{id}` - Update activity
- `DELETE /api/activities/{id}` - Delete activity
- `GET /api/activities/travel-time` - Get travel time between locations
- `GET /api/activities/budget/total/{id}` - Get total cost
- `GET /api/activities/budget/daily/{id}` - Get daily costs

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL
);
```

### Itineraries Table
```sql
CREATE TABLE itineraries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    user_id BIGINT REFERENCES users(id)
);
```

### Activities Table
```sql
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    cost DECIMAL(10,2),
    activity_date DATE NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    notes TEXT,
    itinerary_id BIGINT REFERENCES itineraries(id)
);
```

## Features in Detail

### 1. User Authentication
- Secure Firebase authentication
- Automatic user creation in backend
- Session management with auth guards
- Real-time authentication state

### 2. Itinerary Management
- Create multiple trips
- Set trip duration and location
- Add general notes
- Visual trip cards with summary

### 3. Activity Planning
- Day-by-day activity organization
- Time and duration tracking
- GPS coordinate support
- Cost tracking per activity
- Personal notes and reminders

### 4. Budget Management
- Real-time cost calculation
- Daily budget breakdown
- Total trip cost tracking
- Cost analysis by activity type

### 5. Travel Optimization
- Google Maps integration
- Travel time calculation
- Distance estimation
- Route optimization suggestions

## Development

### Running Tests
```bash
# Frontend tests
ng test

# Backend tests
cd backend
./gradlew test
```

### Building for Production
```bash
# Frontend
ng build --configuration production

# Backend
cd backend
./gradlew build
```

## Deployment

### Frontend Deployment
- Build the Angular application
- Deploy to any static hosting service (Netlify, Vercel, etc.)
- Update API endpoints for production

### Backend Deployment
- Build the Spring Boot JAR
- Deploy to cloud platforms (AWS, Google Cloud, Heroku)
- Configure production database
- Set environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Angular, Spring Boot, and Firebase**