const bannerEl = document.getElementById('adminStatusBanner');
const requestsBodyEl = document.getElementById('adminRequestsBody');
const providersBodyEl = document.getElementById('adminProvidersBody');
const usersBodyEl = document.getElementById('adminUsersBody');

function adminHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

async function ensureAdminAccess() {
    if (!getToken()) {
        window.location.href = '/auth';
        return false;
    }

    const res = await fetch('/api/admin/requests', { headers: adminHeaders() });
    if (res.status === 401) {
        clearToken();
        window.location.href = '/auth';
        return false;
    }
    if (res.status === 403) {
        bannerEl.textContent = 'Access denied: this page is restricted to administrators.';
        requestsBodyEl.innerHTML = '<tr><td colspan="6">Unauthorized</td></tr>';
        providersBodyEl.innerHTML = '<tr><td colspan="5">Unauthorized</td></tr>';
        usersBodyEl.innerHTML = '<tr><td colspan="5">Unauthorized</td></tr>';
        return false;
    }

    const requests = await res.json();
    renderRequests(requests);
    return true;
}

function renderRequests(requests) {
    if (!requests.length) {
        requestsBodyEl.innerHTML = '<tr><td colspan="6">No assistance requests found.</td></tr>';
        return;
    }

    const statuses = ['Pending', 'Reviewed', 'Connected', 'Closed'];
    requestsBodyEl.innerHTML = requests.map(r => `
        <tr>
            <td>
                <strong>${escapeHtml(r.user_name)}</strong><br/>
                <small>${escapeHtml(r.user_email)} | ${escapeHtml(r.user_phone)}</small>
            </td>
            <td>${escapeHtml(r.provider_name)} (${escapeHtml(r.provider_city)})</td>
            <td>${escapeHtml(r.issue_category)}<br/><small>Urgency: ${escapeHtml(r.urgency)}</small></td>
            <td>${escapeHtml(r.description)}</td>
            <td><strong>${escapeHtml(r.status)}</strong></td>
            <td>
                <select id="status-${r.id}">
                    ${statuses.map(st => `<option value="${st}" ${st === r.status ? 'selected' : ''}>${st}</option>`).join('')}
                </select>
                <button type="button" class="btn-primary btn-sm" onclick="updateRequestStatus(${r.id})">Save</button>
            </td>
        </tr>
    `).join('');
}

async function updateRequestStatus(requestId) {
    const selectEl = document.getElementById(`status-${requestId}`);
    const status = selectEl.value;

    const res = await fetch(`/api/admin/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ status })
    });
    const data = await res.json();
    bannerEl.textContent = data.message || 'Status updated.';
    if (res.ok) {
        const reqRes = await fetch('/api/admin/requests', { headers: adminHeaders() });
        if (reqRes.ok) renderRequests(await reqRes.json());
    }
}

async function loadAdminProviders() {
    const res = await fetch('/api/admin/providers', { headers: adminHeaders() });
    if (!res.ok) return;
    const providers = await res.json();

    if (!providers.length) {
        providersBodyEl.innerHTML = '<tr><td colspan="5">No providers in database.</td></tr>';
        return;
    }

    providersBodyEl.innerHTML = providers.map(p => `
        <tr>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td>${escapeHtml(p.category)}</td>
            <td>${escapeHtml(p.address)}, ${escapeHtml(p.city)}</td>
            <td>${escapeHtml(p.contact_phone)}</td>
            <td>
                <button type="button" class="btn-secondary btn-sm" onclick="deleteProvider(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('addProviderForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('providerMsg');

    const payload = {
        name: document.getElementById('provName').value.trim(),
        category: document.getElementById('provCategory').value,
        city: document.getElementById('provCity').value.trim(),
        address: document.getElementById('provAddress').value.trim(),
        contact_phone: document.getElementById('provPhone').value.trim(),
        contact_email: document.getElementById('provEmail').value.trim(),
        description: document.getElementById('provDesc').value.trim(),
        is_free: true
    };

    const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    msgEl.textContent = data.message || 'Done.';

    if (res.ok) {
        e.target.reset();
        loadAdminProviders();
    }
});

async function deleteProvider(id) {
    const res = await fetch(`/api/admin/providers/${id}`, {
        method: 'DELETE',
        headers: adminHeaders()
    });
    const data = await res.json();
    bannerEl.textContent = data.message || 'Provider deleted.';
    if (res.ok) loadAdminProviders();
}

async function loadAdminUsers() {
    const res = await fetch('/api/admin/users', { headers: adminHeaders() });
    if (!res.ok) return;
    const users = await res.json();

    usersBodyEl.innerHTML = users.map(u => `
        <tr>
            <td>${escapeHtml(u.full_name)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(u.phone)}</td>
            <td>${escapeHtml(u.location || '-')}</td>
            <td><strong>${escapeHtml(u.role)}</strong></td>
        </tr>
    `).join('');
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

(async function initAdmin() {
    const ok = await ensureAdminAccess();
    if (ok) {
        loadAdminProviders();
        loadAdminUsers();
    }
})();