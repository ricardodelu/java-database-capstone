// Header Component
function renderHeader() {
    // Check if we're on the homepage
    if (window.location.pathname.endsWith("/")) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("token");
    }

    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");
    const headerDiv = document.getElementById("header");

    // Validate session
    if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
        localStorage.removeItem("userRole");
        alert("Session expired or invalid login. Please log in again.");
        window.location.href = "/";
        return;
    }

    let headerContent = `
        <header class="main-header">
            <div class="logo">
                <a href="/" class="logo-link">
                    <img src="/assets/images/logo.png" alt="Clinic Logo" class="logo-img">
                    <span class="logo-text">Clinic Management System</span>
                </a>
            </div>
            <nav class="main-nav">
                <div class="nav-links">`;

    // Role-specific navigation
    switch (role) {
        case "admin":
            headerContent += `
                    <a href="/admin/dashboard" class="nav-link">Dashboard</a>
                    <a href="/admin/doctors" class="nav-link">Manage Doctors</a>
                    <a href="/admin/patients" class="nav-link">Manage Patients</a>
                    <button id="addDocBtn" class="admin-btn" onclick="openModal('addDoctor')">Add Doctor</button>
                    <a href="#" class="nav-link" onclick="logout()">Logout</a>`;
            break;

        case "doctor":
            headerContent += `
                    <a href="/doctor/dashboard" class="nav-link">Dashboard</a>
                    <a href="/doctor/appointments" class="nav-link">Appointments</a>
                    <a href="/doctor/patients" class="nav-link">My Patients</a>
                    <a href="#" class="nav-link" onclick="logout()">Logout</a>`;
            break;

        case "loggedPatient":
            headerContent += `
                    <a href="/patient/dashboard" class="nav-link">Home</a>
                    <a href="/patient/appointments" class="nav-link">My Appointments</a>
                    <a href="/patient/records" class="nav-link">Medical Records</a>
                    <a href="#" class="nav-link" onclick="logoutPatient()">Logout</a>`;
            break;

        case "patient":
        default:
            headerContent += `
                    <a href="/login" class="nav-link">Login</a>
                    <a href="/signup" class="nav-link">Sign Up</a>`;
            break;
    }

    headerContent += `
                </div>
            </nav>
        </header>`;

    // Inject the header
    headerDiv.innerHTML = headerContent;
    attachHeaderButtonListeners();
}

// Attach event listeners to header buttons
function attachHeaderButtonListeners() {
    // Add Doctor button listener
    const addDocBtn = document.getElementById("addDocBtn");
    if (addDocBtn) {
        addDocBtn.addEventListener("click", () => openModal("addDoctor"));
    }

    // Other button listeners can be added here
}

// Logout function for admin and doctor
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/";
}

// Logout function for patients
function logoutPatient() {
    localStorage.removeItem("token");
    localStorage.setItem("userRole", "patient");
    window.location.href = "/patient/dashboard";
}

// Export functions for use in other modules
export { renderHeader, logout, logoutPatient };