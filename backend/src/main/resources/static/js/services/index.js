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
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
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
                
                // Redirect based on role
                const redirectUrl = `${window.location.origin}/${role}/dashboard`;
                console.log('Login successful, redirecting to:', redirectUrl);
                window.location.replace(redirectUrl);
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