/**
 * Footer Component
 * Renders a consistent footer across all pages
 */

// Footer Component
class Footer {
    constructor() {
        this.footerElement = null;
    }

    async render() {
        const footerHtml = `
            <footer class="modern-footer">
                <div class="footer-container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>Contact Info</h4>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>123 Medical Center Dr.<br>Healthcare City, HC 12345</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <span>(555) 123-4567</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>info@clinicms.com</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-clock"></i>
                                    <span>Mon-Fri: 8AM-6PM<br>Sat: 9AM-3PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-bottom-content">
                            <p>&copy; 2025 Clinic Management System. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        return footerHtml;
    }

    async mount(containerId = 'footer') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Footer container with id '${containerId}' not found`);
            return;
        }

        const footerHtml = await this.render();
        container.innerHTML = footerHtml;
        this.footerElement = container;

        // Add CSS if not already present
        this.addStyles();
    }

    addStyles() {
        // Check if styles are already added
        if (document.getElementById('modern-footer-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'modern-footer-styles';
        style.textContent = `
            .modern-footer {
                background: #f8f9fa;
                color: #333;
                padding: 2rem 0 0 0;
                margin-top: auto;
                border-top: 1px solid #e9ecef;
            }

            .footer-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
            }

            .footer-content {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 3rem;
                margin-bottom: 2rem;
            }

            .footer-section h3 {
                color: #007bff;
                font-size: 1.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }

            .footer-section h4 {
                color: #007bff;
                font-size: 1.1rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }

            .footer-section p {
                line-height: 1.6;
                margin-bottom: 1rem;
                color: #6c757d;
            }

            .social-links {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }

            .social-link {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background: rgba(52, 152, 219, 0.2);
                border: 1px solid rgba(52, 152, 219, 0.3);
                border-radius: 50%;
                color: #3498db;
                text-decoration: none;
                transition: all 0.3s ease;
            }

            .social-link:hover {
                background: #3498db;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
            }

            .footer-links {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .footer-links li {
                margin-bottom: 0.5rem;
            }

            .footer-links a {
                color: #6c757d;
                text-decoration: none;
                transition: color 0.3s ease;
                display: inline-block;
                padding: 0.25rem 0;
            }

            .footer-links a:hover {
                color: #007bff;
                transform: translateX(5px);
            }

            .contact-info {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .contact-item {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                color: #6c757d;
            }

            .contact-item i {
                color: #007bff;
                width: 16px;
                margin-top: 0.25rem;
                flex-shrink: 0;
            }

            .contact-item span {
                line-height: 1.4;
            }

            .footer-bottom {
                border-top: 1px solid #e9ecef;
                padding: 1.5rem 0;
                background: #e9ecef;
            }

            .footer-bottom-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 1rem;
            }

            .footer-bottom p {
                margin: 0;
                color: #6c757d;
                font-size: 0.9rem;
            }

            .footer-bottom-links {
                display: flex;
                gap: 1.5rem;
            }

            .footer-bottom-links a {
                color: #6c757d;
                text-decoration: none;
                font-size: 0.9rem;
                transition: color 0.3s ease;
            }

            .footer-bottom-links a:hover {
                color: #007bff;
            }

            @media (max-width: 768px) {
                .footer-container {
                    padding: 0 1rem;
                }

                .footer-content {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }

                .footer-bottom-content {
                    flex-direction: column;
                    text-align: center;
                }

                .footer-bottom-links {
                    justify-content: center;
                }

                .social-links {
                    justify-content: center;
                }
            }

            @media (max-width: 480px) {
                .footer-bottom-links {
                    flex-direction: column;
                    gap: 0.5rem;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Export the Footer class
export { Footer };

// Auto-initialize if this script is loaded directly
if (typeof document !== 'undefined') {
    const footer = new Footer();
    
    // Auto-mount if footer container exists
    document.addEventListener('DOMContentLoaded', () => {
        const footerContainer = document.getElementById('footer');
        if (footerContainer) {
            footer.mount('footer');
        }
    });
}
