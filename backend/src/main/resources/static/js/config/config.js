// Environment detection
const ENV = {
    DEV: 'development',
    PROD: 'production',
    TEST: 'testing'
};

const currentEnv = process.env.NODE_ENV || ENV.DEV;

// Base configuration
const config = {
    development: {
        API_BASE_URL: 'http://localhost:8081',
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
    },
    production: {
        API_BASE_URL: 'https://api.yourclinic.com',
        AUTH_TIMEOUT: 3600000,
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
    },
    testing: {
        API_BASE_URL: 'http://localhost:8081',
        AUTH_TIMEOUT: 3600000,
        MAX_RETRIES: 3,
        SPECIALTY_OPTIONS: ['Test Specialty'],
        APPOINTMENT_STATUSES: {
            PENDING: 'PENDING',
            CONFIRMED: 'CONFIRMED',
            CANCELLED: 'CANCELLED',
            COMPLETED: 'COMPLETED'
        }
    }
};

// Export environment-specific configuration
export const {
    API_BASE_URL,
    AUTH_TIMEOUT,
    MAX_RETRIES,
    SPECIALTY_OPTIONS,
    APPOINTMENT_STATUSES
} = config[currentEnv];

// Export utility functions
export const isProduction = () => currentEnv === ENV.PROD;
export const isDevelopment = () => currentEnv === ENV.DEV;
export const isTesting = () => currentEnv === ENV.TEST;