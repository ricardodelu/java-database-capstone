import { apiService } from './apiService.js';

class PrescriptionService {
    constructor() {
        this.baseUrl = '/api/prescriptions';
    }

    async addPrescription(prescriptionData) {
        try {
            console.log('[PrescriptionService] Adding prescription:', prescriptionData);
            
            // Get current user (doctor)
            const user = window.authService ? window.authService.getCurrentUser() : null;
            if (!user || !user.username) {
                throw new Error('Doctor not authenticated');
            }
            
            // Use the correct endpoint for doctor prescriptions
            const endpoint = `/api/doctors/${user.username}/prescriptions`;
            console.log('[PrescriptionService] Using endpoint:', endpoint);
            
            const response = await apiService.post(endpoint, prescriptionData);
            console.log('[PrescriptionService] Prescription added successfully:', response);
            return response;
        } catch (error) {
            console.error('[PrescriptionService] Error adding prescription:', error);
            throw error;
        }
    }

    async getPrescriptionsByPatient(patientId) {
        try {
            const response = await apiService.get(`${this.baseUrl}/patient/${patientId}`);
            return response;
        } catch (error) {
            console.error('[PrescriptionService] Error getting prescriptions:', error);
            throw error;
        }
    }

    async getPrescriptionsByDoctor(doctorId) {
        try {
            const response = await apiService.get(`${this.baseUrl}/doctor/${doctorId}`);
            return response;
        } catch (error) {
            console.error('[PrescriptionService] Error getting doctor prescriptions:', error);
            throw error;
        }
    }
}

// Create singleton instance
const prescriptionService = new PrescriptionService();

export { prescriptionService };
