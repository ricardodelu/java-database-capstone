class Header {
    constructor() {
        this.headerDiv = document.getElementById('header');
        this.init();
    }

    init() {
        // Check if we're on homepage
        if (window.location.pathname.endsWith("/")) {
            localStorage.removeItem("userRole");
            localStorage.removeItem("token");
            this.renderHomeHeader();
            return;
        }

        // Get authentication state
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");

        // Validate session
        if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
            localStorage.removeItem("userRole");
            alert("Session expired or invalid login. Please log in again.");
            window.location.href = "/";
            return;
        }

        this.renderRoleBasedHeader(role);
    }

    renderHomeHeader() {
        const headerContent = `
            <header class="main-header">
                <div class="logo">
                    <img src="/assets/images/logo/logo.png" alt="Clinic Logo">
                    <h1>Clinic Management</h1>
                </div>
                <nav>
                    <ul>
                        <li><a href="#about">About</a></li>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
            </header>
        `;
        this.headerDiv.innerHTML = headerContent;
    }

    renderRoleBasedHeader(role) {
        let headerContent = `
            <header class="role-header">
                <div class="logo">
                    <img src="/assets/images/logo/logo.png" alt="Clinic Logo">
                </div>
                <nav>
        `;

        switch(role) {
            case "admin":
                headerContent += `
                    <button id="addDoctorBtn" class="btn-primary">Add Doctor</button>
                    <button onclick="this.logout()" class="btn-secondary">Logout</button>
                `;
                break;

            case "doctor":
                headerContent += `
                    <a href="/doctor/dashboard" class="nav-link">Home</a>
                    <button onclick="this.logout()" class="btn-secondary">Logout</button>
                `;
                break;

            case "loggedPatient":
                headerContent += `
                    <a href="/patient/dashboard" class="nav-link">Home</a>
                    <a href="/patient/appointments" class="nav-link">Appointments</a>
                    <button onclick="this.logoutPatient()" class="btn-secondary">Logout</button>
                `;
                break;

            case "patient":
                headerContent += `
                    <button id="loginBtn" class="btn-primary">Login</button>
                    <button id="signupBtn" class="btn-secondary">Sign Up</button>
                `;
                break;
        }

        headerContent += `
                </nav>
            </header>
        `;

        this.headerDiv.innerHTML = headerContent;
        this.attachHeaderButtonListeners();
    }

    attachHeaderButtonListeners() {
        // Admin buttons
        const addDoctorBtn = document.getElementById('addDoctorBtn');
        if (addDoctorBtn) {
            addDoctorBtn.addEventListener('click', () => this.openModal('addDoctor'));
        }

        // Patient buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openModal('login'));
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.openModal('signup'));
        }
    }

    openModal(modalType) {
        // Dispatch custom event for modal handling
        const event = new CustomEvent('openModal', { detail: { type: modalType } });
        document.dispatchEvent(event);
    }

    logout() {
        localStorage.removeItem("userRole");
        localStorage.removeItem("token");
        window.location.href = "/";
    }

    logoutPatient() {
        localStorage.removeItem("token");
        localStorage.setItem("userRole", "patient");
        window.location.href = "/patient/dashboard";
    }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Header();
});