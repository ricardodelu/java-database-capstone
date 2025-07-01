class AuthService {
    constructor() {
        this.tokenKey = 'jwtToken';
        this.userKey = 'user';
        this.currentUser = null;
    }

    // Store the JWT token and user info in localStorage
    setAuth(token, user) {
        console.log('setAuth called with:', { 
            token: token ? `token (${token.length} chars)` : 'no token',
            tokenPrefix: token ? token.substring(0, 10) + '...' : 'n/a',
            user: user ? {
                username: user.username,
                roles: user.roles
            } : 'no user'
        });
        
        if (!token || !user) {
            console.warn('Cannot set auth: missing', { 
                missingToken: !token, 
                missingUser: !user 
            });
            return false;
        }
        
        try {
            // Verify localStorage is available
            if (typeof localStorage === 'undefined') {
                throw new Error('localStorage is not available');
            }
            
            // Store the token
            console.log('Storing token in localStorage with key:', this.tokenKey);
            localStorage.setItem(this.tokenKey, token);
            
            // Verify the token was stored
            const storedToken = localStorage.getItem(this.tokenKey);
            if (storedToken !== token) {
                throw new Error('Token storage verification failed');
            }
            
            // Store the user data
            console.log('Storing user data in localStorage with key:', this.userKey);
            const userString = JSON.stringify(user);
            localStorage.setItem(this.userKey, userString);
            
            // Verify the user data was stored
            const storedUser = localStorage.getItem(this.userKey);
            if (storedUser !== userString) {
                throw new Error('User data storage verification failed');
            }
            
            // Update the current user
            this.currentUser = user;
            
            console.log('Auth data stored and verified successfully');
            return true;
            
        } catch (error) {
            console.error('Error in setAuth:', error);
            // Clear any partial data that might have been stored
            try {
                localStorage.removeItem(this.tokenKey);
                localStorage.removeItem(this.userKey);
            } catch (e) {
                console.error('Error cleaning up after failed auth storage:', e);
            }
            return false;
        }
    }

    // Get the stored JWT token
    getToken() {
        try {
            if (typeof localStorage === 'undefined') {
                console.error('localStorage is not available');
                return null;
            }
            
            const token = localStorage.getItem(this.tokenKey);
            console.log('Retrieved token from localStorage with key:', this.tokenKey);
            console.log('Token exists:', !!token);
            
            if (!token) {
                console.warn('No token found in localStorage');
                return null;
            }
            
            // Verify the token format (basic check for JWT format)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                console.error('Invalid token format');
                return null;
            }
            
            return token;
            
        } catch (error) {
            console.error('Error retrieving token from localStorage:', error);
            return null;
        }
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
