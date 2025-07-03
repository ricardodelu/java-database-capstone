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
            const user = authService.getCurrentUser();
            
            if (token && user) {
                console.log('User is authenticated, checking role...');
                // Update UI based on user role
                this.updateUIForAuthenticatedUser(user.role || 'patient');
                
                // Only load dashboard if we're on a dashboard route
                const path = window.location.pathname;
                console.log('Current path:', path);
                
                if (path === '/admin/dashboard' && user.roles?.includes('ROLE_ADMIN')) {
                    console.log('Loading admin dashboard from checkAuthState');
                    await this.loadDashboard('admin');
                } else if (path === '/patient/dashboard') {
                    await this.loadDashboard('patient');
                } else if (path === '/doctor/dashboard') {
                    await this.loadDashboard('doctor');
                } else {
                    console.log('No dashboard to load for current route:', path);
                }
            } else {
                console.log('No valid authentication found');
                this.updateUIForUnauthenticatedUser();
                
                // If on a dashboard route but not authenticated, redirect to login
                const path = window.location.pathname;
                if (path.includes('dashboard')) {
                    window.location.href = '/';
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
        
        // Get the JWT token
        const token = authService.getToken();
        if (!token) {
            console.error('No JWT token found');
            window.location.href = '/login';
            return;
        }
        
        // Redirect to the appropriate dashboard based on role
        const dashboardPath = `/${role}/dashboard`;
        console.log('Loading dashboard at', dashboardPath, 'for role:', role);
        
        // Find the content div
        const contentDiv = document.querySelector('main.main-content') || document.getElementById('content') || document.body;
        
        // Check if we're already on the dashboard page
        if (window.location.pathname === dashboardPath) {
            console.log('Already on dashboard page, initializing dashboard...');
            await this.initializeDashboard(role);
            return;
        }
        
        // Show loading state
        if (contentDiv) {
            contentDiv.innerHTML = '<div class="loading">Loading dashboard...</div>';
        }
        
        // Use fetch to load the dashboard with the JWT token
        try {
            const response = await fetch(dashboardPath, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/html',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin' // Include cookies if needed
            });
            
            if (response.ok) {
                // If the response is HTML, replace the current document
                const html = await response.text();
                document.open();
                document.write(html);
                document.close();
            } else if (response.status === 401 || response.status === 403) {
                console.error('Access denied - invalid or expired token');
                authService.logout();
                window.location.href = '/login';
            } else {
                console.error('Failed to load dashboard:', response.status, response.statusText);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div class="error">
                        <h2>Error Loading Dashboard</h2>
                        <p>${error.message || 'An unknown error occurred'}</p>
                        <button onclick="window.location.href='/'">Return to Home</button>
                    </div>
                `;
            } else {
                window.location.href = '/';
            }
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
                        // Only proceed if we're on the admin dashboard page
                        if (!document.getElementById('doctorList')) {
                            console.error('Admin dashboard elements not found on this page');
                            return;
                        }
                        
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
