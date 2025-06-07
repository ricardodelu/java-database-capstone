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
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Dispatch custom event for form submission
                const event = new CustomEvent('modalSubmit', {
                    detail: { type, data }
                });
                document.dispatchEvent(event);
            });
        }
    }
}

// Create and export singleton instance
const modal = new Modal();
export const openModal = (type, data = null) => modal.openModal(type, data);