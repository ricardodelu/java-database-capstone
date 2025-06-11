// Doctor Card Component
class DoctorCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['doctor'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'doctor' && oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const doctor = JSON.parse(this.getAttribute('doctor') || '{}');
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                :host(:hover) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .doctor-info {
                    margin-bottom: 16px;
                }

                h3 {
                    margin: 0 0 8px 0;
                    color: #333;
                    font-size: 18px;
                }

                p {
                    margin: 4px 0;
                    color: #666;
                    font-size: 14px;
                }

                .specialty {
                    color: #007bff;
                    font-weight: 500;
                }

                .doctor-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }

                button {
                    flex: 1;
                    padding: 8px 12px;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: background-color 0.2s ease;
                }

                .edit-btn {
                    background-color: #f8f9fa;
                    color: #333;
                    border: 1px solid #ddd;
                }

                .edit-btn:hover {
                    background-color: #e9ecef;
                }

                .delete-btn {
                    background-color: #dc3545;
                    color: white;
                }

                .delete-btn:hover {
                    background-color: #c82333;
                }

                i {
                    font-size: 14px;
                }
            </style>

            <div class="doctor-info">
                <h3>${doctor.name || 'Unknown'}</h3>
                <p class="specialty">${doctor.specialty || 'No specialty'}</p>
                <p class="email">${doctor.email || 'No email'}</p>
                <p class="phone">${doctor.phone || 'No phone number'}</p>
            </div>
            <div class="doctor-actions">
                <button class="edit-btn" id="editBtn">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="delete-btn" id="deleteBtn">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `;

        // Add event listeners
        this.shadowRoot.getElementById('editBtn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('edit', {
                detail: { doctor },
                bubbles: true,
                composed: true
            }));
        });

        this.shadowRoot.getElementById('deleteBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this doctor?')) {
                this.dispatchEvent(new CustomEvent('delete', {
                    detail: { doctorId: doctor.id },
                    bubbles: true,
                    composed: true
                }));
            }
        });
    }
}

// Register the custom element
customElements.define('doctor-card', DoctorCard);