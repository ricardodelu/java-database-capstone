export class Modal {
    constructor() {
        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.getElementById('closeModal');
        
        // Initialize modal if it doesn't exist
        if (!this.modal) {
            this.createModal();
        }
        
        // Bind events
        this.bindEvents();
    }
    
    createModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button id="closeModal" class="close" aria-label="Close">&times;</button>
                <div id="modal-body"></div>
            </div>
        `;
        
        // Add to body if not already there
        document.body.appendChild(modal);
        
        // Update references
        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.getElementById('closeModal');
    }
    
    bindEvents() {
        // Close modal when clicking the close button
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside the content
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }
    
    openModal(type, data = null) {
        // Set modal content
        this.modalBody.innerHTML = this.getModalContent(type, data);
        
        // Show modal with animation
        this.modal.style.display = 'flex';
        // Trigger reflow to enable animation
        void this.modal.offsetWidth;
        this.modal.classList.add('show');
        
        // Focus first input when modal opens
        const firstInput = this.modalBody.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Attach form handlers
        this.attachFormListeners(type);
    }
    
    closeModal() {
        // Hide modal with animation
        this.modal.classList.remove('show');
        
        // Remove modal from DOM after animation completes
        this.modal.addEventListener('transitionend', () => {
            if (!this.modal.classList.contains('show')) {
                this.modal.style.display = 'none';
                this.modalBody.innerHTML = '';
            }
        }, { once: true });
    }
    
    getModalContent(type, data) {
        let title, formId, usernameLabel, usernameType;
        
        switch(type) {
            case 'adminLogin':
                title = 'Admin Login';
                formId = 'adminLoginForm';
                usernameLabel = 'Username';
                usernameType = 'text';
                break;
            case 'doctorLogin':
                title = 'Doctor Login';
                formId = 'doctorLoginForm';
                usernameLabel = 'Email';
                usernameType = 'email';
                break;
            case 'patientLogin':
                title = 'Patient Login';
                formId = 'patientLoginForm';
                usernameLabel = 'Email';
                usernameType = 'email';
                break;
            default:
                return '<div class="error-message">Invalid modal type</div>';
        }
        
        return `
            <h2>${title}</h2>
            <form id="${formId}" novalidate>
                <div class="form-group">
                    <label for="username">${usernameLabel}</label>
                    <input type="${usernameType}" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <div class="password-field">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                        <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                            <span class="show-icon">👁️</span>
                            <span class="hide-icon" style="display:none;">👁️</span>
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <button type="submit" class="login-button">
                        <span class="button-text">Login</span>
                    </button>
                </div>
                <div class="error-message" style="display: none;"></div>
            </form>
        `;
    }
    
    attachFormListeners(type) {
        const form = this.modalBody.querySelector('form');
        if (!form) return;
        
        // Toggle password visibility
        const togglePassword = form.querySelector('.toggle-password');
        const passwordInput = form.querySelector('input[type="password"]');
        const showIcon = form.querySelector('.show-icon');
        const hideIcon = form.querySelector('.hide-icon');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                showIcon.style.display = type === 'password' ? 'inline' : 'none';
                hideIcon.style.display = type === 'password' ? 'none' : 'inline';
            });
        }
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form elements
            const submitButton = form.querySelector('button[type="submit"]');
            const errorDiv = form.querySelector('.error-message');
            const buttonText = submitButton.querySelector('.button-text');
            const inputs = form.querySelectorAll('input');
            
            // Reset UI state
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            inputs.forEach(input => input.classList.remove('error'));
            
            try {
                // Show loading state
                submitButton.disabled = true;
                submitButton.classList.add('button-loading');
                buttonText.textContent = 'Logging in...';
                
                // Validate form
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Client-side validation
                let isValid = true;
                inputs.forEach(input => {
                    if (input.required && !input.value.trim()) {
                        input.classList.add('error');
                        isValid = false;
                    } else if (input.type === 'email' && input.value && !this.validateEmail(input.value)) {
                        input.classList.add('error');
                        throw new Error('Please enter a valid email address');
                    }
                });

                if (!isValid) {
                    throw new Error('Please fill in all required fields');
                }

                // Log the form data for debugging
                console.log('Form data:', { type, data });
                
                // Dispatch custom event with form data
                const event = new CustomEvent('modalSubmit', {
                    detail: {
                        type: type,
                        data: data
                    },
                    bubbles: true,
                    cancelable: true
                });
                
                // Dispatch the event
                document.dispatchEvent(event);
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error to user
                errorDiv.textContent = error.message || 'An error occurred. Please try again.';
                errorDiv.style.display = 'block';
                
                // Reset button state
                submitButton.disabled = false;
                submitButton.classList.remove('button-loading');
                buttonText.textContent = 'Login';
                
                // Scroll to error
                setTimeout(() => {
                    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        });
        
        // Clear error state when typing
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const errorDiv = form.querySelector('.error-message');
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
            });
        });
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
}

// Create and export singleton instance
const modal = new Modal();
export const openModal = (type, data = null) => modal.openModal(type, data);