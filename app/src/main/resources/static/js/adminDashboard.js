// Import the apiService using a relative path
import { apiService } from './services/apiService.js';
import { doctorService } from './services/doctorServices.js';

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
        this.isModalOpen = false;
        
        // DOM elements
        this.modal = null;
        this.addDoctorForm = null;
        this.doctorList = null;
        this.searchBar = null;
        this.specialtyFilter = null;
        this.timeFilter = null;
        this.modalTitle = null;
        this.elements = {}; // For storing dynamic elements
        
        // Initialize when DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            // DOM already loaded
            setTimeout(() => this.initialize(), 0);
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
                modalTitle: document.querySelector('#addDoctorModal h2')
            };
            
            // Check for missing critical elements
            const requiredElements = ['searchBar', 'specialtyFilter', 'doctorList', 'addDoctorBtn', 'modal', 'modalForm'];
            const missingElements = requiredElements
                .filter(key => !this.elements[key])
                .map(key => `#${key}`);
                
            if (missingElements.length > 0) {
                throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
            }
            
            // Assign elements to instance properties for easier access
            Object.assign(this, this.elements);
            console.log('Instance properties assigned:', {
                doctorList: this.doctorList,
                searchBar: this.searchBar,
                addDoctorBtn: this.addDoctorBtn
            });
            
            console.log('All required DOM elements found');
            console.log('All elements:', this.elements);
            console.log('Modal elements:', {
                modal: this.elements.modal,
                closeModalBtn: this.elements.closeModalBtn,
                cancelBtn: this.elements.cancelBtn,
                modalForm: this.elements.modalForm
            });
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            // Set up modal event listeners
            console.log('Setting up modal listeners...');
            this._setupModalListeners();
            console.log('Modal listeners setup complete');
            
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
     * Close the modal
     */
    closeModal() {
        const { modal } = this.elements;
        if (!modal) return;
        
        // Hide modal
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Remove show class
        modal.classList.remove('show');
        this.isModalOpen = false;
        
        // Reset form
        if (this.elements.modalForm) {
            this.elements.modalForm.reset();
        }
        
        // Clear editing state
        this.editingDoctorId = null;
    }
    
    /**
     * Populate the form with doctor data
     * @param {Object} doctor - The doctor data
     * @private
     */
    populateForm(doctor) {
        const form = this.elements.modalForm;
        if (!form) {
            console.error('Form not found in populateForm');
            return;
        }
        
        console.log('Populating form with doctor data:', doctor);
        console.log('Form element:', form);
        
        // Populate form fields
        const fields = {
            'id': doctor.id,
            'name': doctor.name,
            'email': doctor.email,
            'specialty': doctor.specialty,
            'phoneNumber': doctor.phoneNumber,
            'licenseNumber': doctor.licenseNumber
        };
        
        Object.entries(fields).forEach(([fieldName, value]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            console.log(`Setting field ${fieldName} to value:`, value, 'Field found:', !!field, 'Field element:', field);
            if (field && value) {
                field.value = value;
                console.log(`Successfully set ${fieldName} to:`, field.value);
            } else {
                console.warn(`Could not set ${fieldName}: field=${!!field}, value=${value}`);
            }
        });
        
        // Handle password field for edit mode
        const passwordField = form.querySelector('#password');
        if (passwordField) {
            passwordField.required = false;
            passwordField.placeholder = 'Leave blank to keep current password';
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
        
        // Reset form only for add mode, not for edit mode
        if (this.elements.modalForm) {
            const isEditMode = this.editingDoctorId !== null;
            console.log('Showing modal in edit mode:', isEditMode);
            
            if (!isEditMode) {
                this.elements.modalForm.reset();
                console.log('Form reset for add mode');
            } else {
                console.log('Form not reset for edit mode');
            }
            
            // Show/hide password field based on add/edit mode
            const passwordField = this.elements.modalForm.querySelector('#password');
            const passwordRequired = this.elements.modalForm.querySelector('#passwordRequired');
            
            if (passwordField && passwordRequired) {
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
            firstInput.focus();
        }
    }
    
    /**
     * Open modal for adding a new doctor
     */
    openModalForAdd() {
        this.editingDoctorId = null;
        this._showModal('Add New Doctor');
        
        // Explicitly clear the id field for new doctor
        const idField = this.elements.modalForm?.querySelector('#doctorId');
        if (idField) {
            idField.value = '';
        }
    }
    
    /**
     * Open modal for editing a doctor
     * @param {Object} doctor - The doctor object to edit
     */
    openModalForEdit(doctor) {
        console.log('openModalForEdit called with doctor:', doctor);
        this.editingDoctorId = doctor.id;
        console.log('Set editingDoctorId to:', this.editingDoctorId);
        this._showModal('Edit Doctor');
        
        // Populate the form with doctor data immediately after modal is shown
        // Try multiple times to ensure the form is populated
        const populateForm = () => {
            console.log('Attempting to populate form...');
            this.populateForm(doctor);
            
            // Check if phone number was set, if not try again
            const phoneField = this.elements.modalForm?.querySelector('[name="phoneNumber"]');
            if (phoneField && !phoneField.value && doctor.phoneNumber) {
                console.log('Phone number not set, retrying...');
                setTimeout(() => {
                    phoneField.value = doctor.phoneNumber;
                    console.log('Phone number set on retry:', phoneField.value);
                }, 50);
            }
        };
        
        // Initial population
        setTimeout(populateForm, 100);
        
        // Backup population in case the first one fails
        setTimeout(populateForm, 200);
    }
    
    /**
     * Set up modal event listeners
     * @private
     */
    _setupModalListeners() {
        const { modal, closeModalBtn, cancelBtn, modalForm } = this.elements;
        
        console.log('Setting up modal listeners with elements:', {
            modal: !!modal,
            closeModalBtn: !!closeModalBtn,
            cancelBtn: !!cancelBtn,
            modalForm: !!modalForm
        });
        
        // Close modal when clicking the close button
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Close button clicked');
                this.closeModal();
            });
        } else {
            console.warn('Close modal button not found');
        }
        
        // Close modal when clicking the cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Cancel button clicked');
                this.closeModal();
            });
        } else {
            console.warn('Cancel button not found');
        }
        
        // Close modal when clicking outside the modal content
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('Modal background clicked');
                    this.closeModal();
                }
            });
        } else {
            console.warn('Modal element not found');
        }
        
        // Handle form submission
        if (modalForm) {
            modalForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        } else {
            console.warn('Modal form not found');
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
        
        // Add logout button functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
            this.eventListeners.push({
                element: logoutBtn,
                type: 'click',
                handler: this.handleLogout
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
            this.elements.specialtyFilter.addEventListener('change', () => this.loadDoctors());
            this.eventListeners.push({
                element: this.elements.specialtyFilter,
                type: 'change',
                handler: this.loadDoctors
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
    /**
     * Clean up all event listeners
     */
    cleanup() {
        console.log('Cleaning up AdminDashboardService event listeners');
        this.eventListeners.forEach(({ element, event, handler }) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(event, handler);
            }
        });
        this.eventListeners = [];
    }
    


/**
 * Load doctors from the API
 */
    async loadDoctors() {
        try {
            this.showLoading();
            
            // Get specialty filter value - use both possible references
            const specialtyFilter = this.elements.specialtyFilter || this.specialtyFilter;
            const specialty = specialtyFilter ? specialtyFilter.value : '';
            
            console.log('Specialty filter value:', specialty);
            
            // Build URL with specialty parameter if selected
            let url = '/api/admin/dashboard';
            if (specialty && specialty !== '') {
                url += `?specialty=${encodeURIComponent(specialty)}`;
            }
            
            console.log('Loading doctors from URL:', url);
            
            // Use the apiService to make the request to the protected endpoint
            const response = await apiService.get(url);
            
            if (response && response.doctors) {
                // The response should contain the dashboard data
                console.log('Dashboard data loaded:', response);
                
                // If there are doctors in the response, update the UI
                this.doctors = Array.isArray(response.doctors) ? response.doctors : [];
                this.renderDoctors();
                
                // Update other dashboard data as needed
                // Example: this.updateDashboardStats(response.stats);
            } else {
                // If no doctors array in the response, initialize with empty array
                this.doctors = [];
                this.renderDoctors();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            
            // Show appropriate error message
            let errorMessage = 'Failed to load dashboard data. ';
            
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage += 'You are not authorized to view this page. ';
                    // Redirect to login if not authenticated
                    window.location.href = '/login';
                } else if (error.response.status === 403) {
                    errorMessage += 'You do not have permission to access this resource. ';
                    // Redirect to home if not authorized
                    window.location.href = '/';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage += error.response.data.message;
                }
            } else if (error.request) {
                errorMessage += 'No response from server. Please check your connection.';
            } else {
                errorMessage += error.message || 'An unknown error occurred.';
            }
            
            this.showError(errorMessage);
            throw new Error(errorMessage);
        }
    }
    /**
     * Filter doctors based on search and filter criteria
     */
    filterDoctors() {
        // Use consistent element references
        const searchBar = this.elements.searchBar || this.searchBar;
        const timeFilter = this.elements.timeFilter || this.timeFilter;
        
        const searchTerm = searchBar ? searchBar.value.toLowerCase() : '';
        const time = timeFilter ? timeFilter.value : '';

        console.log('Filtering doctors with search term:', searchTerm, 'and time filter:', time);

        let filteredDoctors = this.doctors.filter(doctor => {
            return doctor.name.toLowerCase().includes(searchTerm);
        });

        // Sort by ID as a proxy for creation time
        if (time === 'newest') {
            filteredDoctors.sort((a, b) => b.id - a.id);
        } else if (time === 'oldest') {
            filteredDoctors.sort((a, b) => a.id - b.id);
        }

        console.log('Filtered doctors count:', filteredDoctors.length);
        this.renderDoctors(filteredDoctors);
    }
    
    /**
     * Render the list of doctors
     * @param {Array} doctors - The list of doctors to render
     */
    renderDoctors(doctors = this.doctors) {
        if (!this.doctorList) {
            console.error('doctorList element not found');
            return;
        }
        
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
                console.log('Edit button clicked for doctor:', doctor);
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
        console.log('Form submission started');
        
        const form = e.target;
        const formData = new FormData(form);
        const doctorData = Object.fromEntries(formData.entries());
        
        console.log('Form data:', doctorData);
        
        // Validate form data
        const { isValid, errors } = this._validateFormData(doctorData);
        console.log('Validation result:', { isValid, errors });
        
        if (!isValid) {
            console.log('Form validation failed:', errors);
            this._showFormErrors(errors);
            return;
        }
        
        try {
            this.showLoading();
            
            if (this.editingDoctorId) {
                // Update existing doctor - remove id and password fields from request body
                const { id, password, ...updateData } = doctorData;
                console.log('Update data (without id and password):', updateData);
                await doctorService.updateDoctor(this.editingDoctorId, updateData);
                this.showSuccess('Doctor updated successfully');
            } else {
                // Add new doctor
                await doctorService.saveDoctor(doctorData);
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
    
    /**
     * Handle doctor deletion
     * @param {number} doctorId - The ID of the doctor to delete
     */
    async handleDeleteDoctor(doctorId) {
        try {
            this.showLoading();
            const result = await doctorService.deleteDoctor(doctorId);
            
            if (result.success) {
                this.showSuccess('Doctor deleted successfully');
                await this.loadDoctors(); // Refresh the list
            } else {
                this.showError(result.message || 'Failed to delete doctor');
            }
        } catch (error) {
            console.error('Error deleting doctor:', error);
            this.showError(error.message || 'Failed to delete doctor');
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Validate form data
     * @param {Object} data - The form data to validate
     * @returns {Object} Validation result with isValid and errors
     * @private
     */
    _validateFormData(data) {
        const errors = [];
        
        console.log('Validating form data:', data);
        console.log('Phone number length:', data.phoneNumber ? data.phoneNumber.length : 'undefined');
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        if (!data.email || !this._isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!data.specialty || data.specialty.trim().length === 0) {
            errors.push('Please select a specialty');
        }
        
        if (!data.phoneNumber || data.phoneNumber.trim().length !== 10) {
            errors.push('Please enter a valid 10-digit phone number');
            console.log('Phone validation failed:', {
                hasPhoneNumber: !!data.phoneNumber,
                phoneLength: data.phoneNumber ? data.phoneNumber.length : 0,
                phoneValue: data.phoneNumber
            });
        }
        
        if (!data.licenseNumber || data.licenseNumber.trim().length === 0) {
            errors.push('License number is required');
        }
        
        // Password is only required for new doctors
        if (!this.editingDoctorId && (!data.password || data.password.length < 8)) {
            errors.push('Password must be at least 8 characters long');
        }
        
        console.log('Validation complete. Errors:', errors);
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Check if email is valid
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid, false otherwise
     * @private
     */
    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Show form validation errors
     * @param {Array} errors - Array of error messages
     * @private
     */
    _showFormErrors(errors) {
        // Clear any existing error messages
        const existingErrors = this.modal.querySelectorAll('.form-error');
        existingErrors.forEach(error => error.remove());
        
        // Show new error messages
        errors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.textContent = error;
            errorDiv.style.color = 'red';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            
            // Insert after the form
            this.modal.querySelector('form').appendChild(errorDiv);
        });
    }
    
    /**
     * Add event listeners for the modal
     * @private
     */
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
    
    /**
     * Handle logout functionality
     */
    handleLogout() {
        console.log('Logout requested');
        
        // Clear authentication data
        if (typeof authService !== 'undefined') {
            authService.clearAuth();
        } else {
            // Fallback: clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userEmail');
        }
        
        // Redirect to main page
        window.location.href = '/';
    }
}

// Export the class for use in other modules
export { AdminDashboardService };


// Self-executing function to initialize the admin dashboard
(async function initAdminDashboard() {
    try {
        console.log('Initializing admin dashboard...');
        
        // Get the service instance
        const dashboardService = AdminDashboardService.getInstance();
        
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
        window.adminDashboard = dashboardService;
        
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        
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