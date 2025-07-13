/**
 * Header Component
 * Renders a dynamic header based on user role and authentication state
 */

// Header Component
class Header {
    constructor() {
        this.headerElement = null;
    }

    async render(pageTitle = 'Clinic Management System', showLogout = false, showLogin = false) {
        const headerHtml = `
            <header class="modern-header">
                <div class="header-container">
                    <div class="header-left">
                        <div class="logo-container">
                            <img src="/assets/images/logo/logo.png" alt="Clinic Logo" class="logo">
                            <span class="logo-text">ClinicMS</span>
                        </div>
                        <h1 class="page-title">${pageTitle}</h1>
                    </div>
                    <div class="header-right">
                        ${showLogin ? `
                            <button id="loginBtn" class="logout-btn">
                                <i class="fas fa-sign-in-alt"></i>
                                <span>Login</span>
                            </button>
                        ` : ''}
                        ${showLogout ? `
                            <button id="logoutBtn" class="logout-btn">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </header>
        `;
        return headerHtml;
    }

    async mount(containerId = 'header', pageTitle = 'Clinic Management System', showLogout = false, showLogin = false) {
        console.log('Header mount called with:', { containerId, pageTitle, showLogout, showLogin });
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Header container with id '${containerId}' not found`);
            return;
        }
        console.log('Header container found:', container);
        const headerHtml = await this.render(pageTitle, showLogout, showLogin);
        console.log('Header HTML generated, length:', headerHtml.length);
        container.innerHTML = headerHtml;
        this.headerElement = container;
        if (showLogout) {
            console.log('Setting up logout...');
            this.setupLogout();
        }
        if (showLogin) {
            console.log('Setting up login...');
            this.setupLogin();
        }
        this.addStyles();
        console.log('Header mount completed');
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    handleLogout() {
        console.log('Logout requested from header');
        
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        sessionStorage.removeItem('selectedRole');
        
        // Redirect to main page
        window.location.href = '/';
    }

    setupLogin() {
        console.log('Setting up login button...');
        const loginBtn = document.getElementById('loginBtn');
        console.log('Login button element:', loginBtn);
        if (loginBtn) {
            console.log('Adding click event listener to login button');
            loginBtn.addEventListener('click', () => {
                console.log('Login button clicked!');
                
                // Try to call openLoginModal directly first
                if (typeof openLoginModal === 'function') {
                    console.log('Calling openLoginModal directly...');
                    openLoginModal();
                    return;
                }
                
                // Fallback to event dispatch
                console.log('openLoginModal not found, dispatching event...');
                const event = new Event('showLogin');
                console.log('Dispatching showLogin event:', event);
                window.dispatchEvent(event);
                console.log('showLogin event dispatched');
            });
            console.log('Login button event listener added successfully');
        } else {
            console.error('Login button not found in DOM');
        }
    }

    addStyles() {
        // Check if styles are already added
        if (document.getElementById('modern-header-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'modern-header-styles';
        style.textContent = `
            .modern-header {
                background: #ffffff;
                color: #333;
                padding: 1rem 0;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                position: sticky;
                top: 0;
                z-index: 1000;
                border-bottom: 1px solid #e9ecef;
            }

            .header-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-left {
                display: flex;
                align-items: center;
                gap: 2rem;
            }

            .logo-container {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .logo {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: white;
                padding: 4px;
            }

            .logo-text {
                font-size: 1.5rem;
                font-weight: 700;
                color: #007bff;
            }

            .page-title {
                font-size: 1.75rem;
                font-weight: 600;
                margin: 0;
                color: #333;
            }

            .header-right {
                display: flex;
                align-items: center;
            }

            .logout-btn {
                background-color: transparent;
                border: 2px solid #007bff;
                color: #007bff;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
            }

            .logout-btn:hover {
                background-color: #007bff;
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
            }

            .logout-btn i {
                font-size: 1rem;
            }

            @media (max-width: 768px) {
                .header-container {
                    padding: 0 1rem;
                    flex-direction: column;
                    gap: 1rem;
                }

                .header-left {
                    flex-direction: column;
                    gap: 0.5rem;
                    text-align: center;
                }

                .page-title {
                    font-size: 1.5rem;
                }

                .logo-text {
                    font-size: 1.25rem;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Export the Header class
export { Header };

// Auto-initialize if this script is loaded directly
if (typeof document !== 'undefined') {
    const header = new Header();
    
    // Auto-mount if header container exists
    document.addEventListener('DOMContentLoaded', () => {
        const headerContainer = document.getElementById('header');
        if (headerContainer) {
            const isDashboard = window.location.pathname.includes('/dashboard') || 
                              window.location.pathname.includes('/admin') ||
                              window.location.pathname.includes('/doctor') ||
                              window.location.pathname.includes('/patient');
            const isPatientDashboard = window.location.pathname.includes('/patientDashboard') || window.location.pathname.includes('/pages/patientDashboard.html');
            const pageTitle = isDashboard ? 
                (window.location.pathname.includes('/admin') ? 'Admin Dashboard' :
                 window.location.pathname.includes('/doctor') ? 'Doctor Dashboard' :
                 window.location.pathname.includes('/patient') ? 'Patient Dashboard' : 'Dashboard') :
                'Clinic Management System';
            const token = localStorage.getItem('token');
            const showLogin = isPatientDashboard && !token;
            header.mount('header', pageTitle, isDashboard && !!token, showLogin);
        }
    });
}
