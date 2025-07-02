/**
 * Header Component
 * Renders a dynamic header based on user role and authentication state
 */

// Main function to render the header
function renderHeader() {
    // Don't show header on homepage
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("token");
        return;
    }

    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");
    const headerDiv = document.getElementById('header');
    
    if (!headerDiv) return;

    // Validate session
    if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
        localStorage.removeItem("userRole");
        alert("Session expired or invalid login. Please log in again.");
        window.location.href = "/";
        return;
    }

    let headerContent = `
        <nav class="header-nav">
            <div class="logo">
                <a href="/">ClinicMS</a>
            </div>
            <div class="nav-links">
    `;

    // Add navigation links based on role
    switch(role) {
        case 'admin':
            headerContent += `
                <a href="/admin/dashboard" class="nav-link">Dashboard</a>
                <button id="addDocBtn" class="btn btn-primary">Add Doctor</button>
                <button id="logoutBtn" class="btn btn-outline">Logout</button>
            `;
            break;
            
        case 'doctor':
            headerContent += `
                <a href="/doctor/dashboard" class="nav-link">Home</a>
                <button id="logoutBtn" class="btn btn-outline">Logout</button>
            `;
            break;
            
        case 'loggedPatient':
            headerContent += `
                <a href="/patient/dashboard" class="nav-link">Home</a>
                <a href="/patient/appointments" class="nav-link">My Appointments</a>
                <button id="logoutBtn" class="btn btn-outline">Logout</button>
            `;
            break;
            
        default: // patient (not logged in)
            headerContent += `
                <a href="/login" class="btn btn-outline">Login</a>
                <a href="/signup" class="btn btn-primary">Sign Up</a>
            `;
    }

    headerContent += `
            </div>
        </nav>
    `;

    headerDiv.innerHTML = headerContent;
    attachHeaderButtonListeners();
}

// Attach event listeners to header buttons
function attachHeaderButtonListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add Doctor button (admin only)
    const addDocBtn = document.getElementById('addDocBtn');
    if (addDocBtn) {
        addDocBtn.addEventListener('click', () => openModal('addDoctor'));
    }
}

// Handle logout functionality
function handleLogout() {
    const role = localStorage.getItem("userRole");
    
    if (role === 'loggedPatient') {
        // For patients, keep the role but remove token
        localStorage.removeItem("token");
        localStorage.setItem("userRole", "patient");
        window.location.href = "/patient/dashboard";
    } else {
        // For admins and doctors, clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "/";
    }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
});

// Export functions for testing and manual triggering
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderHeader,
        handleLogout,
        attachHeaderButtonListeners
    };
}
