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
        await loadDoctors();
        populateSpecialtyFilter();
        renderDoctors(doctors);
        setupEventListeners(); // Setup listeners after initial data is loaded
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

// Populate the specialty filter dropdown
function populateSpecialtyFilter() {
    const specialties = [...new Set(doctors.map(d => d.specialty))];
    specialties.sort().forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty;
        option.textContent = specialty;
        filterSpecialty.appendChild(option);
    });
}

// Show booking modal
function showBookingModal() {
    if (!selectedDoctor) {
        console.error("No doctor selected, cannot show modal.");
        return;
    }

    const bookingForm = document.getElementById('bookingForm');
    const messageDiv = document.getElementById('bookingMessage');

    // Reset form and clear any previous messages
    if (bookingForm) {
        bookingForm.reset();
        document.getElementById('bookingDoctorId').value = selectedDoctor.id;
    }
    if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';
        messageDiv.className = 'booking-message';
    }

    const bookingTimeSelect = document.getElementById('bookingTime');
    if (bookingTimeSelect) {
        bookingTimeSelect.innerHTML = ''; // Clear existing options
        if (selectedDoctor.availableTimes && selectedDoctor.availableTimes.length > 0) {
            bookingTimeSelect.innerHTML = '<option value="">Select a time slot</option>';
            selectedDoctor.availableTimes.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                bookingTimeSelect.appendChild(option);
            });
        } else {
            bookingTimeSelect.innerHTML = '<option value="">No available slots for this doctor</option>';
        }
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
    const bookingTime = document.getElementById('bookingTime');
    const slotsLoader = document.getElementById('slotsLoader');
    const closeBookingModal = document.getElementById('closeBookingModal');
    const cancelBookingBtn = document.getElementById('cancelBooking');

    if (!bookingForm || !bookingDate || !bookingTime || !slotsLoader || !closeBookingModal || !cancelBookingBtn) {
        console.error('One or more modal elements could not be found. Check the IDs in patientDashboard.html.');
        return;
    }

    // Set min date for date picker
    bookingDate.min = new Date().toISOString().split('T')[0];

    // Event listener for closing the modal
    const closeModal = () => hideModal('bookingModal');
    closeBookingModal.addEventListener('click', closeModal);
    cancelBookingBtn.addEventListener('click', closeModal);

    function convertTo24Hour(timeStr) {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier.toUpperCase() === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }

        return `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('[SUBMIT] Form submission initiated.');

        const doctorId = document.getElementById('bookingDoctorId').value;
        const patientId = 1; // Hardcoded for now, replace with actual patient ID
        const appointmentDate = document.getElementById('bookingDate').value;
        const appointmentTime12hr = document.getElementById('bookingTime').value;
        const reason = document.getElementById('bookingReason').value;
        const messageDiv = document.getElementById('bookingMessage');

        console.log(`[SUBMIT] Data collected: date='${appointmentDate}', time='${appointmentTime12hr}'`);

        // Hide previous messages and reset class
        messageDiv.style.display = 'none';
        messageDiv.className = 'booking-message';

        // Form validation
        if (!appointmentDate || !appointmentTime12hr) {
            messageDiv.textContent = 'Please select both a date and a time slot.';
            messageDiv.className = 'booking-message error';
            messageDiv.style.display = 'block';
            console.error('[SUBMIT] Validation failed: Date or time not selected.');
            return; // Stop the submission
        }

        console.log('[SUBMIT] Converting time to 24hr format.');
        const time24hr = convertTo24Hour(appointmentTime12hr);
        console.log(`[SUBMIT] Time converted to: ${time24hr}`);

        const bookingData = {
            doctorId,
            patientId,
            date: appointmentDate,
            time: time24hr,
            reason,
        };
        console.log('[SUBMIT] Booking data object created:', bookingData);

        try {
            console.log('[SUBMIT] Sending fetch request to /api/appointments/book...');
            const response = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
            console.log(`[SUBMIT] Received response with status: ${response.status}`);

            const result = await response.json();
            console.log('[SUBMIT] Parsed JSON response:', result);

            if (response.ok) {
                console.log('[SUBMIT] Response is OK. Showing success message.');
                messageDiv.textContent = result.message || 'Appointment booked successfully!';
                messageDiv.className = 'booking-message success';
                messageDiv.style.display = 'block';
                bookingForm.reset();
                setTimeout(() => {
                    closeModal();
                }, 2000); // Close modal after 2 seconds
            } else {
                console.log('[SUBMIT] Response is NOT OK. Showing error message.');
                messageDiv.textContent = result.error || 'Failed to book appointment. Please try again.';
                messageDiv.className = 'booking-message error';
                messageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('[SUBMIT] An error occurred in the try-catch block:', error);
            messageDiv.textContent = 'An error occurred. Please check the console and try again.';
            messageDiv.className = 'booking-message error';
            messageDiv.style.display = 'block';
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
document.addEventListener('DOMContentLoaded', initializeDashboard); 