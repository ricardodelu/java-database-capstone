import config from '../config/config.js';

const PATIENT_API = `${config.API_BASE_URL}/api/patients`;
const AUTH_API = `${config.API_BASE_URL}/api/auth`;

class PatientService {
    async signup(patientData) {
        try {
            const response = await fetch(`${AUTH_API}/patient/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            return {
                success: true,
                message: 'Registration successful'
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async login(credentials) {
        try {
            const response = await fetch(`${AUTH_API}/patient/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getPatientData(token) {
        try {
            const response = await fetch(`${PATIENT_API}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch patient data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patient data:', error);
            return null;
        }
    }

    async getAppointments(patientId, token) {
        try {
            const response = await fetch(`${PATIENT_API}/${patientId}/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
    }

    async bookAppointment(appointmentData, token) {
        try {
            const response = await fetch(`${PATIENT_API}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Booking failed');
            }

            return {
                success: true,
                message: 'Appointment booked successfully'
            };
        } catch (error) {
            console.error('Booking error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async filterAppointments(filters, token) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.date) queryParams.append('date', filters.date);
            if (filters.doctorId) queryParams.append('doctorId', filters.doctorId);

            const response = await fetch(
                `${PATIENT_API}/appointments/search?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to filter appointments');
            }

            return await response.json();
        } catch (error) {
            console.error('Filter error:', error);
            return [];
        }
    }

    async updateProfile(patientId, profileData, token) {
        try {
            const response = await fetch(`${PATIENT_API}/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            return {
                success: true,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            console.error('Update error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// Create and export a singleton instance
export const patientService = new PatientService();