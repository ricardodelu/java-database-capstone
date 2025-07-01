import { authService } from './services/authService.js';

class App {
    constructor() {
        this.initEventListeners();
        this.checkAuthState();
    }

    initEventListeners() {
        // Handle logout
        document.addEventListener('click', (e) => {
            if (e.target.matches('#logout-link, #logout-link *')) {
                e.preventDefault();
                authService.logout();
            }
        });

        // Handle role selection
        const roleButtons = document.querySelectorAll('.role-btn');
        roleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const role = e.target.dataset.role || e.target.textContent.toLowerCase();
                this.handleRoleSelection(role);
            });
        });
    }

    async checkAuthState() {
        try {
            const token = authService.getToken();
            if (token) {
                // User is logged in, load the appropriate dashboard
                const user = authService.getCurrentUser();
                if (user && user.roles && user.roles.length > 0) {
                    const role = user.roles[0].replace('ROLE_', '').toLowerCase();
                    await this.loadDashboard(role);
                }
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            authService.logout();
        }
    }

    handleRoleSelection(role) {
        const modal = document.getElementById('loginModal');
        if (modal) {
            // Show login modal with role pre-selected
            const roleInput = modal.querySelector('input[name="role"]');
            if (roleInput) roleInput.value = role;
            modal.style.display = 'block';
        }
    }

    async loadDashboard(role) {
        const contentDiv = document.getElementById('main-content');
        if (!contentDiv) return;

        try {
            // Clear existing content
            contentDiv.innerHTML = '';

            // Load the appropriate dashboard based on role
            switch (role) {
                case 'admin':
                    // Dynamically import and instantiate AdminDashboardService
                    const { AdminDashboardService } = await import('./services/adminDashboard.js');
                    new AdminDashboardService();
                    break;
                case 'doctor':
                    const { DoctorDashboard } = await import('./services/doctorDashboard.js');
                    new DoctorDashboard();
                    break;
                case 'patient':
                    // Load patient dashboard
                    window.location.href = '/patient/dashboard';
                    return;
                default:
                    throw new Error('Invalid role');
            }

            // Update UI to show user is logged in
            this.updateUIForAuthenticatedUser(role);
            
        } catch (error) {
            console.error(`Error loading ${role} dashboard:`, error);
            contentDiv.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Dashboard</h2>
                    <p>${error.message || 'An error occurred while loading the dashboard.'}</p>
                    <button onclick="window.location.href='/'">Return to Home</button>
                </div>
            `;
        }
    }

    updateUIForAuthenticatedUser(role) {
        // Update header to show user is logged in
        const header = document.querySelector('header');
        if (header) {
            const user = authService.getCurrentUser();
            const welcomeMsg = document.createElement('div');
            welcomeMsg.className = 'user-welcome';
            welcomeMsg.innerHTML = `
                <span>Welcome, ${user?.username || ''}</span>
                <a href="#" id="logout-link">Logout</a>
            `;
            
            const existingWelcome = header.querySelector('.user-welcome');
            if (existingWelcome) {
                existingWelcome.replaceWith(welcomeMsg);
            } else {
                header.appendChild(welcomeMsg);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
