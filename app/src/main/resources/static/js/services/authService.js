class AuthService {
    constructor() {
        this.tokenKey = 'jwtToken';
        this.userKey = 'user';
        this.currentUser = null;
    }

    // Store the JWT token and user info in localStorage
    setAuth(token, user) {
        console.group('🔐 setAuth');
        console.log('📥 Received auth data:', { 
            token: token ? `token (${token.length} chars)` : '❌ no token',
            tokenPrefix: token ? token.substring(0, 10) + '...' : 'n/a',
            user: user ? {
                username: user.username,
                roles: user.roles
            } : '❌ no user data'
        });
        
        // Validate input
        if (!token || !user) {
            console.error('❌ Cannot set auth: missing data', { 
                missingToken: !token, 
                missingUser: !user 
            });
            console.groupEnd();
            return false;
        }
        
        // Validate token format (basic check)
        if (token.split('.').length !== 3) {
            console.error('❌ Invalid JWT token format');
            console.groupEnd();
            return false;
        }
        
        try {
            // Verify localStorage is available
            if (typeof localStorage === 'undefined') {
                throw new Error('localStorage is not available');
            }
            
            console.log('💾 Storing token in localStorage...');
            localStorage.setItem(this.tokenKey, token);
            console.log('✅ Token stored with key:', this.tokenKey);
            
            // Verify the token was stored correctly
            const storedToken = localStorage.getItem(this.tokenKey);
            if (storedToken !== token) {
                console.error('❌ Token storage verification failed');
                console.log('Original token length:', token.length);
                console.log('Stored token length:', storedToken?.length || 0);
                throw new Error('Token storage verification failed');
            }
            
            // Store user data
            console.log('👤 Storing user data...');
            const userString = JSON.stringify(user);
            localStorage.setItem(this.userKey, userString);
            console.log('✅ User data stored with key:', this.userKey);
            
            // Verify user data was stored
            const storedUser = localStorage.getItem(this.userKey);
            if (storedUser !== userString) {
                console.error('❌ User data storage verification failed');
                throw new Error('User data storage verification failed');
            }
            
            // Update current user in memory
            this.currentUser = user;
            
            console.log('🎉 Auth data stored and verified successfully');
            console.groupEnd();
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
        if (!user || !user.roles) {
            console.warn('No user or roles found');
            return false;
        }
        
        // Normalize the role to check for
        const normalizedRole = role.toUpperCase();
        const roleWithPrefix = normalizedRole.startsWith('ROLE_') ? normalizedRole : `ROLE_${normalizedRole}`;
        
        // Check if any of the user's roles match (case-insensitive and with/without prefix)
        const hasRole = user.roles.some(userRole => {
            const normalizedUserRole = userRole.toUpperCase();
            return normalizedUserRole === normalizedRole || 
                   normalizedUserRole === roleWithPrefix ||
                   normalizedUserRole === normalizedRole.replace('ROLE_', '') ||
                   normalizedUserRole === roleWithPrefix.replace('ROLE_', '');
        });
        
        console.log(`Role check - Required: ${role}, User roles: ${JSON.stringify(user.roles)}, Has role: ${hasRole}`);
        return hasRole;
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
        return this.hasRole('ADMIN');
    }
    
    // Check if current user has doctor role
    isDoctor() {
        return this.hasRole('DOCTOR');
    }
    
    // Check if current user has patient role
    isPatient() {
        return this.hasRole('PATIENT');
    }

    // Get auth header for API requests
    getAuthHeader() {
        const token = this.getToken();
        const hasToken = !!token;
        const header = hasToken ? { 'Authorization': `Bearer ${token}` } : {};
        
        console.group('Auth Service - getAuthHeader');
        console.log('Token exists:', hasToken);
        if (hasToken) {
            console.log('Token length:', token.length);
            console.log('Token prefix:', token.substring(0, 10) + '...');
        }
        console.log('Generated header:', header);
        console.groupEnd();
        
        return header;
    }
    
    // Login method to handle authentication
    async login(username, password) {
        console.group('🔐 Login Flow');
        console.log('🔑 Attempting login for user:', username);
        
        try {
            console.log('📤 Sending login request to /api/auth/signin');
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            console.log('📥 Login response status:', response.status);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                    console.error('❌ Login failed with status', response.status, ':', errorData);
                } catch (e) {
                    const errorText = await response.text();
                    console.error('❌ Failed to parse error response. Raw response:', errorText);
                    errorData = { message: 'Invalid server response' };
                }
                throw new Error(errorData.message || `Login failed with status ${response.status}`);
            }
            
            let data;
            try {
                data = await response.json();
                console.log('✅ Login successful, response data:', data);
            } catch (e) {
                console.error('❌ Failed to parse successful login response:', e);
                throw new Error('Invalid server response format');
            }
            
            if (!data.token) {
                console.error('❌ No token in response:', data);
                throw new Error('No authentication token received');
            }
            
            console.log('🔑 Token received, length:', data.token.length);
            console.log('👤 User info:', { username: data.username, roles: data.roles });
            
            // Store the auth data
            console.log('💾 Storing auth data in localStorage...');
            const authStored = this.setAuth(data.token, {
                username: data.username,
                roles: data.roles || []
            });
            
            if (!authStored) {
                console.error('❌ Failed to store auth data in localStorage');
                throw new Error('Failed to store authentication data');
            }
            
            console.log('✅ Auth data stored successfully');
            console.groupEnd();
            return data;
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();
