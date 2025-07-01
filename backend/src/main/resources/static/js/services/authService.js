class AuthService {
    constructor() {
        this.tokenKey = 'jwtToken';
        this.userKey = 'user';
        this.currentUser = null;
    }

    // Store the JWT token and user info in localStorage
    setAuth(token, user) {
        console.log('Setting auth token and user:', { token, user });
        if (token && user) {
            try {
                localStorage.setItem(this.tokenKey, token);
                localStorage.setItem(this.userKey, JSON.stringify(user));
                console.log('Auth data stored successfully');
                return true;
            } catch (error) {
                console.error('Error storing auth data:', error);
                return false;
            }
        }
        console.warn('Cannot set auth: missing token or user');
        return false;
    }

    // Get the stored JWT token
    getToken() {
        const token = localStorage.getItem(this.tokenKey);
        console.log('Retrieved token from storage:', token ? 'Token exists' : 'No token found');
        return token;
    }

    // Get the stored user info
    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Check if user has a specific role
    hasRole(role) {
        const user = this.getUser();
        return user && user.roles && user.roles.includes(role);
    }

    // Clear auth data (logout)
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUser = null;
    }
    
    // Alias for clearAuth (for compatibility)
    logout() {
        this.clearAuth();
        // Redirect to login page or home page after logout
        window.location.href = '/';
    }
    
    // Get the current authenticated user
    getCurrentUser() {
        if (!this.currentUser) {
            const userData = localStorage.getItem(this.userKey);
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        }
        return this.currentUser;
    }
    
    // Check if current user has admin role
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.roles && user.roles.includes('ROLE_ADMIN');
    }
    
    // Check if current user has doctor role
    isDoctor() {
        const user = this.getCurrentUser();
        return user && user.roles && user.roles.includes('ROLE_DOCTOR');
    }
    
    // Check if current user has patient role
    isPatient() {
        const user = this.getCurrentUser();
        return user && user.roles && user.roles.includes('ROLE_PATIENT');
    }

    // Get auth header for API requests
    getAuthHeader() {
        const token = this.getToken();
        const header = token ? { 'Authorization': `Bearer ${token}` } : {};
        console.log('Generated auth header:', header);
        return header;
    }
}

export const authService = new AuthService();
