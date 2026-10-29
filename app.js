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
        announcement: 'WELCOME TO THE EME DANCERS SPOOKTACULAR PARTY',
        subAnnouncement: 'Enjoy the music, drinks, and performances',
        kdsTone: 'beep',
        kdsVolume: 0.5,
        lighting: 'ambient_orange'
    }
};

let formState = {
    posTable: 'Table 1',
    posItem: '',
    annMain: '',
    annSub: '',
    adminEmergencyMsg: ''
};

let emergencyAudioCtx = null;
let emergencyOscillator = null;

// Audio Synth for Evacuation Tone (Guaranteed override loop)
function playEmergencyTone() {
    try {
        if (!emergencyAudioCtx) {
            emergencyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (emergencyOscillator) return;

        emergencyOscillator = emergencyAudioCtx.createOscillator();
        const gainNode = emergencyAudioCtx.createGain();

        emergencyOscillator.type = 'sawtooth';
        emergencyOscillator.frequency.setValueAtTime(800, emergencyAudioCtx.currentTime);

        let isHigh = false;
        setInterval(() => {
            if (emergencyOscillator && emergencyAudioCtx) {
                emergencyOscillator.frequency.setValueAtTime(isHigh ? 800 : 970, emergencyAudioCtx.currentTime);
                isHigh = !isHigh;
            }
        }, 300);

        gainNode.gain.setValueAtTime(1.0, emergencyAudioCtx.currentTime);
        emergencyOscillator.connect(gainNode);
        gainNode.connect(emergencyAudioCtx.destination);
        emergencyOscillator.start();
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function stopEmergencyTone() {
    if (emergencyOscillator) {
        try {
            emergencyOscillator.stop();
            emergencyOscillator.disconnect();
        } catch (e) {}
        emergencyOscillator = null;
    }
}

// Data Sync Engine with Active Focus Guard (Preserves Multi-DJ session state)
async function syncData() {
    try {
        const res = await fetch(API_URL, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const data = await res.json();
        
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        const isTyping = activeTag === 'input' || activeTag === 'textarea';

        state.orders = data.record.orders || [];
        state.config = data.record.config || state.config;

        if (!isTyping) {
            render();
        }
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
    const header = document.getElementById('main-header');
    const footer = document.getElementById('main-footer');
    const kioskEmergency = document.getElementById('kiosk-emergency-overlay');
    const kioskEmergencyMsg = document.getElementById('kiosk-emergency-msg');

    if (!formState.annMain) formState.annMain = state.config.announcement || '';
    if (!formState.annSub) formState.annSub = state.config.subAnnouncement || '';
    if (!formState.adminEmergencyMsg) formState.adminEmergencyMsg = state.config.emergencyMessage || '';

    // MASTER EMERGENCY OVERRIDE (Applies instantly across all screens/devices)
    if (state.config.emergencyActive) {
        if (kioskEmergency) kioskEmergency.classList.remove('hidden');
        if (kioskEmergencyMsg) kioskEmergencyMsg.innerText = state.config.emergencyMessage;
        playEmergencyTone();
    } else {
        if (kioskEmergency) kioskEmergency.classList.add('hidden');
        stopEmergencyTone();
    }

    // Handle Kiosk Mode (Hide Headers/Footers on Big Screen)
    if (state.view === 'ann') {
        header.classList.add('hidden');
        footer.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
        footer.classList.remove('hidden');
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
                        <p class="text-xs text-slate-400 mt-2">Spotify player, lighting control & emergency overrides.</p>
                    </div>

                    <div onclick="switchView('ann')" class="bg-[#121721] p-6 rounded-xl border border-slate-800 hover:border-slate-600 cursor-pointer transition shadow-lg">
                        <div class="text-xs font-bold tracking-widest text-purple-400 uppercase mb-2">Public Kiosk</div>
                        <h3 class="text-xl font-bold text-white">Big Screen (ANN / CDS)</h3>
                        <p class="text-xs text-slate-400 mt-2">Decorated Halloween stage display with live RGB lighting & CDS.</p>
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

    // 2. BIG SCREEN VIEW (HALLOWEEN DECOR + SUPERCHARGED UPBEAT PARTY LIGHTS + CDS)
    else if (state.view === 'ann') {
        const preparingOrders = state.orders.filter(o => o.status === 'in_prog');
        const readyOrders = state.orders.filter(o => o.status === 'ready');

        let lightingBg = "bg-gradient-to-b from-[#0f071c] via-[#07040d] to-[#040207]";
        let lightingOverlay = "";
        let borderGlow = "border-orange-500/20";

        if (state.config.lighting === 'neon_purple') {
            lightingBg = "bg-gradient-to-b from-[#2e074d] via-[#10031a] to-[#05010a]";
            lightingOverlay = "shadow-[inset_0_0_150px_rgba(168,85,247,0.5)]";
            borderGlow = "border-purple-500/60";
        } else if (state.config.lighting === 'strobe_white') {
            lightingBg = "bg-black";
            lightingOverlay = "animate-[bounce_0.2s_infinite] bg-white/20";
            borderGlow = "border-white";
        } else if (state.config.lighting === 'party_rgb') {
            // Super-upbeat rapid color shifting party mode
            lightingBg = "bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-700 animate-[pulse_0.4s_cubic-bezier(0.4,0,0.6,1)_infinite]";
            lightingOverlay = "shadow-[inset_0_0_200px_rgba(255,255,255,0.4)]";
            borderGlow = "border-pink-300";
        } else if (state.config.lighting === 'blackout') {
            lightingBg = "bg-black";
            borderGlow = "border-zinc-900";
        }

        container.className = `w-full min-h-screen ${lightingBg} p-8 md:p-14 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${lightingOverlay}`;
        container.innerHTML = `
            <div class="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex items-center justify-between border-b ${borderGlow} pb-6 relative z-20">
                <div class="flex items-center gap-3">
                    <span class="text-3xl animate-bounce">🎃</span>
                    <span class="font-brand font-black text-3xl md:text-4xl tracking-widest text-orange-400 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">EME DANCERS</span>
                </div>
                <div class="text-purple-300 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                    <span>🦇 HALLOWEEN STAGE 🦇</span>
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
            </div>

            <div class="my-auto py-12 text-center space-y-6 relative z-20">
                <h1 class="font-brand text-5xl md:text-8xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                    ${state.config.announcement}
                </h1>
                ${state.config.subAnnouncement ? `<p class="text-orange-300 text-2xl md:text-3xl font-semibold tracking-wide drop-shadow">${state.config.subAnnouncement}</p>` : ''}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-purple-950/80 pt-8 relative z-20">
                <div class="bg-[#120b1e]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-900/60 shadow-xl">
                    <h3 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span> 🧪 POTION BREWING (PREPARING)
                    </h3>
                    <div class="flex flex-wrap gap-3">
                        ${preparingOrders.length === 0 ? '<span class="text-slate-500 text-sm italic">No orders currently brewing</span>' : ''}
                        ${preparingOrders.map(o => `
                            <span class="bg-purple-950/70 border border-purple-800 px-4 py-2 rounded-xl text-lg font-bold text-purple-200">
                                ${o.table}
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-[#120b1e]/90 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <h3 class="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span> 🍬 READY FOR COLLECTION
                    </h3>
                    <div class="flex flex-wrap gap-3">
                        ${readyOrders.length === 0 ? '<span class="text-slate-500 text-sm italic">No orders ready for collection</span>' : ''}
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
                        <input type="text" id="pos-table" value="${formState.posTable}" oninput="formState.posTable = this.value" placeholder="e.g., Table 4 or Order #102" class="w-full bg-[#0b0e14] border border-slate-700 p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500">
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Order Items / Notes</label>
                        <textarea id="pos-item" oninput="formState.posItem = this.value" placeholder="e.g., 2x Witches Brew, 1x Monster Burger" class="w-full bg-[#0b0e14] border border-slate-700 p-3.5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 h-28 resize-none">${formState.posItem}</textarea>
                    </div>

                    <button onclick="submitOrder()" class="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl font-bold text-sm text-white transition shadow-lg">
                        Submit Order to Kitchen
                    </button>
                </div>
            </div>
        `;
    }

    // 4. KITCHEN DISPLAY (KDS)
    else if (state.view === 'kds') {
        container.className = "max-w-7xl mx-auto p-6 md:p-10";
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 class="text-xl font-bold text-white">Kitchen Display System</h2>
                        <p class="text-xs text-slate-400">3-Phase workflow: Ordered -> In Progress -> Ready for Pickup.</p>
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
                    <p class="text-xs text-slate-400">Full Spotify integration, stage broadcasts, lighting control, and master emergency overrides.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-[#121721] p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col h-[560px]">
                        <div class="flex items-center justify-between">
                            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Spotify Web Player</h3>
                            <a href="https://open.spotify.com" target="_blank" class="text-xs text-indigo-400 hover:underline">Open in new tab ↗</a>
                        </div>
                        <div class="w-full flex-1 rounded-xl overflow-hidden border border-slate-800 bg-black">
                            <iframe 
                                src="https://open.spotify.com" 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <!-- Upbeat Stage Lighting Control Suite -->
                        <div class="bg-[#121721] p-6 rounded-2xl border border-slate-800 space-y-4">
                            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Big Screen Stage Lighting</h3>
                            <p class="text-xs text-slate-400">Control live ambient washes, high-tempo strobe flashing, and upbeat party pulsing modes.</p>
                            
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                <button onclick="setLighting('ambient_orange')" class="py-2.5 px-3 rounded-xl text-xs font-bold border transition ${state.config.lighting === 'ambient_orange' ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-[#0b0e14] border-slate-800 text-orange-400'}">
                                    🎃 Halloween Orange
                                </button>
                                <button onclick="setLighting('neon_purple')" class="py-2.5 px-3 rounded-xl text-xs font-bold border transition ${state.config.lighting === 'neon_purple' ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-[#0b0e14] border-slate-800 text-purple-400'}">
                                    🔮 Neon Purple
                                </button>
                                <button onclick="setLighting('party_rgb')" class="py-2.5 px-3 rounded-xl text-xs font-bold border transition ${state.config.lighting === 'party_rgb' ? 'bg-pink-600 border-pink-500 text-white shadow-lg animate-pulse' : 'bg-[#0b0e14] border-slate-800 text-pink-400'}">
                                    ⚡ Upbeat Party RGB
                                </button>
                                <button onclick="setLighting('strobe_white')" class="py-2.5 px-3 rounded-xl text-xs font-bold border transition ${state.config.lighting === 'strobe_white' ? 'bg-slate-200 border-white text-black shadow-lg' : 'bg-[#0b0e14] border-slate-800 text-slate-300'}">
                                    💥 Rapid Strobe
                                </button>
                                <button onclick="setLighting('blackout')" class="py-2.5 px-3 rounded-xl text-xs font-bold border transition ${state.config.lighting === 'blackout' ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg' : 'bg-[#0b0e14] border-slate-800 text-zinc-500'}">
                                    🌑 Blackout
                                </button>
                            </div>
                        </div>

                        <!-- Broadcast Controller -->
                        <div class="bg-[#121721] p-6 rounded-2xl border border-slate-800 space-y-4">
                            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Push to Big Screen</h3>
                            <input type="text" id="ann-main" value="${formState.annMain}" oninput="formState.annMain = this.value" placeholder="Main Title (e.g., COSTUME CONTEST NOW)" class="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500">
                            <input type="text" id="ann-sub" value="${formState.annSub}" oninput="formState.annSub = this.value" placeholder="Sub-text (optional)" class="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500">
                            
                            <div class="flex gap-2">
                                <button onclick="setQuickAnn('COSTUME CONTEST IN 5 MINS', 'Get ready on stage')" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700">Preset: Contest</button>
                                <button onclick="setQuickAnn('HAPPY HALLOWEEN!', 'Enjoy the party')" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700">Preset: Halloween</button>
                            </div>

                            <button onclick="updateAnnouncement()" class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-sm text-white transition">
                                Push to Big Screen
                            </button>
                        </div>

                        <!-- Emergency Controls -->
                        <div class="bg-[#121721] p-6 rounded-2xl border ${state.config.emergencyActive ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800'} space-y-3">
                            <h3 class="text-sm font-bold ${state.config.emergencyActive ? 'text-rose-400 animate-pulse' : 'text-slate-300'} uppercase tracking-wider">Emergency Alarm Master Control</h3>
                            <button onclick="toggleEmergency()" class="w-full py-4 rounded-xl font-black text-sm tracking-widest text-white transition ${state.config.emergencyActive ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-rose-600 hover:bg-rose-500 shadow-lg'}">
                                ${state.config.emergencyActive ? 'RESET / DEACTIVATE EMERGENCY ALARM' : 'TRIGGER EMERGENCY ALARM'}
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
                        <textarea id="admin-emergency-msg" oninput="formState.adminEmergencyMsg = this.value" class="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm h-24 resize-none focus:outline-none focus:border-indigo-500">${formState.adminEmergencyMsg}</textarea>
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
    const table = formState.posTable;
    const item = formState.posItem;
    if (!table || !item) return;
    state.orders.push({ table, item, status: 'ordered' });
    formState.posItem = '';
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
    state.config.announcement = formState.annMain;
    state.config.subAnnouncement = formState.annSub;
    saveData();
}

function setQuickAnn(main, sub) {
    formState.annMain = main;
    formState.annSub = sub;
    updateAnnouncement();
}

function setLighting(mode) {
    state.config.lighting = mode;
    saveData();
}

function toggleEmergency() {
    state.config.emergencyActive = !state.config.emergencyActive;
    saveData();
}

function saveAdminSettings() {
    state.config.emergencyMessage = formState.adminEmergencyMsg;
    saveData();
    alert("Admin defaults saved.");
}

// Initial Sync Cycle
syncData();
setInterval(syncData, 3000);
