const API = "http://localhost:5000/api";

function showView(viewId, showNav = true) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.getElementById('topNav').style.display = showNav ? 'flex' : 'none';
}

function authHeader() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    };
}

let catChartInstance, grpChartInstance;

// ===== AUTH =====
function toggleAuth() {
    const l = document.getElementById('loginForm');
    const r = document.getElementById('registerForm');
    if (l.style.display === 'none') { l.style.display = 'block'; r.style.display = 'none'; }
    else { l.style.display = 'none'; r.style.display = 'block'; }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('token', data.token);
        goToDashboard();
    } else alert(data.msg || data.error || 'Login failed');
}

async function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const res = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
    if (res.ok) { alert('Success, please login'); toggleAuth(); }
    else alert('Registration failed');
}

function logout() {
    localStorage.removeItem('token');
    showView('authView', false);
}

// ===== FLOW =====
async function goToCategories() { showView('catView'); loadCategories(); }
async function goToGroups() {
    const v = document.getElementById('catName').value.trim();
    if (v) await createCategory();
    showView('groupView'); await loadGroups();
}
async function goToExpenses() {
    const v = document.getElementById('grpName').value.trim();
    if (v) await createGroup();
    showView('expenseView'); await loadExpOptions();
}
async function goToDashboard() { showView('dashboardView'); loadDashboard(); }

// ===== CATEGORIES =====
async function loadCategories() {
    const res = await fetch(`${API}/categories`, { headers: authHeader() });
    const data = await res.json();
    const l = document.getElementById('catList');
    l.innerHTML = '';
    data.forEach(c => l.innerHTML += `<div class="list-item"><span>${c.name}</span> <span style="color:#666;font-size:12px">Added</span></div>`);
}
async function createCategory() {
    const name = document.getElementById('catName').value;
    if (!name) return;
    await fetch(`${API}/categories`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ name: name }) });
    document.getElementById('catName').value = '';
    loadCategories();
}

// ===== GROUPS =====
async function loadGroups() {
    const res = await fetch(`${API}/groups`, { headers: authHeader() });
    const data = await res.json();
    const l = document.getElementById('grpList');
    l.innerHTML = '';
    data.forEach(g => l.innerHTML += `<div class="list-item"><span>${g.name}</span> <span style="color:#666;font-size:12px">Added</span></div>`);
}
async function createGroup() {
    const name = document.getElementById('grpName').value;
    if (!name) return;
    await fetch(`${API}/groups`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ name: name }) });
    document.getElementById('grpName').value = '';
    loadGroups();
}

// ===== EXPENSES =====
async function loadExpOptions() {
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];

    try {
        const cRes = await fetch(`${API}/categories`, { headers: authHeader() });
        const cData = await cRes.json();
        const cSel = document.getElementById('expCat');
        cSel.innerHTML = '<option value="">Select Category</option>';
        if (Array.isArray(cData)) {
            cData.forEach(c => cSel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
        }
    } catch (err) { console.error("Cat err", err); }

    try {
        const gRes = await fetch(`${API}/groups`, { headers: authHeader() });
        const gData = await gRes.json();
        const gSel = document.getElementById('expGrp');
        gSel.innerHTML = '<option value="">Select Group (Op)</option>';
        if (Array.isArray(gData)) {
            gData.forEach(g => gSel.innerHTML += `<option value="${g.id}">${g.name}</option>`);
        }
    } catch (err) { console.error("Grp err", err); }
}

async function createExpense() {
    const cat = document.getElementById('expCat').value;
    const grp = document.getElementById('expGrp').value;
    const amt = document.getElementById('expAmt').value;
    const desc = document.getElementById('expDesc').value;
    const date = document.getElementById('expDate').value;
    if (!cat || !amt) return alert("Category and Amount required!");

    await fetch(`${API}/expenses`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ category_id: cat, group_id: grp, amount: amt, description: desc, date: date }) });

    document.getElementById('expAmt').value = '';
    document.getElementById('expDesc').value = '';
    alert('Expense saved! Proceed to Next Step.');
}

let trendChartInstance;

