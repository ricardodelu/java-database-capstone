// Define the PatientRow custom element
class PatientRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    // Define the component's attributes
    static get observedAttributes() {
        return ['patient-id', 'name', 'phone', 'email', 'appointment-time', 'status'];
    }

    // Called when the element is added to the DOM
    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    // Called when an observed attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    // Render the component
    render() {
        const patientId = this.getAttribute('patient-id');
        const name = this.getAttribute('name');
        const phone = this.getAttribute('phone') || 'N/A';
        const email = this.getAttribute('email') || 'N/A';
        const appointmentTime = this.getAttribute('appointment-time');
        const status = this.getAttribute('status');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: table-row;
                }

                td {
                    padding: 12px 15px;
                    border-bottom: 1px solid var(--border-color, #ddd);
                }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .status-scheduled {
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .status-completed {
                    background: #e8f5e9;
                    color: #2e7d32;
                }

                .status-cancelled {
                    background: #ffebee;
                    color: #c62828;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                }

                .action-btn {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: background-color 0.2s;
                }

                .view-btn {
                    background: var(--primary-color, #015c5d);
                    color: white;
                }

                .view-btn:hover {
                    background: var(--primary-hover, #017d7e);
                }

                .prescribe-btn {
                    background: var(--success-color, #28a745);
                    color: white;
                }

                .prescribe-btn:hover {
                    background: var(--success-hover, #218838);
                }

                i {
                    font-size: 14px;
                }
            </style>

            <td>${patientId}</td>
            <td>${name}</td>
            <td>${phone}</td>
            <td>${email}</td>
            <td>${this.formatDateTime(appointmentTime)}</td>
            <td>
                <span class="status-badge status-${status.toLowerCase()}">
                    ${status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" data-action="view">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn prescribe-btn" data-action="prescribe">
                        <i class="fas fa-prescription"></i> Prescribe
                    </button>
                </div>
            </td>
        `;
    }

    // Set up event listeners
    setupEventListeners() {
        const buttons = this.shadowRoot.querySelectorAll('.action-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.closest('.action-btn').dataset.action;
                const patientId = this.getAttribute('patient-id');
                
                // Dispatch custom events
                if (action === 'view') {
                    this.dispatchEvent(new CustomEvent('view-patient', {
                        detail: { patientId },
                        bubbles: true,
                        composed: true
                    }));
                } else if (action === 'prescribe') {
                    this.dispatchEvent(new CustomEvent('add-prescription', {
                        detail: { patientId },
                        bubbles: true,
                        composed: true
                    }));
                }
            });
        });
    }

    // Format date and time
    formatDateTime(dateTimeStr) {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Register the custom element
customElements.define('patient-row', PatientRow);

// Export the component
export default PatientRow; 