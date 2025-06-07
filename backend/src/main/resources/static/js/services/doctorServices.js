import { API_BASE_URL } from '../config/config.js';

const DOCTOR_API = `${API_BASE_URL}/api/doctors`;

class DoctorService {
    async getAllDoctors() {
        try {
            const response = await fetch(DOCTOR_API);
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching doctors:', error);
            return [];
        }
    }

    async deleteDoctor(doctorId, token) {
        try {
            const response = await fetch(`${DOCTOR_API}/${doctorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete doctor');
            }

            return {
                success: true,
                message: 'Doctor deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting doctor:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async saveDoctor(doctorData, token) {
        try {
            const response = await fetch(DOCTOR_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(doctorData)
            });

            if (!response.ok) {
                throw new Error('Failed to save doctor');
            }

            const savedDoctor = await response.json();
            return {
                success: true,
                data: savedDoctor,
                message: 'Doctor saved successfully'
            };
        } catch (error) {
            console.error('Error saving doctor:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updateDoctor(doctorId, doctorData, token) {
        try {
            const response = await fetch(`${DOCTOR_API}/${doctorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(doctorData)
            });

            if (!response.ok) {
                throw new Error('Failed to update doctor');
            }

            const updatedDoctor = await response.json();
            return {
                success: true,
                data: updatedDoctor,
                message: 'Doctor updated successfully'
            };
        } catch (error) {
            console.error('Error updating doctor:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async filterDoctors(filters) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.name) queryParams.append('name', filters.name);
            if (filters.specialty) queryParams.append('specialty', filters.specialty);
            if (filters.availability) queryParams.append('availability', filters.availability);

            const url = `${DOCTOR_API}/search?${queryParams.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to filter doctors');
            }

            return await response.json();
        } catch (error) {
            console.error('Error filtering doctors:', error);
            return [];
        }
    }
}

// Create and export a singleton instance
export const doctorService = new DoctorService();