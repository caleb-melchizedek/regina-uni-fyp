const TOKEN_KEY = 'sms_jwt_token';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// Quick-Exit safety redirect
const quickExitBtn = document.getElementById('quickExitBtn');
if (quickExitBtn) {
    quickExitBtn.addEventListener('click', () => {
        window.location.replace('https://www.google.com');
    });
}

// Update navbar based on login state
const authNavLink = document.getElementById('authNavLink');
const logoutBtn = document.getElementById('logoutBtn');

if (getToken()) {
    if (authNavLink) authNavLink.style.display = 'none';
    if (logoutBtn) {
        logoutBtn.style.display = 'inline-block';
        logoutBtn.addEventListener('click', () => {
            clearToken();
            window.location.href = '/auth';
        });
    }
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
        window.location.href = '/dashboard';
    });
}

// Registration handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            full_name: document.getElementById('regName').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            phone: document.getElementById('regPhone').value.trim(),
            location: document.getElementById('regLocation').value.trim(),
            password: document.getElementById('regPassword').value
        };
        const msgEl = document.getElementById('authMessage');

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        msgEl.textContent = data.message || 'Registration completed.';
        if (res.ok) registerForm.reset();
    });
}