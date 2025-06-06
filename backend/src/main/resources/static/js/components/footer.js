class Footer {
    constructor() {
        this.footerDiv = document.getElementById('footer');
        this.render();
    }

    render() {
        const currentYear = new Date().getFullYear();
        const footerContent = `
            <footer class="footer">
                <div class="footer-content">
                    <!-- Branding Section -->
                    <div class="footer-brand">
                        <img src="/assets/images/logo/logo.png" alt="Clinic Logo" class="footer-logo">
                        <p class="copyright">© ${currentYear} Clinic Management System. All rights reserved.</p>
                    </div>

                    <!-- Links Section -->
                    <div class="footer-links">
                        <div class="footer-column">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/careers">Careers</a></li>
                                <li><a href="/press">Press</a></li>
                            </ul>
                        </div>

                        <div class="footer-column">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="/help">Help Center</a></li>
                                <li><a href="/contact">Contact Us</a></li>
                                <li><a href="/faq">FAQ</a></li>
                            </ul>
                        </div>

                        <div class="footer-column">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="/terms">Terms of Service</a></li>
                                <li><a href="/privacy">Privacy Policy</a></li>
                                <li><a href="/compliance">Compliance</a></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Social Media Section -->
                    <div class="footer-social">
                        <h4>Follow Us</h4>
                        <div class="social-links">
                            <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        this.footerDiv.innerHTML = footerContent;
    }
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Footer();
});