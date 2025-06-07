import { openModal } from '../components/modals.js';

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
        console.log('Role selected:', role); // Debug log
        openModal(`${role}Login`);
    }

    async handleLoginSubmit(event) {
        const { type, data } = event.detail;
        console.log('Login attempt:', type, data); // Debug log
        
        try {
            // Add your login logic here
            const response = await fetch(`/api/auth/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const result = await response.json();
            localStorage.setItem('token', result.token);
            localStorage.setItem('userRole', type.replace('Login', ''));
            
            // Redirect based on role
            window.location.href = `/${type.replace('Login', '')}/dashboard`;
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginHandler();
    console.log('Login handler initialized'); // Debug log
});