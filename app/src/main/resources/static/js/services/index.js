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
        // document.addEventListener('modalSubmit', this.handleLoginSubmit.bind(this)); // Removed as per edit hint
    }

    handleRoleSelection(role) {
        // Redirect to the login page with the selected role
        window.location.href = `/login.html?role=${role}`;
    }

    async handleLoginSubmit(event) {
        const { type, data } = event.detail;
        console.log('Login attempt:', type, data);
        
        try {
            // For admin login, use username; for others, use email
            const loginData = type === 'adminLogin' 
                ? { username: data.username, password: data.password }
                : { email: data.email, password: data.password };
                
            console.log('Sending login request with data:', JSON.stringify(loginData, null, 2));

            // Make the login request
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Explicitly ask for JSON response
                },
                body: JSON.stringify(loginData)
            });

            console.log('Received response status:', response.status);
            console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
            
            // Log raw response text for debugging
            const responseText = await response.text();
            console.log('Raw response text:', responseText);
            
            // Check for empty response
            if (!responseText) {
                console.error('Empty response received from server');
                throw new Error('Empty response from server');
            }
            
            // Try to parse the response as JSON
            let result;
            try {
                result = JSON.parse(responseText);
                console.log('Parsed response data:', result);
            } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error('Invalid server response format');
            }
            
            // Check for error in response
            if (!response.ok) {
                const errorMessage = result.message || result.error || `Login failed with status: ${response.status}`;
                console.error('Login error:', errorMessage);
                throw new Error(errorMessage);
            }
            
            // Process the response
            console.log('Login successful, processing response...');
            
            if (!result) {
                console.error('No result object in response');
                throw new Error('Authentication failed: Invalid server response');
            }
            
            console.log('Login response:', {
                hasToken: !!result.token,
                tokenPrefix: result.token ? result.token.substring(0, 10) + '...' : 'none',
                username: result.username,
                roles: result.roles
            });
            
            if (!result.token) {
                console.error('No token in response:', result);
                throw new Error('Authentication failed: No token received');
            }
            
            console.log('Token received, storing auth data...');
            const user = {
                username: result.username,
                roles: Array.isArray(result.roles) ? result.roles : []
            };
            
            console.log('User data to store:', user);
            
            console.log('User data to store:', user);
            
            // Store the token and user data
            const authStored = authService.setAuth(result.token, user);
            console.log('Auth data stored:', authStored ? 'success' : 'failed');
            
            if (!authStored) {
                throw new Error('Failed to store authentication data');
            }
            
            // Verify the token was stored
            const storedToken = authService.getToken();
            console.log('Stored token verified:', storedToken ? 'found' : 'not found');
            
            if (!storedToken) {
                throw new Error('Failed to verify stored token');
            }
            
            // Determine the role from the first role in the array
            const role = user.roles && user.roles.length > 0 
                ? user.roles[0].replace('ROLE_', '').toLowerCase()
                : 'user';
            
            console.log('User role determined:', role);
            
            // Close the login modal
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                const modalInstance = bootstrap.Modal.getInstance(loginModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
            
            // Clear any error messages
            const errorElement = document.getElementById('loginError');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
            
            // Use the SPA's navigation to load the dashboard
            // This ensures the JWT token is included in API requests
            console.log('Loading dashboard for role:', role);
            
            // Use the app's loadDashboard method to handle the navigation
            // This will load the dashboard content via API calls with the JWT token
            if (window.app && typeof window.app.loadDashboard === 'function') {
                try {
                    await window.app.loadDashboard(role);
                    // Update the URL without reloading the page
                    window.history.pushState({}, '', `/${role}/dashboard`);
                } catch (error) {
                    console.error('Error loading dashboard:', error);
                    // Fall back to full page reload if SPA navigation fails
                    window.location.href = `/${role}/dashboard`;
                }
            } else {
                console.warn('App instance or loadDashboard method not found, falling back to page reload');
                window.location.href = `/${role}/dashboard`;
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Log detailed error information
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                error.message = 'No response from server. Please check your connection.';
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Request setup error:', error.message);
            }
        
            // Show error message to user in all relevant places
            let errorMessage = error.message || 'Login failed. Please try again.';
            
            // Handle common error cases
            if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
                errorMessage = 'Invalid username or password. Please try again.';
            } else if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('forbidden')) {
                errorMessage = 'Access denied. Please contact support.';
            } else if (errorMessage.includes('500') || errorMessage.toLowerCase().includes('server error')) {
                errorMessage = 'Server error. Please try again later.';
            } else if (errorMessage.includes('Empty response')) {
                errorMessage = 'Empty response from server. Please try again or contact support.';
            } else if (errorMessage.includes('timeout')) {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            } else if (errorMessage.includes('No token received')) {
                errorMessage = 'Authentication failed: No token received from server.';
            }
            
            // Try to show error in modal first
            const modalErrorElement = document.querySelector('.modal .error-message');
            if (modalErrorElement) {
                modalErrorElement.textContent = errorMessage;
                modalErrorElement.style.display = 'block';
                setTimeout(() => {
                    modalErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
            
            // Also try to show in page error element if exists
            const pageErrorElement = document.getElementById('loginError');
            if (pageErrorElement) {
                pageErrorElement.textContent = errorMessage;
                pageErrorElement.style.display = 'block';
                setTimeout(() => {
                    pageErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
            
            // Fallback to console and alert if no error elements found
            if (!modalErrorElement && !pageErrorElement) {
                console.error('No error elements found, falling back to alert');
                alert(errorMessage);
            }
            
            // Re-enable any disabled form elements
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                }
                
                // Re-enable all inputs
                const inputs = form.querySelectorAll('input');
                inputs.forEach(input => {
                    input.disabled = false;
                });
            });
            
            // Log the complete error for debugging
            console.group('Login Error Details');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            if (error.config) {
                console.error('Request config:', {
                    url: error.config.url,
                    method: error.config.method,
                    data: error.config.data,
                    headers: error.config.headers
                });
            }
            if (error.stack) {
                console.error('Error stack:', error.stack);
            }
            console.groupEnd();
            
            // Dispatch an event that other parts of the app can listen to
            const errorEvent = new CustomEvent('loginError', {
                detail: {
                    message: errorMessage,
                    error: {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                        response: error.response ? {
                            status: error.response.status,
                            data: error.response.data
                        } : undefined
                    }
                }
            });
            document.dispatchEvent(errorEvent);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginHandler();
    console.log('Login handler initialized');
});