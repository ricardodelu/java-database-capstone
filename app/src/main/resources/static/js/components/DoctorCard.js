/**
 * Doctor Card Component
 * Creates a dynamic, reusable card for displaying doctor information
 * with role-based actions
 */

export function createDoctorCard(doctor) {
    // Create card container
    const card = document.createElement('div');
    card.className = 'doctor-card';
    
    // Get user role from localStorage
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    // Create doctor info section
    const infoDiv = document.createElement('div');
    infoDiv.className = 'doctor-info';
    
    // Doctor name
    const name = document.createElement('h3');
    name.textContent = doctor.name || 'Dr. Unknown';
    
    // Specialty
    const specialty = document.createElement('p');
    specialty.className = 'specialty';
    specialty.textContent = doctor.specialty || 'General Practitioner';
    
    // Email
    const email = document.createElement('p');
    email.className = 'email';
    email.textContent = doctor.email || 'No email provided';
    
    // Availability
    const availability = document.createElement('p');
    availability.className = 'availability';
    if (doctor.availability && Array.isArray(doctor.availability)) {
        availability.textContent = `Available: ${doctor.availability.join(', ')}`;
    } else {
        availability.textContent = 'Contact for availability';
    }
    
    // Assemble info section
    infoDiv.appendChild(name);
    infoDiv.appendChild(specialty);
    infoDiv.appendChild(email);
    infoDiv.appendChild(availability);
    
    // Create actions section
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'card-actions';
    
    // Add role-specific buttons
    if (role === 'admin') {
        // Delete button for admin
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this doctor?')) {
                try {
                    // Import the deleteDoctor function from doctorServices
                    const { deleteDoctor } = await import('../services/doctorServices.js');
                    await deleteDoctor(doctor.id, token);
                    card.dispatchEvent(new CustomEvent('doctorDeleted', {
                        bubbles: true,
                        detail: { doctorId: doctor.id }
                    }));
                } catch (error) {
                    console.error('Error deleting doctor:', error);
                    alert('Failed to delete doctor. Please try again.');
                }
            }
        });
        actionsDiv.appendChild(deleteBtn);
        
        // Edit button for admin
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-edit';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.dispatchEvent(new CustomEvent('editDoctor', {
                bubbles: true,
                detail: { doctor }
            }));
        });
        actionsDiv.appendChild(editBtn);
        
    } else if (role === 'patient') {
        // Book Now button for non-logged in patients
        const bookBtn = document.createElement('button');
        bookBtn.className = 'btn btn-primary';
        bookBtn.textContent = 'Book Now';
        bookBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('Please log in to book an appointment.');
            // Optionally trigger login modal
            const event = new CustomEvent('showLogin', { bubbles: true });
            document.dispatchEvent(event);
        });
        actionsDiv.appendChild(bookBtn);
        
    } else if (role === 'loggedPatient') {
        // Book Now button for logged-in patients
        const bookBtn = document.createElement('button');
        bookBtn.className = 'btn btn-primary';
        bookBtn.textContent = 'Book Now';
        bookBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                // Import required services
                const { getPatientData } = await import('../services/patientServices.js');
                const { showBookingOverlay } = await import('../services/bookingService.js');
                
                // Get patient data and show booking overlay
                const patientData = await getPatientData(token);
                showBookingOverlay(e, doctor, patientData);
                
            } catch (error) {
                console.error('Error initiating booking:', error);
                alert('Failed to initiate booking. Please try again.');
            }
        });
        actionsDiv.appendChild(bookBtn);
    }
    
    // Assemble the card
    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);
    
    // Add hover effect
    card.style.transition = 'transform 0.2s, box-shadow 0.2s';
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
    });
    
    // Initial shadow
    card.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
    
    return card;
}