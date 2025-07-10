import { authService } from '/js/services/authService.js';
import config from '../config/config.js';

/**
 * API Service for handling HTTP requests
 * Handles authentication headers and error handling
 */
class ApiService {
    constructor() {
        // Set base URL for API endpoints from config
        this.baseUrl = config.API_BASE_URL;
    }

    /**
     * Handle API response
     * @private
     * @param {Response} response - Fetch response object
     * @returns {Promise<object>} Parsed JSON response
     * @throws {Error} If response is not OK
     */
    async handleResponse(response) {
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: 'Network response was not OK' };
            }
            const error = new Error(errorData.message || 'Something went wrong');
            error.status = response.status;
            error.data = errorData;
            throw error;
        }
        return response.json();
    }

    /**
     * Make a GET request
     * @param {string} endpoint - API endpoint (without base URL)
     * @param {object} [options] - Additional fetch options
     * @returns {Promise<object>} Response data
     */
    async get(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const authHeader = authService.getAuthHeader();
        
        console.log('Making GET request to:', url);
        console.log('Auth header:', authHeader);
        
        const headers = {
            'Content-Type': 'application/json',
            ...authHeader,
            ...(options.headers || {})
        };

        const requestOptions = {
            method: 'GET',
            headers: headers,
            credentials: 'include',
            mode: 'cors',
            ...options
        };
        
        console.log('Request options:', requestOptions);

        try {
            const response = await fetch(url, requestOptions);
            console.log('Response status:', response.status);
            
            if (response.status === 401) {
                // Handle unauthorized access
                console.error('Unauthorized access - redirecting to login');
                authService.clearAuth();
                window.location.href = '/login.html';
                return null;
            }
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }

    /**
     * Make a POST request
     * @param {string} endpoint - API endpoint (without base URL)
     * @param {object} data - Request body data
     * @param {object} [options] - Additional fetch options
     * @returns {Promise<object>} Response data
     */
    async post(endpoint, data = {}, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...authService.getAuthHeader(),
            ...(options.headers || {})
        };

        console.log('POST request to:', url);
        console.log('POST request data:', data);
        console.log('POST request headers:', headers);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                credentials: 'include',
                mode: 'cors',
                body: JSON.stringify(data),
                ...options
            });
            console.log('POST response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.log('POST response error body:', errorText);
            }
            return this.handleResponse(response);
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }

    /**
     * Make a PUT request
     * @param {string} endpoint - API endpoint (without base URL)
     * @param {object} data - Request body data
     * @param {object} [options] - Additional fetch options
     * @returns {Promise<object>} Response data
     */
    async put(endpoint, data = {}, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...authService.getAuthHeader(),
            ...(options.headers || {})
        };

        console.log('PUT request to:', url);
        console.log('PUT request data:', data);
        console.log('PUT request headers:', headers);

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers,
                credentials: 'include',
                mode: 'cors',
                body: JSON.stringify(data),
                ...options
            });
            console.log('PUT response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.log('PUT response error body:', errorText);
            }
            return this.handleResponse(response);
        } catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    }

    /**
     * Make a DELETE request
     * @param {string} endpoint - API endpoint (without base URL)
     * @param {object} [options] - Additional fetch options
     * @returns {Promise<object>} Response data
     */
    async delete(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...authService.getAuthHeader(),
            ...(options.headers || {})
        };

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers,
                credentials: 'include',
                mode: 'cors',
                ...options
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }

    /**
     * Check if user is authenticated and has the required role
     * @param {string} requiredRole - e.g. 'ADMIN', 'DOCTOR', 'PATIENT'
     * @returns {boolean} True if authenticated and has role, false otherwise
     */
    checkAuth(requiredRole) {
        const token = authService.getToken();
        const user = authService.getCurrentUser();
        if (!token || !user || !user.roles) return false;
        if (!requiredRole) return true; // Just check authentication
        // Normalize role string
        const roleStr = requiredRole.startsWith('ROLE_') ? requiredRole : `ROLE_${requiredRole}`;
        return user.roles.includes(roleStr);
    }
}

// Export a singleton instance
export const apiService = new ApiService();
