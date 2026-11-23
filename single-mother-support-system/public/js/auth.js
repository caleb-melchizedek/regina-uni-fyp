const TOKEN_KEY = 'sms_jwt_token';
const USER_KEY = 'sms_user';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setUser(user) {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Keep clearToken() alias if anything else calls it
function clearToken() {
    clearAuth();
}

// Quick-Exit safety redirect
const quickExitBtn = document.getElementById('quickExitBtn');
if (quickExitBtn) {
    quickExitBtn.addEventListener('click', () => {
        window.location.replace('https://www.google.com');
    });
}

// Update navbar based on login state & role
const authNavLink = document.getElementById('authNavLink');
const adminNavLink = document.getElementById('adminNavLink');
const logoutBtn = document.getElementById('logoutBtn');

const currentUser = getUser();
if (getToken()) {
    if (authNavLink) authNavLink.style.display = 'none';
    if (adminNavLink && currentUser && currentUser.role === 'admin') {
        adminNavLink.style.display = 'inline-block';
    }
    if (logoutBtn) {
        logoutBtn.style.display = 'inline-block';
        logoutBtn.addEventListener('click', () => {
            clearAuth();
            window.location.href = '/auth';
        });
    }
} else if (adminNavLink) {
    adminNavLink.style.display = 'none';
}

// Login handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const msgEl = document.getElementById('authMessage');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            msgEl.textContent = data.message || 'Login failed.';
            return;
        }

        setToken(data.token);
        if (data.user) setUser(data.user);

        window.location.href = data.user && data.user.role === 'admin' ? '/admin' : '/dashboard';
    });
}