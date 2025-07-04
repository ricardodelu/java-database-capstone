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
                            <h3>ClinicMS</h3>
                            <p>Modern healthcare management system designed to streamline clinic operations and improve patient care.</p>
                            <div class="social-links">
                                <a href="#" class="social-link" aria-label="Facebook">
                                    <i class="fab fa-facebook"></i>
                                </a>
                                <a href="#" class="social-link" aria-label="Twitter">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" class="social-link" aria-label="LinkedIn">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                                <a href="#" class="social-link" aria-label="Instagram">
                                    <i class="fab fa-instagram"></i>
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Quick Links</h4>
                            <ul class="footer-links">
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/services">Services</a></li>
                                <li><a href="/appointments">Appointments</a></li>
                                <li><a href="/contact">Contact</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Services</h4>
                            <ul class="footer-links">
                                <li><a href="/services/cardiology">Cardiology</a></li>
                                <li><a href="/services/neurology">Neurology</a></li>
                                <li><a href="/services/pediatrics">Pediatrics</a></li>
                                <li><a href="/services/orthopedics">Orthopedics</a></li>
                                <li><a href="/services/dermatology">Dermatology</a></li>
                            </ul>
                        </div>
                        
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
                            <div class="footer-bottom-links">
                                <a href="/privacy">Privacy Policy</a>
                                <a href="/terms">Terms of Service</a>
                                <a href="/sitemap">Sitemap</a>
                            </div>
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
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: #ecf0f1;
                padding: 3rem 0 0 0;
                margin-top: auto;
            }

            .footer-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
            }

            .footer-content {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }

            .footer-section h3 {
                color: #3498db;
                font-size: 1.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }

            .footer-section h4 {
                color: #3498db;
                font-size: 1.1rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }

            .footer-section p {
                line-height: 1.6;
                margin-bottom: 1rem;
                color: #bdc3c7;
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
                color: #bdc3c7;
                text-decoration: none;
                transition: color 0.3s ease;
                display: inline-block;
                padding: 0.25rem 0;
            }

            .footer-links a:hover {
                color: #3498db;
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
                color: #bdc3c7;
            }

            .contact-item i {
                color: #3498db;
                width: 16px;
                margin-top: 0.25rem;
                flex-shrink: 0;
            }

            .contact-item span {
                line-height: 1.4;
            }

            .footer-bottom {
                border-top: 1px solid rgba(236, 240, 241, 0.1);
                padding: 1.5rem 0;
                background: rgba(0, 0, 0, 0.1);
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
                color: #95a5a6;
                font-size: 0.9rem;
            }

            .footer-bottom-links {
                display: flex;
                gap: 1.5rem;
            }

            .footer-bottom-links a {
                color: #95a5a6;
                text-decoration: none;
                font-size: 0.9rem;
                transition: color 0.3s ease;
            }

            .footer-bottom-links a:hover {
                color: #3498db;
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
