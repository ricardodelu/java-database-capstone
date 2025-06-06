export class DoctorCard {
    constructor(doctor) {
        this.doctor = doctor;
        this.role = localStorage.getItem("userRole");
    }

    createCard() {
        const card = document.createElement("div");
        card.classList.add("doctor-card");
        card.setAttribute("data-doctor-id", this.doctor.id);

        // Add info section
        const infoDiv = this.createInfoSection();
        card.appendChild(infoDiv);

        // Add actions section
        const actionsDiv = this.createActionsSection();
        card.appendChild(actionsDiv);

        return card;
    }

    createInfoSection() {
        const infoDiv = document.createElement("div");
        infoDiv.classList.add("doctor-info");

        // Doctor name
        const name = document.createElement("h3");
        name.textContent = this.doctor.name;
        name.classList.add("doctor-name");

        // Specialization
        const specialization = document.createElement("p");
        specialization.textContent = this.doctor.specialization;
        specialization.classList.add("doctor-specialization");

        // Email if available
        if (this.doctor.email) {
            const email = document.createElement("p");
            email.textContent = this.doctor.email;
            email.classList.add("doctor-email");
            infoDiv.appendChild(email);
        }

        // Availability if provided
        if (this.doctor.availability) {
            const availability = document.createElement("p");
            availability.textContent = `Available: ${this.doctor.availability.join(", ")}`;
            availability.classList.add("doctor-availability");
            infoDiv.appendChild(availability);
        }

        infoDiv.appendChild(name);
        infoDiv.appendChild(specialization);

        return infoDiv;
    }

    createActionsSection() {
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("card-actions");

        // Add role-specific buttons
        switch (this.role) {
            case "admin":
                this.addAdminButtons(actionsDiv);
                break;
            case "loggedPatient":
                this.addPatientButtons(actionsDiv);
                break;
            case "patient":
                this.addLoginPrompt(actionsDiv);
                break;
        }

        return actionsDiv;
    }

    addAdminButtons(actionsDiv) {
        // Edit button with confirmation
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("btn-edit");
        editBtn.onclick = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Authentication required");
                
                await this.handleEdit();
            } catch (error) {
                console.error("Edit failed:", error);
                alert("Failed to edit doctor. Please try again.");
            }
        };

        // Delete button with confirmation and token check
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("btn-delete");
        deleteBtn.onclick = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Authentication required");
                
                await this.handleDelete();
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Failed to delete doctor. Please try again.");
            }
        };

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
    }

    addPatientButtons(actionsDiv) {
        const bookBtn = document.createElement("button");
        bookBtn.textContent = "Book Appointment";
        bookBtn.classList.add("btn-book");
        bookBtn.onclick = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.handleLogin();
                    return;
                }

                // Get patient data before showing booking form
                const patientData = await this.getPatientData(token);
                await this.handleBooking(patientData);
            } catch (error) {
                console.error("Booking failed:", error);
                alert("Failed to book appointment. Please try again.");
            }
        };

        // Add availability indicator
        if (this.doctor.availability) {
            const availabilityBadge = document.createElement("span");
            availabilityBadge.classList.add("availability-badge");
            availabilityBadge.textContent = this.doctor.isAvailable ? "Available" : "Busy";
            actionsDiv.appendChild(availabilityBadge);
        }

        actionsDiv.appendChild(bookBtn);
    }

    addLoginPrompt(actionsDiv) {
        const loginPrompt = document.createElement("p");
        loginPrompt.textContent = "Please login to book appointments";
        loginPrompt.classList.add("login-prompt");

        const loginBtn = document.createElement("button");
        loginBtn.textContent = "Login";
        loginBtn.classList.add("btn-login");
        loginBtn.onclick = () => this.handleLogin();

        actionsDiv.appendChild(loginPrompt);
        actionsDiv.appendChild(loginBtn);
    }

    // Enhanced event handlers
    async handleEdit() {
        if (!confirm(`Do you want to edit Dr. ${this.doctor.name}'s information?`)) {
            return;
        }

        const event = new CustomEvent('editDoctor', {
            detail: { 
                doctorId: this.doctor.id,
                doctorData: this.doctor
            }
        });
        document.dispatchEvent(event);
    }

    async handleDelete() {
        if (!confirm(`Are you sure you want to delete Dr. ${this.doctor.name}? This action cannot be undone.`)) {
            return;
        }

        const event = new CustomEvent('deleteDoctor', {
            detail: { 
                doctorId: this.doctor.id,
                doctorName: this.doctor.name
            }
        });
        document.dispatchEvent(event);
    }

    async handleBooking(patientData) {
        const event = new CustomEvent('bookAppointment', {
            detail: { 
                doctorId: this.doctor.id,
                doctorName: this.doctor.name,
                specialization: this.doctor.specialization,
                patientData: patientData
            }
        });
        document.dispatchEvent(event);
    }

    async getPatientData(token) {
        try {
            const response = await fetch('/api/patient/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch patient data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching patient data:', error);
            throw error;
        }
    }

    handleLogin() {
        const event = new CustomEvent('openModal', {
            detail: { type: 'login' }
        });
        document.dispatchEvent(event);
    }
}