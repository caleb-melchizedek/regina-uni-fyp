const providersListEl = document.getElementById('providersList');
const myRequestsListEl = document.getElementById('myRequestsList');
const requestSectionEl = document.getElementById('requestSection');

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

async function loadProviders() {
    if (!getToken()) {
        providersListEl.innerHTML = `<p>Please <a href="/auth">log in</a> to view matching institutions and submit requests.</p>`;
        return;
    }

    const category = document.getElementById('categoryFilter').value;
    const city = document.getElementById('cityFilter').value.trim();
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);

    const res = await fetch(`/api/providers?${params.toString()}`, {
        headers: authHeaders()
    });

    if (res.status === 401 || res.status === 403) {
        clearToken();
        window.location.href = '/auth';
        return;
    }

    const providers = await res.json();
    if (!providers.length) {
        providersListEl.innerHTML = '<p>No service providers matched your filter.</p>';
        return;
    }

    providersListEl.innerHTML = providers.map(p => `
        <div class="provider-card">
            <span class="badge">${p.category}</span>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p><strong>Location:</strong> ${p.address}, ${p.city}</p>
            <p><strong>Phone:</strong> ${p.contact_phone}</p>
            <button type="button" class="btn-primary" onclick="selectProvider(${p.id}, '${p.name.replace(/'/g, "\\'")}', '${p.category}')">
                Request Assistance
            </button>
        </div>
    `).join('');
}

function selectProvider(id, name, category) {
    document.getElementById('selectedProviderId').value = id;
    document.getElementById('issueCategory').value = category;
    document.getElementById('selectedProviderLabel').textContent = `Selected Institution: ${name}`;
    requestSectionEl.style.display = 'block';
    requestSectionEl.scrollIntoView({ behavior: 'smooth' });
}

const requestForm = document.getElementById('requestForm');
if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusMsg = document.getElementById('requestStatusMsg');

        const payload = {
            provider_id: document.getElementById('selectedProviderId').value,
            issue_category: document.getElementById('issueCategory').value,
            urgency: document.getElementById('urgencyLevel').value,
            description: document.getElementById('requestDescription').value.trim()
        };

        const res = await fetch('/api/providers/request', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        statusMsg.textContent = data.message;
        if (res.ok) {
            requestForm.reset();
            loadMyRequests();
        }
    });
}

async function loadMyRequests() {
    if (!getToken()) return;

    const res = await fetch('/api/providers/my-requests', {
        headers: authHeaders()
    });
    if (!res.ok) return;

    const requests = await res.json();
    if (!requests.length) {
        myRequestsListEl.innerHTML = '<p>You have not submitted any assistance requests yet.</p>';
        return;
    }

    myRequestsListEl.innerHTML = requests.map(r => `
        <div class="request-item">
            <strong>${r.provider_name}</strong> — <span>${r.issue_category}</span>
            <p>Status: <strong>${r.status}</strong> | Urgency: ${r.urgency}</p>
            <p>${r.description}</p>
        </div>
    `).join('');
}

document.getElementById('filterBtn')?.addEventListener('click', loadProviders);

loadProviders();
loadMyRequests();