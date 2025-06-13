import { openModal } from './components/modals.js';
import { doctorService } from './services/doctorServices.js';
import { DoctorCard } from './components/DoctorCard.js';

class AdminDashboard {
    constructor() {
        this.contentDiv = document.getElementById('doctorList');
        this.searchBar = document.getElementById('searchBar');
        this.timeFilter = document.getElementById('timeFilter');
        this.specialtyFilter = document.getElementById('specialtyFilter');
        this.addDoctorBtn = document.getElementById('addDoctorBtn');
        
        this.init();
    }

    init() {
        // Bind event listeners
        this.addDoctorBtn.addEventListener('click', () => openModal('addDoctor'));
        this.searchBar.addEventListener('input', () => this.handleFilters());
        this.timeFilter.addEventListener('change', () => this.handleFilters());
        this.specialtyFilter.addEventListener('change', () => this.handleFilters());

        // Setup doctor deletion listener
        document.addEventListener('deleteDoctor', async (e) => {
            await this.handleDoctorDeletion(e.detail.doctorId);
        });

        // Setup doctor edit listener
        document.addEventListener('editDoctor', (e) => {
            this.handleDoctorEdit(e.detail.doctorData);
        });

        // Initial load
        this.loadDoctors();
    }

    async loadDoctors() {
        try {
            const response = await fetch('/admin/dashboard');
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            const data = await response.json();
            console.log('Dashboard data:', data); // Debug log
            
            // The admin dashboard API returns {success: true, doctors: [...]}
            if (data.success && data.doctors) {
                this.renderDoctorCards(data.doctors);
            } else {
                console.error('No doctors data in response:', data);
                this.showError('No doctors data available.');
            }
        } catch (error) {
            console.error('Failed to load doctors:', error);
            this.showError('Failed to load doctors. Please try again.');
        }
    }

    async handleFilters() {
        const filters = {
            name: this.searchBar.value,
            specialty: this.specialtyFilter.value,
            sortBy: this.timeFilter.value
        };

        try {
            const filteredDoctors = await doctorService.filterDoctors(filters);
            this.renderDoctorCards(filteredDoctors);
        } catch (error) {
            console.error('Filter failed:', error);
            this.showError('Failed to filter doctors. Please try again.');
        }
    }

    renderDoctorCards(doctors) {
        this.contentDiv.innerHTML = '';
        
        if (doctors.length === 0) {
            this.contentDiv.innerHTML = `
                <div class="no-results">
                    <p>No doctors found</p>
                </div>
            `;
            return;
        }

        doctors.forEach(doctor => {
            const card = new DoctorCard(doctor);
            this.contentDiv.appendChild(card.createCard());
        });
    }

    async handleDoctorDeletion(doctorId) {
        if (!confirm('Are you sure you want to delete this doctor?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const result = await doctorService.deleteDoctor(doctorId, token);
            
            if (result.success) {
                this.showSuccess('Doctor deleted successfully');
                await this.loadDoctors();
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            this.showError('Failed to delete doctor. Please try again.');
        }
    }

    handleDoctorEdit(doctorData) {
        openModal('editDoctor', doctorData);
    }

    async handleAddDoctor(formData) {
        try {
            const token = localStorage.getItem('token');
            const result = await doctorService.saveDoctor(formData, token);
            
            if (result.success) {
                this.showSuccess('Doctor added successfully');
                await this.loadDoctors();
                return true;
            } else {
                this.showError(result.message);
                return false;
            }
        } catch (error) {
            console.error('Add doctor failed:', error);
            this.showError('Failed to add doctor. Please try again.');
            return false;
        }
    }

    showError(message) {
        // Implement your error notification logic here
        alert(message);
    }

    showSuccess(message) {
        // Implement your success notification logic here
        alert(message);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});

// Export for testing
export { AdminDashboard };