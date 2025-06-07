import { appointmentService } from './services/appointmentService.js';
import { createPatientRow } from './components/patientRows.js';

class DoctorDashboard {
    constructor() {
        // Initialize DOM elements
        this.tableBody = document.getElementById('appointmentsTableBody');
        this.searchBar = document.getElementById('searchBar');
        this.dateInput = document.getElementById('appointmentDate');
        this.todayBtn = document.getElementById('todayBtn');
        
        // Initialize state
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.token = localStorage.getItem('token');
        this.patientName = '';

        this.init();
    }

    init() {
        // Set initial date
        this.dateInput.value = this.selectedDate;

        // Bind event listeners
        this.searchBar.addEventListener('input', () => {
            this.patientName = this.searchBar.value;
            this.loadAppointments();
        });

        this.dateInput.addEventListener('change', (e) => {
            this.selectedDate = e.target.value;
            this.loadAppointments();
        });

        this.todayBtn.addEventListener('click', () => {
            this.selectedDate = new Date().toISOString().split('T')[0];
            this.dateInput.value = this.selectedDate;
            this.loadAppointments();
        });

        // Initial load
        this.loadAppointments();
    }

    async loadAppointments() {
        try {
            // Show loading state
            this.showLoading();

            const appointments = await appointmentService.getDoctorAppointments(
                this.selectedDate,
                this.patientName,
                this.token
            );

            this.renderAppointments(appointments);
        } catch (error) {
            console.error('Failed to load appointments:', error);
            this.showError('Failed to load appointments. Please try again.');
        }
    }

    renderAppointments(appointments) {
        this.tableBody.innerHTML = '';

        if (!appointments || appointments.length === 0) {
            this.showNoAppointments();
            return;
        }

        appointments.forEach(appointment => {
            const row = createPatientRow(appointment);
            this.tableBody.appendChild(row);

            // Add event listeners for actions
            const actionButtons = row.querySelectorAll('.action-btn');
            actionButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.handleAppointmentAction(btn.dataset.action, appointment.id);
                });
            });
        });
    }

    async handleAppointmentAction(action, appointmentId) {
        try {
            switch (action) {
                case 'complete':
                    await this.completeAppointment(appointmentId);
                    break;
                case 'cancel':
                    await this.cancelAppointment(appointmentId);
                    break;
                case 'reschedule':
                    this.openRescheduleModal(appointmentId);
                    break;
            }
        } catch (error) {
            console.error(`Failed to ${action} appointment:`, error);
            this.showError(`Failed to ${action} appointment. Please try again.`);
        }
    }

    async completeAppointment(appointmentId) {
        if (!confirm('Mark this appointment as completed?')) return;

        const result = await appointmentService.updateAppointmentStatus(
            appointmentId,
            'COMPLETED',
            this.token
        );

        if (result.success) {
            this.showSuccess('Appointment marked as completed');
            await this.loadAppointments();
        } else {
            this.showError(result.message);
        }
    }

    async cancelAppointment(appointmentId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        const result = await appointmentService.updateAppointmentStatus(
            appointmentId,
            'CANCELLED',
            this.token
        );

        if (result.success) {
            this.showSuccess('Appointment cancelled successfully');
            await this.loadAppointments();
        } else {
            this.showError(result.message);
        }
    }

    openRescheduleModal(appointmentId) {
        // Implement reschedule modal logic
    }

    showLoading() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="loading-spinner"></div>
                    Loading appointments...
                </td>
            </tr>
        `;
    }

    showNoAppointments() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No appointments found for ${this.selectedDate}
                </td>
            </tr>
        `;
    }

    showError(message) {
        // Implement your error notification logic here
        alert(message);
    }

    showSuccess(message) {
        // Implement your success notification logic here
        alert(message);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DoctorDashboard();
});

// Export for testing
export { DoctorDashboard };