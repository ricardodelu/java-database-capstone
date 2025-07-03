import { apiService } from '/js/services/apiService.js';

/**
 * Admin Dashboard Service - Manages the admin dashboard functionality
 */
class AdminDashboardService {
    static instance = null;
    
    /**
     * Get the singleton instance of AdminDashboardService
     * @returns {AdminDashboardService} The singleton instance
     */
    static getInstance() {
        if (!AdminDashboardService.instance) {
            AdminDashboardService.instance = new AdminDashboardService();
        }
        return AdminDashboardService.instance;
    }
    
    constructor() {
        if (AdminDashboardService.instance) {
            return AdminDashboardService.instance;
        }
        
        console.log('AdminDashboardService initialized');
        AdminDashboardService.instance = this;
        
        // Initialize properties
        this.initialized = false;
        this.eventListeners = [];
        this.doctors = [];
        this.editingDoctorId = null;
        
        // DOM elements
        this.modal = null;
        this.addDoctorForm = null;
        this.doctorList = null;
        this.searchBar = null;
        this.specialtyFilter = null;
        this.timeFilter = null;
        this.modalTitle = null;
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.cleanup = this.cleanup.bind(this);
        this.initializeEventListeners = this.initializeEventListeners.bind(this);
        this.loadDoctors = this.loadDoctors.bind(this);
        this.filterDoctors = this.filterDoctors.bind(this);
        this.renderDoctors = this.renderDoctors.bind(this);
        this.createDoctorCard = this.createDoctorCard.bind(this);
        this.openModalForAdd = this.openModalForAdd.bind(this);
        this.openModalForEdit = this.openModalForEdit.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleDeleteDoctor = this.handleDeleteDoctor.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this._addModalEventListeners = this._addModalEventListeners.bind(this);
        this._removeModalEventListeners = this._removeModalEventListeners.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.hideLoading = this.hideLoading.bind(this);
        this.showError = this.showError.bind(this);
        this.showSuccess = this.showSuccess.bind(this);
        
        // Initialize when DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initialize);
        } else {
            // DOM already loaded
            setTimeout(this.initialize, 0);
        }
    }
    
    async initialize() {
        // Prevent multiple initializations
        if (this.initialized) {
            console.log('AdminDashboardService already initialized');
            return;
        }
        
        console.log('Initializing AdminDashboardService');
        
        try {
            // Check authentication before proceeding
            if (!apiService.checkAuth('ADMIN')) {
                console.log('User not authenticated or missing admin role');
                return;
            }
            
            // Reset state
            this.doctors = [];
            this.editingDoctorId = null;
            this.isModalOpen = false;
            this._modalListenersAdded = false;
            
            // Get DOM elements with null checks
            this.elements = {
                searchBar: document.getElementById('searchBar'),
                specialtyFilter: document.getElementById('specialtyFilter'),
                timeFilter: document.getElementById('timeFilter'),
                doctorList: document.getElementById('doctorList'),
                addDoctorBtn: document.getElementById('addDoctorBtn'),
                modal: document.getElementById('addDoctorModal'),
                addDoctorForm: document.getElementById('addDoctorForm'),
                modalTitle: document.querySelector('#addDoctorModal h2'),
                closeBtn: document.querySelector('#addDoctorModal .close'),
                cancelBtn: document.querySelector('#addDoctorModal .cancel-btn')
            };
            
            // Check for missing critical elements
            const requiredElements = ['searchBar', 'specialtyFilter', 'doctorList', 'addDoctorBtn', 'modal', 'addDoctorForm'];
            const missingElements = requiredElements
                .filter(key => !this.elements[key])
                .map(key => `#${key}`);
                
            if (missingElements.length > 0) {
                throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
            }
            
            // Assign elements to instance properties for easier access
            Object.assign(this, this.elements);
            
            console.log('All required DOM elements found');
            
            // Initialize the dashboard
            this.initializeEventListeners();
            await this.loadDoctors();
            
            // Mark as initialized
            this.initialized = true;
            console.log('AdminDashboardService initialization complete');
            
        } catch (error) {
            console.error('Error initializing AdminDashboardService:', error);
            this.showError(`Failed to initialize dashboard: ${error.message}`);
        }
    }

    // Add event listener with cleanup tracking
    _addEventListener(element, event, handler) {
        if (!element) return;
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    // Clean up all event listeners
    cleanup() {
        console.log('Cleaning up AdminDashboardService event listeners');
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.initialized = false;
    }
    
    initializeEventListeners() {
        // Clean up any existing listeners first
        this.cleanup();
        
        console.log('Initializing event listeners');
        
        // Search and filter
        this._addEventListener(this.searchBar, 'input', () => this.filterDoctors());
        this._addEventListener(this.specialtyFilter, 'change', () => this.loadDoctors(this.specialtyFilter.value));
        
        if (this.timeFilter) {
            this._addEventListener(this.timeFilter, 'change', () => this.filterDoctors());
        }
        
        // Add Doctor button
        console.log('Adding click listener to Add Doctor button');
        this._addEventListener(this.addDoctorBtn, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openModalForAdd();
        });
        
        // Form submission
        this._addEventListener(this.addDoctorForm, 'submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });
        
        // Modal close button
        if (this.closeBtn) {
            this._addEventListener(this.closeBtn, 'click', () => this.closeModal());
        }
        
        // Modal cancel button
        if (this.cancelBtn) {
            this._addEventListener(this.cancelBtn, 'click', () => this.closeModal());
        }
    }

    async loadDoctors(specialty = '') {
        this.showLoading();
        
        try {
            let url = '/api/doctors';
            if (specialty) {
                url += `?specialty=${encodeURIComponent(specialty)}`;
            }
            
            const data = await apiService.get(url);
            this.doctors = data.doctors || [];
            this.renderDoctors(); // Initial render after fetch
            this.filterDoctors(); // Apply other filters like search
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showError(error.message || 'Failed to load doctors. Please try again later.');
            
            // If unauthorized, redirect to login
            if (error.message && error.message.includes('401')) {
                window.location.href = '/';
            }
        } finally {
            this.hideLoading();
        }
    }

    filterDoctors() {
        const searchTerm = this.searchBar.value.toLowerCase();
        const specialty = this.specialtyFilter.value;
        const time = this.timeFilter.value;

        // The specialty filter is now handled by the backend via loadDoctors.
        // We only need to trigger a reload if the specialty changes.
        // The event listener for specialtyFilter should now call loadDoctors directly.

        let filteredDoctors = this.doctors.filter(doctor => {
            return doctor.name.toLowerCase().includes(searchTerm);
        });

        // Sort by ID as a proxy for creation time
        if (time === 'newest') {
            filteredDoctors.sort((a, b) => b.id - a.id);
        } else if (time === 'oldest') {
            filteredDoctors.sort((a, b) => a.id - b.id);
        }

        this.renderDoctors(filteredDoctors);
    }

    renderDoctors(doctorsToRender = this.doctors) {
        this.doctorList.innerHTML = '';
        
        if (doctorsToRender.length === 0) {
            this.doctorList.innerHTML = `<div class="no-doctors"><p>No doctors found matching your criteria.</p></div>`;
            return;
        }
        
        doctorsToRender.forEach(doctor => {
            const doctorCard = this.createDoctorCard(doctor);
            this.doctorList.appendChild(doctorCard);
        });
    }

    createDoctorCard(doctor) {
        console.log('Creating card for doctor:', doctor);
        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.innerHTML = `
            <div class="doctor-header">
                <h3 class="doctor-name">${doctor.name}</h3>
                <span class="doctor-specialty">${doctor.specialty || 'General'}</span>
            </div>
            <div class="doctor-body">
                <p class="doctor-info">
                    <i class="fas fa-envelope"></i> ${doctor.email || 'No email'}
                </p>
                <p class="doctor-info">
                    <i class="fas fa-phone"></i> ${doctor.phoneNumber || 'No phone number'}
                </p>
            </div>
            <div class="doctor-actions">
                <button class="btn btn-edit edit-btn" data-id="${doctor.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete delete-btn" data-id="${doctor.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Add event listeners to the buttons
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModalForEdit(doctor);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this doctor?')) {
                    this.handleDeleteDoctor(doctor.id);
                }
            });
        }
        
        return card;
    }

    openModalForAdd() {
        console.log('Opening modal for adding new doctor');
        this.editingDoctorId = null;
        
        // Set modal title
        if (this.modalTitle) {
            this.modalTitle.textContent = 'Add New Doctor';
        }
        
        // Reset form

    const url = isEditing ? `/api/admin/doctors/${this.editingDoctorId}` : '/api/admin/doctors';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        if (this.editingDoctorId) {
            // Update existing doctor
            await apiService.put(`/admin/doctors/${this.editingDoctorId}`, doctorData);
        } else {
            // Add new doctor
            await apiService.post('/admin/doctors', doctorData);
        }
        
        this.closeModal();
        this.loadDoctors(this.specialtyFilter.value);
        this.showSuccess(`Doctor ${this.editingDoctorId ? 'updated' : 'added'} successfully!`);
        
    } catch (error) {
        console.error('Error saving doctor:', error);
        this.showError(error.message || 'Failed to save doctor. Please try again.');
        
        // If unauthorized, redirect to login
        if (error.message.includes('401')) {
            window.location.href = '/';
        }
    } finally {
        this.hideLoading();
    }
}

async handleDeleteDoctor(doctorId) {
    if (!confirm('Are you sure you want to delete this doctor?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/doctors/${doctorId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete doctor');
        }
        
        this.showSuccess('Doctor deleted successfully!');
        await this.loadDoctors();
    } catch (error) {
        console.error('Error deleting doctor:', error);
        this.showError('Failed to delete doctor. Please try again.');
    }
}

closeModal() {
    console.log('Closing modal');
    if (this.modal) {
        this.modal.style.display = 'none';
        this.isModalOpen = false;
        document.body.classList.remove('modal-open');
        
        // Reset form state
        if (this.addDoctorForm) {
            this.addDoctorForm.reset();
            
            // Clear any error messages
            const errorElements = this.addDoctorForm.querySelectorAll('.error-message');
            errorElements.forEach(el => el.textContent = '');
            
            const inputGroups = this.addDoctorForm.querySelectorAll('.form-group');
            inputGroups.forEach(group => group.classList.remove('has-error'));
        }
    }
}

_addModalEventListeners() {
    // Clean up any existing modal listeners first
    this._removeModalEventListeners();
    
    // Close when clicking outside the modal content
    const handleOutsideClick = (e) => {
        if (e.target === this.modal) {
            this.closeModal();
        }
    };
    
    // Close with Escape key
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            this.closeModal();
        }
    };
    
    // Add new listeners
    if (this.modal) {
        this.modal.addEventListener('click', handleOutsideClick);
        this.eventListeners.push({
            element: this.modal,
            type: 'click',
            handler: handleOutsideClick
        });
    }
    
    document.addEventListener('keydown', handleEscapeKey);
    this.eventListeners.push({
        element: document,
        type: 'keydown',
        handler: handleEscapeKey
    });
}

_removeModalEventListeners() {
    // Remove existing listeners
    this.eventListeners = this.eventListeners.filter(listener => listener.element !== this.modal && listener.element !== document);
}

showLoading() {
    if (this.doctorList) {
        this.doctorList.innerHTML = '<div class="loading">Loading...</div>';
    }
}

hideLoading() {
    const loadingElement = this.doctorList?.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

showError(message) {
    console.error('Error:', message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    if (this.doctorList) {
        this.doctorList.insertAdjacentElement('beforebegin', errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    } else {
        console.error('Could not display error message - doctorList not found');
    }
}

showSuccess(message) {
    console.log('Success:', message);
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    if (this.doctorList) {
        this.doctorList.insertAdjacentElement('beforebegin', successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    } else {
        console.log('Success:', message);
    }
}
}

// Export the singleton instance for use in other modules
export { AdminDashboardService };

/**
 * Initialize the admin dashboard when the DOM is loaded
 */
function initAdminDashboard() {
    try {
        console.log('Initializing admin dashboard...');
        
        // Get the service instance
        const dashboardService = AdminDashboardService.getInstance();
        
        // Clean up any existing instance
        dashboardService.cleanup();
        
        // Initialize the service
        dashboardService.initialize();
        
        // Add cleanup on page unload
        window.addEventListener('beforeunload', () => {
            dashboardService.cleanup();
        });
        
        // Make it available globally for debugging
        window.adminDashboard = dashboardService;
        
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        
        // Show error to user
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.style.display = 'block';
            errorContainer.textContent = `Failed to initialize dashboard: ${error.message}`;
        }
    }
}

// Initialize only if we're on the admin dashboard page
if (document.getElementById('adminDashboard')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdminDashboard);
    } else {
        initAdminDashboard();
    }
}