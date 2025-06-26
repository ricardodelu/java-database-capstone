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
        if (this.modal) {
            this.closeModalBtn = this.modal.querySelector('.close');
            this.prescriptionForm = document.getElementById('prescriptionForm');
            this.patientIdInput = document.getElementById('patientId');
        }

        this.addEventListeners();
        this.loadAppointments();
    }

    addEventListeners() {
        if (this.searchBar) this.searchBar.addEventListener('input', () => this.filterAndRender());
        if (this.dateFilter) this.dateFilter.addEventListener('change', () => this.filterAndRender());
        if (this.statusFilter) this.statusFilter.addEventListener('change', () => this.filterAndRender());
        if (this.todayBtn) this.todayBtn.addEventListener('click', () => this.showTodaysAppointments());
        if (this.refreshBtn) this.refreshBtn.addEventListener('click', () => this.loadAppointments());
        if (this.closeModalBtn) this.closeModalBtn.addEventListener('click', () => this.closeModal());
        if (this.prescriptionForm) this.prescriptionForm.addEventListener('submit', (e) => this.handlePrescriptionSubmit(e));
    }

    async loadAppointments() {
        try {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                console.error('User email not found in localStorage.');
                this.showAlert('Could not verify user. Please log in again.', 'error');
                return;
            }
            const response = await fetch(`/api/doctors/${userEmail}/appointments`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch appointments: ${response.status} ${errorText}`);
            }
            this.appointments = await response.json();
            this.filterAndRender();
        } catch (error) {
            console.error('Error loading appointments:', error);
            if (this.noPatientsDiv) this.noPatientsDiv.style.display = 'block';
            if (this.tableBody) this.tableBody.innerHTML = '<tr><td colspan="7">Could not load appointments.</td></tr>';
        }
    }

    filterAndRender() {
        if (!this.appointments) return;
        const searchTerm = this.searchBar ? this.searchBar.value.toLowerCase() : '';
        const selectedDate = this.dateFilter ? this.dateFilter.value : '';
        const selectedStatus = this.statusFilter ? this.statusFilter.value : '';

        let filtered = this.appointments.filter(appt => {
            const patientName = appt.patient?.name?.toLowerCase() || '';
            const patientId = appt.patient?.id?.toString() || '';
            const appointmentDate = appt.appointmentTime ? appt.appointmentTime.split('T')[0] : '';

            const matchesSearch = patientName.includes(searchTerm) || patientId.includes(searchTerm);
            const matchesDate = !selectedDate || appointmentDate === selectedDate;
            const matchesStatus = !selectedStatus || appt.status.toLowerCase() === selectedStatus;

            return matchesSearch && matchesDate && matchesStatus;
        });

        this.renderAppointments(filtered);
    }

    renderAppointments(appointmentsToRender) {
        if (!this.tableBody || !this.noPatientsDiv) return;

        this.tableBody.innerHTML = '';
        if (appointmentsToRender.length === 0) {
            this.noPatientsDiv.style.display = 'block';
            return;
        }
        this.noPatientsDiv.style.display = 'none';

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
                    <button class="action-btn add-prescription-btn" data-patient-id="${appt.patient?.id}">Prescribe</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });

        this.tableBody.querySelectorAll('.add-prescription-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const patientId = e.target.dataset.patientId;
                this.openModal(patientId);
            });
        });
    }

    showTodaysAppointments() {
        if (!this.dateFilter) return;
        const today = new Date().toISOString().split('T')[0];
        this.dateFilter.value = today;
        this.filterAndRender();
    }

    openModal(patientId) {
        if (!this.modal || !this.patientIdInput) return;
        this.patientIdInput.value = patientId;
        this.modal.style.display = 'block';
    }

    closeModal() {
        if (!this.modal || !this.prescriptionForm) return;
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
                const errorText = await response.text();
                throw new Error(`Failed to add prescription: ${errorText}`);
            }

            this.showSuccess('Prescription added successfully!');
            this.closeModal();
        } catch (error) {
            console.error('Error adding prescription:', error);
            this.showError(error.message);
        }
    }

    showAlert(message, type = 'info') {
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
    if (document.getElementById('patientTableBody')) {
        new DoctorDashboardService();
    }
});
