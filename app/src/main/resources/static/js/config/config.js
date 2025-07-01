// Base configuration for the browser environment
const config = {
    API_BASE_URL: 'http://localhost:8080', // Corrected port
    AUTH_TIMEOUT: 3600000, // 1 hour in milliseconds
    MAX_RETRIES: 3,
    SPECIALTY_OPTIONS: [
        'General Medicine',
        'Cardiology',
        'Pediatrics',
        'Dermatology',
        'Orthopedics'
    ],
    APPOINTMENT_STATUSES: {
        PENDING: 'PENDING',
        CONFIRMED: 'CONFIRMED',
        CANCELLED: 'CANCELLED',
        COMPLETED: 'COMPLETED'
    }
};

export default config;