// Debug: confirm script is loaded
console.log("patientDashboard.js loaded");

import { createDoctorCard } from './components/doctorCard.js';

// Declare doctors and filteredDoctors at the top
let doctors = [];
let filteredDoctors = [];
// Declare contentContainer for doctor cards
const contentContainer = document.getElementById('content');

// Test that the function is available from HTML
console.log('openLoginModal function defined in module:', typeof window.openLoginModal === 'function');

// Add global event listener for showLogin to open login modal - at the very top
console.log('Setting up showLogin event listener...');
window.addEventListener('showLogin', function(event) {
    console.log('showLogin event received!', event);
    console.log('openLoginModal function exists:', typeof openLoginModal === 'function');
    if (typeof openLoginModal === 'function') {
        console.log('Calling openLoginModal...');
        openLoginModal();
    } else {
        console.error('openLoginModal function not found');
        alert('Please log in.');
    }
});
console.log('showLogin event listener added successfully');

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired for patientDashboard.js");
    if (typeof initializeDashboard === 'function') {
        console.log("Calling initializeDashboard...");
        initializeDashboard();
    } else {
        console.error("initializeDashboard is not defined");
    }
});

async function initializeDashboard() {
    console.log("initializeDashboard called");
    try {
        console.log('Starting header initialization...');
        // Initialize header with login button for anonymous users
        const { Header } = await import('/js/components/header.js');
        console.log('Header component imported successfully');
        const { authService } = await import('/js/services/authService.js');
        console.log('AuthService imported successfully');
        const header = new Header();
        console.log('Header instance created');
        const token = authService.getToken();
        console.log('Token retrieved:', token ? 'exists' : 'not found');
        console.log('Mounting header with showLogin:', !token);
        await header.mount('header', 'Patient Dashboard', !!token, !token);
        console.log('Header mounted successfully');
        
        await loadDoctors();
        populateSpecialtyFilter();
        await renderDoctors(doctors);
        setupEventListeners(); // Setup listeners after initial data is loaded
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        alert('Failed to load dashboard data. Please try again later.');
    }
}

async function loadDoctors() {
    console.log("Attempting to fetch doctors...");
    try {
        const response = await fetch('/api/doctors');
        console.log("/api/doctors response status:", response.status);
        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }
        const data = await response.json();
        console.log("Doctors data received:", data);
        doctors = data.doctors;
        filteredDoctors = [...doctors];
    } catch (error) {
        console.error('Error loading doctors:', error);
        throw error;
    }
}

