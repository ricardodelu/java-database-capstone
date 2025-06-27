// Import utility functions
import { showModal, hideModal, createRipple } from './util.js';

// State management
let doctors = [];
let filteredDoctors = [];
let selectedDoctor = null;

// DOM Elements
const searchBar = document.getElementById('searchBar');
const filterTime = document.getElementById('filterTime');
const filterSpecialty = document.getElementById('filterSpecialty');
const contentContainer = document.getElementById('content');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const bookingForm = document.getElementById('bookingForm');
const appointmentDate = document.getElementById('appointmentDate');
const appointmentTime = document.getElementById('appointmentTime');
const appointmentReason = document.getElementById('appointmentReason');

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Load doctors data
        await loadDoctors();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial render
        renderDoctors(doctors);
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showError('Failed to load dashboard data. Please try again later.');
    }
}

// Load doctors from the API
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors');
        
        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }
        
        const data = await response.json();
        doctors = data.doctors;
        filteredDoctors = [...doctors];
    } catch (error) {
        console.error('Error loading doctors:', error);
        throw error;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    searchBar.addEventListener('input', handleSearch);
    
    // Filter functionality
    filterTime.addEventListener('change', handleFilter);
    filterSpecialty.addEventListener('change', handleFilter);
    
    // Modal functionality
    closeModal.addEventListener('click', () => hideModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal(modal);
    });
    
    // Booking form submission
    bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Date selection for available time slots
    appointmentDate.addEventListener('change', loadAvailableTimeSlots);
}

// Handle search input
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredDoctors = doctors.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm) ||
        doctor.specialty.toLowerCase().includes(searchTerm)
    );
    renderDoctors(filteredDoctors);
}

// Handle filter changes
function handleFilter() {
    const timeFilter = filterTime.value;
    const specialtyFilter = filterSpecialty.value;
    
    filteredDoctors = doctors.filter(doctor => {
        const matchesTime = !timeFilter || doctor.availableTime === timeFilter;
        const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
        return matchesTime && matchesSpecialty;
    });
    
    renderDoctors(filteredDoctors);
}

// Render doctor cards
function renderDoctors(doctors) {
    contentContainer.innerHTML = '';
    
    if (doctors.length === 0) {
        contentContainer.innerHTML = `
            <div class="no-results">
                <p>No doctors found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    doctors.forEach(doctor => {
        const card = createDoctorCard(doctor);
        contentContainer.appendChild(card);
    });
}

// Create a doctor card element
function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    
    card.innerHTML = `
        <div class="doctor-info">
            <h3 class="doctor-name">${doctor.name}</h3>
            <p class="doctor-specialty">${doctor.specialty}</p>
            <div class="doctor-details">
                <p><i class="fas fa-envelope"></i> ${doctor.email}</p>
                <p><i class="fas fa-phone"></i> ${doctor.phoneNumber}</p>
                <p><i class="fas fa-id-card"></i> License: ${doctor.licenseNumber}</p>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn-book" data-doctor-id="${doctor.id}">Book Appointment</button>
        </div>
    `;
    
    // Add click handler for booking
    const bookButton = card.querySelector('.btn-book');
    bookButton.addEventListener('click', (e) => {
        createRipple(e);
        selectedDoctor = doctor;
        showBookingModal();
    });
    
    return card;
}

// Show booking modal
function showBookingModal() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    appointmentDate.min = today;
    
    // Reset form
    bookingForm.reset();
    
    // Show modal
    showModal(modal);
}

// Load available time slots for selected date
async function loadAvailableTimeSlots() {
    if (!selectedDoctor || !appointmentDate.value) return;
    
    try {
        const date = appointmentDate.value;
        const response = await fetch(`/api/doctors/${selectedDoctor.id}/availability?date=${date}`);
        
        if (!response.ok) throw new Error('Failed to fetch available time slots');
        
        const data = await response.json();
        const timeSlots = data.availableSlots;
        
        // Populate time slots dropdown
        appointmentTime.innerHTML = '<option value="">Select a time slot</option>';
        if (timeSlots && timeSlots.length > 0) {
            timeSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                appointmentTime.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading time slots:', error);
        showError('Failed to load available time slots. Please try again.');
    }
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    if (!selectedDoctor) {
        showError('Please select a doctor first.');
        return;
    }
    
    const patientId = localStorage.getItem('patientId');
    console.log('Retrieved patient ID for booking:', patientId); // Debug log

    const bookingData = {
        patientId: patientId,
        doctorId: selectedDoctor.id,
        date: appointmentDate.value,
        time: appointmentTime.value,
        reason: appointmentReason.value
    };
    
    try {
        const response = await fetch('/api/appointments/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) throw new Error('Failed to book appointment');
        
        const result = await response.json();
        
        // Show success message
        showSuccess('Appointment booked successfully!');
        
        // Hide modal
        hideModal(modal);
        
        // Refresh appointments list if needed
        // You might want to update a separate appointments view here
        
    } catch (error) {
        console.error('Error booking appointment:', error);
        showError('Failed to book appointment. Please try again.');
    }
}

// Utility functions for notifications
function showError(message) {
    // Implement your error notification system here
    alert(message); // Replace with a better UI notification
}

function showSuccess(message) {
    // Implement your success notification system here
    alert(message); // Replace with a better UI notification
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard); 