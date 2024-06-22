document.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');
    if (!userType) {
        window.location.href = '/login';
    } else if (userType !== 'student') {
        if (userType === 'profesor') {
            window.location.href = '/loggedTeacher';
        } else if (userType === 'admin') {
            window.location.href = '/loggedAdmin';
        }
    }
});