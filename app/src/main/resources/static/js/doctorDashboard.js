// Doctor Dashboard Service - Modern implementation with JWT authentication
import { apiService } from './services/apiService.js';
import { authService } from './services/authService.js';

class DoctorDashboardService {
    static instance = null;

    static getInstance() {
        if (!DoctorDashboardService.instance) {
            DoctorDashboardService.instance = new DoctorDashboardService();
        }
        return DoctorDashboardService.instance;
    }

    constructor() {
        this.appointments = [];
        this.eventListeners = [];
        this.elements = {};
        this.modal = null;
        this.prescriptionForm = null;
        this.patientIdInput = null;
        this.closeModalBtn = null;
        this.cancelBtn = null;
    }

    async initialize() {
        console.log('Initializing DoctorDashboardService...');
        
        // Check authentication first
        if (!authService.isAuthenticated()) {
            console.error('User not authenticated');
            window.location.href = '/login.html';
            return;
        }

        // Check if user has doctor role
        const user = authService.getUser();
        if (!user || !user.roles || !user.roles.includes('ROLE_DOCTOR')) {
            console.error('User does not have doctor role');
            window.location.href = '/';
            return;
        }

        this.initializeElements();
        this.initializeEventListeners();
        await this.loadAppointments();
    }

    initializeElements() {
        // Main elements
        this.elements = {
            tableBody: document.getElementById('patientTableBody'),
            searchBar: document.getElementById('searchBar'),
            dateFilter: document.getElementById('dateFilter'),
            todayBtn: document.getElementById('todayAppointments'),
            noPatientsDiv: document.getElementById('noPatients'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            errorContainer: document.getElementById('errorContainer')
        };

        // Modal elements
        this.modal = document.getElementById('prescriptionModal');
        if (this.modal) {
            this.prescriptionForm = this.modal.querySelector('#prescriptionForm');
            this.patientIdInput = this.modal.querySelector('#patientId');
            this.closeModalBtn = this.modal.querySelector('.close');
            this.cancelBtn = this.modal.querySelector('.cancel-btn');
        }

        // Verify all required elements are found
        const requiredElements = ['tableBody', 'searchBar', 'dateFilter', 'todayBtn', 'noPatientsDiv'];
        const missingElements = requiredElements.filter(id => !this.elements[id]);
        
        if (missingElements.length > 0) {
            console.error('Missing required elements:', missingElements);
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }

        console.log('All required DOM elements found');
    }

    initializeEventListeners() {
        // Search and filter listeners
        if (this.elements.searchBar) {
            this.elements.searchBar.addEventListener('input', () => this.filterAndRender());
            this.eventListeners.push({
                element: this.elements.searchBar,
                type: 'input',
                handler: () => this.filterAndRender()
            });
        }

        if (this.elements.dateFilter) {
            this.elements.dateFilter.addEventListener('change', () => this.filterAndRender());
            this.eventListeners.push({
                element: this.elements.dateFilter,
                type: 'change',
                handler: () => this.filterAndRender()
            });
        }

        if (this.elements.todayBtn) {
            this.elements.todayBtn.addEventListener('click', () => this.showTodaysAppointments());
            this.eventListeners.push({
                element: this.elements.todayBtn,
                type: 'click',
                handler: () => this.showTodaysAppointments()
            });
        }

        // Modal listeners
        this.setupModalListeners();

        console.log('Event listeners initialized');
    }

    setupModalListeners() {
        if (!this.modal) return;

        // Close modal listeners
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeModal());
            this.eventListeners.push({
                element: this.closeModalBtn,
                type: 'click',
                handler: () => this.closeModal()
            });
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.closeModal());
            this.eventListeners.push({
                element: this.cancelBtn,
                type: 'click',
                handler: () => this.closeModal()
            });
        }

        // Form submission
        if (this.prescriptionForm) {
            this.prescriptionForm.addEventListener('submit', (e) => this.handlePrescriptionSubmit(e));
            this.eventListeners.push({
                element: this.prescriptionForm,
                type: 'submit',
                handler: (e) => this.handlePrescriptionSubmit(e)
            });
        }

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });

        console.log('Modal listeners setup complete');
    }

    async loadAppointments() {
        try {
            this.showLoading();
            
            // Get current user email from auth service
            const user = authService.getUser();
            if (!user || !user.username) {
                throw new Error('User information not available');
            }

            console.log('Loading appointments for doctor:', user.username);
            
            // Use apiService to make authenticated request
            const response = await apiService.get(`/api/doctors/${user.username}/appointments`);
            
            if (response && response.appointments) {
                this.appointments = response.appointments;
                console.log('Appointments loaded:', this.appointments.length);
                this.filterAndRender();
            } else {
                throw new Error('Invalid response format from server');
            }
            
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.showError('Failed to load appointments. Please try again.');
            
            // If unauthorized, redirect to login
            if (error.status === 401 || error.status === 403) {
                window.location.href = '/login.html';
            }
        } finally {
            this.hideLoading();
        }
    }

    filterAndRender() {
        if (!this.appointments) return;

        const searchTerm = this.elements.searchBar ? this.elements.searchBar.value.toLowerCase() : '';
        const selectedDate = this.elements.dateFilter ? this.elements.dateFilter.value : '';

        let filtered = this.appointments.filter(appt => {
            const patientName = appt.patient?.name?.toLowerCase() || '';
            const patientId = appt.patient?.id?.toString() || '';
            const appointmentDate = appt.appointmentTime ? appt.appointmentTime.split('T')[0] : '';

            const matchesSearch = patientName.includes(searchTerm) || patientId.includes(searchTerm);
            const matchesDate = !selectedDate || appointmentDate === selectedDate;

            return matchesSearch && matchesDate;
        });

        this.renderAppointments(filtered);
    }

    renderAppointments(appointmentsToRender) {
        if (!this.elements.tableBody || !this.elements.noPatientsDiv) return;

        this.elements.tableBody.innerHTML = '';
        
        if (appointmentsToRender.length === 0) {
            this.elements.noPatientsDiv.style.display = 'block';
            return;
        }
        
        this.elements.noPatientsDiv.style.display = 'none';

        appointmentsToRender.forEach(appt => {
            const row = document.createElement('tr');
            const appointmentDateTime = appt.appointmentTime ? new Date(appt.appointmentTime).toLocaleString() : 'N/A';
            const status = appt.status ? appt.status.toLowerCase() : 'unknown';
            
            row.innerHTML = `
                <td>${appt.patient?.id || 'N/A'}</td>
                <td>${appt.patient?.name || 'N/A'}</td>
                <td>${appt.patient?.phoneNumber || 'N/A'}</td>
                <td>${appt.patient?.email || 'N/A'}</td>
                <td>${appointmentDateTime}</td>
                <td><span class="status status-${status}">${appt.status || 'N/A'}</span></td>
                <td>
                    <button class="action-btn add-prescription-btn" data-patient-id="${appt.patient?.id}">
                        <i class="fas fa-pills"></i> Prescribe
                    </button>
                </td>
            `;
            
            this.elements.tableBody.appendChild(row);
        });

        // Add event listeners to prescription buttons
        this.elements.tableBody.querySelectorAll('.add-prescription-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const patientId = e.target.closest('.add-prescription-btn').dataset.patientId;
                this.openModal(patientId);
            });
        });
    }

    showTodaysAppointments() {
        if (!this.elements.dateFilter) return;
        const today = new Date().toISOString().split('T')[0];
        this.elements.dateFilter.value = today;
        this.filterAndRender();
    }

    openModal(patientId) {
        if (!this.modal || !this.patientIdInput) return;
        
        console.log('Opening prescription modal for patient:', patientId);
        this.patientIdInput.value = patientId;
        this.modal.style.display = 'block';
        
        // Focus on first input
        const firstInput = this.modal.querySelector('input:not([type="hidden"])');
        if (firstInput) {
            firstInput.focus();
        }
    }

    closeModal() {
        if (!this.modal || !this.prescriptionForm) return;
        
        console.log('Closing prescription modal');
        this.modal.style.display = 'none';
        this.prescriptionForm.reset();
    }

    async handlePrescriptionSubmit(event) {
        event.preventDefault();
        
        try {
            const user = authService.getUser();
            if (!user || !user.username) {
                throw new Error('User information not available');
            }

            const formData = new FormData(this.prescriptionForm);
            const prescriptionData = {
                patientId: formData.get('patientId'),
                medication: formData.get('medication'),
                dosage: formData.get('dosage'),
                duration: formData.get('duration'),
                notes: formData.get('notes'),
            };

            console.log('Submitting prescription:', prescriptionData);

            // Use apiService to make authenticated request
            await apiService.post(`/api/doctors/${user.username}/prescriptions`, prescriptionData);

            this.showSuccess('Prescription added successfully!');
            this.closeModal();
            
            // Reload appointments to show updated data
            await this.loadAppointments();
            
        } catch (error) {
            console.error('Error adding prescription:', error);
            this.showError(error.message || 'Failed to add prescription. Please try again.');
        }
    }

    showLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'none';
        }
    }

    showError(message) {
        console.error('Error:', message);
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        console.log('Success:', message);
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast toast-${type}`;
            toast.style.display = 'block';
            
            setTimeout(() => {
                toast.style.display = 'none';
            }, 5000);
        }
    }

    cleanup() {
        console.log('Cleaning up DoctorDashboardService event listeners');
        
        // Remove all event listeners
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.handler) {
                listener.element.removeEventListener(listener.type, listener.handler);
            }
        });
        
        this.eventListeners = [];
    }
}

// Export the class for use in other modules
export { DoctorDashboardService };

// Self-executing function to initialize the doctor dashboard
(async function initDoctorDashboard() {
    try {
        console.log('Initializing doctor dashboard...');
        
        // Get the service instance
        const dashboardService = DoctorDashboardService.getInstance();
        
        // Clean up any existing instance
        if (typeof dashboardService.cleanup === 'function') {
            dashboardService.cleanup();
        }
        
        // Initialize the service
        if (typeof dashboardService.initialize === 'function') {
            await dashboardService.initialize();
        } else {
            console.error('initialize method not found on dashboardService');
        }
        
        // Add cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (typeof dashboardService.cleanup === 'function') {
                dashboardService.cleanup();
            }
        });
        
        // Make it available globally for debugging
        window.doctorDashboard = dashboardService;
        
    } catch (error) {
        console.error('Error initializing doctor dashboard:', error);
        
        // Show error to user
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.style.display = 'block';
            errorContainer.textContent = `Failed to initialize dashboard: ${error.message}`;
        } else {
            // Fallback error display
            alert(`Failed to initialize dashboard: ${error.message}`);
        }
    }
})();
