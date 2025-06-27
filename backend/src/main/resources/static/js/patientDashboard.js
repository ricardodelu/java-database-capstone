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

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Load doctors data
        await loadDoctors();
        

        
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
    if (!selectedDoctor) {
        console.error("No doctor selected, cannot show modal.");
        return;
    }
    console.log(`Showing booking modal for Dr. ${selectedDoctor.name}`);
    
    // Reset form fields
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.reset();
    }
    const availableSlots = document.getElementById('availableSlots');
    if (availableSlots) {
        availableSlots.innerHTML = '<option value="">Select a date to see available slots</option>';
    }

    showModal('bookingModal');
}

function setupEventListeners() {
    // Page filters
    searchBar.addEventListener('input', handleSearch);
    filterTime.addEventListener('change', handleFilter);
    filterSpecialty.addEventListener('change', handleFilter);

    // Modal elements
    const bookingForm = document.getElementById('bookingForm');
    const bookingDate = document.getElementById('bookingDate');
    const availableSlots = document.getElementById('availableSlots');
    const slotsLoader = document.getElementById('slotsLoader');
    const closeBookingModal = document.getElementById('closeBookingModal');
    const cancelBookingBtn = document.getElementById('cancelBooking');

    if (!bookingForm || !bookingDate || !availableSlots || !slotsLoader || !closeBookingModal || !cancelBookingBtn) {
        console.error('One or more modal elements could not be found. Check IDs in patient/base.html.');
        return;
    }

    // Set min date for date picker
    bookingDate.min = new Date().toISOString().split('T')[0];

    // Event listener for closing the modal
    const closeModal = () => hideModal('bookingModal');
    closeBookingModal.addEventListener('click', closeModal);
    cancelBookingBtn.addEventListener('click', closeModal);

    // Event listener for date change to fetch available slots
    bookingDate.addEventListener('change', async () => {
        const selectedDate = bookingDate.value;
        if (!selectedDate || !selectedDoctor) return;

        slotsLoader.style.display = 'block';
        availableSlots.innerHTML = '<option value="">Loading...</option>';

        try {
            const response = await fetch(`/api/appointments/available-slots?doctorId=${selectedDoctor.id}&date=${selectedDate}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const slots = await response.json();
            availableSlots.innerHTML = '<option value="">Select a time slot</option>';
            if (slots.length > 0) {
                slots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    availableSlots.appendChild(option);
                });
            } else {
                availableSlots.innerHTML = '<option value="">No available slots</option>';
            }
        } catch (error) {
            console.error('Error fetching available slots:', error);
            availableSlots.innerHTML = '<option value="">Error loading slots</option>';
        } finally {
            slotsLoader.style.display = 'none';
        }
    });

    // Event listener for form submission
    bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const patientId = localStorage.getItem('patientId');
        if (!patientId) {
            alert('You must be logged in to book an appointment.');
            return;
        }

        if (!selectedDoctor) {
            alert('An error occurred. No doctor selected.');
            return;
        }

        const formData = new FormData(bookingForm);
        const bookingData = {
            patientId: parseInt(patientId, 10),
            doctorId: selectedDoctor.id,
            date: formData.get('date'),
            time: formData.get('time'),
            reason: formData.get('reason'),
        };

        console.log('Submitting booking data:', bookingData);

        try {
            const response = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Appointment booked successfully!');
                hideModal('bookingModal');
            } else {
                alert(`Booking failed: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('An error occurred while booking the appointment.');
        }
    });
}

// Utility functions for notifications
function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
}); 