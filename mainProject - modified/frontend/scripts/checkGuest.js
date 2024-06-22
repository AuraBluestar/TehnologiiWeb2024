document.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');

    if (userType) {
        // Redirect logged-in users to their respective home pages
        if (userType === 'student') {
            window.location.href = '/loggedStudent';
        } else if (userType === 'profesor') {
            window.location.href = '/loggedTeacher';
        } else if (userType === 'admin') {
            window.location.href = '/loggedAdmin';
        }
    }
});