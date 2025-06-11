// Admin Dashboard Service
class AdminDashboardService {
    constructor() {
        this.doctors = [];
        this.searchBar = document.getElementById('searchBar');
        this.specialtyFilter = document.getElementById('specialtyFilter');
        this.timeFilter = document.getElementById('timeFilter');
        this.doctorList = document.getElementById('doctorList');
        this.addDoctorBtn = document.getElementById('addDoctorBtn');
        this.modal = document.getElementById('addDoctorModal');
        this.addDoctorForm = document.getElementById('addDoctorForm');
        
        this.initializeEventListeners();
        this.loadDoctors();
    }

    initializeEventListeners() {
        // Search functionality
        this.searchBar.addEventListener('input', () => this.filterDoctors());
        
        // Filter functionality
        this.specialtyFilter.addEventListener('change', () => this.filterDoctors());
        this.timeFilter.addEventListener('change', () => this.filterDoctors());
        
        // Modal functionality
        this.addDoctorBtn.addEventListener('click', () => this.openModal());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.querySelector('.cancel-btn').addEventListener('click', () => this.closeModal());
        
        // Form submission
        this.addDoctorForm.addEventListener('submit', (e) => this.handleAddDoctor(e));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    async loadDoctors() {
        try {
            this.showLoading();
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            
            const data = await response.json();
            this.doctors = Array.isArray(data) ? data : [];
            this.renderDoctors();
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showError('Failed to load doctors. Please try again later.');
        } finally {
            this.hideLoading();
        }
    }

    filterDoctors() {
        const searchTerm = this.searchBar.value.toLowerCase();
        const specialtyFilter = this.specialtyFilter.value;
        const timeFilter = this.timeFilter.value;
        
        let filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) ||
                                doctor.email.toLowerCase().includes(searchTerm);
            const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
            return matchesSearch && matchesSpecialty;
        });
        
        // Apply time sorting if selected
        if (timeFilter) {
            filteredDoctors.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return timeFilter === 'newest' ? dateB - dateA : dateA - dateB;
            });
        }
        
        this.renderDoctors(filteredDoctors);
    }

    renderDoctors(doctorsToRender = this.doctors) {
        this.doctorList.innerHTML = '';
        
        if (doctorsToRender.length === 0) {
            this.doctorList.innerHTML = `
                <div class="no-doctors">
                    <p>No doctors found matching your criteria.</p>
                </div>
            `;
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
                <p class="phone">${doctor.phone || 'No phone number'}</p>
            </div>
            <div class="doctor-actions">
                <button class="edit-btn" data-id="${doctor.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" data-id="${doctor.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Add event listeners for edit and delete
        card.querySelector('.edit-btn').addEventListener('click', () => this.handleEditDoctor(doctor));
        card.querySelector('.delete-btn').addEventListener('click', () => this.handleDeleteDoctor(doctor.id));
        
        return card;
    }

    async handleAddDoctor(event) {
        event.preventDefault();
        
        const formData = new FormData(this.addDoctorForm);
        const doctorData = {
            name: formData.get('name'),
            email: formData.get('email'),
            specialty: formData.get('specialty'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch('/api/doctors/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(doctorData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to add doctor');
            }
            
            this.showSuccess('Doctor added successfully!');
            this.closeModal();
            this.addDoctorForm.reset();
            await this.loadDoctors();
        } catch (error) {
            console.error('Error adding doctor:', error);
            this.showError('Failed to add doctor. Please try again.');
        }
    }

    async handleEditDoctor(doctor) {
        // TODO: Implement edit functionality
        console.log('Edit doctor:', doctor);
    }

    async handleDeleteDoctor(doctorId) {
        if (!confirm('Are you sure you want to delete this doctor?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/doctors/${doctorId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
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

    openModal() {
        this.modal.style.display = 'block';
        this.addDoctorForm.reset();
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