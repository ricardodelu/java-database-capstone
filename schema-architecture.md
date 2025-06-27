# Clinic Management System Architecture

## Overview
This Spring Boot application follows a layered architecture with clear separation between presentation, business logic, and data access layers. The system serves three main user roles: Admin, Doctor, and Patient, each with their own dedicated dashboard and API endpoints.

## Technology Stack
- **Frontend**: Thymeleaf (Admin, Patient & Doctor dashboards)
- **Backend**: Spring Boot 3.x with Spring Security
- **Database**: 
  - MySQL (Primary database for all structured data)
  - MongoDB (Planned for future prescription management)
- **Authentication**: JWT (JSON Web Tokens)
- **Build Tool**: Maven

## Architecture Layers

### 1. Presentation Layer
- **Thymeleaf Templates** (Server-side rendering)
  - Admin Dashboard (`/admin/dashboard`)
  - Doctor Dashboard (`/doctor/dashboard`)
- **RESTful APIs** (Client-side rendering)
  - Patient Dashboard (served as static content with API calls)


### 2. Controller Layer
- **AdminController** (`/api/admin/**`)
  - Handles admin authentication and dashboard operations
  - Manages doctor registrations and profiles
  - Views system statistics

- **DoctorController** (`/api/doctors/**`)
  - Handles doctor authentication and profile management
  - Manages doctor's appointment schedule
  - Handles prescription management (future)

- **PatientController** (`/api/patients/**`)
  - Handles patient registration and authentication
  - Manages patient profiles and medical history
  - Handles appointment booking and management

- **AppointmentController** (`/api/appointments/**`)
  - Manages appointment scheduling and availability
  - Handles booking, cancellation, and rescheduling
  - Provides appointment history and upcoming appointments

- **DashboardController** (MVC Controllers)
  - Serves the main dashboard views for admin and doctor roles
  - Handles server-side rendering with Thymeleaf

### 3. Service Layer
- **AppService**: Core business logic for admin operations
- **DoctorService**: Doctor-specific business logic
- **PatientService**: Patient management and operations
- **AppointmentService**: Manages all appointment-related operations
- **AuthService**: Handles authentication and authorization

### 4. Repository Layer
- **JPA Repositories** for MySQL entities:
  - DoctorRepository
  - PatientRepository
  - AppointmentRepository
  - AdminRepository
- **MongoDB Repositories** (future):
  - PrescriptionRepository

## Data Flow

### Admin Dashboard Flow
1. Admin logs in through `/api/admin/login`
2. Dashboard loads initial data via `/api/admin/dashboard`
3. Admin can view, add, edit, or delete doctors
4. System updates are reflected in real-time via API calls

### Doctor Dashboard Flow
1. Doctor logs in through `/api/doctors/login`
2. Dashboard loads doctor's profile and schedule
3. Doctor can view upcoming appointments (`/api/doctors/{email}/appointments`)
4. Doctor can update availability and profile information

### Patient Dashboard Flow
1. Patient logs in through `/api/patients/login`
2. Dashboard loads patient's appointments and medical history
3. Patient can:
   - Book new appointments (`/api/appointments/book`)
   - View upcoming appointments (`/api/patients/{email}/appointments`)
   - Check doctor availability (`/api/appointments/available-slots`)
   - Update profile information

## Security
- JWT-based authentication for API endpoints
- Role-based access control (ADMIN, DOCTOR, PATIENT)
- CSRF protection for forms
- Password hashing with BCrypt

## Frontend Architecture

### Admin & Doctor Dashboards
- Server-rendered with Thymeleaf
- Progressive enhancement with JavaScript
- Responsive design with Bootstrap

### Patient Dashboard
- Single Page Application (SPA) architecture
- REST API communication via fetch/axios
- Dynamic content loading
- Form validation and error handling

## Future Considerations
1. Implement WebSocket for real-time updates
2. Add WebRTC for telemedicine features
3. Expand MongoDB integration for document management
4. Develop native mobile applications
5. Add comprehensive logging and monitoring

## Deployment
- Containerized with Docker
- Can be deployed to any cloud provider
- Environment-specific configurations
- Database migration support
