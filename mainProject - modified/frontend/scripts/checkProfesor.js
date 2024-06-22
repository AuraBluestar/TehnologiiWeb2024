document.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = '/login';
    } else if (userType !== 'profesor') {
        if (userType === 'student') {
            window.location.href = '/loggedStudent';
        } else if (userType === 'admin') {
            window.location.href = '/loggedAdmin';
        }
    }
});