import { openModal } from '../components/modals.js';
import { authService } from './authService.js';

class LoginHandler {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Attach click handlers to role buttons
        document.querySelectorAll('.role-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const role = e.target.id.replace('Btn', '').toLowerCase();
                this.handleRoleSelection(role);
            });
        });

        // Listen for modal form submissions
        document.addEventListener('modalSubmit', this.handleLoginSubmit.bind(this));
    }

    handleRoleSelection(role) {
        console.log('Role selected:', role);
        openModal(`${role}Login`);
    }

    async handleLoginSubmit(event) {
        const { type, data } = event.detail;
        console.log('Login attempt:', type, data);
        
        try {
            // Map the login type to the expected username field
            const loginData = {
                username: data.email || data.username, // Handle both email and username
                password: data.password
            };

            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                let errorMessage = `Login failed with status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                    console.error('Login error details:', errorData);
                } catch (e) {
                    const errorText = await response.text();
                    console.error('Failed to parse error response:', errorText);
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            
            // Store the JWT token and user info
            if (result.token) {
                const user = {
                    username: result.username,
                    roles: result.roles || []
                };
                
                authService.setAuth(result.token, user);
                
                // Determine the role from the first role in the array
                const role = result.roles && result.roles.length > 0 
                    ? result.roles[0].replace('ROLE_', '').toLowerCase()
                    : 'user';
                
                // Instead of redirecting, load the dashboard content via JavaScript
                console.log('Login successful, loading dashboard content');
                
                // Load the dashboard content
                const contentDiv = document.getElementById('main-content');
                if (contentDiv) {
                    // Clear existing content
                    contentDiv.innerHTML = '';
                    
                    // Load the dashboard based on role
                    if (role === 'admin') {
                        // Initialize the admin dashboard
                        import('./adminDashboard.js').then(module => {
                            new module.AdminDashboardService();
                        }).catch(error => {
                            console.error('Error loading admin dashboard:', error);
                            window.location.href = '/';
                        });
                    } else {
                        // Handle other roles or redirect to home
                        window.location.href = '/';
                    }
                } else {
                    // Fallback to full page reload if SPA structure not found
                    const redirectUrl = `${window.location.origin}/${role}/dashboard`;
                    console.warn('SPA structure not found, falling back to full page load');
                    window.location.href = redirectUrl;
                }
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Login failed. Please check your credentials and try again.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginHandler();
    console.log('Login handler initialized');
});