// ===== DASHBOARD =====
async function loadDashboard() {
    const res = await fetch(`${API}/dashboard`, { headers: authHeader() });
    const data = await res.json();

    document.getElementById('dashTotal').innerText = '₹' + Number(data.total).toFixed(2);

    const rl = document.getElementById('recentExpList');
    rl.innerHTML = '';
    if (data.recent && data.recent.length > 0) {
        data.recent.forEach(r => {
            const dateStr = new Date(r.date).toISOString().split('T')[0];
            rl.innerHTML += `<div class="list-item">
            <div><strong>${r.description || 'N/A'}</strong><br><small style="color:#aaa">${r.category_name} &bull; ${r.group_name || 'Personal'} &bull; ${dateStr}</small></div>
            <div style="color:var(--accent); font-weight:bold">-₹${Number(r.amount).toFixed(2)}</div>
            </div>`;
        });
    } else rl.innerHTML = '<p style="color:#666; font-size:14px;">No recent expenses.</p>';

    const ctxCat = document.getElementById('catChart').getContext('2d');
    const ctxGrp = document.getElementById('grpChart').getContext('2d');
    const ctxTrend = document.getElementById('trendChart').getContext('2d');

    if (catChartInstance) catChartInstance.destroy();
    if (grpChartInstance) grpChartInstance.destroy();
    if (trendChartInstance) trendChartInstance.destroy();

    const isDark = document.body.classList.contains('dark-mode');
    const primaryColor = isDark ? '#8a2be2' : '#dc2626';
    const colors = isDark
        ? ['#8a2be2', '#2be28a', '#e22b8a', '#2b8ae2', '#e2a32b', '#6b7280']
        : ['#dc2626', '#16a34a', '#2563eb', '#f59e0b', '#7c3aed', '#db2777'];

    const chartConfig = (labels, vals, type = 'doughnut') => ({
        type: type,
        data: { labels, datasets: [{ data: vals, backgroundColor: colors, borderWidth: 0 }] },
        options: { plugins: { legend: { labels: { color: '#fff' } } } }
    });

    catChartInstance = new Chart(ctxCat, chartConfig(data.byCategory.map(c => c.name), data.byCategory.map(c => c.t)));
    grpChartInstance = new Chart(ctxGrp, chartConfig(data.byGroup.map(c => c.name), data.byGroup.map(c => c.t), 'polarArea'));

    // Trend stacked area chart
    if (data.trend && data.trend.length > 0) {
        const dates = [...new Set(data.trend.map(t => new Date(t.date).toISOString().split('T')[0]))].sort();
        const categories = [...new Set(data.trend.map(t => t.category_name))];

        const datasets = categories.map((cat, i) => {
            const dataPts = dates.map(d => {
                const found = data.trend.find(t => new Date(t.date).toISOString().split('T')[0] === d && t.category_name === cat);
                return found ? found.t : 0;
            });
            const c = colors[i % colors.length];
            return {
                label: cat,
                data: dataPts,
                backgroundColor: c + '80', // opacity for stacking clarity
                borderColor: c,
                borderWidth: 2,
                fill: true,
                tension: 0.4
            };
        });

        trendChartInstance = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: dates,
                datasets: datasets
            },
            options: {
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { ticks: { color: '#ccc' } },
                    y: {
                        stacked: true,
                        ticks: { color: '#ccc' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#fff', font: { family: 'Inter', size: 12 } } },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(9, 9, 11, 0.9)',
                        titleColor: '#8a2be2',
                        titleFont: { family: 'Inter', size: 14, weight: 'bold' },
                        bodyColor: '#fff',
                        bodyFont: { family: 'Inter', size: 13 },
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
    }
}

// ===== SETTINGS =====
function goToSettings() {
    showView('settingsView');
}

function applySettings() {
    const color = document.getElementById('themeColor').value.trim();
    if (color) {
        document.documentElement.style.setProperty('--primary', color);
        if (window.APP_CONFIG) window.APP_CONFIG.THEME.primary = color;
        alert("Configuration updated.");
    }
}

// ===== PDF EXPORT =====
function exportPDF() {
    const element = document.getElementById('pdfContent');
    const opt = {
        margin: 10,
        filename: 'trackwise_report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#09090b' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

// ===== THEME TOGGLE =====
function toggleTheme() {
    const isDark = document.getElementById('checkbox').checked;
    if (isDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
    // Reload charts to update colors
    if (document.getElementById('dashboardView').classList.contains('active')) {
        loadDashboard();
    }
}

// Initial Theme Check
(function () {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        // Ensure checkbox is checked when HTML loads
        window.addEventListener('DOMContentLoaded', () => {
            const cb = document.getElementById('checkbox');
            if (cb) cb.checked = true;
        });
    }
})();

if (localStorage.getItem('token')) {
    goToDashboard();
} else {
    showView('authView', false);
}
