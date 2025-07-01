class AuthService {
    constructor() {
        this.tokenKey = 'jwtToken';
        this.userKey = 'user';
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
