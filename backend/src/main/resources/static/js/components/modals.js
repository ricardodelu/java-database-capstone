export class Modal {
    constructor() {
        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.getElementById('closeModal');
        
        // Bind close button
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal(type, data = null) {
        this.modalBody.innerHTML = this.getModalContent(type, data);
        this.modal.style.display = 'block';
        this.attachModalListeners(type);
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.modalBody.innerHTML = '';
    }

    getModalContent(type, data) {
        switch(type) {
            case 'adminLogin':
                return `
                    <h2>Admin Login</h2>
                    <form id="adminLoginForm">
                        <input type="text" name="username" placeholder="Username" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                `;
            case 'doctorLogin':
                return `
                    <h2>Doctor Login</h2>
                    <form id="doctorLoginForm">
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                `;
            case 'patientLogin':
                return `
                    <h2>Patient Login</h2>
                    <form id="patientLoginForm">
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                `;
            default:
                return '<p>Invalid modal type</p>';
        }
    }

    attachModalListeners(type) {
        const form = this.modalBody.querySelector('form');
        if (!form) return;
        
        // Add error message container if it doesn't exist
        if (!form.querySelector('.error-message')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.display = 'none';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.marginTop = '10px';
            form.appendChild(errorDiv);
        }
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted in modal. Type:', type);
            
            // Get form elements
            const submitButton = form.querySelector('button[type="submit"]');
            const errorDiv = form.querySelector('.error-message');
            const inputs = form.querySelectorAll('input');
            
            try {
                // Disable form and show loading state
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
                
                // Clear previous errors
                errorDiv.style.display = 'none';
                errorDiv.textContent = '';
                inputs.forEach(input => input.classList.remove('is-invalid'));
                
                // Get form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Basic client-side validation
                let hasErrors = false;
                inputs.forEach(input => {
                    if (input.required && !input.value.trim()) {
                        input.classList.add('is-invalid');
                        hasErrors = true;
                    }
                });
                
                if (hasErrors) {
                    throw new Error('Please fill in all required fields');
                }
                
                console.log('Dispatching modalSubmit event with data:', data);
                
                // Dispatch custom event for form submission
                const event = new CustomEvent('modalSubmit', {
                    detail: { type, data }
                });
                
                // Add a one-time event listener for the response
                const responseHandler = (response) => {
                    if (response.detail && response.detail.success === false) {
                        throw new Error(response.detail.message || 'Login failed');
                    }
                };
                
                document.addEventListener('modalResponse', responseHandler, { once: true });
                document.dispatchEvent(event);
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error to user
                errorDiv.textContent = error.message || 'An error occurred. Please try again.';
                errorDiv.style.display = 'block';
                
                // Re-enable form
                submitButton.disabled = false;
                submitButton.innerHTML = 'Login';
                
                // Scroll to error
                setTimeout(() => {
                    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        });
        
        // Add input event listeners to clear error state when typing
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
                const errorDiv = form.querySelector('.error-message');
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
            });
        });
    }
}

// Create and export singleton instance
const modal = new Modal();
export const openModal = (type, data = null) => modal.openModal(type, data);