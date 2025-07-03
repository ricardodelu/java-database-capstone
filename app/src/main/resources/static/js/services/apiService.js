import { authService } from '/js/services/authService.js';

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
        const url = `${this.baseUrl}${endpoint}`;
        const requestId = Math.random().toString(36).substring(2, 9);
        const authHeader = authService.getAuthHeader();
        
        const headers = {
            'Content-Type': 'application/json',
            ...authHeader,
            'X-Request-ID': requestId
        };
        
        console.group(`🔵 API Request #${requestId}`);
        console.log('📤 Request:', {
            method: 'GET',
            url: url,
            headers: headers,
            credentials: 'include',
            mode: 'cors'
        });
        
        console.log('🔑 Auth Details:', {
            hasAuthHeader: !!authHeader.Authorization,
            authHeaderLength: authHeader.Authorization ? authHeader.Authorization.length : 0,
            authHeaderPrefix: authHeader.Authorization ? authHeader.Authorization.substring(0, 20) + '...' : 'N/A',
            localStorageToken: localStorage.getItem('jwtToken') ? 'Token exists' : 'No token',
            localStorageTokenLength: localStorage.getItem('jwtToken')?.length || 0
        });
        
        const startTime = performance.now();
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
                credentials: 'same-origin',
                mode: 'cors',
                referrerPolicy: 'strict-origin-when-cross-origin'
            });
            
            const responseTime = Math.round(performance.now() - startTime);
            const responseData = await response.clone().json().catch(() => ({}));
            
            console.log(`📥 Response [${response.status} ${response.statusText}]`, {
                status: response.status,
                statusText: response.statusText,
                responseTime: `${responseTime}ms`,
                responseData: responseData,
                headers: Object.fromEntries([...response.headers.entries()])
            });
            
            if (!response.ok) {
                console.error('❌ Request failed with status:', response.status);
                console.error('Response body:', responseData);
                
                if (response.status === 401) {
                    console.error('🔐 401 Unauthorized - Possible issues:');
                    console.error('1. Invalid or expired JWT token');
                    console.error('2. Token not properly included in request');
                    console.error('3. Backend JWT validation failure');
                    console.error('4. CORS/credentials issue');
                    
                    // Additional debug info
                    console.log('🔍 Debug Info:', {
                        tokenInLocalStorage: !!localStorage.getItem('jwtToken'),
                        authHeaderSent: !!authHeader.Authorization,
                        requestUrl: url,
                        requestHeaders: headers
                    });
                } else if (response.status === 403) {
                    console.error('🔒 403 Forbidden - You do not have permission to access this resource');
                }
                
                // Throw an error with the response data
                const error = new Error(response.statusText || 'Request failed');
                error.status = response.status;
                error.response = responseData;
                console.groupEnd();
                throw error;
            }
            
            console.groupEnd();
            return responseData;
        } catch (error) {
            console.error('Request Failed:', error);
            console.groupEnd();
            throw error;
        }
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
            console.warn('User not authenticated, redirecting to login');
            // Redirect to login if not authenticated
            window.location.href = '/';
            return false;
        }
        
        if (requiredRole && !authService.hasRole(requiredRole)) {
            console.warn(`User does not have required role: ${requiredRole}`);
            // Instead of redirecting to /unauthorized, redirect to home with an error message
            // or handle it in a way that makes sense for your application
            window.location.href = `/?error=unauthorized&requiredRole=${encodeURIComponent(requiredRole)}`;
            return false;
        }
        
        return true;
    }
}

export const apiService = new ApiService();
