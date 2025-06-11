// Import dependencies
import { getAuthToken } from '../util.js';
import { renderHeader, renderFooter } from '../render.js';

// Constants
const API_BASE_URL = '/api';
const ENDPOINTS = {
    PATIENTS: `${API_BASE_URL}/patients`,
    APPOINTMENTS: `${API_BASE_URL}/appointments`,
    PRESCRIPTIONS: `${API_BASE_URL}/prescriptions`,
};

// State
let currentDoctorId = null;
let currentFilter = 'today';
let currentDate = new Date().toISOString().split('T')[0];

// DOM Elements
const searchBar = document.getElementById('searchBar');
const todayAppointmentsBtn = document.getElementById('todayAppointments');
const dateFilter = document.getElementById('dateFilter');
const statusFilter = document.getElementById('statusFilter');
const patientTableBody = document.getElementById('patientTableBody');
const noPatients = document.getElementById('noPatients');
const refreshBtn = document.getElementById('refreshBtn');
const prescriptionModal = document.getElementById('prescriptionModal');
const patientDetailsModal = document.getElementById('patientDetailsModal');
const prescriptionForm = document.getElementById('prescriptionForm');

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Render header and footer
        await renderHeader();
        await renderFooter();

        // Get doctor ID from token
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Set up event listeners
        setupEventListeners();

        // Load initial data
        await loadPatients();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showError('Failed to initialize dashboard. Please try refreshing the page.');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    searchBar.addEventListener('input', debounce(handleSearch, 300));

    // Filter buttons
    todayAppointmentsBtn.addEventListener('click', () => {
        currentFilter = 'today';
        currentDate = new Date().toISOString().split('T')[0];
        dateFilter.value = currentDate;
        todayAppointmentsBtn.classList.add('active');
        loadPatients();
    });

    dateFilter.addEventListener('change', (e) => {
        currentFilter = 'date';
        currentDate = e.target.value;
        todayAppointmentsBtn.classList.remove('active');
        loadPatients();
    });

    statusFilter.addEventListener('change', () => {
        loadPatients();
    });

    // Refresh button
    refreshBtn.addEventListener('click', loadPatients);

    // Modal close buttons
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', () => {
            prescriptionModal.style.display = 'none';
            patientDetailsModal.style.display = 'none';
        });
    });

    // Prescription form submission
    prescriptionForm.addEventListener('submit', handlePrescriptionSubmit);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === prescriptionModal) {
            prescriptionModal.style.display = 'none';
        }
        if (e.target === patientDetailsModal) {
            patientDetailsModal.style.display = 'none';
        }
    });
}

// Load patients based on current filters
async function loadPatients() {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const queryParams = new URLSearchParams({
            date: currentDate,
            status: statusFilter.value,
            search: searchBar.value.trim(),
        });

        const response = await fetch(`${ENDPOINTS.APPOINTMENTS}?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const appointments = await response.json();
        renderPatientTable(appointments);
    } catch (error) {
        console.error('Failed to load patients:', error);
        showError('Failed to load patient records. Please try again.');
    }
}

// Render patient table
function renderPatientTable(appointments) {
    if (!appointments || appointments.length === 0) {
        patientTableBody.innerHTML = '';
        noPatients.style.display = 'block';
        return;
    }

    noPatients.style.display = 'none';
    patientTableBody.innerHTML = appointments.map(appointment => `
        <tr>
            <td>${appointment.patient.id}</td>
            <td>${appointment.patient.name}</td>
            <td>${appointment.patient.phone || 'N/A'}</td>
            <td>${appointment.patient.email || 'N/A'}</td>
            <td>${formatDateTime(appointment.appointmentTime)}</td>
            <td>
                <span class="status-badge status-${appointment.status.toLowerCase()}">
                    ${appointment.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewPatientDetails('${appointment.patient.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn" onclick="addPrescription('${appointment.patient.id}')">
                        <i class="fas fa-prescription"></i> Prescribe
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// View patient details
async function viewPatientDetails(patientId) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${ENDPOINTS.PATIENTS}/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const patient = await response.json();
        const detailsContainer = document.getElementById('patientDetails');
        
        detailsContainer.innerHTML = `
            <dl>
                <dt>Name:</dt>
                <dd>${patient.name}</dd>
                <dt>Email:</dt>
                <dd>${patient.email || 'N/A'}</dd>
                <dt>Phone:</dt>
                <dd>${patient.phone || 'N/A'}</dd>
                <dt>Date of Birth:</dt>
                <dd>${formatDate(patient.dateOfBirth)}</dd>
                <dt>Gender:</dt>
                <dd>${patient.gender || 'N/A'}</dd>
                <dt>Address:</dt>
                <dd>${patient.address || 'N/A'}</dd>
            </dl>
        `;

        // Store patient ID for prescription form
        document.getElementById('patientId').value = patientId;
        
        // Show modal
        patientDetailsModal.style.display = 'block';
    } catch (error) {
        console.error('Failed to load patient details:', error);
        showError('Failed to load patient details. Please try again.');
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