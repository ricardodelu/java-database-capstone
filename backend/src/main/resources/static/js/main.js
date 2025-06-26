document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('logout-link');

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Clear user session data
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');

            // Redirect to the login page
            window.location.href = '/';
        });
    }
});
