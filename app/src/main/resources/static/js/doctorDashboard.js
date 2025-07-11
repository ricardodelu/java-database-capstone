// Doctor Dashboard Service - Modern implementation with JWT authentication
import { authService } from './services/authService.js';
import { apiService } from './services/apiService.js';
import { prescriptionService } from './services/prescriptionServices.js';

class DoctorDashboardService {
    static instance = null;

    static getInstance() {
        if (!DoctorDashboardService.instance) {
            DoctorDashboardService.instance = new DoctorDashboardService();
        }
        return DoctorDashboardService.instance;
    }

    constructor() {
        if (DoctorDashboardService.instance) {
            return DoctorDashboardService.instance;
        }
        this.initialized = false;
        this.eventListeners = [];
        this.patients = [];
        this.appointments = [];
        this.editingPatientId = null;
        this.editingAppointmentId = null;
        this.isModalOpen = false;
        this._modalListenersAdded = false;
        this.elements = {};
        DoctorDashboardService.instance = this;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            setTimeout(() => this.initialize(), 0);
        }
    }

    async initialize() {
        if (this.initialized) return;
        try {
            // Debug: Log token and user at initialization
            const token = authService.getToken();
            const user = authService.getCurrentUser();
            console.log('[DoctorDashboard] Initializing. Token:', token, 'User:', user);
            if (!apiService.checkAuth('DOCTOR')) {
                console.warn('[DoctorDashboard] Not authenticated or missing doctor role. Redirecting to /login.');
                window.location.href = '/login';
                return;
            }
            this.patients = [];
            this.appointments = [];
            this.editingPatientId = null;
            this.editingAppointmentId = null;
            this.isModalOpen = false;
            this._modalListenersAdded = false;
            this.elements = {
                searchBar: document.getElementById('searchBar'),
                dateFilter: document.getElementById('dateFilter'),
                statusFilter: document.getElementById('statusFilter'),
                todayAppointmentsBtn: document.getElementById('todayAppointmentsBtn'),
                patientTable: document.getElementById('patientTable'),
                patientTableBody: document.getElementById('patientTableBody'),
                addPatientModal: document.getElementById('addPatientModal'),
                addPatientForm: document.getElementById('addPatientForm'),
                addAppointmentModal: document.getElementById('addAppointmentModal'),
                addAppointmentForm: document.getElementById('addAppointmentForm'),
                prescriptionModal: document.getElementById('prescriptionModal'),
                prescriptionForm: document.getElementById('prescriptionForm'),
                loadingOverlay: document.getElementById('loadingOverlay'),
                errorContainer: document.getElementById('errorContainer'),
                toast: document.getElementById('toast'),
            };
            this.checkRequiredElements();
            this.initializeEventListeners();
            await this.loadPatients();
            await this.loadAppointments();
            this.initialized = true;
        } catch (error) {
            console.error('[DoctorDashboard] Failed to initialize dashboard:', error);
            this.showError(`Failed to initialize dashboard: ${error.message}`);
        }
    }

    checkRequiredElements() {
        const required = ['searchBar', 'dateFilter', 'statusFilter', 'todayAppointmentsBtn', 'patientTable', 'patientTableBody', 'addPatientModal', 'addPatientForm', 'addAppointmentModal', 'addAppointmentForm', 'prescriptionModal', 'prescriptionForm', 'loadingOverlay', 'errorContainer', 'toast'];
        const missing = required.filter(key => !this.elements[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required DOM elements: ${missing.join(', ')}`);
        }
    }

    initializeEventListeners() {
        this.cleanup();
        // Today's appointments button
        this.elements.todayAppointmentsBtn.addEventListener('click', () => this.showTodaysAppointments());
        this.eventListeners.push({ element: this.elements.todayAppointmentsBtn, type: 'click', handler: this.showTodaysAppointments });
        // Search/filter
        this.elements.searchBar.addEventListener('input', () => this.filterPatients());
        this.eventListeners.push({ element: this.elements.searchBar, type: 'input', handler: this.filterPatients });
        this.elements.dateFilter.addEventListener('change', () => this.filterPatients());
        this.eventListeners.push({ element: this.elements.dateFilter, type: 'change', handler: this.filterPatients });
        this.elements.statusFilter.addEventListener('change', () => this.filterPatients());
        this.eventListeners.push({ element: this.elements.statusFilter, type: 'change', handler: this.filterPatients });
        // Modal listeners
        this.setupModalListeners();
    }

    cleanup() {
        this.eventListeners.forEach(({ element, type, handler }) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(type, handler);
            }
        });
        this.eventListeners = [];
    }

    async loadPatients() {
        try {
            this.showLoading();
            const user = authService.getCurrentUser();
            const token = authService.getToken();
            console.log('[DoctorDashboard] loadPatients: user', user, 'token', token);
            const endpoint = `/api/doctors/${user && user.username ? user.username : 'UNKNOWN'}/patients`;
            console.log('[DoctorDashboard] loadPatients: endpoint', endpoint);
            const response = await apiService.get(endpoint);
            console.log('[DoctorDashboard] loadPatients: response', response);
            this.patients = response && response.patients ? response.patients : [];
            this.filterPatients();
        } catch (error) {
            console.error('[DoctorDashboard] Failed to load patients:', error);
            this.showError('Failed to load patients.');
        } finally {
            this.hideLoading();
        }
    }

    async loadAppointments() {
        try {
            this.showLoading();
            const user = authService.getCurrentUser();
            const token = authService.getToken();
            console.log('[DoctorDashboard] loadAppointments: user', user, 'token', token);
            const endpoint = `/api/doctors/${user && user.username ? user.username : 'UNKNOWN'}/appointments`;
            console.log('[DoctorDashboard] loadAppointments: endpoint', endpoint);
            const response = await apiService.get(endpoint);
            console.log('[DoctorDashboard] loadAppointments: response', response);
            this.appointments = response && response.appointments ? response.appointments : [];
            this.renderAppointments(this.appointments);
        } catch (error) {
            console.error('[DoctorDashboard] Failed to load appointments:', error);
            this.showError('Failed to load appointments.');
        } finally {
            this.hideLoading();
        }
    }

    showTodaysAppointments() {
        const today = new Date().toISOString().split('T')[0];
        this.elements.dateFilter.value = today;
        this.filterPatients();
        this.showSuccess('Showing today\'s appointments');
    }

    filterPatients() {
        const searchTerm = this.elements.searchBar.value.toLowerCase();
        const date = this.elements.dateFilter.value;
        const status = this.elements.statusFilter.value;
        
        let filtered = this.patients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm) ||
            (patient.id && patient.id.toString().includes(searchTerm)) ||
            (patient.email && patient.email.toLowerCase().includes(searchTerm)) ||
            (patient.phoneNumber && patient.phoneNumber.includes(searchTerm))
        );
        
        // Filter by appointment date if date is selected
        if (date) {
            filtered = filtered.filter(patient => {
                const patientAppointments = this.appointments.filter(apt => apt.patientId === patient.id);
                return patientAppointments.some(apt => apt.date === date);
            });
        }
        
        // Filter by appointment status if status is selected
        if (status) {
            filtered = filtered.filter(patient => {
                const patientAppointments = this.appointments.filter(apt => apt.patientId === patient.id);
                return patientAppointments.some(apt => apt.status === status);
            });
        }
        
        this.renderPatients(filtered);
    }

    renderPatients(patientsToRender) {
        const tbody = this.elements.patientTableBody;
        tbody.innerHTML = '';
        
        if (!patientsToRender.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="noPatientRecord">No patient records found.</td></tr>';
            return;
        }
        
        patientsToRender.forEach(patient => {
            const row = this.createPatientRow(patient);
            tbody.appendChild(row);
        });
    }

    createPatientRow(patient) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td data-label="Patient ID">${patient.id}</td>
            <td data-label="Name">${patient.name}</td>
            <td data-label="Phone">${patient.phoneNumber || 'N/A'}</td>
            <td data-label="Email">${patient.email || 'N/A'}</td>
            <td data-label="Actions">
                <div class="action-buttons">
                    <button class="prescription-btn" data-id="${patient.id}">
                        <i class="fas fa-pills"></i> Add Prescription
                    </button>
                </div>
            </td>
        `;
        
        console.log('[DoctorDashboard] Created row for patient:', patient.id, 'Row HTML:', row.innerHTML);
        
        // Add event listener for prescription button
        const prescriptionBtn = row.querySelector('.prescription-btn');
        if (prescriptionBtn) {
            console.log('[DoctorDashboard] Adding click listener to prescription button for patient:', patient.id);
            prescriptionBtn.addEventListener('click', (e) => {
                console.log('[DoctorDashboard] Prescription button clicked for patient:', patient.id);
                e.preventDefault();
                e.stopPropagation();
                this.openModalForAddPrescription(patient);
            });
        } else {
            console.error('[DoctorDashboard] Prescription button not found for patient:', patient.id);
        }
        
        return row;
    }

    getPatientPrescriptions(patientId) {
        // This would typically come from an API call
        // For now, return empty array - you can implement this later
        return [];
    }

    renderAppointments(appointmentsToRender) {
        // This method can be used to show appointments in a separate view
        // For now, we're focusing on the patient table
        console.log('Appointments loaded:', appointmentsToRender.length);
    }

    setupModalListeners() {
        // Modal open/close logic for prescription modal
        const prescriptionModal = document.getElementById('prescriptionModal');
        const prescriptionForm = document.getElementById('prescriptionForm');
        // Close modal on close or cancel
        const closeButtons = document.querySelectorAll('.close-modal, .cancel-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (prescriptionModal) {
                    prescriptionModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        });
        // Close modal when clicking outside
        if (prescriptionModal) {
            prescriptionModal.addEventListener('click', (e) => {
                if (e.target === prescriptionModal) {
                    prescriptionModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
        // Handle prescription form submission
        if (prescriptionForm) {
            prescriptionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePrescriptionSubmit(e);
            });
        }
    }

    viewPatient(patient) {
        // Implement patient view functionality
        console.log('Viewing patient:', patient);
        this.showSuccess(`Viewing patient: ${patient.name}`);
    }

    openModalForEditPatient(patient) {
        // Open edit patient modal and populate form
        console.log('Editing patient:', patient);
        this.showSuccess(`Editing patient: ${patient.name}`);
    }

    openModalForAddPrescription(patient) {
        console.log('[DoctorDashboard] openModalForAddPrescription called for patient:', patient);
        
        // Set the patient ID in the hidden field
        const patientIdField = document.getElementById('prescriptionPatientId');
        if (patientIdField) {
            patientIdField.value = patient.id;
            console.log('[DoctorDashboard] Set patient ID in hidden field:', patient.id);
        } else {
            console.error('[DoctorDashboard] prescriptionPatientId field not found');
        }
        
        // Show the prescription modal
        const modal = document.getElementById('prescriptionModal');
        console.log('[DoctorDashboard] Modal element found:', !!modal);
        if (modal) {
            console.log('[DoctorDashboard] Modal HTML:', modal.outerHTML);
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log('[DoctorDashboard] Modal opened successfully');
            console.log('[DoctorDashboard] Modal display style:', modal.style.display);
            console.log('[DoctorDashboard] Modal computed display:', window.getComputedStyle(modal).display);
            console.log('[DoctorDashboard] Modal z-index:', window.getComputedStyle(modal).zIndex);
            console.log('[DoctorDashboard] Modal position:', window.getComputedStyle(modal).position);
            console.log('[DoctorDashboard] Modal visibility:', window.getComputedStyle(modal).visibility);
            console.log('[DoctorDashboard] Modal opacity:', window.getComputedStyle(modal).opacity);
        } else {
            console.error('[DoctorDashboard] prescriptionModal not found');
            console.log('[DoctorDashboard] All elements with id containing "modal":', document.querySelectorAll('[id*="modal"]'));
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
        if (this.elements.errorContainer) {
            this.elements.errorContainer.textContent = message;
            this.elements.errorContainer.style.display = 'block';
            setTimeout(() => {
                this.elements.errorContainer.style.display = 'none';
            }, 5000);
        }
    }

    showSuccess(message) {
        if (this.elements.toast) {
            this.elements.toast.textContent = message;
            this.elements.toast.className = 'toast toast-success show';
            setTimeout(() => {
                this.elements.toast.classList.remove('show');
            }, 3000);
        }
    }

    async handlePrescriptionSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const prescriptionData = Object.fromEntries(formData.entries());
        try {
            this.showLoading();
            console.log('[DoctorDashboard] Submitting prescription data:', prescriptionData);
            
            // Note: Doctor ID is handled by the backend based on the authenticated user
            // Add prescription date if not provided
            if (!prescriptionData.prescriptionDate) {
                prescriptionData.prescriptionDate = new Date().toISOString().split('T')[0];
            }
            
            // Use prescription service to save prescription
            const response = await prescriptionService.addPrescription(prescriptionData);
            console.log('[DoctorDashboard] Prescription submission response:', response);
            
            if (response) {
                // Show detailed success message
                const successMessage = `Prescription added successfully for patient ID: ${prescriptionData.patientId}`;
                this.showSuccess(successMessage);
                console.log('[DoctorDashboard] Prescription added successfully:', successMessage);
                
                // Close modal
                const modal = document.getElementById('prescriptionModal');
                if (modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
                // Reset form
                form.reset();
            }
        } catch (error) {
            console.error('[DoctorDashboard] Error submitting prescription:', error);
            this.showError(error.message || 'Failed to add prescription');
        } finally {
            this.hideLoading();
        }
    }
}

export { DoctorDashboardService };
