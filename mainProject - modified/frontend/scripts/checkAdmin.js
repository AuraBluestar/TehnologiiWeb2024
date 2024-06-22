document.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = '/login';
    } else if (userType !== 'admin') {
        if (userType === 'profesor') {
            window.location.href = '/loggedTeacher';
        } else if (userType === 'student') {
            window.location.href = '/loggedStudent';
        }
    }
});