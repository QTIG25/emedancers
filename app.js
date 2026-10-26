// --- SYSTEM CONFIGURATION ---
const BIN_ID = '6adf837bffd5d160538d7188';
const API_KEY = '$2a$10$rbJxPooQ4d2WN/deO03Z1Orf9Za/AoqSxPA63Wwn8wgX4d0GaNsNy';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let state = {
    view: 'home',
    orders: [],
    config: {
        emergencyActive: false,
        emergencyMessage: 'ATTENTION: AN INCIDENT HAS BEEN REPORTED. PLEASE EVACUATE THE PREMISES IMMEDIATELY VIA THE NEAREST EXIT.',
        announcement: 'WELCOME TO THE EME DANCERS PRODUCTION EVENT',
        subAnnouncement: 'Please visit the bar for refreshments',
        kdsTone: 'beep',
        kdsVolume: 0.5
    }
};

let emergencyAudioCtx = null;
let emergencyOscillator = null;

// Audio Synth for British Standard ISO Evacuation Tone
function playEmergencyTone() {
    try {
        if (!emergencyAudioCtx) {
            emergencyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (emergencyOscillator) return; // Already playing

        emergencyOscillator = emergencyAudioCtx.createOscillator();
        const gainNode = emergencyAudioCtx.createGain();

        // BS 5839-1 Two-Tone Evacuation Pattern (800Hz / 970Hz alternating)
        emergencyOscillator.type = 'sawtooth';
        emergencyOscillator.frequency.setValueAtTime(800, emergencyAudioCtx.currentTime);

        let isHigh = false;
        setInterval(() => {
            if (emergencyOscillator && emergencyAudioCtx) {
                emergencyOscillator.frequency.setValueAtTime(isHigh ? 800 : 970, emergencyAudioCtx.currentTime);
                isHigh = !isHigh;
            }
        }, 500);

        gainNode.gain.setValueAtTime(0.8, emergencyAudioCtx.currentTime);
        emergencyOscillator.connect(gainNode);
        gainNode.connect(emergencyAudioCtx.destination);
        emergencyOscillator.start();
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function stopEmergencyTone() {
    if (emergencyOscillator) {
        emergencyOscillator.stop();
        emergencyOscillator.disconnect();
        emergencyOscillator = null;
    }
}

// Data Sync Engine
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

// --- MAIN RENDER ENGINE ---
function render() {
    const container = document.getElementById('app-container');
    const banner = document.getElementById('emergency-banner');
    const header = document.getElementById('main-header');
    const footer = document.getElementById('main-footer');
    const bannerMsg = document.getElementById('emergency-banner-msg');

    // Handle Kiosk Mode (Hide Headers/Footers on Big Screen)
    if (state.view === 'ann') {
        header.classList.add('hidden');
        footer.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
        footer.classList.remove('hidden');
    }

    // Handle Emergency Alarm Override
    if (state.config.emergencyActive) {
        banner.classList.remove('hidden');
        if (bannerMsg) bannerMsg.innerText = state.config.emergencyMessage;
        if (state.view === 'dj') {
            playEmergencyTone();
        }
    } else {
        banner.classList.add('hidden');
        stopEmergencyTone();
    }

    // 1. HOME VIEW
    if (state.view === 'home') {
        container.className = "max-w-7xl mx-auto p-6 md:p-10";
        container.innerHTML = `
            <div class="space-y-8">
                <div class="border-b border-slate-800 pb-6">
                    <h1 class="text-3xl font-bold tracking-tight text-white">System Directory</h1>
                    <p class="text-slate-400 text-sm mt-1">Select a management deck to initiate session.</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div onclick="switchView('pos')" class="bg-[#121721] p-6 rounded-xl border border-slate-800 hover:border-slate-600 cursor-pointer transition shadow-lg">
                        <div class="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">Order Entry</div>
                        <h3 class="text-xl font-bold text-white">Point of Sale (POS)</h3>
                        <p class="text-xs text-slate-400 mt-2">Mobile service terminal for floor staff.</p>
                    </div>

                    <div onclick="switchView('kds')" class="bg-[#121721] p-6 rounded-xl border border-slate-800 hover:border-slate-600 cursor-pointer transition shadow-lg">
                        <div class="text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">Kitchen Deck</div>
                        <h3 class="text-xl font-bold text-white">Kitchen Display (KDS)</h3>
                        <p class="text-xs text-slate-400 mt-2">3-Phase order tracking (Ordered, Preparing, Ready).</p>
                    </div>

                    <div onclick="switchView('dj')" class="bg-[#121721] p-6 rounded-xl border border-slate-800 hover:border-slate-600 cursor-pointer transition shadow-lg">
                        <div class="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">Stage & Audio</div>
                        <h3 class="text-xl font-bold text-white">DJ & Tech Deck</h3>
                        <p class="text-xs text-slate-400 mt-2">Spotify player, announcements, stage alerts & BS emergency alarm.</p>
                    </div>

                    <div onclick="switchView('ann')" class="bg-[#121721] p-6 rounded-xl border border-slate-800 hover:border-slate-600 cursor-pointer transition shadow-lg">
                        <div class="text-xs font-bold tracking-widest text-purple-400 uppercase mb-2">Public Kiosk</div>
                        <h3 class="text-xl font-bold text-white">Big Screen (ANN / CDS)</h3>
                        <p class="text-xs text-slate-400 mt-2">Full-screen display for TV. Live announcements and order pickup board.</p>
                    </div>

                    <div onclick="switchView('admin')" class="bg-[#121721] p-6 rounded-xl border border-slate-800 hover:border-slate-600 cursor-pointer transition shadow-lg">
                        <div class="text-xs font-bold tracking-widest text-rose-400 uppercase mb-2">Configuration</div>
                        <h3 class="text-xl font-bold text-white">Admin Control</h3>
                        <p class="text-xs text-slate-400 mt-2">System defaults, database link, and alert testing.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // 2. BIG SCREEN VIEW (ANN + CDS FULL SCREEN KIOSK)
    else if (state.view === 'ann') {
        const preparingOrders = state.orders.filter(o => o.status === 'in_prog');
        const readyOrders = state.orders.filter(o => o.status === 'ready');

        container.className = "w-full min-h-screen bg-[#07090e] p-8 md:p-12 flex flex-col justify-between";
        container.innerHTML = `
            <!-- Top Bar Branding -->
            <div class="flex items-center justify-between border-b border-indigo-500/20 pb-6">
                <div>
                    <span class="font-brand font-black text-2xl md:text-3xl tracking-widest text-white">EME DANCERS</span>
                    <span class="text-xs font-bold uppercase tracking-widest text-indigo-400 block">STAGE & EVENT DISPLAY</span>
                </div>
                <div class="bg-indigo-950/60 border border-indigo-500/30 px-4 py-2 rounded-full text-indigo-300 font-mono text-xs font-bold tracking-widest">
                    LIVE SYSTEM SYNCED
                </div>
            </div>

            <!-- Main Center Broadcast Text -->
            <div class="my-auto py-10 text-center space-y-4">
                <h1 class="font-brand text-5xl md:text-7xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-2xl">
                    ${state.config.announcement}
                </h1>
                ${state.config.subAnnouncement ? `<p class="text-indigo-300 text-xl md:text-2xl font-semibold tracking-wide">${state.config.subAnnouncement}</p>` : ''}
            </div>

            <!-- CDS (Customer Order Collection Display) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800/80 pt-8">
                <!-- In Progress Section -->
                <div class="bg-[#0f141d] p-6 rounded-2xl border border-slate-800">
                    <h3 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span> PREPARING FOOD & DRINK
                    </h3>
                    <div class="flex flex-wrap gap-3">
                        ${preparingOrders.length === 0 ? '<span class="text-slate-600 text-sm">No orders currently preparing</span>' : ''}
                        ${preparingOrders.map(o => `
                            <span class="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-lg font-bold text-slate-200">
                                ${o.table}
                            </span>
                        `).join('')}
                    </div>
                </div>

                <!-- Ready For Collection Section -->
                <div class="bg-[#0f141d] p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <h3 class="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span> READY FOR PICKUP
                    </h3>
                    <div class="flex flex-wrap gap-3">
                        ${readyOrders.length === 0 ? '<span class="text-slate-600 text-sm">No orders ready for pickup</span>' : ''}
                        ${readyOrders.map(o => `
                            <span class="bg-emerald-600/20 border border-emerald-500/50 px-5 py-2.5 rounded-xl text-xl font-black text-emerald-300 animate-pulse">
                                ${o.table}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // 3. POS VIEW
    else if (state.view === 'pos') {
        container.className = "max-w-3xl mx-auto p-6 md:p-10";
        container.innerHTML = `
            <div class="bg-[#121721] p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
                <div class="border-b border-slate-800 pb-4">
                    <h2 class="text-xl font-bold text-white">Floor Point of Sale</h2>
                    <p class="text-xs text-slate-400">Submit new orders directly to kitchen and CDS.</p>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Table Number / Order ID</label>
                        <input type="text" id="pos-table" placeholder="e.g., Table 4 or Order #102" class="w-full bg-[#0b0e14] border border-slate-700 p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500">
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Order Items / Notes</label>
                        <textarea id="pos-item" placeholder="e.g., 2x Burgers, 1x Cola (No Ice)" class="w-full bg-[#0b0e14] border border-slate-700 p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 h-28 resize-none"></textarea>
                    </div>

                    <button onclick="submitOrder()" class="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl font-bold text-sm text-white transition shadow-lg">
                        Submit Order to Kitchen
                    </button>
                </div>
            </div>
        `;
    }

    // 4. KITCHEN DISPLAY (KDS - 3 PHASE WORKFLOW)
    else if (state.view === 'kds') {
        container.className = "max-w-7xl mx-auto p-6 md:p-10";
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 class="text-xl font-bold text-white">Kitchen Display System</h2>
                        <p class="text-xs text-slate-400">3-Phase workflow: Ordered $\\rightarrow$ In Progress $\\rightarrow$ Ready for Pickup.</p>
                    </div>
                    <span class="bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700">
                        Active Tickets: ${state.orders.length}
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${state.orders.length === 0 ? '<p class="text-slate-500 text-sm">No active tickets.</p>' : ''}
                    ${state.orders.map((ord, idx) => {
                        let statusBg = "bg-amber-500/10 border-amber-500/40 text-amber-400";
                        let statusText = "Phase 1: Ordered";
                        if (ord.status === 'in_prog') {
                            statusBg = "bg-blue-500/10 border-blue-500/40 text-blue-400";
                            statusText = "Phase 2: In Progress";
                        } else if (ord.status === 'ready') {
                            statusBg = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
                            statusText = "Phase 3: Ready for Pickup";
                        }

                        return `
                            <div class="bg-[#121721] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl space-y-4">
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between">
                                        <span class="font-black text-lg text-white">${ord.table}</span>
                                        <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusBg}">
                                            ${statusText}
                                        </span>
                                    </div>
                                    <p class="text-sm text-slate-300 font-medium whitespace-pre-wrap">${ord.item}</p>
                                </div>

                                <div class="pt-4 border-t border-slate-800 space-y-2">
                                    <div class="grid grid-cols-2 gap-2">
                                        <button onclick="setOrderStatus(${idx}, 'in_prog')" class="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold py-2 rounded-lg transition border border-blue-500/30">
                                            Start Prep
                                        </button>
                                        <button onclick="setOrderStatus(${idx}, 'ready')" class="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold py-2 rounded-lg transition border border-emerald-500/30">
                                            Mark Ready
                                        </button>
                                    </div>
                                    <button onclick="removeOrder(${idx})" class="w-full bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 text-xs font-bold py-2 rounded-lg transition border border-slate-700">
                                        Complete & Delete Order
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // 5. DJ & TECH CONTROL DECK
    else if (state.view === 'dj') {
        container.className = "max-w-7xl mx-auto p-6 md:p-10";
        container.innerHTML = `
            <div class="space-y-6">
                <div class="border-b border-slate-800 pb-4">
                    <h2 class="text-xl font-bold text-white">DJ & Tech Deck</h2>
                    <p class="text-xs text-slate-400">Audio playback, big screen broadcasts, and BS emergency alarm triggering.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Spotify Embed Player -->
                    <div class="bg-[#121721] p-6 rounded-2xl border border-slate-800 space-y-4">
                        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Embedded Spotify Player</h3>
                        <div class="w-full h-80 rounded-xl overflow-hidden border border-slate-800">
                            <iframe 
                                src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0" 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>

                    <!-- Stage Controls & Emergency Alarm -->
                    <div class="space-y-6">
                        <!-- Broadcast Controller -->
                        <div class="bg-[#121721] p-6 rounded-2xl border border-slate-800 space-y-4">
                            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Push to Big Screen</h3>
                            <input type="text" id="ann-main" placeholder="Main Title (e.g., NEXT ACT: EME JUNIORS)" value="${state.config.announcement}" class="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm">
                            <input type="text" id="ann-sub" placeholder="Sub-text (optional)" value="${state.config.subAnnouncement || ''}" class="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm">
                            
                            <div class="flex gap-2">
                                <button onclick="setQuickAnn('SHOW STARTING IN 5 MINUTES', 'Please take your seats')" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700">Preset: 5 Mins</button>
                                <button onclick="setQuickAnn('WELCOME TO EME DANCERS', 'Enjoy the show')" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700">Preset: Welcome</button>
                            </div>

                            <button onclick="updateAnnouncement()" class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-sm text-white transition">
                                Push to Big Screen
                            </button>
                        </div>

                        <!-- Emergency Overrides -->
                        <div class="bg-[#121721] p-6 rounded-2xl border border-rose-900/50 space-y-3">
                            <h3 class="text-sm font-bold text-rose-400 uppercase tracking-wider">BS 5839-1 Emergency Alarm Override</h3>
                            <p class="text-xs text-slate-400">Activating will flash all screens and play a high-decibel two-tone evacuation siren on this device.</p>
                            <button onclick="toggleEmergency()" class="w-full py-4 rounded-xl font-black text-sm tracking-widest text-white transition ${state.config.emergencyActive ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500 shadow-lg'}">
                                ${state.config.emergencyActive ? 'DEACTIVATE EMERGENCY ALARM' : 'TRIGGER BRITISH STANDARD EVACUATION'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 6. ADMIN VIEW
    else if (state.view === 'admin') {
        container.className = "max-w-3xl mx-auto p-6 md:p-10";
        container.innerHTML = `
            <div class="bg-[#121721] p-8 rounded-2xl border border-slate-800 space-y-6">
                <div class="border-b border-slate-800 pb-4">
                    <h2 class="text-xl font-bold text-white">System Administration</h2>
                    <p class="text-xs text-slate-400">Database linkage & system configuration.</p>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">JSONbin Bin ID</label>
                        <input type="text" value="${BIN_ID}" disabled class="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-slate-500 text-sm font-mono">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Emergency Message Text</label>
                        <textarea id="admin-emergency-msg" class="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm h-24 resize-none">${state.config.emergencyMessage}</textarea>
                    </div>
                    <button onclick="saveAdminSettings()" class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-sm text-white transition">
                        Save System Defaults
                    </button>
                </div>
            </div>
        `;
    }
}

// POS Action
function submitOrder() {
    const table = document.getElementById('pos-table').value;
    const item = document.getElementById('pos-item').value;
    if (!table || !item) return;
    state.orders.push({ table, item, status: 'ordered' });
    saveData();
    alert("Order submitted!");
}

// KDS Actions
function setOrderStatus(index, status) {
    state.orders[index].status = status;
    saveData();
}

function removeOrder(index) {
    state.orders.splice(index, 1);
    saveData();
}

// DJ Actions
function updateAnnouncement() {
    const main = document.getElementById('ann-main').value;
    const sub = document.getElementById('ann-sub').value;
    state.config.announcement = main;
    state.config.subAnnouncement = sub;
    saveData();
}

function setQuickAnn(main, sub) {
    document.getElementById('ann-main').value = main;
    document.getElementById('ann-sub').value = sub;
    updateAnnouncement();
}

function toggleEmergency() {
    state.config.emergencyActive = !state.config.emergencyActive;
    saveData();
}

function saveAdminSettings() {
    const msg = document.getElementById('admin-emergency-msg').value;
    state.config.emergencyMessage = msg;
    saveData();
    alert("Admin defaults saved.");
}

// Initial Sync Cycle
syncData();
setInterval(syncData, 3000);
