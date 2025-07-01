class AuthService {
    constructor() {
        this.tokenKey = 'jwtToken';
        this.userKey = 'user';
    }

    // Store the JWT token and user info in localStorage
    setAuth(token, user) {
        if (token && user) {
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            return true;
        }
        return false;
    }

    // Get the stored JWT token
    getToken() {
        return localStorage.getItem(this.tokenKey);
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
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

export const authService = new AuthService();
