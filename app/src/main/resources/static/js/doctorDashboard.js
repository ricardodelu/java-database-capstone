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
                timeFilter: document.getElementById('timeFilter'),
                patientList: document.getElementById('patientList'),
                addPatientBtn: document.getElementById('addPatientBtn'),
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
        const required = ['searchBar', 'dateFilter', 'timeFilter', 'patientList', 'addPatientBtn', 'addPatientModal', 'addPatientForm', 'addAppointmentModal', 'addAppointmentForm', 'prescriptionModal', 'prescriptionForm', 'loadingOverlay', 'errorContainer', 'toast'];
        const missing = required.filter(key => !this.elements[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required DOM elements: ${missing.join(', ')}`);
        }
    }

    initializeEventListeners() {
        this.cleanup();
        // Add patient
        this.elements.addPatientBtn.addEventListener('click', () => this.openModalForAddPatient());
        this.eventListeners.push({ element: this.elements.addPatientBtn, type: 'click', handler: this.openModalForAddPatient });
        // Search/filter
        this.elements.searchBar.addEventListener('input', () => this.filterPatients());
        this.eventListeners.push({ element: this.elements.searchBar, type: 'input', handler: this.filterPatients });
        this.elements.dateFilter.addEventListener('change', () => this.filterPatients());
        this.eventListeners.push({ element: this.elements.dateFilter, type: 'change', handler: this.filterPatients });
        this.elements.timeFilter.addEventListener('change', () => this.filterPatients());
        this.eventListeners.push({ element: this.elements.timeFilter, type: 'change', handler: this.filterPatients });
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

    filterPatients() {
        const searchTerm = this.elements.searchBar.value.toLowerCase();
        const date = this.elements.dateFilter.value;
        const time = this.elements.timeFilter.value;
        let filtered = this.patients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm) ||
            (patient.id && patient.id.toString().includes(searchTerm))
        );
        // Optionally filter by date/time if relevant
        this.renderPatients(filtered);
    }

    renderPatients(patientsToRender) {
        const list = this.elements.patientList;
        list.innerHTML = '';
        if (!patientsToRender.length) {
            list.innerHTML = '<div class="no-records">No patient records found.</div>';
            return;
        }
        patientsToRender.forEach(patient => {
            const card = this.createPatientCard(patient);
            list.appendChild(card);
        });
    }

    createPatientCard(patient) {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.innerHTML = `
            <div class="doctor-header">
                <h3 class="doctor-name">${patient.name}</h3>
                <span class="doctor-id">ID: ${patient.id}</span>
            </div>
            <div class="doctor-body">
                <p class="doctor-info"><i class="fas fa-envelope"></i> ${patient.email || 'No email'}</p>
                <p class="doctor-info"><i class="fas fa-phone"></i> ${patient.phoneNumber || 'No phone'}</p>
                <p class="doctor-info"><i class="fas fa-home"></i> ${patient.address || 'No address'}</p>
            </div>
            <div class="doctor-actions">
                <button class="btn btn-edit edit-btn" data-id="${patient.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-delete delete-btn" data-id="${patient.id}"><i class="fas fa-trash"></i> Delete</button>
                <button class="btn btn-primary add-appointment-btn" data-id="${patient.id}"><i class="fas fa-calendar-plus"></i> Add Appointment</button>
            </div>
        `;
        card.querySelector('.edit-btn').addEventListener('click', () => this.openModalForEditPatient(patient));
        card.querySelector('.delete-btn').addEventListener('click', () => this.deletePatient(patient.id));
        card.querySelector('.add-appointment-btn').addEventListener('click', () => this.openModalForAddAppointment(patient));
        return card;
    }

    renderAppointments(appointmentsToRender) {
        // Similar to renderPatients, but for appointments
        // For brevity, not fully implemented here
    }

    setupModalListeners() {
        // Add modal open/close, form submit, and validation logic for all modals
        // For brevity, not fully implemented here
    }

    openModalForAddPatient() {
        // Open add patient modal and reset form
    }

    openModalForEditPatient(patient) {
        // Open edit patient modal and populate form
    }

    deletePatient(patientId) {
        // Confirm and delete patient
    }

    openModalForAddAppointment(patient) {
        // Open add appointment modal and set patient
    }

    // exportData() method removed - no longer needed

    showLoading() {
        this.elements.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.elements.loadingOverlay.style.display = 'none';
    }

    showError(message) {
        this.elements.errorContainer.textContent = message;
        this.elements.errorContainer.style.display = 'block';
        setTimeout(() => {
            this.elements.errorContainer.style.display = 'none';
        }, 5000);
    }

    showSuccess(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.className = 'toast toast-success';
        this.elements.toast.style.display = 'block';
        setTimeout(() => {
            this.elements.toast.style.display = 'none';
        }, 3000);
    }
}

export { DoctorDashboardService };
