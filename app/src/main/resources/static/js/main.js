import { authService } from '/js/services/authService.js';

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
        
        // Handle login form submission
        document.addEventListener('modalSubmit', async (e) => {
            const { type, data } = e.detail;
            console.log('Modal submit event received:', { type, data });
            
            if (type.endsWith('Login')) {
                try {
                    // Show loading state in the form
                    const form = document.querySelector('#modal form');
                    const submitButton = form?.querySelector('button[type="submit"]');
                    const buttonText = submitButton?.querySelector('.button-text');
                    const errorDiv = form?.querySelector('.error-message');
                    
                    if (submitButton && buttonText) {
                        submitButton.disabled = true;
                        buttonText.textContent = 'Logging in...';
                    }
                    
                    // Call the login service
                    const result = await authService.login(data.username, data.password);
                    console.log('Login successful:', result);
                    
                    // Close the modal
                    const modal = document.getElementById('modal');
                    if (modal) {
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                        const modalBody = document.getElementById('modal-body');
                        if (modalBody) modalBody.innerHTML = '';
                    }
                    
                    // Redirect based on user role
                    if (result.roles && result.roles.length > 0) {
                        const role = result.roles[0].replace('ROLE_', '').toLowerCase();
                        await this.loadDashboard(role);
                    } else {
                        console.warn('No roles found for user, defaulting to home');
                        window.location.href = '/';
                    }
                    
                } catch (error) {
                    console.error('Login failed:', error);
                    
                    // Show error in the form
                    const form = document.querySelector('#modal form');
                    const submitButton = form?.querySelector('button[type="submit"]');
                    const buttonText = submitButton?.querySelector('.button-text');
                    const errorDiv = form?.querySelector('.error-message');
                    
                    if (errorDiv) {
                        errorDiv.textContent = error.message || 'Login failed. Please try again.';
                        errorDiv.style.display = 'block';
                    }
                    
                    if (submitButton && buttonText) {
                        submitButton.disabled = false;
                        buttonText.textContent = 'Login';
                    }
                }
            }
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
        console.log('loadDashboard called with role:', role);
        const contentDiv = document.querySelector('main.main-content');
        
        if (!contentDiv) {
            console.error('Main content area (main.main-content) not found in the DOM');
            console.log('Available elements in body:', document.body.innerHTML);
            return;
        }

        try {
            console.log('Clearing existing content');
            contentDiv.innerHTML = '<div class="loading">Loading dashboard...</div>';

            // Log the current user for debugging
            const currentUser = authService.getCurrentUser();
            console.log('Current user from authService:', currentUser);
            console.log('Available roles:', currentUser?.roles);

            // Load the appropriate dashboard based on role
            console.log(`Loading dashboard for role: ${role}`);
            
            switch (role.toLowerCase()) {
                case 'admin':
                    console.log('Loading admin dashboard');
                    try {
                        const { AdminDashboardService } = await import('/js/adminDashboard.js');
                        console.log('AdminDashboardService imported successfully');
                        new AdminDashboardService();
                        console.log('AdminDashboardService instantiated');
                    } catch (e) {
                        console.error('Error loading admin dashboard:', e);
                        throw new Error('Failed to load admin dashboard');
                    }
                    break;
                    
                case 'doctor':
                    console.log('Loading doctor dashboard');
                    try {
                        const { DoctorDashboard } = await import('/js/doctorDashboard.js');
                        console.log('DoctorDashboard imported successfully');
                        new DoctorDashboard();
                        console.log('DoctorDashboard instantiated');
                    } catch (e) {
                        console.error('Error loading doctor dashboard:', e);
                        throw new Error('Failed to load doctor dashboard');
                    }
                    break;
                    
                case 'patient':
                    console.log('Redirecting to patient dashboard');
                    window.location.href = '/patient/dashboard';
                    return;
                    
                default:
                    console.error('Invalid role specified:', role);
                    throw new Error(`Invalid role: ${role}`);
            }

            console.log('Updating UI for authenticated user');
            this.updateUIForAuthenticatedUser(role);
            
        } catch (error) {
            console.error(`Error in loadDashboard for role ${role}:`, error);
            
            const errorMessage = error.message || 'An error occurred while loading the dashboard.';
            console.error('Error details:', { 
                message: error.message,
                stack: error.stack,
                role: role
            });
            
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div class="error-message">
                        <h2>Error Loading Dashboard</h2>
                        <p>${errorMessage}</p>
                        <p>Please try refreshing the page or contact support if the problem persists.</p>
                        <button onclick="window.location.href='/'">Return to Home</button>
                    </div>
                `;
            } else {
                console.error('Could not display error message - content div not found');
            }
            
            // Re-throw the error for any upstream error handling
            throw error;
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
