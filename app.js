// --- CONFIGURATION ---
const BIN_ID = '6adf837bffd5d160538d7188';
const API_KEY = '$2a$10$rbJxPooQ4d2WN/deO03Z1Orf9Za/AoqSxPA63Wwn8wgX4d0GaNsNy';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let state = {
    view: 'home',
    orders: [],
    config: {
        emergencyActive: false,
        emergencyMessage: 'EMERGENCY: PLEASE EVACUATE IMMEDIATELY',
        announcement: 'Welcome to the EME Dancers Family Party!',
        kdsTone: 'beep',
        kdsVolume: 0.5
    }
};

// Sync data from JSONbin cloud storage every 3 seconds for real-time multi-device updates
async function syncData() {
    try {
        const res = await fetch(API_URL, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const data = await res.json();
        state.orders = data.record.orders || [];
        state.config = data.record.config || state.config;
        render();
    } catch (e) {
        console.error("Sync error:", e);
    }
}

async function saveData() {
    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ orders: state.orders, config: state.config })
        });
        render();
    } catch (e) {
        console.error("Save error:", e);
    }
}

function switchView(viewName) {
    state.view = viewName;
    render();
}

// --- RENDER ENGINE ---
function render() {
    const container = document.getElementById('app-container');
    const banner = document.getElementById('emergency-banner');

    // Global Emergency Alert Handler
    if (state.config.emergencyActive) {
        banner.classList.remove('hidden');
        banner.innerText = state.config.emergencyMessage;
    } else {
        banner.classList.add('hidden');
    }

    if (state.view === 'home') {
        container.innerHTML = `
            <div class="text-center py-12 space-y-4">
                <h1 class="text-4xl font-black tracking-tight">EME Dancers Backstage Command</h1>
                <p class="text-slate-400">Select a module to open on this device</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div onclick="switchView('pos')" class="bg-slate-900 p-6 rounded-2xl cursor-pointer hover:border-emerald-500 border border-slate-800 transition">
                        <h3 class="text-xl font-bold text-emerald-400">🛒 Floor POS</h3>
                        <p class="text-sm text-slate-400 mt-2">Take table orders on mobile</p>
                    </div>
                    <div onclick="switchView('kds')" class="bg-slate-900 p-6 rounded-2xl cursor-pointer hover:border-amber-500 border border-slate-800 transition">
                        <h3 class="text-xl font-bold text-amber-400">🍳 Kitchen KDS</h3>
                        <p class="text-sm text-slate-400 mt-2">Live prep screen & audio updates</p>
                    </div>
                    <div onclick="switchView('ann')" class="bg-slate-900 p-6 rounded-2xl cursor-pointer hover:border-purple-500 border border-slate-800 transition">
                        <h3 class="text-xl font-bold text-purple-400">✨ EME Big Screen</h3>
                        <p class="text-sm text-slate-400 mt-2">Branded public stage display</p>
                    </div>
                    <div onclick="switchView('dj')" class="bg-slate-900 p-6 rounded-2xl cursor-pointer hover:border-indigo-500 border border-slate-800 transition">
                        <h3 class="text-xl font-bold text-indigo-400">🎛️ DJ & Tech Deck</h3>
                        <p class="text-sm text-slate-400 mt-2">Announcements & Emergency controls</p>
                    </div>
                    <div onclick="switchView('admin')" class="bg-slate-900 p-6 rounded-2xl cursor-pointer hover:border-rose-500 border border-slate-800 transition">
                        <h3 class="text-xl font-bold text-rose-400">⚙️ Admin Panel</h3>
                        <p class="text-sm text-slate-400 mt-2">System customizations & status</p>
                    </div>
                </div>
            </div>
        `;
    } else if (state.view === 'ann') {
        container.innerHTML = `
            <div class="min-h-[75vh] flex flex-col items-center justify-between p-10 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl">
                <div class="bg-slate-900/80 border border-indigo-500/30 px-6 py-2 rounded-full text-indigo-300 font-bold uppercase tracking-widest text-sm">
                    ⭐ EME DANCERS LIVE PRODUCTION ⭐
                </div>
                <div class="my-auto space-y-4">
                    <h1 class="text-5xl md:text-7xl font-black max-w-4xl">${state.config.announcement}</h1>
                </div>
                <div class="text-slate-400 text-xs uppercase tracking-wider">Powered by EME Dancers Backstage Command</div>
            </div>
        `;
    } else if (state.view === 'pos') {
        container.innerHTML = `
            <div class="space-y-6 max-w-xl mx-auto bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h2 class="text-2xl font-bold">Floor POS Order Entry</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Table Name / Location:</label>
                        <input type="text" id="pos-table" value="Table 1" class="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Items / Notes:</label>
                        <input type="text" id="pos-item" value="Spooky Burger & Soda" class="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white">
                    </div>
                    <button onclick="submitOrder()" class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold transition">Send Order to Kitchen</button>
                </div>
            </div>
        `;
    } else if (state.view === 'kds') {
        container.innerHTML = `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">Kitchen Display System (KDS)</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${state.orders.length === 0 ? '<p class="text-slate-500">No active kitchen orders.</p>' : ''}
                    ${state.orders.map((ord, idx) => `
                        <div class="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
                            <div>
                                <span class="bg-slate-800 px-3 py-1 rounded font-bold text-sm text-indigo-400">Table: ${ord.table}</span>
                                <p class="text-lg font-medium mt-3">${ord.item}</p>
                            </div>
                            <button onclick="removeOrder(${idx})" class="mt-6 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 py-2 rounded-xl text-xs font-bold transition">Clear / Complete Order</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (state.view === 'dj') {
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                    <h3 class="font-bold text-lg">Broadcast Stage Announcement</h3>
                    <input type="text" id="ann-input" placeholder="Type announcement for Big Screen..." class="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white">
                    <button onclick="updateAnnouncement()" class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold transition">Push to Big Screen</button>
                </div>
                <div class="bg-slate-900 p-6 rounded-2xl border border-rose-900/50 space-y-4 shadow-xl">
                    <h3 class="font-bold text-lg text-rose-400">Emergency Control Panel</h3>
                    <button onclick="toggleEmergency()" class="w-full bg-rose-600 hover:bg-rose-500 py-4 rounded-xl font-black text-white transition tracking-wider">
                        ${state.config.emergencyActive ? 'DEACTIVATE EMERGENCY' : 'TRIGGER EMERGENCY ALARM'}
                    </button>
                </div>
            </div>
        `;
    } else if (state.view === 'admin') {
        container.innerHTML = `
            <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-xl mx-auto space-y-4 shadow-xl">
                <h2 class="text-2xl font-bold">Admin & System Info</h2>
                <p class="text-sm text-slate-400">Connected to Bin: <code class="bg-slate-800 px-2 py-1 rounded text-indigo-300">${BIN_ID}</code></p>
                <p class="text-xs text-emerald-400 font-semibold">✓ Live Syncing Active (JSONbin.io)</p>
            </div>
        `;
    }
}

// POS Actions
function submitOrder() {
    const table = document.getElementById('pos-table').value;
    const item = document.getElementById('pos-item').value;
    if (!table || !item) return;
    state.orders.push({ table, item });
    saveData();
    alert("Order sent to Kitchen!");
}

function removeOrder(index) {
    state.orders.splice(index, 1);
    saveData();
}

// DJ Actions
function updateAnnouncement() {
    const text = document.getElementById('ann-input').value;
    if (!text) return;
    state.config.announcement = text;
    saveData();
    alert("Announcement pushed to Big Screen!");
}

function toggleEmergency() {
    state.config.emergencyActive = !state.config.emergencyActive;
    saveData();
}

// Start live sync cycle (polls every 3 seconds)
syncData();
setInterval(syncData, 3000);
