/**
 * Authentication Service
 * Handles JWT token management and user authentication state
 */
class AuthService {
    constructor() {
        this.tokenKey = 'jwtToken';
        this.userKey = 'user';
    }

    /**
     * Store authentication data in localStorage
     * @param {string} token - JWT token
     * @param {object} user - User data
     * @returns {boolean} True if successful, false otherwise
     */
    setAuth(token, user) {
        if (!token || !user) {
            console.error('Cannot set auth: Missing token or user data');
            return false;
        }

        try {
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Error storing auth data:', error);
            return false;
        }
    }

    /**
     * Get the stored JWT token
     * @returns {string|null} The JWT token or null if not found
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Get the current user data
     * @returns {object|null} User data or null if not found
     */
    getCurrentUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated, false otherwise
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Check if user has admin role
     * @returns {boolean} True if user has admin role, false otherwise
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.roles && user.roles.includes('ROLE_ADMIN');
    }

    /**
     * Clear authentication data
     */
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Get authorization header for API requests
     * @returns {object} Authorization header
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

// Export a singleton instance
export const authService = new AuthService();
