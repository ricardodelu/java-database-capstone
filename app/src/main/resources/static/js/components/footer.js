/**
 * Footer Component
 * Renders a consistent footer across all pages
 */

function renderFooter() {
    const footer = document.getElementById('footer');
    
    if (!footer) {
        console.warn('Footer container not found');
        return;
    }

    const currentYear = new Date().getFullYear();
    
    footer.innerHTML = `
        <footer class="footer">
            <div class="footer-content">
                <!-- Branding Section -->
                <div class="footer-brand">
                    <div class="footer-logo">
                        <img src="/assets/images/logo.png" alt="ClinicMS Logo" class="logo" />
                        <h2>ClinicMS</h2>
                    </div>
                    <p class="copyright">© ${currentYear} Clinic Management System. All rights reserved.</p>
                </div>

                <!-- Quick Links -->
                <div class="footer-links">
                    <!-- Company -->
                    <div class="footer-column">
                        <h4>Company</h4>
                        <ul class="footer-menu">
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/press">Press</a></li>
                        </ul>
                    </div>

                    <!-- Support -->
                    <div class="footer-column">
                        <h4>Support</h4>
                        <ul class="footer-menu">
                            <li><a href="/help/account">My Account</a></li>
                            <li><a href="/help/center">Help Center</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                            <li><a href="/faq">FAQs</a></li>
                        </ul>
                    </div>

                    <!-- Legal -->
                    <div class="footer-column">
                        <h4>Legal</h4>
                        <ul class="footer-menu">
                            <li><a href="/terms">Terms of Service</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/cookies">Cookie Policy</a></li>
                            <li><a href="/licensing">Licensing</a></li>
                        </ul>
                    </div>

                    <!-- Contact Info -->
                    <div class="footer-column">
                        <h4>Contact Us</h4>
                        <address class="contact-info">
                            <p><i class="icon icon-location"></i> 123 Medical Drive, Health City, HC 12345</p>
                            <p><i class="icon icon-phone"></i> (123) 456-7890</p>
                            <p><i class="icon icon-email"></i> info@clinicms.com</p>
                        </address>
                        <div class="social-links">
                            <a href="https://facebook.com" aria-label="Facebook"><i class="icon icon-facebook"></i></a>
                            <a href="https://twitter.com" aria-label="Twitter"><i class="icon icon-twitter"></i></a>
                            <a href="https://linkedin.com" aria-label="LinkedIn"><i class="icon icon-linkedin"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>ClinicMS is a registered trademark. All other trademarks are the property of their respective owners.</p>
            </div>
        </footer>
    `;
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderFooter();
});

// Export for testing and manual triggering
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderFooter };
}
