// Import the apiService using a relative path
import { apiService } from './services/apiService.js';

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
    
    /**
     * Initialize the admin dashboard
     */
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
                window.location.href = '/login';
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
                modalForm: document.getElementById('addDoctorForm'),
                closeModalBtn: document.querySelector('.close-modal'),
                cancelBtn: document.querySelector('.cancel-btn'),
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
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            // Set up modal event listeners
            this._setupModalListeners();
            
            // Load initial data
            await this.loadDoctors();
            
            this.initialized = true;
            console.log('AdminDashboardService initialized successfully');
            
        } catch (error) {
            console.error('Error initializing AdminDashboardService:', error);
            this.showError(`Failed to initialize dashboard: ${error.message}`);
        }
    }
    
    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - The keyboard event
     * @private
     */
    _handleKeyDown(e) {
        if (e.key === 'Escape' && this.isModalOpen) {
            this.closeModal();
        }
    }
    
    /**
     * Show the modal with a title
     * @param {string} title - The modal title
     * @private
     */
    _showModal(title) {
        const { modal, modalTitle } = this.elements;
        if (!modal) return;
        
        if (modalTitle) {
            modalTitle.textContent = title;
        }
        
        // Reset form
        if (this.elements.modalForm) {
            this.elements.modalForm.reset();
            
            // Show/hide password field based on add/edit mode
            const passwordField = this.elements.modalForm.querySelector('#password');
            const passwordRequired = this.elements.modalForm.querySelector('#passwordRequired');
            
            if (passwordField && passwordRequired) {
                const isEditMode = this.editingDoctorId !== null;
                passwordField.required = !isEditMode;
                passwordRequired.style.display = isEditMode ? 'none' : 'inline';
                
                // Add event listener to password field to toggle required attribute
                if (isEditMode) {
                    passwordField.placeholder = 'Leave blank to keep current password';
                } else {
                    passwordField.placeholder = 'Enter password';
                }
            }
        }
        
        // Show modal
        document.body.style.overflow = 'hidden';
        modal.style.display = 'block';
        
        // Trigger reflow to enable animation
        void modal.offsetWidth;
        
        // Add show class for animation
        modal.classList.add('show');
        this.isModalOpen = true;
        
        // Set focus to first form field
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
        // Wait for animation to complete before hiding
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            this.isModalOpen = false;
            this.editingDoctorId = null;
        }, 300);
    }
    
    /**
     * Open modal for adding a new doctor
     */
    openModalForAdd() {
        this.editingDoctorId = null;
        this._showModal('Add New Doctor');
    }
    
    /**
     * Open modal for editing a doctor
     * @param {string} doctorId - The ID of the doctor to edit
     */
    openModalForEdit(doctorId) {
        this.editingDoctorId = doctorId;
        this._showModal('Edit Doctor');
        
        // Find the doctor and populate the form
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (doctor) {
            this.populateForm(doctor);
        }
    }
    
    /**
     * Set up modal event listeners
     * @private
     */
    _setupModalListeners() {
        const { modal, closeModalBtn, cancelBtn, modalForm } = this.elements;
        
        // Close modal when clicking the close button
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Close modal when clicking the cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }
        
        // Close modal when clicking outside the modal content
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // Handle form submission
        if (modalForm) {
            modalForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }
    
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Remove any existing event listeners first
        this.cleanup();
        
        // Add new event listeners
        if (this.elements.addDoctorBtn) {
            this.elements.addDoctorBtn.addEventListener('click', () => this.openModalForAdd());
            this.eventListeners.push({
                element: this.elements.addDoctorBtn,
                type: 'click',
                handler: this.openModalForAdd
            });
        }
        
        if (this.elements.searchBar) {
            this.elements.searchBar.addEventListener('input', () => this.filterDoctors());
            this.eventListeners.push({
                element: this.elements.searchBar,
                type: 'input',
                handler: this.filterDoctors
            });
        }
        
        if (this.elements.specialtyFilter) {
            this.elements.specialtyFilter.addEventListener('change', () => this.filterDoctors());
            this.eventListeners.push({
                element: this.elements.specialtyFilter,
                type: 'change',
                handler: this.filterDoctors
            });
        }
        
        if (this.elements.timeFilter) {
            this.elements.timeFilter.addEventListener('change', () => this.filterDoctors());
            this.eventListeners.push({
                element: this.elements.timeFilter,
                type: 'change',
                handler: this.filterDoctors
            });
        }
        
        // Add keyboard event listener for Escape key to close modal
        document.addEventListener('keydown', this._handleKeyDown);
        this.eventListeners.push({
            element: document,
            type: 'keydown',
            handler: this._handleKeyDown
        });
    }
    
    /**
     * Clean up all event listeners
     */
    cleanup() {
        console.log('Cleaning up AdminDashboardService event listeners');
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.initialized = false;
    }
    
    /**
     * Load doctors from the API
     * @param {string} specialty - The specialty to filter by
     */
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
    
    /**
     * Filter doctors based on search and filter criteria
     */
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
    
    /**
     * Render the list of doctors
     * @param {Array} doctors - The list of doctors to render
     */
    renderDoctors(doctors = this.doctors) {
        this.doctorList.innerHTML = '';
        
        if (doctors.length === 0) {
            this.doctorList.innerHTML = `<div class="no-doctors"><p>No doctors found matching your criteria.</p></div>`;
            return;
        }
        
        doctors.forEach(doctor => {
            const doctorCard = this.createDoctorCard(doctor);
            this.doctorList.appendChild(doctorCard);
        });
    }
    
    /**
     * Create a doctor card element
     * @param {Object} doctor - The doctor data
     * @returns {HTMLElement} The doctor card element
     */
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
    
    /**
     * Handle form submission
     * @param {Event} e - The form submission event
     */
    /**
     * Handle form submission
     * @param {Event} e - The form submission event
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const doctorData = Object.fromEntries(formData.entries());
        
        // Validate form data
        const { isValid, errors } = this._validateFormData(doctorData);
        if (!isValid) {
            this._showFormErrors(errors);
            return;
        }
        
        try {
            this.showLoading();
            
            if (this.editingDoctorId) {
                // Update existing doctor
                await apiService.updateDoctor(this.editingDoctorId, doctorData);
                this.showSuccess('Doctor updated successfully');
            } else {
                // Add new doctor
                await apiService.addDoctor(doctorData);
                this.showSuccess('Doctor added successfully');
            }
            
            // Close modal and refresh the list
            this.closeModal();
            await this.loadDoctors();
            
        } catch (error) {
            console.error('Error saving doctor:', error);
            this.showError(error.message || 'Failed to save doctor');
        } finally {
            this.hideLoading();
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

// Initialize the admin dashboard when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
    initAdminDashboard();
}