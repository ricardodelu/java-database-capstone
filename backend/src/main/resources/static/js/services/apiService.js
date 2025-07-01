import { authService } from './authService.js';

class ApiService {
    constructor() {
        this.baseUrl = '/api';
    }

    // Helper method to handle response
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Something went wrong');
        }
        return response.json();
    }

    // Get request with auth
    async get(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader()
            }
        });
        return this.handleResponse(response);
    }

    // Post request with auth
    async post(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader()
            },
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    // Put request with auth
    async put(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader()
            },
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    // Delete request with auth
    async delete(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeader()
            }
        });
        return this.handleResponse(response);
    }

    // Check if user is authenticated and has required role
    checkAuth(requiredRole = null) {
        if (!authService.isAuthenticated()) {
            // Redirect to login if not authenticated
            window.location.href = '/';
            return false;
        }
        
        if (requiredRole && !authService.hasRole(requiredRole)) {
            // Redirect to unauthorized page or dashboard
            window.location.href = '/unauthorized';
            return false;
        }
        
        return true;
    }
}

export const apiService = new ApiService();
