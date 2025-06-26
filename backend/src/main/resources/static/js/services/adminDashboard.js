// Admin Dashboard Service
class AdminDashboardService {
    constructor() {
        this.doctors = [];
        this.editingDoctorId = null; // For tracking edits
        this.searchBar = document.getElementById('searchBar');
        this.specialtyFilter = document.getElementById('specialtyFilter');
        this.timeFilter = document.getElementById('timeFilter');
        this.doctorList = document.getElementById('doctorList');
        this.addDoctorBtn = document.getElementById('addDoctorBtn');
        this.modal = document.getElementById('addDoctorModal');
        this.addDoctorForm = document.getElementById('addDoctorForm');
        this.modalTitle = this.modal.querySelector('h2');
        this.submitButton = this.addDoctorForm.querySelector('button[type="submit"]');
        
        this.initializeEventListeners();
        this.loadDoctors();
    }

    initializeEventListeners() {
        // Search and filter
        this.searchBar.addEventListener('input', () => this.filterDoctors());
        this.specialtyFilter.addEventListener('change', () => this.loadDoctors(this.specialtyFilter.value));
        this.timeFilter.addEventListener('change', () => this.filterDoctors());
        
        // Modal functionality
        this.addDoctorBtn.addEventListener('click', () => this.openModalForAdd());
        this.modal.querySelector('.close').addEventListener('click', () => this.closeModal());
        this.modal.querySelector('.cancel-btn').addEventListener('click', () => this.closeModal());
        
        // Form submission
        this.addDoctorForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    async loadDoctors(specialty = '') {
        try {
            this.showLoading();
            let url = '/api/admin/dashboard';
            if (specialty && specialty !== 'all') {
                url += `?specialty=${encodeURIComponent(specialty)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }

            const data = await response.json();
            this.doctors = data.doctors || [];
            this.renderDoctors(); // Initial render after fetch
            this.filterDoctors(); // Apply other filters like search
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showError('Failed to load doctors. Please try again later.');
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
        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.innerHTML = `
            <div class="doctor-info">
                <h3>${doctor.name}</h3>
                <p class="specialty">${doctor.specialty}</p>
                <p class="email">${doctor.email}</p>
                <p class="phone">${doctor.phoneNumber || 'No phone number'}</p>
            </div>
            <div class="doctor-actions">
                <button class="edit-btn" data-id="${doctor.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" data-id="${doctor.id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        
        card.querySelector('.edit-btn').addEventListener('click', () => this.openModalForEdit(doctor));
        card.querySelector('.delete-btn').addEventListener('click', () => this.handleDeleteDoctor(doctor.id));
        
        return card;
    }

    openModalForAdd() {
        this.editingDoctorId = null;
        this.modalTitle.textContent = 'Add New Doctor';
        this.submitButton.textContent = 'Add Doctor';
        this.addDoctorForm.reset();
        const passwordField = this.addDoctorForm.elements['password'];
        passwordField.required = true;
        passwordField.placeholder = '';
        this.modal.style.display = 'block';
    }

    openModalForEdit(doctor) {
        this.editingDoctorId = doctor.id;
        this.modalTitle.textContent = 'Edit Doctor';
        this.submitButton.textContent = 'Update Doctor';
        this.addDoctorForm.reset();

        // Populate form
        this.addDoctorForm.elements['name'].value = doctor.name;
        this.addDoctorForm.elements['email'].value = doctor.email;
        this.addDoctorForm.elements['specialty'].value = doctor.specialty;
        this.addDoctorForm.elements['phone'].value = doctor.phoneNumber || '';
        this.addDoctorForm.elements['licenseNumber'].value = doctor.licenseNumber || '';
        
        // Handle password field for edits
        const passwordField = this.addDoctorForm.elements['password'];
        passwordField.required = false;
        passwordField.placeholder = 'Leave blank to keep unchanged';

        this.modal.style.display = 'block';
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.addDoctorForm);
        const isEditing = this.editingDoctorId !== null;

        const password = formData.get('password');
        const phone = formData.get('phone').replace(/\D/g, ''); // Remove non-digit characters
        const doctorData = {
            name: formData.get('name'),
            email: formData.get('email'),
            specialty: formData.get('specialty'),
            phoneNumber: phone,
            licenseNumber: formData.get('licenseNumber')
        };

        // Only include the password if it's a new doctor or if the password is being changed
        if (!isEditing || (isEditing && password)) {
            doctorData.password = password;
        }

        const url = isEditing ? `/api/admin/doctors/${this.editingDoctorId}` : '/api/admin/doctors';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(doctorData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Failed to ${isEditing ? 'update' : 'add'} doctor`);
            }
            
            this.showSuccess(`Doctor ${isEditing ? 'updated' : 'added'} successfully!`);
            this.closeModal();
            await this.loadDoctors();

        } catch (error) {
            console.error(`Error ${isEditing ? 'adding/updating' : 'adding'} doctor:`, error);
            this.showError(error.message);
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
        this.modal.style.display = 'none';
    }

    showLoading() {
        this.doctorList.innerHTML = '<div class="loading"></div>';
    }

    hideLoading() {
        const loadingElement = this.doctorList.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.doctorList.insertAdjacentElement('beforebegin', errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.doctorList.insertAdjacentElement('beforebegin', successDiv);
        
        setTimeout(() => successDiv.remove(), 5000);
    }
}

// Initialize the service when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboardService();
}); 