async function renderDoctors(doctors) {
    console.log("Rendering doctors:", doctors);
    contentContainer.innerHTML = '';
    if (doctors.length === 0) {
        contentContainer.innerHTML = `
            <div class="no-results">
                <p>No doctors found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    for (const doctor of doctors) {
        const card = await createDoctorCard(doctor, (doctor, e) => {
            // This is the onBookNow callback for the "Book Now" button
            console.log('Book Now button clicked for doctor:', doctor.name);
            showBookingModal(doctor);
        });
        
        // Remove the card click handler - only the "Book Now" button should open the modal
        // card.addEventListener('click', (e) => { ... });
        
        contentContainer.appendChild(card);
    }
}

function populateSpecialtyFilter() {
    const filterSpecialty = document.getElementById('filterSpecialty');
    if (!filterSpecialty) return;
    // Remove all options except the first (All Specialties)
    filterSpecialty.length = 1;
    // Get unique specialties from doctors
    const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];
    specialties.forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty;
        option.textContent = specialty;
        filterSpecialty.appendChild(option);
    });
}

function setupEventListeners() {
    const searchBar = document.getElementById('searchBar');
    const filterTime = document.getElementById('filterTime');
    const filterSpecialty = document.getElementById('filterSpecialty');

    if (searchBar) {
        searchBar.addEventListener('input', handleFilters);
    }
    if (filterTime) {
        filterTime.addEventListener('change', handleFilters);
    }
    if (filterSpecialty) {
        filterSpecialty.addEventListener('change', handleFilters);
    }
}

async function handleFilters() {
    const searchBar = document.getElementById('searchBar');
    const filterTime = document.getElementById('filterTime');
    const filterSpecialty = document.getElementById('filterSpecialty');

    let searchTerm = searchBar ? searchBar.value.trim().toLowerCase() : '';
    let time = filterTime ? filterTime.value : '';
    let specialty = filterSpecialty ? filterSpecialty.value : '';

    filteredDoctors = doctors.filter(doctor => {
        const matchesName = doctor.name.toLowerCase().includes(searchTerm);
        const matchesSpecialty = !specialty || doctor.specialty === specialty;
        // Updated time filtering: check if any availableTimes include AM/PM
        const matchesTime = !time || (
            Array.isArray(doctor.availableTimes) && doctor.availableTimes.some(slot => slot.toUpperCase().includes(time))
        );
        return matchesName && matchesSpecialty && matchesTime;
    });

    await renderDoctors(filteredDoctors);
}

// Booking modal logic
function showBookingModal(doctor) {
    console.log('=== BOOKING MODAL START ===');
    console.log('Doctor:', doctor);
    
    // Create modal content
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) {
        console.error('modal-body element not found!');
        return;
    }
    console.log('Modal body found, clearing content...');
    modalBody.innerHTML = '';

    // Create form
    const form = document.createElement('form');
    form.className = 'booking-form';

    // Date input
    const dateGroup = document.createElement('div');
    dateGroup.className = 'form-group';
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Select Date:';
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'form-control';
    dateInput.required = true;
    dateInput.min = new Date().toISOString().split('T')[0];
    dateGroup.appendChild(dateLabel);
    dateGroup.appendChild(dateInput);
    form.appendChild(dateGroup);

    // Time select
    const timeGroup = document.createElement('div');
    timeGroup.className = 'form-group';
    const timeLabel = document.createElement('label');
    timeLabel.textContent = 'Select Time:';
    const timeSelect = document.createElement('select');
    timeSelect.className = 'form-control';
    timeSelect.required = true;
    timeGroup.appendChild(timeLabel);
    timeGroup.appendChild(timeSelect);
    form.appendChild(timeGroup);

    // Reason input
    const reasonGroup = document.createElement('div');
    reasonGroup.className = 'form-group';
    const reasonLabel = document.createElement('label');
    reasonLabel.textContent = 'Reason (optional):';
    const reasonInput = document.createElement('input');
    reasonInput.type = 'text';
    reasonInput.className = 'form-control';
    reasonInput.placeholder = 'Reason for appointment';
    reasonGroup.appendChild(reasonLabel);
    reasonGroup.appendChild(reasonInput);
    form.appendChild(reasonGroup);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'Book Appointment';
    form.appendChild(submitBtn);

    // Message div
    const messageDiv = document.createElement('div');
    messageDiv.className = 'booking-message';
    form.appendChild(messageDiv);

    // Populate time slots on date change
    dateInput.addEventListener('change', async () => {
        console.log('Date changed to:', dateInput.value);
        timeSelect.innerHTML = '';
        if (!dateInput.value) return;
        
        // Optionally, fetch available slots for the selected date from the API
        const url = `/api/appointments/available-slots?doctorId=${doctor.id}&date=${dateInput.value}`;
        console.log('Fetching available slots from:', url);
        
        try {
            // Get auth token for the request
            const { authService } = await import('/js/services/authService.js');
            const token = authService.getToken();
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            console.log('Making request with auth header:', !!token);
            const response = await fetch(url, { headers });
            console.log('Available slots response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Available slots response data:', data);
                
                const slots = data.availableSlots || doctor.availableTimes || [];
                console.log('Slots to display:', slots);
                
                if (slots.length === 0) {
                    console.log('No slots available');
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'No available slots';
                    timeSelect.appendChild(option);
                } else {
                    console.log('Adding slots to dropdown');
                    timeSelect.appendChild(new Option('Select a time', ''));
                    slots.forEach(slot => {
                        const option = document.createElement('option');
                        option.value = slot;
                        option.textContent = slot;
                        timeSelect.appendChild(option);
                    });
                }
            } else {
                console.error('Available slots API error:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                timeSelect.appendChild(new Option('Error loading slots', ''));
            }
        } catch (err) {
            console.error('Available slots fetch error:', err);
            timeSelect.appendChild(new Option('Error loading slots', ''));
        }
    });

    // Form submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('=== FORM SUBMIT START ===');
        messageDiv.textContent = '';
        messageDiv.className = 'booking-message';
        const date = dateInput.value;
        const time = timeSelect.value;
        const reason = reasonInput.value;
        console.log('Form data:', { date, time, reason });
        
        if (!date || !time) {
            console.log('Validation failed: missing date or time');
            messageDiv.textContent = 'Please select a date and time.';
            messageDiv.classList.add('error');
            return;
        }
        // Get patient ID using authService
        let patientId = null;
        console.log('Starting auth check...');
        try {
            console.log('Importing authService...');
            const { authService } = await import('/js/services/authService.js');
            console.log('authService imported successfully');
            
            console.log('Getting token...');
            const token = authService.getToken();
            console.log('Token retrieved:', token ? 'EXISTS' : 'NOT FOUND');
            
            console.log('Getting current user...');
            const user = authService.getCurrentUser();
            console.log('User retrieved:', user);
            
            console.log('Auth check - Token:', token ? 'exists' : 'not found');
            console.log('Auth check - User:', user);
            
            if (token && user) {
                console.log('Token and user both exist, proceeding...');
                // For now, we'll use the username as a fallback
                // In a real system, you'd want to fetch the patient ID from the backend
                // using the token to get the full patient data
                patientId = user.username; // This is a temporary solution
                console.log('Using patientId:', patientId);
                
                // TODO: Fetch actual patient ID from backend using token
                // const response = await fetch('/api/patients/me', {
                //     headers: authService.getAuthHeader()
                // });
                // const patientData = await response.json();
                // patientId = patientData.id;
            } else {
                console.log('Token or user missing:');
                console.log('- Token exists:', !!token);
                console.log('- User exists:', !!user);
            }
        } catch (err) {
            console.error('Error retrieving patient data:', err);
            console.error('Error details:', err.message);
            console.error('Error stack:', err.stack);
        }
        
        console.log('Final patientId:', patientId);
        if (!patientId) {
            console.log('No patientId found, showing error message');
            messageDiv.textContent = 'You must be logged in as a patient to book an appointment.';
            messageDiv.classList.add('error');
            return;
        }
        // Book appointment via API
        console.log('Proceeding with booking API call...');
        const bookingData = {
            doctorId: doctor.id,
            patientId,
            date,
            time,
            reason
        };
        console.log('Booking data:', bookingData);
        
        try {
            console.log('Making API call to /api/appointments/book...');
            
            // Get auth token for the request
            const { authService } = await import('/js/services/authService.js');
            const token = authService.getToken();
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            
            console.log('Making booking request with auth header:', !!token);
            const response = await fetch('/api/appointments/book', {
                method: 'POST',
                headers,
                body: JSON.stringify(bookingData)
            });
            console.log('API response status:', response.status);
            
            const result = await response.json();
            console.log('API response data:', result);
            
            if (response.ok) {
                console.log('Booking successful!');
                messageDiv.textContent = 'Appointment booked successfully!';
                messageDiv.classList.add('success');
                form.reset();
            } else {
                console.log('Booking failed:', result.error);
                messageDiv.textContent = result.error || 'Failed to book appointment.';
                messageDiv.classList.add('error');
            }
        } catch (err) {
            console.error('API call error:', err);
            messageDiv.textContent = 'Error booking appointment.';
            messageDiv.classList.add('error');
        }
    });

    modalBody.appendChild(form);
    // Show the modal
    const modal = document.getElementById('modal');
    if (modal) {
        console.log('Showing modal with .active class');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    // Close modal on click of close button
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.onclick = () => {
            console.log('Closing modal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };
    }
} 