import { apiService } from './apiService.js';

const DOCTOR_API = '/doctors';

class DoctorService {
    async getAllDoctors() {
        try {
            return await apiService.get(DOCTOR_API);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            return [];
        }
    }

    async deleteDoctor(doctorId) {
        try {
            await apiService.delete(`${DOCTOR_API}/${doctorId}`);
            return {
                success: true,
                message: 'Doctor deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting doctor:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete doctor'
            };
        }
    }

    async saveDoctor(doctorData) {
        try {
            return await apiService.post(DOCTOR_API, doctorData);
        } catch (error) {
            console.error('Error saving doctor:', error);
            throw error;
        }
    }

    async updateDoctor(doctorId, doctorData) {
        try {
            return await apiService.put(`${DOCTOR_API}/${doctorId}`, doctorData);
        } catch (error) {
            console.error('Error updating doctor:', error);
            throw error;
        }
    }

    async getDoctorById(doctorId) {
        try {
            return await apiService.get(`${DOCTOR_API}/${doctorId}`);
        } catch (error) {
            console.error('Error fetching doctor:', error);
            throw error;
        }
    }

    async filterDoctors(filters) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.name) queryParams.append('name', filters.name);
            if (filters.specialty) queryParams.append('specialty', filters.specialty);
            if (filters.availability) queryParams.append('availability', filters.availability);

            const url = `${DOCTOR_API}/search?${queryParams.toString()}`;
            return await apiService.get(url);
        } catch (error) {
            console.error('Error filtering doctors:', error);
            return [];
        }
    }
}

// Create and export a singleton instance
export const doctorService = new DoctorService();