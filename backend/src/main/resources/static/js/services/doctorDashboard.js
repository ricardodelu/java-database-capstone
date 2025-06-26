class DoctorDashboardService {
    constructor() {
        this.appointments = [];
        this.init();
    }

    init() {
        // DOM Elements
        this.tableBody = document.getElementById('patientTableBody');
        this.searchBar = document.getElementById('searchBar');
        this.dateFilter = document.getElementById('dateFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.todayBtn = document.getElementById('todayAppointments');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.noPatientsDiv = document.getElementById('noPatients');

        // Modal Elements
        this.modal = document.getElementById('prescriptionModal');
        this.closeModalBtn = this.modal.querySelector('.close');
        this.prescriptionForm = document.getElementById('prescriptionForm');
        this.patientIdInput = document.getElementById('patientId');

        this.addEventListeners();
        this.loadAppointments();
    }

    addEventListeners() {
        this.searchBar.addEventListener('input', () => this.filterAndRender());
        this.dateFilter.addEventListener('change', () => this.filterAndRender());
        this.statusFilter.addEventListener('change', () => this.filterAndRender());
        this.todayBtn.addEventListener('click', () => this.showTodaysAppointments());
        this.refreshBtn.addEventListener('click', () => this.loadAppointments());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.prescriptionForm.addEventListener('submit', (e) => this.handlePrescriptionSubmit(e));
    }

    async loadAppointments() {
        try {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                console.error('User email not found in localStorage. Cannot fetch appointments.');
                this.showAlert('Could not verify user. Please log in again.', 'error');
                return;
            }
            const response = await fetch(`/api/doctors/${userEmail}/appointments`);
            if (!response.ok) {
                throw new Error('Failed to fetch appointments.');
            }
            this.appointments = await response.json();
            this.filterAndRender();
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.showError('Could not load appointments.');
        }
    }

    filterAndRender() {
        const searchTerm = this.searchBar.value.toLowerCase();
        const selectedDate = this.dateFilter.value;
        const selectedStatus = this.statusFilter.value;

        let filtered = this.appointments.filter(appt => {
            const patientName = appt.patient?.name?.toLowerCase() || '';
            const patientId = appt.patient?.id?.toString() || '';
            const appointmentDate = appt.appointmentTime.split('T')[0];

            const matchesSearch = patientName.includes(searchTerm) || patientId.includes(searchTerm);
            const matchesDate = !selectedDate || appointmentDate === selectedDate;
            const matchesStatus = !selectedStatus || appt.status.toLowerCase() === selectedStatus;

            return matchesSearch && matchesDate && matchesStatus;
        });

        this.renderAppointments(filtered);
    }

    renderAppointments(appointmentsToRender) {
        this.tableBody.innerHTML = '';
        if (appointmentsToRender.length === 0) {
            this.noPatientsDiv.style.display = 'block';
            return;
        }
        this.noPatientsDiv.style.display = 'none';

        appointmentsToRender.forEach(appt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appt.patient.id}</td>
                <td>${appt.patient.name}</td>
                <td>${appt.patient.phoneNumber || 'N/A'}</td>
                <td>${appt.patient.email}</td>
                <td>${new Date(appt.appointmentTime).toLocaleString()}</td>
                <td><span class="status status-${appt.status.toLowerCase()}">${appt.status}</span></td>
                <td>
                    <button class="action-btn add-prescription-btn" data-patient-id="${appt.patient.id}">Prescribe</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });

        // Add event listeners to new buttons
        this.tableBody.querySelectorAll('.add-prescription-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const patientId = e.target.dataset.patientId;
                this.openModal(patientId);
            });
        });
    }

    showTodaysAppointments() {
        const today = new Date().toISOString().split('T')[0];
        this.dateFilter.value = today;
        this.filterAndRender();
    }

    openModal(patientId) {
        this.patientIdInput.value = patientId;
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.prescriptionForm.reset();
    }

    async handlePrescriptionSubmit(event) {
        event.preventDefault();
        const formData = new FormData(this.prescriptionForm);
        const prescriptionData = {
            patientId: formData.get('patientId'),
            medication: formData.get('medication'),
            dosage: formData.get('dosage'),
            instructions: formData.get('instructions')
        };

        try {
            const response = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prescriptionData),
            });

            if (!response.ok) {
                throw new Error('Failed to add prescription.');
            }

            this.showSuccess('Prescription added successfully!');
            this.closeModal();
        } catch (error) {
            console.error('Error adding prescription:', error);
            this.showError(error.message);
        }
    }

    showAlert(message, type = 'info') {
        // A simple alert, can be replaced with a more sophisticated notification system
        alert(`${type.toUpperCase()}: ${message}`);
    }

    showError(message) {
        this.showAlert(message, 'error');
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DoctorDashboardService();
});
    }
}

// Add prescription
function addPrescription(patientId) {
    document.getElementById('patientId').value = patientId;
    prescriptionForm.reset();
    prescriptionModal.style.display = 'block';
}

// Handle prescription form submission
async function handlePrescriptionSubmit(e) {
    e.preventDefault();
    
    try {
        const token = getAuthToken();
        const formData = new FormData(e.target);
        const prescriptionData = {
            patientId: formData.get('patientId'),
            medication: formData.get('medication'),
            dosage: formData.get('dosage'),
            frequency: formData.get('frequency'),
            duration: formData.get('duration'),
            notes: formData.get('notes'),
        };

        const response = await fetch(ENDPOINTS.PRESCRIPTIONS, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prescriptionData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Close modal and show success message
        prescriptionModal.style.display = 'none';
        showSuccess('Prescription added successfully');
        
        // Refresh patient list
        loadPatients();
    } catch (error) {
        console.error('Failed to add prescription:', error);
        showError('Failed to add prescription. Please try again.');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function showError(message) {
    // Implement your preferred error notification system
    alert(message); // Replace with a better UI notification
}

function showSuccess(message) {
    // Implement your preferred success notification system
    alert(message); // Replace with a better UI notification
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Export functions for use in other modules
export {
    loadPatients,
    viewPatientDetails,
    addPrescription,
}; 