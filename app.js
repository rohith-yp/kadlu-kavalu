/**
 * Kadalu Kavalu - Guardian of the Sea
 * Tactical Surveillance & Coastal Security Platform Simulation Engine
 */

// Canvas 2D context roundRect polyfill for backward compatibility
if (typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        if (!radii) radii = 0;
        if (typeof radii === 'number') radii = [radii];
        if (radii.length === 1) radii = [radii[0], radii[0], radii[0], radii[0]];
        else if (radii.length === 2) radii = [radii[0], radii[1], radii[0], radii[1]];
        else if (radii.length === 3) radii = [radii[0], radii[1], radii[2], radii[1]];
        
        const r1 = radii[0];
        const r2 = radii[1];
        const r3 = radii[2];
        const r4 = radii[3];
        
        this.beginPath();
        this.moveTo(x + r1, y);
        this.lineTo(x + w - r2, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r2);
        this.lineTo(x + w, y + h - r3);
        this.quadraticCurveTo(x + w, y + h, x + w - r3, y + h);
        this.lineTo(x + r4, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r4);
        this.lineTo(x, y + r1);
        this.quadraticCurveTo(x, y, x + r1, y);
        this.closePath();
        return this;
    };
}

// ==========================================================================
// 1. SYSTEM GEOGRAPHY & DATABASE CONFIG
// ==========================================================================

const MAP_BOUNDS = {
    minLon: -180.0,
    maxLon: 180.0,
    minLat: -90.0,
    maxLat: 90.0
};

// Subcontinent coastal vectors (sub-selection for regional GIS mockup)
const mainlandIndia = [
    {lon: 68.1, lat: 23.8}, {lon: 68.3, lat: 23.0}, {lon: 68.8, lat: 22.8},
    {lon: 69.0, lat: 22.4}, {lon: 69.5, lat: 22.1}, {lon: 70.2, lat: 22.8},
    {lon: 70.8, lat: 22.9}, {lon: 72.1, lat: 22.3}, {lon: 72.1, lat: 21.8},
    {lon: 72.8, lat: 21.1}, {lon: 72.8, lat: 19.0}, {lon: 73.1, lat: 17.0},
    {lon: 73.8, lat: 15.5}, {lon: 74.5, lat: 13.0}, {lon: 75.8, lat: 11.2},
    {lon: 76.2, lat: 10.0}, {lon: 77.0, lat: 8.4}, {lon: 77.5, lat: 8.0}, // Kanyakumari
    {lon: 78.0, lat: 8.7},  {lon: 79.0, lat: 9.1},  {lon: 79.4, lat: 9.3},
    {lon: 79.3, lat: 9.8},  {lon: 79.8, lat: 10.3}, {lon: 79.8, lat: 11.0},
    {lon: 80.3, lat: 13.1}, {lon: 80.4, lat: 14.5}, {lon: 81.3, lat: 15.8},
    {lon: 82.2, lat: 16.5}, {lon: 83.3, lat: 17.7}, {lon: 84.5, lat: 18.5},
    {lon: 85.0, lat: 19.3}, {lon: 86.5, lat: 20.2}, {lon: 87.0, lat: 21.5},
    {lon: 88.0, lat: 22.0}, {lon: 89.0, lat: 22.2}, {lon: 90.0, lat: 22.5},
    {lon: 91.0, lat: 22.8}, {lon: 91.5, lat: 22.2}, {lon: 92.2, lat: 20.8},
    {lon: 93.0, lat: 20.0}, {lon: 94.0, lat: 18.0}, {lon: 94.5, lat: 16.0},
    {lon: 96.0, lat: 16.0}, {lon: 96.5, lat: 15.0}, {lon: 97.5, lat: 13.8},
    {lon: 98.2, lat: 10.0}, {lon: 98.5, lat: 6.0},  {lon: 100.0, lat: 6.0},
    {lon: 100.0, lat: 30.0}, {lon: 60.0, lat: 30.0}, {lon: 60.0, lat: 23.8}
];

const sriLanka = [
    {lon: 79.7, lat: 9.3},  {lon: 80.2, lat: 9.8},  {lon: 80.9, lat: 9.3},
    {lon: 81.2, lat: 8.8},  {lon: 81.8, lat: 7.3},  {lon: 81.8, lat: 6.3},
    {lon: 81.2, lat: 6.0},  {lon: 80.5, lat: 5.9},  {lon: 80.0, lat: 6.1},
    {lon: 79.7, lat: 7.2},  {lon: 79.7, lat: 8.5},  {lon: 79.7, lat: 9.3}
];

const lakshadweep = [
    {lon: 72.6, lat: 10.6, label: "Kavaratti"},
    {lon: 72.2, lat: 11.2, label: "Agatti"},
    {lon: 72.7, lat: 11.8, label: "Andrott"},
    {lon: 73.0, lat: 10.2, label: "Kalpeni"},
    {lon: 73.0, lat: 8.3, label: "Minicoy"}
];

const maldives = [
    {lon: 73.5, lat: 4.2, label: "MalÃ©"},
    {lon: 73.4, lat: 6.8, label: "Haa Alif"},
    {lon: 73.0, lat: 5.3, label: "Lhaviyani"},
    {lon: 73.6, lat: 2.0, label: "Laamu"},
    {lon: 73.1, lat: -0.2, label: "Addu"}
];

const andamanNicobar = [
    {lon: 92.7, lat: 12.6, label: "Port Blair"},
    {lon: 92.8, lat: 13.3, label: "N. Andaman"},
    {lon: 92.9, lat: 12.0, label: "Rutland"},
    {lon: 92.5, lat: 10.7, label: "Little Andaman"},
    {lon: 93.6, lat: 8.0, label: "Kamorta"},
    {lon: 93.8, lat: 7.0, label: "Great Nicobar"}
];

// EEZ border approximation
const indianEEZ = [
    {lon: 65.5, lat: 23.5}, {lon: 66.8, lat: 20.0}, {lon: 67.5, lat: 17.0},
    {lon: 68.2, lat: 14.0}, {lon: 70.0, lat: 11.0}, {lon: 71.2, lat: 8.0},
    {lon: 74.0, lat: 5.0},  {lon: 77.0, lat: 4.5},  {lon: 80.5, lat: 4.8},
    {lon: 82.5, lat: 5.5},  {lon: 84.0, lat: 7.5},  {lon: 85.2, lat: 10.5},
    {lon: 85.8, lat: 14.0}, {lon: 87.0, lat: 17.5}, {lon: 88.5, lat: 19.8},
    {lon: 90.0, lat: 20.2}, {lon: 91.0, lat: 19.0}, {lon: 91.8, lat: 16.5},
    {lon: 91.5, lat: 13.5}, {lon: 91.0, lat: 10.0}, {lon: 91.2, lat: 7.0},
    {lon: 93.0, lat: 5.0},  {lon: 95.5, lat: 5.5},  {lon: 96.0, lat: 9.0},
    {lon: 95.2, lat: 12.0}, {lon: 94.8, lat: 14.5}, {lon: 93.5, lat: 16.0}
];

// Geofence regions
const GEOFENCES = [
    {
        id: "geo-mil",
        name: "Restricted Zone Alpha (Military Range)",
        type: "military",
        polygon: [
            {lon: 86.2, lat: 20.2}, {lon: 88.2, lat: 19.5},
            {lon: 87.8, lat: 18.0}, {lon: 85.8, lat: 18.7}
        ]
    },
    {
        id: "geo-eco",
        name: "Marine Coral Biosphere Reserve",
        type: "ecological",
        polygon: [
            {lon: 78.1, lat: 9.2}, {lon: 79.4, lat: 9.2},
            {lon: 79.2, lat: 8.4}, {lon: 77.9, lat: 8.4}
        ]
    },
    {
        id: "geo-fish",
        name: "Gujarat Coastal Artisanal Fishing Zone",
        type: "fishing",
        polygon: [
            {lon: 69.0, lat: 21.0}, {lon: 71.8, lat: 21.0},
            {lon: 71.8, lat: 18.5}, {lon: 69.0, lat: 18.5}
        ]
    }
];

const PORTS = [
    {lon: 72.8, lat: 19.0, name: "Mumbai Port"},
    {lon: 76.2, lat: 9.9, name: "Port of Kochi"},
    {lon: 80.3, lat: 13.1, name: "Chennai Port"},
    {lon: 83.3, lat: 17.7, name: "Visakhapatnam Port"},
    {lon: 88.2, lat: 22.0, name: "Kolkata Port"},
    {lon: 79.8, lat: 6.9, name: "Colombo Port"}
];

const COUNTRIES = [
    {code: "IN", flag: "\uD83C\uDDEE\uD83C\uDDF3", name: "India"},
    {code: "LK", flag: "\uD83C\uDDF1\uD83C\uDDF0", name: "Sri Lanka"},
    {code: "MV", flag: "\uD83C\uDDF2\uD83C\uDDFB", name: "Maldives"},
    {code: "PA", flag: "\uD83C\uDDF5\uD83C\uDDE6", name: "Panama"},
    {code: "CN", flag: "\uD83C\uDDE8\uD83C\uDDF3", name: "China"},
    {code: "LR", flag: "\uD83C\uDDF1\uD83C\uDDF7", name: "Liberia"},
    {code: "IT", flag: "\uD83C\uDDEE\uD83C\uDDF9", name: "Italy"},
    {code: "FR", flag: "\uD83C\uDDEB\uD83C\uDDF7", name: "France"},
    {code: "DE", flag: "\uD83C\uDDE9\uD83C\uDDF9", name: "Germany"},
    {code: "CH", flag: "\uD83C\uDDE8\uD83C\uDDFD", name: "Switzerland"},
    {code: "US", flag: "\uD83C\uDDFA\uD83C\uDDF8", name: "United States"},
    {code: "AU", flag: "\uD83C\uDDE6\uD83C\uDDFA", name: "Australia"},
    {code: "BR", flag: "\uD83C\uDDE7\uD83C\uDDF7", name: "Brazil"},
    {code: "ZA", flag: "\uD83C\uDDFF\uD83C\uDDE6", name: "South Africa"},
    {code: "JP", flag: "\uD83C\uDDEF\uD83C\uDDF5", name: "Japan"}
];

const COUNTRY_PORTS = {
    "IN": [
        { lon: 72.8, lat: 19.0, name: "Mumbai Port" },
        { lon: 76.2, lat: 9.9, name: "Port of Kochi" },
        { lon: 80.3, lat: 13.1, name: "Chennai Port" },
        { lon: 83.3, lat: 17.7, name: "Visakhapatnam Port" },
        { lon: 88.2, lat: 22.0, name: "Kolkata Port" }
    ],
    "LK": [
        { lon: 79.8, lat: 6.9, name: "Colombo Port" }
    ],
    "MV": [
        { lon: 73.5, lat: 4.2, name: "Male Port" }
    ],
    "CN": [
        { lon: 121.5, lat: 31.2, name: "Shanghai Port" },
        { lon: 114.1, lat: 22.3, name: "Shenzhen Port" }
    ],
    "PA": [
        { lon: -79.5, lat: 8.9, name: "Panama City Port" }
    ],
    "LR": [
        { lon: -10.8, lat: 6.3, name: "Monrovia Port" }
    ],
    "IT": [
        { lon: 12.5, lat: 41.9, name: "Rome Port" },
        { lon: 9.1, lat: 44.4, name: "Genoa Port" },
        { lon: 14.3, lat: 40.8, name: "Naples Port" }
    ],
    "FR": [
        { lon: 5.3, lat: 43.3, name: "Marseille Port" },
        { lon: -1.6, lat: 47.2, name: "Nantes Port" }
    ],
    "DE": [
        { lon: 9.9, lat: 53.5, name: "Hamburg Port" }
    ],
    "CH": [
        { lon: 8.2, lat: 47.5, name: "Basel Port" }
    ],
    "US": [
        { lon: -74.0, lat: 40.7, name: "New York Port" },
        { lon: -118.2, lat: 33.7, name: "Los Angeles Port" }
    ],
    "AU": [
        { lon: 151.2, lat: -33.8, name: "Sydney Port" },
        { lon: 115.7, lat: -32.0, name: "Fremantle Port" }
    ],
    "BR": [
        { lon: -43.2, lat: -22.9, name: "Rio de Janeiro Port" }
    ],
    "ZA": [
        { lon: 18.4, lat: -33.9, name: "Cape Town Port" },
        { lon: 31.0, lat: -29.9, name: "Durban Port" }
    ],
    "JP": [
        { lon: 139.8, lat: 35.6, name: "Tokyo Port" }
    ]
};

let voiceActive = true;
let _speechQueue = [];
let _isSpeaking = false;

function _drainSpeechQueue() {
    if (_isSpeaking || _speechQueue.length === 0) return;
    const { text, priority } = _speechQueue.shift();
    
    // Keep queue short — if critical, stop current utterance and speak immediately
    if (priority === 'critical' && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    // Strip emoji characters and extra whitespace
    const cleanText = text.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (!cleanText) { _drainSpeechQueue(); return; }
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => /^en/.test(v.lang)) || voices[0];
    if (engVoice) utterance.voice = engVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    utterance.volume = 1.0;
    
    _isSpeaking = true;
    utterance.onend = utterance.onerror = () => {
        _isSpeaking = false;
        _drainSpeechQueue();
    };
    
    window.speechSynthesis.speak(utterance);
}

function speakAnnouncement(text, priority = 'normal') {
    if (!voiceActive || !window.speechSynthesis) return;
    // Limit queue to last 5 items so old alerts don't pile up
    if (_speechQueue.length >= 5) {
        _speechQueue.splice(0, _speechQueue.length - 4);
    }
    _speechQueue.push({ text, priority });
    _drainSpeechQueue();
}

// Pre-load voices as soon as they are available in the browser
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

function isPointInPolygon(pt, poly) {
    let isInside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].lon, yi = poly[i].lat;
        const xj = poly[j].lon, yj = poly[j].lat;
        const intersect = ((yi > pt.lat) !== (yj > pt.lat))
            && (pt.lon < (xj - xi) * (pt.lat - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
}

// Data lists for simulation populator
const CARGO_NAMES = [
    "MV OCEAN SENTINEL", "COSCO SHANGHAI", "MAERSK ADRIATIC", "EVER GALAXY",
    "ATLANTIC COMPASS", "PACIFIC TRADER", "APL INDUS", "NYK HYPERION",
    "MSC REGINA", "GOLDEN HORIZON", "ASIAN DIGNITY", "SOUTHERN CROSS"
];
const FISHING_NAMES = [
    "FV JAL-DEV-II", "SEA HARVESTER", "OCEAN BOUNTY", "FV SAMUDRA-3",
    "BLUEFIN-9", "MARINA PRINCESS", "SOUTHERN WAVE", "MEENA-X"
];
const CG_NAMES = [
    "ICGS SAMARATH", "ICGS VIKRAM", "ICGS SHOURYA", "ICGS SANKALP",
    "ICGS SAMRAT", "ICGS SAJAG"
];

let vessels = [];
function generateInitialVessels() {
    vessels = [];
    
    // 1. Cargo Vessels (200 global vessels)
    for (let i = 0; i < 200; i++) {
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const ports = COUNTRY_PORTS[country.code] || COUNTRY_PORTS["IN"];
        const startPort = ports[Math.floor(Math.random() * ports.length)];
        
        // Pick a destination port in a DIFFERENT country
        const otherCountries = COUNTRIES.filter(c => c.code !== country.code);
        const destCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
        const destPorts = COUNTRY_PORTS[destCountry.code] || COUNTRY_PORTS["IN"];
        const destPort = destPorts[Math.floor(Math.random() * destPorts.length)];
        
        let threatScore = Math.floor(Math.random() * 20);
        let anomaly = "Sailing normally within registered lane.";
        let action = "Normal surveillance monitoring.";
        let aisStatus = "Active";
        
        if (i % 12 === 0) {
            threatScore = 65 + Math.floor(Math.random() * 25);
            anomaly = `SUSPICIOUS ROUTE: Deviating from standard shipping lanes heading towards ${destPort.name}. Speed anomalous for cargo class.`;
            action = "ALERT: Dispatch nearest coastal patrol to monitor and verify credentials.";
            aisStatus = Math.random() > 0.5 ? "Lost" : "Active";
        }

        vessels.push({
            id: "cargo-" + i,
            mmsi: "41900" + String(i).padStart(4, '0'),
            imo: "9" + String(Math.floor(100000 + Math.random() * 900000)),
            name: CARGO_NAMES[i % CARGO_NAMES.length] + " " + String(100 + i),
            type: "cargo",
            class: "Crude Oil / Container Carrier",
            country: country.code,
            flag: country.flag,
            threatScore: threatScore,
            lat: lerp(startPort.lat, destPort.lat, Math.random()),
            lon: lerp(startPort.lon, destPort.lon, Math.random()),
            speed: parseFloat((10 + Math.random() * 8).toFixed(1)),
            heading: Math.floor(calculateHeading(startPort.lon, startPort.lat, destPort.lon, destPort.lat)),
            destination: `${destPort.name} (${destCountry.name})`,
            eta: new Date(Date.now() + Math.random() * 86400000 * 2).toISOString().replace('T', ' ').slice(0, 16),
            aisStatus: aisStatus,
            anomaly: anomaly,
            action: action,
            cgAsset: "EU Border Patrol",
            route: {
                start: {lon: startPort.lon, lat: startPort.lat},
                end: {lon: destPort.lon, lat: destPort.lat}
            }
        });
    }

    // 2. Fishing Vessels (115 global vessels)
    for (let i = 0; i < 115; i++) {
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const ports = COUNTRY_PORTS[country.code] || COUNTRY_PORTS["IN"];
        const startPort = ports[Math.floor(Math.random() * ports.length)];
        
        const lat = startPort.lat + (Math.random() - 0.5) * 2.5;
        const lon = startPort.lon + (Math.random() - 0.5) * 2.5;
        const threatScore = Math.floor(Math.random() * 25);

        vessels.push({
            id: "fishing-" + i,
            mmsi: "41930" + String(i).padStart(4, '0'),
            imo: "N/A",
            name: FISHING_NAMES[i % FISHING_NAMES.length] + " (" + String(i + 1) + ")",
            type: "fishing",
            class: "Artisanal Trawler",
            country: country.code,
            flag: country.flag,
            threatScore: threatScore,
            lat: lat,
            lon: lon,
            speed: parseFloat((2 + Math.random() * 4).toFixed(1)),
            heading: Math.floor(Math.random() * 360),
            destination: "Local Coastal Basin",
            eta: "Daily Return",
            aisStatus: "Active",
            anomaly: "Active fishing operations.",
            action: "No intervention required.",
            cgAsset: "Local Coastal Station",
            route: {
                start: {lon: lon - (Math.random() * 0.4 + 0.2), lat: lat - (Math.random() * 0.4 + 0.2)},
                end: {lon: lon + (Math.random() * 0.4 + 0.2), lat: lat + (Math.random() * 0.4 + 0.2)}
            }
        });
    }

    // 3. Coast Guard Patrols (12 global vessels)
    for (let i = 0; i < 12; i++) {
        const country = COUNTRIES[i % COUNTRIES.length];
        const ports = COUNTRY_PORTS[country.code] || COUNTRY_PORTS["IN"];
        const startPort = ports[Math.floor(Math.random() * ports.length)];
        
        const lat = startPort.lat + (Math.random() - 0.5) * 1.5;
        const lon = startPort.lon + (Math.random() - 0.5) * 1.5;
        
        vessels.push({
            id: "cg-" + i,
            mmsi: "41990" + String(i).padStart(4, '0'),
            imo: "MIL-CG",
            name: CG_NAMES[i % CG_NAMES.length],
            type: "coastguard",
            class: "Offshore Patrol Vessel",
            country: country.code,
            flag: country.flag,
            threatScore: 0,
            lat: lat,
            lon: lon,
            speed: parseFloat((16 + Math.random() * 10).toFixed(1)),
            heading: Math.floor(Math.random() * 360),
            destination: "Patrol Grid Sector " + String.fromCharCode(65 + i),
            eta: "Ongoing Patrol",
            aisStatus: "Active",
            anomaly: "Security patrol sweeps.",
            action: "Command surveillance hub.",
            cgAsset: "Command Headquarters",
            route: {
                start: {lon: startPort.lon, lat: startPort.lat},
                end: {lon: lon + (Math.random() - 0.5) * 1.5, lat: lat + (Math.random() - 0.5) * 1.5}
            }
        });
    }

    // 4. Emergency Search & Rescue (5 global vessels)
    for (let i = 0; i < 5; i++) {
        const country = COUNTRIES[i % COUNTRIES.length];
        const ports = COUNTRY_PORTS[country.code] || COUNTRY_PORTS["IN"];
        const startPort = ports[Math.floor(Math.random() * ports.length)];
        
        const lat = startPort.lat + (Math.random() - 0.5) * 2.0;
        const lon = startPort.lon + (Math.random() - 0.5) * 2.0;
        
        vessels.push({
            id: "emergency-" + i,
            mmsi: "41991" + String(i).padStart(4, '0'),
            imo: "SAR",
            name: "SAR CUTTER VARUNA " + String(i+1),
            type: "emergency",
            class: "Rapid Response SAR Vessel",
            country: country.code,
            flag: country.flag,
            threatScore: 0,
            lat: lat,
            lon: lon,
            speed: 28.5,
            heading: Math.floor(Math.random() * 360),
            destination: "Incident Grid Alpha",
            eta: "Priority Transit",
            aisStatus: "Active",
            anomaly: "Responding to emergency distress channel.",
            action: "Priority clearance of transit zones.",
            cgAsset: "Naval Air Support",
            route: {
                start: {lon: lon - (Math.random() * 0.8 + 0.4), lat: lat - (Math.random() * 0.8 + 0.4)},
                end: {lon: lon + (Math.random() * 0.8 + 0.4), lat: lat + (Math.random() * 0.8 + 0.4)}
            }
        });
    }

    // 5. Explicit Suspicious Targets (India, Sri Lanka, Maldives)
    vessels.push({
        id: "target-sheng-hai",
        mmsi: "563029110",
        imo: "9304192",
        name: "MV SHENG-HAI",
        type: "suspicious",
        class: "Substandard Bulk Carrier",
        country: "PA",
        flag: "\uD83C\uDDF5\uD83C\uDDE6",
        threatScore: 82,
        lat: 19.3,
        lon: 87.2,
        speed: 8.2,
        heading: 195,
        destination: "Port of Karachi (Deviation)",
        eta: "2026-07-12 12:45 UTC",
        aisStatus: "Active",
        anomaly: "CRITICAL: Deviating from SLOC sea lane. Crossed boundary into Restricted Zone Alpha (Military Range). Failed to reply to port operations VHF hail.",
        action: "IMMEDIATE ACTION: Dispatch offshore interceptor. Launch Dornier patrol aircraft CG-782 for visual profiling.",
        cgAsset: "Patrol Vessel (8.4 nm, Intercept course)",
        route: {
            start: {lon: 90.0, lat: 21.0},
            end: {lon: 84.0, lat: 17.0}
        }
    });

    vessels.push({
        id: "target-jal-dev",
        mmsi: "419302198",
        imo: "N/A",
        name: "FV JAL-DEV-II",
        type: "suspicious",
        class: "Unregulated Trawler",
        country: "IN",
        flag: "\uD83C\uDDEE\uD83C\uDDF3",
        threatScore: 78,
        lat: 8.9,
        lon: 78.4,
        speed: 3.5,
        heading: 90,
        destination: "Coastal Waters",
        eta: "Overdue",
        aisStatus: "Lost",
        anomaly: "WARNING: Satellite AIS transmission lost 45 mins ago. Last tracked heading towards Marine Coral Sanctuary. Threat score elevated due to matching illegal transshipment profiling.",
        action: "RECOMMENDED ACTION: Task nearest coastal interceptor unit to investigate last known coordinates.",
        cgAsset: "Interceptor C-421 (14.2 nm away)",
        route: {
            start: {lon: 77.8, lat: 8.4},
            end: {lon: 79.2, lat: 9.3}
        }
    });

    vessels.push({
        id: "target-dhow",
        mmsi: "UNKNOWN-01",
        imo: "N/A",
        name: "UNKNOWN DHOW",
        type: "suspicious",
        class: "Wooden Vessel",
        country: "MV",
        flag: "\uD83C\uDDF2\uD83C\uDDFB",
        threatScore: 56,
        lat: 5.5,
        lon: 72.8,
        speed: 9.4,
        heading: 45,
        destination: "Unscheduled landfall Maldives",
        eta: "Unspecified",
        aisStatus: "Active",
        anomaly: "SUSPICIOUS: Running dark (no navigation lights reported by radar sweep). Radar cross-section matches smuggling profile in Minicoy channel.",
        action: "RECOMMENDED ACTION: Coordinate with Coast Guard. Direct surveillance radar to maintain track.",
        cgAsset: "MNDF Huravee (28.4 nm away)",
        route: {
            start: {lon: 71.2, lat: 4.2},
            end: {lon: 74.8, lat: 7.0}
        }
    });

    // 6. Many Unknown / Unidentified Vessels
    const UNKNOWN_POSITIONS = [
        {lon: 73.5, lat: 15.2, name: "UNKNOWN CONTACT-01"},
        {lon: 75.1, lat: 12.8, name: "UNKNOWN CONTACT-02"},
        {lon: 78.3, lat: 6.5, name: "UNKNOWN CONTACT-03"},
        {lon: 80.5, lat: 10.3, name: "UNKNOWN CONTACT-04"},
        {lon: 82.1, lat: 14.7, name: "UNKNOWN CONTACT-05"},
        {lon: 85.4, lat: 18.2, name: "UNKNOWN CONTACT-06"},
        {lon: 70.2, lat: 18.5, name: "UNKNOWN CONTACT-07"},
        {lon: 68.8, lat: 14.3, name: "UNKNOWN CONTACT-08"},
        {lon: 71.0, lat: 8.0, name: "UNKNOWN CONTACT-09"},
        {lon: 74.8, lat: 4.5, name: "UNKNOWN CONTACT-10"},
        {lon: 83.7, lat: 7.2, name: "UNKNOWN CONTACT-11"},
        {lon: 86.2, lat: 11.5, name: "UNKNOWN CONTACT-12"},
        {lon: 77.0, lat: 3.0, name: "UNKNOWN CONTACT-13"},
        {lon: 79.9, lat: 20.5, name: "UNKNOWN CONTACT-14"},
        {lon: 67.5, lat: 21.5, name: "UNKNOWN CONTACT-15"},
        {lon: 88.5, lat: 15.0, name: "UNKNOWN CONTACT-16"},
        {lon: 76.4, lat: 17.2, name: "UNKNOWN CONTACT-17"},
        {lon: 73.0, lat: 9.5, name: "UNKNOWN CONTACT-18"},
        {lon: -80.0, lat: 9.0, name: "UNKNOWN CONTACT-PA"},
        {lon: -10.5, lat: 6.0, name: "UNKNOWN CONTACT-LR"},
        {lon: 10.5, lat: 43.0, name: "UNKNOWN CONTACT-EU1"},
        {lon: 6.0, lat: 44.0, name: "UNKNOWN CONTACT-EU2"},
        {lon: 115.0, lat: 23.0, name: "UNKNOWN CONTACT-CN"}
    ];
    UNKNOWN_POSITIONS.forEach((up, i) => {
        const tScore = Math.floor(35 + Math.random() * 60);
        vessels.push({
            id: "unknown-" + i,
            mmsi: "RADAR-" + String(i+1).padStart(3,'0'),
            imo: "UNREGISTERED",
            name: up.name,
            type: "suspicious",
            class: "Unidentified Vessel",
            country: "??",
            flag: "\uD83C\uDFF4",
            threatScore: tScore,
            lat: up.lat + (Math.random() - 0.5) * 0.5,
            lon: up.lon + (Math.random() - 0.5) * 0.5,
            speed: parseFloat((2 + Math.random() * 12).toFixed(1)),
            heading: Math.floor(Math.random() * 360),
            destination: "Unknown",
            eta: "Untracked",
            aisStatus: Math.random() > 0.4 ? "Lost" : "Active",
            anomaly: "RADAR-ONLY TARGET: No active AIS signal. Navigation pattern indicates unregistered coastal operations.",
            action: "Monitor target trajectory. Alert nearest sector commander.",
            cgAsset: "Coastal Surveillance Radar Network",
            route: {
                start: {lon: up.lon, lat: up.lat},
                end: {lon: up.lon + (Math.random() * 1.5 - 0.75), lat: up.lat + (Math.random() * 1.5 - 0.75)}
            }
        });
    });

    // 7. Distress / Engine-Halted Vessels
    const DISTRESS_VESSELS = [
        {id: "distress-01", name: "MV KAVERI STAR", lon: 76.5, lat: 11.2, flag: "\uD83C\uDDEE\uD83C\uDDF3", country: "IN", mmsi: "419800001", class: "Bulk Carrier (Engine Failure)", anomaly: "ENGINE FAILURE: Vessel has lost propulsion. Distress beacon (EPIRB) activated. Vessel adrift in busy shipping lane. Crew of 24 aboard. Requesting immediate tow assistance.", action: "Dispatch rescue tug. Notify Maritime Rescue Coordination Centre (MRCC).", cgAsset: "SAR CUTTER (4.2 nm)"},
        {id: "distress-02", name: "FV BLUE MOON", lon: 80.1, lat: 8.6, flag: "\uD83C\uDDF1\uD83C\uDDF0", country: "LK", mmsi: "413200045", class: "Fishing Vessel (Engine Failure)", anomaly: "DISTRESS: Engine failure reported via VHF Channel 16. Vessel listing 12° starboard. 8 crew members aboard. Taking on minor water ingress. Immediate assistance required.", action: "Dispatch nearest SAR cutter. Coast Guard helicopter on alert. Notify MRCC.", cgAsset: "SAR CUTTER (6.1 nm)"},
        {id: "distress-03", name: "MT MEDITERRANEAN SOS", lon: 11.5, lat: 42.1, flag: "\uD83C\uDDEE\uD83C\uDDF9", country: "IT", mmsi: "352001182", class: "Tanker (Adrift)", anomaly: "EMERGENCY: Main engine failure on oil tanker. Vessel drifting toward restricted zone. 31 crew aboard. Risk of grounding if not assisted within 4 hrs.", action: "CRITICAL: Dispatch ocean-going tug. Alert Oil Spill Response unit.", cgAsset: "EU Patrol Tug (9.8 nm)"},
    ];
    DISTRESS_VESSELS.forEach(dv => {
        vessels.push({
            id: dv.id,
            mmsi: dv.mmsi,
            imo: "N/A",
            name: dv.name,
            type: "distress",
            class: dv.class,
            country: dv.country,
            flag: dv.flag,
            threatScore: 0,
            lat: dv.lat,
            lon: dv.lon,
            speed: 0,
            heading: Math.floor(Math.random() * 360),
            destination: "ADRIFT",
            eta: "EMERGENCY",
            aisStatus: "Distress",
            anomaly: dv.anomaly,
            action: dv.action,
            cgAsset: dv.cgAsset,
            distress: true,
            route: null
        });
    });

    // 8. Mediterranean / Europe Vessels (to populate Italy/Europe view)
    for (let i = 0; i < 18; i++) {
        const euroCountries = [
            {code: "IT", flag: "\uD83C\uDDEE\uD83C\uDDF9", name: "Italy"},
            {code: "FR", flag: "\uD83C\uDDEB\uD83C\uDDF7", name: "France"},
            {code: "DE", flag: "\uD83C\uDDE9\uD83C\uDDF9", name: "Germany"},
            {code: "CH", flag: "\uD83C\uDDE8\uD83C\uDDFD", name: "Switzerland"},
            {code: "PA", flag: "\uD83C\uDDF5\uD83C\uDDE6", name: "Panama"},
            {code: "CN", flag: "\uD83C\uDDE8\uD83C\uDDF3", name: "China"}
        ];
        const country = euroCountries[Math.floor(Math.random() * euroCountries.length)];
        const startOptions = [
            {lon: 12.5, lat: 41.9, name: "Rome Port"},
            {lon: 5.3, lat: 43.3, name: "Marseille Port"},
            {lon: 9.1, lat: 44.4, name: "Genoa Port"},
            {lon: 14.3, lat: 40.8, name: "Naples Port"}
        ];
        const destOptions = [
            {lon: -5.6, lat: 35.9, name: "Gibraltar Strait SLOC"},
            {lon: 32.5, lat: 31.2, name: "Suez Canal SLOC"}
        ];
        const start = startOptions[Math.floor(Math.random() * startOptions.length)];
        const dest = destOptions[Math.floor(Math.random() * destOptions.length)];
        
        let type = "cargo";
        let vClass = "Container Vessel";
        let threat = Math.floor(Math.random() * 15);
        let name = "MV ROME EXPRESS " + String(200 + i);
        let anomaly = "Normal Mediterranean transit.";
        let action = "Standard radar logs.";
        let cgAsset = "EU Border Patrol";
        let speed = parseFloat((12 + Math.random() * 6).toFixed(1));
        
        if (i % 6 === 0) {
            type = "suspicious";
            vClass = "Go-Fast Speedboat";
            threat = 75 + Math.floor(Math.random() * 20);
            name = "UNK SPEEDBOAT " + String(10 + i);
            anomaly = "UNIDENTIFIED CONTACT: Running without active AIS transponder. High-speed maneuver pattern near shipping lanes.";
            action = "ALERT: Dispatch security cutter for boarding & verification.";
            cgAsset = "EU Border Patrol Helicopter";
            speed = parseFloat((25 + Math.random() * 10).toFixed(1));
        } else if (i % 6 === 1) {
            type = "fishing";
            vClass = "Coastal Trawler";
            name = "FV BELLA VITA " + String(100 + i);
            anomaly = "Local fishing operations in domestic waters.";
            speed = parseFloat((3 + Math.random() * 4).toFixed(1));
        } else if (i % 6 === 2) {
            type = "coastguard";
            vClass = "Offshore Patrol Vessel";
            name = "ITS FRANCESCO MOROSINI";
            anomaly = "Routine sea patrol sweeps.";
            cgAsset = "Command Headquarters Rome";
            speed = parseFloat((18 + Math.random() * 8).toFixed(1));
        }
        
        vessels.push({
            id: "euro-" + i,
            mmsi: "2470" + String(i).padStart(5, '0'),
            imo: "9" + String(Math.floor(100000 + Math.random() * 900000)),
            name: name,
            type: type,
            class: vClass,
            country: country.code,
            flag: country.flag,
            threatScore: threat,
            lat: lerp(start.lat, dest.lat, Math.random()),
            lon: lerp(start.lon, dest.lon, Math.random()),
            speed: speed,
            heading: Math.floor(calculateHeading(start.lon, start.lat, dest.lon, dest.lat)),
            destination: dest.name,
            eta: "In Transit",
            aisStatus: type === "suspicious" ? "Lost" : "Active",
            anomaly: anomaly,
            action: action,
            cgAsset: cgAsset,
            route: {
                start: {lon: start.lon, lat: start.lat},
                end: {lon: dest.lon, lat: dest.lat}
            }
        });
    }
}


function lerp(start, end, amt) { return (1 - amt) * start + amt * end; }
function calculateHeading(lon1, lat1, lon2, lat2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    let heading = Math.atan2(y, x) * 180 / Math.PI;
    return (heading + 360) % 360;
}

// ==========================================================================
// ==========================================================================
// 2. HIGH-FIDELITY 3D GERSTNER OCEAN WAVE & SONAR RADAR COMMAND BACKDROP
// ==========================================================================

class Ocean3DAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.width = 0;
        this.height = 0;
        
        // 3D View Camera Settings
        this.cameraPitch = 0.58; // X-axis tilt looking down
        this.cameraYaw = 0.42;   // Y-axis orbit rotation
        this.fov = 900;
        this.cameraTranslationZ = 1200; // Shift ocean grid in front of camera
        
        // Interactive dragging variables
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.dragVelocityX = 0;
        this.dragVelocityY = 0;
        this.friction = 0.95;
        
        // Raycasted targeting coordinate
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetWorldPos = { x: 0, z: 0 };
        
        // Mathematical Gerstner Wave variables (A: Amplitude, L: Wavelength, S: Speed, D: Direction rad, Q: Steepness)
        // Multi-directional wave superposition creates realistic ocean displacement
        this.waves = [
            { A: 14, L: 280, S: 0.0008, D: 0.35, Q: 0.35 },
            { A: 7,  L: 140, S: 0.0016, D: -0.6,  Q: 0.25 },
            { A: 3,  L: 70,  S: 0.0028, D: 1.25,  Q: 0.15 }
        ];
        
        // Grid definition
        this.gridSize = 28; // 28x28 grid quads (optimum density for solid 60fps filled polygon rendering)
        this.gridSpacing = 34; // spacing between vertices
        
        // Normalised light source for marine diffuse shading (coming from top-right)
        this.lightSource = { x: 0.3, y: 0.9, z: -0.3 };
        const len = Math.sqrt(this.lightSource.x**2 + this.lightSource.y**2 + this.lightSource.z**2);
        this.lightSource.x /= len;
        this.lightSource.y /= len;
        this.lightSource.z /= len;
        
        // Simulated ships with physical bobbing, pitch/roll, and custom vector geometries (removed for clean login view)
        this.entities = [];
        
        // Wake foam particle array
        this.particles = [];
        this.lastParticleTime = 0;
        
        // Sonar beam sweep variables
        this.sonarSweepAngle = 0;
        
        this.resize();
        this.setupListeners();
    }
    
    resize() {
        const parent = this.canvas.parentElement;
        this.width = parent.clientWidth;
        this.height = parent.clientHeight;
        
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        this.ctx.scale(dpr, dpr);
    }
    
    setupListeners() {
        window.addEventListener('resize', () => this.resize());
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('.login-card')) return;
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.dragVelocityX = 0;
            this.dragVelocityY = 0;
        });
        
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            
            this.cameraYaw += deltaX * 0.003;
            this.cameraPitch = Math.max(0.18, Math.min(1.15, this.cameraPitch + deltaY * 0.003));
            
            this.dragVelocityX = deltaX * 0.003;
            this.dragVelocityY = deltaY * 0.003;
        });
        
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }
    
    // Gerstner Wave Formula: returns displaced 3D coordinate from flat rest coordinate (x0, z0)
    getGerstnerDisplacement(x0, z0, time) {
        let x = x0;
        let z = z0;
        let y = 0;
        
        this.waves.forEach(w => {
            const kMagnitude = 2 * Math.PI / w.L;
            const kx = Math.cos(w.D) * kMagnitude;
            const kz = Math.sin(w.D) * kMagnitude;
            
            // Phase parameter
            const phase = x0 * kx + z0 * kz - time * w.S;
            const cosPhase = Math.cos(phase);
            const sinPhase = Math.sin(phase);
            
            // Horizontal displacement (sharpens crests)
            x += w.Q * w.A * (kx / kMagnitude) * cosPhase;
            z += w.Q * w.A * (kz / kMagnitude) * cosPhase;
            
            // Vertical displacement
            y += w.A * sinPhase;
        });
        
        return { x: x, y: y, z: z };
    }
    
    getWaveHeight(x, z, time) {
        return this.getGerstnerDisplacement(x, z, time).y;
    }
    
    project3D(x, y, z) {
        // Negate y so that positive Y coordinates point UP (above sea level)
        const projectedY = -y;
        
        // Rotate around Y-axis (Yaw)
        const cosY = Math.cos(this.cameraYaw);
        const sinY = Math.sin(this.cameraYaw);
        let rx = x * cosY - z * sinY;
        let rz = x * sinY + z * cosY;
        
        // Rotate around X-axis (Pitch)
        const cosX = Math.cos(this.cameraPitch);
        const sinX = Math.sin(this.cameraPitch);
        let ry = projectedY * cosX - rz * sinX;
        let rz_final = projectedY * sinX + rz * cosX;
        
        // Translate along camera Z axis
        const distance = this.cameraTranslationZ + rz_final;
        const scale = this.fov / Math.max(distance, 1);
        
        return {
            x: this.width / 2 + rx * scale,
            y: this.height / 2 + ry * scale,
            z: rz_final,
            scale: scale
        };
    }
    
    start() {
        const render = (timestamp) => {
            if (!document.body.classList.contains('view-login')) {
                requestAnimationFrame(render);
                return;
            }
            
            this.update(timestamp);
            this.draw(timestamp);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }
    
    update(timestamp) {
        const time = timestamp;
        if (!this.isDragging) {
            // Gentle, organic cinematic floating camera drift
            this.cameraYaw = 0.42 + Math.sin(time * 0.00012) * 0.12 + this.dragVelocityX;
            this.cameraPitch = 0.58 + Math.cos(time * 0.00008) * 0.05 + this.dragVelocityY;
            this.dragVelocityX *= this.friction;
            this.dragVelocityY *= this.friction;
        }
        
        // Sonar sweep rotation
        this.sonarSweepAngle = (this.sonarSweepAngle + 0.005) % (Math.PI * 2);
        
        // Generate sailing boat wake particles
        if (this.sailBoat && !this.sailBoat.arrived && time - this.lastParticleTime > 100) {
            this.lastParticleTime = time;
            // Emit foam bubble particle behind the stern (to the right, positive X)
            this.particles.push({
                x: this.sailBoat.x + 35,
                z: this.sailBoat.z + (Math.random() - 0.5) * 8,
                opacity: 1.0,
                size: 2.0 + Math.random() * 2.5
            });
        }
        // Update particles
        this.particles.forEach(p => {
            p.opacity -= 0.02; // Decay life
        });
        this.particles = this.particles.filter(p => p.opacity > 0);
    }
    
    draw(timestamp) {
        const time = timestamp;
        
        // Deep ocean background — realistic midnight navy
        this.ctx.fillStyle = '#01060f';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // --- 2D Blueprint Grid Background Overlay ---
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.02)';
        this.ctx.lineWidth = 0.6;
        for (let x = 0; x < this.width; x += 45) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 45) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Corner alignment marks
        const margin = 20;
        this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        this.ctx.lineWidth = 0.8;
        
        // Top-Left
        this.ctx.beginPath();
        this.ctx.moveTo(margin, margin + 10);
        this.ctx.lineTo(margin, margin);
        this.ctx.lineTo(margin + 10, margin);
        this.ctx.stroke();
        // Top-Right
        this.ctx.beginPath();
        this.ctx.moveTo(this.width - margin, margin + 10);
        this.ctx.lineTo(this.width - margin, margin);
        this.ctx.lineTo(this.width - margin - 10, margin);
        this.ctx.stroke();
        // Bottom-Left
        this.ctx.beginPath();
        this.ctx.moveTo(margin, this.height - margin - 10);
        this.ctx.lineTo(margin, this.height - margin);
        this.ctx.lineTo(margin + 10, this.height - margin);
        this.ctx.stroke();
        // Bottom-Right
        this.ctx.beginPath();
        this.ctx.moveTo(this.width - margin, this.height - margin - 10);
        this.ctx.lineTo(this.width - margin, this.height - margin);
        this.ctx.lineTo(this.width - margin - 10, this.height - margin);
        this.ctx.stroke();
        this.ctx.restore();
        
        // Volumetric sonar sweep glow
        const radialGlow = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 40,
            this.width / 2, this.height / 2, this.fov * 1.2
        );
        radialGlow.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
        radialGlow.addColorStop(0.5, 'rgba(10, 18, 36, 0.12)');
        radialGlow.addColorStop(1, 'rgba(4, 6, 10, 0)');
        this.ctx.fillStyle = radialGlow;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 1. Calculate displaced grid coordinates
        const halfSize = (this.gridSize * this.gridSpacing) / 2;
        const gridPoints = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            gridPoints[i] = [];
            const x0 = i * this.gridSpacing - halfSize;
            
            for (let j = 0; j < this.gridSize; j++) {
                const z0 = j * this.gridSpacing - halfSize;
                
                // Get 3D Gerstner coordinates
                const worldPos = this.getGerstnerDisplacement(x0, z0, time);
                const proj = this.project3D(worldPos.x, worldPos.y, worldPos.z);
                
                gridPoints[i][j] = {
                    world: worldPos,
                    proj: proj
                };
            }
        }
        
        // 2. Draw Wave Polygons (Filled quads rendered back-to-front for realistic surface occlusion)
        for (let j = this.gridSize - 2; j >= 0; j--) {
            for (let i = 0; i < this.gridSize - 1; i++) {
                const p00 = gridPoints[i][j];
                const p10 = gridPoints[i+1][j];
                const p11 = gridPoints[i+1][j+1];
                const p01 = gridPoints[i][j+1];
                
                if (p00.proj.scale > 0 && p10.proj.scale > 0 && p11.proj.scale > 0 && p01.proj.scale > 0) {
                    
                    // A. Calculate normal vector of quad (cross product of diagonals)
                    const ux = p10.world.x - p00.world.x;
                    const uy = p10.world.y - p00.world.y;
                    const uz = p10.world.z - p00.world.z;
                    
                    const vx = p01.world.x - p00.world.x;
                    const vy = p01.world.y - p00.world.y;
                    const vz = p01.world.z - p00.world.z;
                    
                    // Cross product vector N
                    let nx = uy * vz - uz * vy;
                    let ny = uz * vx - ux * vz;
                    let nz = ux * vy - uy * vx;
                    
                    // Normalise N
                    const nLen = Math.sqrt(nx*nx + ny*ny + nz*nz);
                    if (nLen > 0) {
                        nx /= nLen;
                        ny /= nLen;
                        nz /= nLen;
                    }
                    
                    // B. Compute Diffuse shading from light source
                    const dotLight = nx * this.lightSource.x + ny * this.lightSource.y + nz * this.lightSource.z;
                    const diffuse = Math.max(0, dotLight);
                    
                    // C. Depth fade factor
                    const avgZ = (p00.world.z + p11.world.z) / 2;
                    const depthFactor = Math.max(0, 1.0 - (avgZ + halfSize) / (2 * halfSize));
                    
                    // D. High-contrast illumination if inside sonar sweep sector
                    const avgX = (p00.world.x + p11.world.x) / 2;
                    const angleToGrid = Math.atan2(avgZ, avgX) + Math.PI; // [0, 2PI]
                    const sweepDiff = Math.abs(this.sonarSweepAngle - angleToGrid);
                    const insideSonar = sweepDiff < 0.22 || sweepDiff > (Math.PI * 2 - 0.22);
                    
                    // E. (Lighthouse removed) — no beam illumination
                    const inBeam = false;
                    const beamFalloff = 0;
                    
                    // F. Specular highlight — tight lobe on normals facing up toward viewer
                    const viewDot = Math.max(0, ny);
                    const specular = Math.pow(viewDot, 12) * diffuse;
                    
                    // G. Crest detection for foam and bright wire edges
                    const avgY = (p00.world.y + p10.world.y + p11.world.y + p01.world.y) / 4;
                    const isCrest = avgY > 9.5;
                    
                    // Shading color composition
                    const baseR = 7;
                    const baseG = 13;
                    const baseB = 25;
                    const crestGlow = Math.max(0, (p00.world.y + 10) / 25);
                    const lightingFactor = diffuse * 0.4 + crestGlow * 0.6;
                    
                    // Beam: zeroed (no lighthouse)
                    const beamR = 0;
                    const beamG = 0;
                    const beamB = 0;
                    
                    // Specular: cyan-white glint
                    const specR = Math.floor(specular * 180);
                    const specG = Math.floor(specular * 230);
                    const specB = Math.floor(specular * 255);
                    
                    const r = Math.min(255, Math.floor(baseR + lightingFactor * (insideSonar ? 18 : 6)  + (insideSonar ? 12 : 0)) + beamR + specR);
                    const g = Math.min(255, Math.floor(baseG + lightingFactor * (insideSonar ? 90 : 38) + (insideSonar ? 45 : 0)) + beamG + specG);
                    const b = Math.min(255, Math.floor(baseB + lightingFactor * (insideSonar ? 140 : 54)+ (insideSonar ? 60 : 0)) + beamB + specB);
                    
                    const beamAlphaBoost = inBeam ? beamFalloff * 0.15 : 0;
                    const alpha = Math.min(0.92, depthFactor * (insideSonar ? 0.38 : 0.24) + beamAlphaBoost);
                    
                    // Draw filled polygon face
                    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p00.proj.x, p00.proj.y);
                    this.ctx.lineTo(p10.proj.x, p10.proj.y);
                    this.ctx.lineTo(p11.proj.x, p11.proj.y);
                    this.ctx.lineTo(p01.proj.x, p01.proj.y);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // Draw grid wire lines â€” golden in beam, cyan in sonar, teal otherwise
                    const lineAlpha = depthFactor * (insideSonar ? 0.45 : isCrest ? 0.22 : p00.world.y > 6 ? 0.14 : 0.07);
                    const beamLineBoost = inBeam ? beamFalloff * 0.25 : 0;
                    this.ctx.strokeStyle = insideSonar
                        ? `rgba(6, 182, 212, ${lineAlpha + beamLineBoost})`
                        : inBeam
                            ? `rgba(253, 200, 80, ${lineAlpha + beamLineBoost})`
                            : `rgba(13, 148, 136, ${lineAlpha})`;
                    this.ctx.lineWidth = isCrest ? 1.2 : p00.world.y > 6 ? 1.0 : 0.65;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p00.proj.x, p00.proj.y);
                    this.ctx.lineTo(p10.proj.x, p10.proj.y);
                    this.ctx.lineTo(p01.proj.x, p01.proj.y);
                    this.ctx.stroke();
                    
                    // H. Foam spray on wave crests â€” sparse bright white dots painted live
                    if (isCrest && Math.random() < 0.04) {
                        const fCx = (p00.proj.x + p10.proj.x + p11.proj.x + p01.proj.x) / 4;
                        const fCy = (p00.proj.y + p10.proj.y + p11.proj.y + p01.proj.y) / 4;
                        const fScale = p00.proj.scale;
                        const fOpacity = Math.min(0.7, crestGlow * 0.85);
                        this.ctx.beginPath();
                        this.ctx.arc(
                            fCx + (Math.random() - 0.5) * 4,
                            fCy + (Math.random() - 0.5) * 4,
                            (0.8 + Math.random() * 1.2) * fScale, 0, Math.PI * 2
                        );
                        this.ctx.fillStyle = `rgba(220, 240, 255, ${fOpacity})`;
                        this.ctx.fill();
                    }
                }
            }
        }
        
        // 2.5 â€” Cinematic Sailing Boat entering from starboard, bobbing on Gerstner waves
        // The boat sails in from the right edge (high X) and gradually moves to center.
        // As it nears the center, the site title "Kadlu Kavalu" fades in above it.
        
        if (!this.sailBoat) {
            this.sailBoat = {
                x: 480,        // Start far right
                z: 60,         // Slightly toward viewer
                speed: 0.18,   // World units per frame
                arrived: false,
                titleAlpha: 0  // Title fade progress
            };
        }
        
        const boat = this.sailBoat;
        
        // Move the boat leftward (negative X) each frame if not at destination
        if (boat.x > -80) {
            boat.x -= boat.speed;
        } else {
            boat.arrived = true;
        }
        
        // Once arrived, fade the title in
        if (boat.arrived && boat.titleAlpha < 1) {
            boat.titleAlpha = Math.min(1, boat.titleAlpha + 0.008);
        }
        
        // Wave-riding: sample Gerstner height + slope for pitch/roll
        const bh   = this.getWaveHeight(boat.x, boat.z, time);
        const bOff = 12;
        const bhL  = this.getWaveHeight(boat.x - bOff, boat.z, time);
        const bhR  = this.getWaveHeight(boat.x + bOff, boat.z, time);
        const bhF  = this.getWaveHeight(boat.x, boat.z - bOff, time);
        const bhB  = this.getWaveHeight(boat.x, boat.z + bOff, time);
        const bPitch = (bhF - bhB) / (bOff * 2); // forward tilt
        const bRoll  = (bhR - bhL) / (bOff * 2); // side tilt
        
        const pBoat = this.project3D(boat.x, bh, boat.z);
        
        if (pBoat.scale > 0) {
            const sc = pBoat.scale;
            const bx = pBoat.x;
            const by = pBoat.y;
            
            this.ctx.save();
            this.ctx.translate(bx, by);
            
            // === Hull ===
            // Sleek hull shape â€” wide midship, pointed bow (left), rounded stern (right)
            const hw = 48 * sc;  // half-width
            const hh = 10 * sc;  // hull depth
            const rollShift = bRoll * 22 * sc;
            const pitchShift = bPitch * 14 * sc;
            
            // Hull gradient â€” dark navy with a cyan shimmer at waterline
            const hullGrad = this.ctx.createLinearGradient(0, -hh * 0.5, 0, hh);
            hullGrad.addColorStop(0, '#0e2a45');
            hullGrad.addColorStop(0.4, '#0c1f33');
            hullGrad.addColorStop(1, '#051020');
            
            this.ctx.beginPath();
            // Hull points: stern(right) â†’ keel â†’ bow(left), with pitch/roll applied
            this.ctx.moveTo( hw + pitchShift,        -hh * 0.25 + rollShift);   // stern top
            this.ctx.bezierCurveTo(
                hw * 0.5 + pitchShift, hh + rollShift,
                -hw * 0.5 - pitchShift, hh - rollShift,
                -hw - pitchShift, -hh * 0.1 - rollShift   // bow top
            );
            this.ctx.bezierCurveTo(
                -hw * 0.6 - pitchShift, -hh * 0.55 - rollShift,
                hw * 0.3 + pitchShift, -hh * 0.55 + rollShift,
                hw + pitchShift, -hh * 0.25 + rollShift   // back to stern
            );
            this.ctx.closePath();
            this.ctx.fillStyle = hullGrad;
            this.ctx.fill();
            
            // Hull outline
            this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
            this.ctx.lineWidth = 1.2 * sc;
            this.ctx.stroke();
            
            // Waterline highlight stripe
            this.ctx.beginPath();
            this.ctx.moveTo(-hw - pitchShift, -hh * 0.1 - rollShift);
            this.ctx.bezierCurveTo(
                -hw * 0.3 - pitchShift, -hh * 0.45 - rollShift,
                hw * 0.4 + pitchShift,  -hh * 0.45 + rollShift,
                hw + pitchShift,        -hh * 0.25 + rollShift
            );
            this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
            this.ctx.lineWidth = 0.7 * sc;
            this.ctx.stroke();
            
            // === Wake â€” V-shaped foam trail to the right (stern) ===
            const wakeLen = 80 * sc;
            const wakeSplay = 18 * sc;
            this.ctx.save();
            this.ctx.globalAlpha = 0.18;
            const wakeGrad = this.ctx.createLinearGradient(hw, 0, hw + wakeLen, 0);
            wakeGrad.addColorStop(0, 'rgba(180, 230, 255, 0.9)');
            wakeGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
            this.ctx.fillStyle = wakeGrad;
            this.ctx.beginPath();
            this.ctx.moveTo(hw + pitchShift, rollShift);
            this.ctx.lineTo(hw + wakeLen, -wakeSplay);
            this.ctx.lineTo(hw + wakeLen,  wakeSplay);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
            
            // === Deck area ===
            this.ctx.fillStyle = 'rgba(12, 28, 48, 0.85)';
            this.ctx.beginPath();
            this.ctx.ellipse(0, -hh * 0.3, hw * 0.78, hh * 0.35, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // === Mast ===
            // Position mast 1/4 from bow (left side)
            const mastX  = -hw * 0.25 - pitchShift;
            const mastBase  = -hh * 0.4 - rollShift * 0.4;
            const mastH  = 85 * sc;   // mast height
            const mastTop = mastBase - mastH;
            
            this.ctx.strokeStyle = '#94a3b8';
            this.ctx.lineWidth = 1.8 * sc;
            this.ctx.beginPath();
            this.ctx.moveTo(mastX, mastBase);
            this.ctx.lineTo(mastX, mastTop);
            this.ctx.stroke();
            
            // Masthead light â€” small glowing dot
            const mastHeadPulse = 0.6 + 0.4 * Math.sin(time * 0.003);
            this.ctx.beginPath();
            this.ctx.arc(mastX, mastTop, 2.5 * sc, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(253, 224, 71, ${mastHeadPulse})`;
            this.ctx.fill();
            const mhGrad = this.ctx.createRadialGradient(mastX, mastTop, 0, mastX, mastTop, 8 * sc);
            mhGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
            mhGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
            this.ctx.fillStyle = mhGrad;
            this.ctx.beginPath();
            this.ctx.arc(mastX, mastTop, 8 * sc, 0, Math.PI * 2);
            this.ctx.fill();
            
            // === Main Sail (billowing to right / downwind) ===
            // Sail runs from mastTop down to the boom, bowing out to starboard (right)
            const boomEnd = hw * 0.35 + pitchShift;
            const boomY   = mastBase - mastH * 0.12;
            const sailBow = mastX + hw * 0.55;  // how far sail bellies out
            
            const sailGrad = this.ctx.createLinearGradient(mastX, mastTop, boomEnd, boomY);
            sailGrad.addColorStop(0, 'rgba(230, 245, 255, 0.90)');
            sailGrad.addColorStop(0.5, 'rgba(180, 220, 255, 0.78)');
            sailGrad.addColorStop(1, 'rgba(100, 170, 220, 0.55)');
            
            this.ctx.beginPath();
            this.ctx.moveTo(mastX, mastTop);
            this.ctx.quadraticCurveTo(sailBow, mastBase - mastH * 0.5, boomEnd, boomY);
            this.ctx.lineTo(mastX, mastBase);
            this.ctx.closePath();
            this.ctx.fillStyle = sailGrad;
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(180, 210, 240, 0.55)';
            this.ctx.lineWidth = 0.8 * sc;
            this.ctx.stroke();
            
            // Sail panel seam lines (gives it real cloth detail)
            const nSeams = 3;
            for (let si = 1; si < nSeams; si++) {
                const t = si / nSeams;
                const sx1 = mastX;
                const sy1 = mastTop + (mastBase - mastTop) * t;
                const sx2 = mastX + (boomEnd - mastX) * t;
                const sy2 = mastTop + (boomY - mastTop) * t;
                const scpx = mastX + (sailBow - mastX) * t;
                const scpy = mastBase - mastH * 0.5;
                
                this.ctx.beginPath();
                this.ctx.moveTo(sx1, sy1);
                this.ctx.quadraticCurveTo(scpx, scpy, sx2, sy2);
                this.ctx.strokeStyle = 'rgba(150, 190, 225, 0.25)';
                this.ctx.lineWidth = 0.5 * sc;
                this.ctx.stroke();
            }
            
            // === Jib sail (smaller foresail) ===
            const jibTop  = mastTop + mastH * 0.18;
            const jibBow  = -hw - pitchShift + 8 * sc;   // far bow point
            const jibBase = mastX;
            
            const jibGrad = this.ctx.createLinearGradient(jibBow, jibTop, mastX, mastBase);
            jibGrad.addColorStop(0, 'rgba(210, 235, 255, 0.75)');
            jibGrad.addColorStop(1, 'rgba(130, 180, 220, 0.45)');
            
            this.ctx.beginPath();
            this.ctx.moveTo(mastX, jibTop);
            this.ctx.lineTo(jibBow, mastBase - hh * 0.1);
            this.ctx.lineTo(mastX, mastBase);
            this.ctx.closePath();
            this.ctx.fillStyle = jibGrad;
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(170, 205, 235, 0.4)';
            this.ctx.lineWidth = 0.7 * sc;
            this.ctx.stroke();
            
            // === Rigging lines ===
            this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            this.ctx.lineWidth = 0.5 * sc;
            
            // Forestay: mast top â†’ bow
            this.ctx.beginPath();
            this.ctx.moveTo(mastX, mastTop);
            this.ctx.lineTo(-hw - pitchShift, mastBase - hh * 0.05 - rollShift);
            this.ctx.stroke();
            
            // Backstay: mast top â†’ stern
            this.ctx.beginPath();
            this.ctx.moveTo(mastX, mastTop);
            this.ctx.lineTo(hw + pitchShift, mastBase - hh * 0.15 + rollShift);
            this.ctx.stroke();
            
            // === Navigation lights ===
            // Port (left/bow) = red; Starboard (right/stern) = green
            const portPulse = 0.7 + 0.3 * Math.sin(time * 0.0025);
            const strbPulse = 0.7 + 0.3 * Math.sin(time * 0.0025 + Math.PI);
            
            this.ctx.beginPath();
            this.ctx.arc(-hw - pitchShift + 3*sc, -hh*0.05 - rollShift, 2.5*sc, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(239, 68, 68, ${portPulse})`;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(hw + pitchShift - 3*sc, -hh*0.15 + rollShift, 2.5*sc, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(34, 197, 94, ${strbPulse})`;
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        // 3. Draw Wake Particles floating on waves
        this.particles.forEach(p => {
            const h = this.getWaveHeight(p.x, p.z, time);
            const proj = this.project3D(p.x, h, p.z);
            if (proj.scale <= 0) return;
            
            // Draw floating foam
            this.ctx.beginPath();
            this.ctx.arc(proj.x, proj.y, p.size * proj.scale * 0.7, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.35 * (1.0 - Math.abs(proj.z)/halfSize)})`;
            this.ctx.fill();
        });
        
        // 4. Draw Bobbing 3D Ships with Navigation lights and active radar masts
        this.entities.forEach(ship => {
            // Find base height and surrounding offsets for pitch and roll slopes
            const h = this.getWaveHeight(ship.x, ship.z, time);
            const offset = 8;
            const hL = this.getWaveHeight(ship.x - offset, ship.z, time);
            const hR = this.getWaveHeight(ship.x + offset, ship.z, time);
            const hB = this.getWaveHeight(ship.x, ship.z - offset, time);
            const hF = this.getWaveHeight(ship.x, ship.z + offset, time);
            
            const pitch = (hF - hB) / (offset * 2);
            const roll = (hR - hL) / (offset * 2);
            
            const pShip = this.project3D(ship.x, h, ship.z);
            if (pShip.scale <= 0) return;
            
            const mScale = pShip.scale * 0.8;
            
            // Draw Distress Signal beacon ring
            if (ship.type === 'distress') {
                ship.pulse = (ship.pulse + 0.012) % 1.0;
                
                this.ctx.beginPath();
                this.ctx.arc(pShip.x, pShip.y, ship.pulse * 55 * pShip.scale, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(249, 115, 22, ${1.0 - ship.pulse})`;
                this.ctx.lineWidth = 1.6;
                this.ctx.stroke();
                
                this.ctx.beginPath();
                this.ctx.arc(pShip.x, pShip.y, 4 * pShip.scale, 0, Math.PI * 2);
                this.ctx.fillStyle = '#f97316';
                this.ctx.fill();
            }
            
            this.ctx.save();
            this.ctx.translate(pShip.x, pShip.y);
            
            // Detailed Vector Hull Drawing (Pointed tactical layout)
            this.ctx.strokeStyle = ship.color;
            this.ctx.fillStyle = '#050a14';
            this.ctx.lineWidth = 1.8;
            
            // Bow, stern, port, starboard vertices with wave rotation skew
            this.ctx.beginPath();
            this.ctx.moveTo(0, -18 * mScale);
            this.ctx.lineTo(6 * mScale + (roll * 8), -3 * mScale + (pitch * 6));
            this.ctx.lineTo(5 * mScale + (roll * 8), 13 * mScale + (pitch * 6));
            this.ctx.lineTo(-5 * mScale - (roll * 8), 13 * mScale + (pitch * 6));
            this.ctx.lineTo(-6 * mScale - (roll * 8), -3 * mScale + (pitch * 6));
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Superstructure bridge cabin block
            this.ctx.fillStyle = ship.color;
            this.ctx.fillRect(-2.5 * mScale, -1 * mScale, 5 * mScale, 7 * mScale);
            
            // Active rotating radar array line
            ship.radarAngle = (ship.radarAngle + 0.06) % (Math.PI * 2);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.0;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 2 * mScale);
            this.ctx.lineTo(Math.cos(ship.radarAngle) * 5 * mScale, 2 * mScale + Math.sin(ship.radarAngle) * 2 * mScale);
            this.ctx.stroke();
            
            // Blinking navigation warning lights (Red port, Green starboard)
            const flash = Math.floor(time / 600) % 2 === 0;
            if (flash) {
                // Red port light
                this.ctx.fillStyle = '#ef4444';
                this.ctx.beginPath();
                this.ctx.arc(-4 * mScale, -2 * mScale, 1.8, 0, Math.PI*2);
                this.ctx.fill();
                
                // Green starboard light
                this.ctx.fillStyle = '#10b981';
                this.ctx.beginPath();
                this.ctx.arc(4 * mScale, -2 * mScale, 1.8, 0, Math.PI*2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
            
            // 5. Sonar detection locks check
            const angleToShip = Math.atan2(ship.z, ship.x) + Math.PI; // [0, 2PI]
            const sweepDiff = Math.abs(this.sonarSweepAngle - angleToShip);
            
            if (sweepDiff < 0.22 || sweepDiff > (Math.PI * 2 - 0.22)) {
                // Draw target acquisition vector brackets
                this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
                this.ctx.lineWidth = 1;
                
                // Pointer connector
                this.ctx.beginPath();
                this.ctx.moveTo(pShip.x, pShip.y);
                this.ctx.lineTo(pShip.x + 24, pShip.y - 24);
                this.ctx.lineTo(pShip.x + 115, pShip.y - 24);
                this.ctx.stroke();
                
                // Lock telemetry data next to ship
                this.ctx.fillStyle = '#f8fafc';
                this.ctx.font = 'bold 8px monospace';
                this.ctx.fillText(ship.name, pShip.x + 28, pShip.y - 29);
                
                this.ctx.fillStyle = ship.color;
                this.ctx.font = '6px monospace';
                this.ctx.fillText(`MMSI: ${ship.mmsi} | SPEED: ${ship.speed}`, pShip.x + 28, pShip.y - 17);
            }
        });
        
        // 5. Draw Sonar Scan sweeping light cone
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.rotate(this.sonarSweepAngle);
        
        const sweepGrad = this.ctx.createLinearGradient(0, 0, this.fov * 0.9, 0);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
        sweepGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
        sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        this.ctx.strokeStyle = sweepGrad;
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.fov * 0.65, 0);
        this.ctx.stroke();
        this.ctx.restore();
        
        // 6. Real-time Cursor Targeting Reticle projected onto 3D wave plane
        // Find nearest wave grid point to the mouse cursor
        let closestPt = null;
        let minDist = 9999;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const pt = gridPoints[i][j];
                if (pt.proj.scale > 0) {
                    const d = Math.hypot(pt.proj.x - this.mouseX, pt.proj.y - this.mouseY);
                    if (d < minDist && d < 45) {
                        minDist = d;
                        closestPt = pt;
                    }
                }
            }
        }
        
        if (closestPt) {
            // Draw neon target cursor hovering on wave surface
            this.ctx.strokeStyle = '#06b6d4';
            this.ctx.lineWidth = 1.0;
            
            // Reticle circle
            this.ctx.beginPath();
            this.ctx.arc(closestPt.proj.x, closestPt.proj.y, 8, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // crosshairs
            this.ctx.beginPath();
            this.ctx.moveTo(closestPt.proj.x - 12, closestPt.proj.y);
            this.ctx.lineTo(closestPt.proj.x - 4, closestPt.proj.y);
            this.ctx.moveTo(closestPt.proj.x + 4, closestPt.proj.y);
            this.ctx.lineTo(closestPt.proj.x + 12, closestPt.proj.y);
            this.ctx.moveTo(closestPt.proj.x, closestPt.proj.y - 12);
            this.ctx.lineTo(closestPt.proj.x, closestPt.proj.y - 4);
            this.ctx.moveTo(closestPt.proj.x, closestPt.proj.y + 4);
            this.ctx.lineTo(closestPt.proj.x, closestPt.proj.y + 12);
            this.ctx.stroke();
            
            // Print GPS lock coordinates
            const calcLat = (9.2 + closestPt.world.z * 0.005).toFixed(4);
            const calcLon = (78.7 + closestPt.world.x * 0.005).toFixed(4);
            
            this.ctx.fillStyle = '#06b6d4';
            this.ctx.font = '6px monospace';
            this.ctx.fillText(`TARGET LOCK: ${calcLat}Â°N / ${calcLon}Â°E`, closestPt.proj.x + 15, closestPt.proj.y + 3);
        }
    }
}

function triggerLoginFlow() {
    const btn = document.getElementById('btn-login');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        // Transition instantly to dashboard workstation
        document.body.className = 'view-dashboard dark-theme'; // Default workstation starts dark
        triggerMapResize();
        
        // Voice boot greeting after short delay to allow voices to load
        setTimeout(() => {
            const aisLostVessels = vessels.filter(v => v.aisStatus === 'Lost');
            const suspiciousVessels = vessels.filter(v => v.type === 'suspicious');
            const distressVessels = vessels.filter(v => v.type === 'distress');
            
            let greeting = `Kadlu Kavalu Maritime Surveillance online. `;
            greeting += `Tracking ${vessels.length} vessels globally. `;
            
            if (aisLostVessels.length > 0) {
                greeting += `Warning: ${aisLostVessels.length} vessel${aisLostVessels.length > 1 ? 's' : ''} with lost AIS signal. `;
            }
            if (suspiciousVessels.length > 0) {
                greeting += `Alert: ${suspiciousVessels.length} unidentified or suspicious contact${suspiciousVessels.length > 1 ? 's' : ''} detected. `;
            }
            if (distressVessels.length > 0) {
                greeting += `Critical: ${distressVessels.length} distress beacon${distressVessels.length > 1 ? 's' : ''} active. Immediate response required.`;
            }
            
            speakAnnouncement(greeting, 'normal');
        }, 800);
    });
}

// ==========================================================================
// 4. MAP DRAWING & INTERACTION LAYER (Canvas GIS Engine)
// ==========================================================================

let worldMapSvgText = null;
const mapImagesCache = {
    'dark-ocean': null,
    'dark-satellite': null,
    'light-ocean': null,
    'light-satellite': null
};

function cacheWorldMapImages() {
    if (!worldMapSvgText) return;
    
    const styles = [
        { key: 'dark-ocean', land: '#141e30', coast: '#1b2d4a' },
        { key: 'dark-satellite', land: '#062f17', coast: 'rgba(16, 185, 129, 0.4)' },
        { key: 'light-ocean', land: '#e2e8f0', coast: '#cbd5e1' },
        { key: 'light-satellite', land: '#cbd5e1', coast: '#94a3b8' }
    ];
    
    styles.forEach(style => {
        const svgTagIndex = worldMapSvgText.indexOf('<svg');
        if (svgTagIndex === -1) return;
        const svgOpenIndex = worldMapSvgText.indexOf('>', svgTagIndex);
        if (svgOpenIndex === -1) return;
        
        const styleTag = `<style>path { fill: ${style.land} !important; stroke: ${style.coast} !important; stroke-width: 0.5px !important; }</style>`;
        const modifiedSvg = worldMapSvgText.slice(0, svgOpenIndex + 1) + styleTag + worldMapSvgText.slice(svgOpenIndex + 1);
        
        const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
            if (mapRenderer) mapRenderer.draw(0);
        };
        img.src = url;
        mapImagesCache[style.key] = img;
    });
}

async function loadWorldMapSvg() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/okviz/synoptic-panel-maps/main/geo/world.svg');
        if (response.ok) {
            worldMapSvgText = await response.text();
            cacheWorldMapImages();
        }
    } catch (e) {
        console.warn("Failed to fetch world map SVG, using regional fallback", e);
    }
}

const MAP_COUNTRIES = [
    { code: "IN", name: "INDIA", lon: 79.0, lat: 21.0 },
    { code: "LK", name: "SRI LANKA", lon: 80.7, lat: 7.8 },
    { code: "MV", name: "MALDIVES", lon: 73.0, lat: 3.2 },
    { code: "CN", name: "CHINA", lon: 104.0, lat: 35.0 },
    { code: "IT", name: "ITALY", lon: 12.5, lat: 41.8 },
    { code: "FR", name: "FRANCE", lon: 2.2, lat: 46.2 },
    { code: "DE", name: "GERMANY", lon: 10.4, lat: 51.1 },
    { code: "CH", name: "SWITZERLAND", lon: 8.2, lat: 46.8 },
    { code: "PA", name: "PANAMA", lon: -80.0, lat: 8.5 },
    { code: "LR", name: "LIBERIA", lon: -9.5, lat: 6.4 },
    { code: "US", name: "USA", lon: -98.0, lat: 39.5 },
    { code: "AU", name: "AUSTRALIA", lon: 133.0, lat: -25.0 },
    { code: "BR", name: "BRAZIL", lon: -51.9, lat: -14.2 },
    { code: "ZA", name: "SOUTH AFRICA", lon: 25.0, lat: -30.0 },
    { code: "JP", name: "JAPAN", lon: 138.2, lat: 36.2 }
];

function drawCountryFlag(ctx, x, y, w, h, code) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, w, h);
    
    if (code === 'IN') {
        const sh = h / 3;
        ctx.fillStyle = '#FF9933';
        ctx.fillRect(x, y, w, sh);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y + sh, w, sh);
        ctx.fillStyle = '#138808';
        ctx.fillRect(x, y + 2 * sh, w, sh);
        ctx.fillStyle = '#000080';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, sh / 3, 0, Math.PI * 2);
        ctx.fill();
    } 
    else if (code === 'IT') {
        const sw = w / 3;
        ctx.fillStyle = '#009246';
        ctx.fillRect(x, y, sw, h);
        ctx.fillStyle = '#F1F2F1';
        ctx.fillRect(x + sw, y, sw, h);
        ctx.fillStyle = '#CE2B37';
        ctx.fillRect(x + 2 * sw, y, sw, h);
    }
    else if (code === 'FR') {
        const sw = w / 3;
        ctx.fillStyle = '#002395';
        ctx.fillRect(x, y, sw, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + sw, y, sw, h);
        ctx.fillStyle = '#ED2939';
        ctx.fillRect(x + 2 * sw, y, sw, h);
    }
    else if (code === 'DE') {
        const sh = h / 3;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, sh);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x, y + sh, w, sh);
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(x, y + 2 * sh, w, sh);
    }
    else if (code === 'CH') {
        ctx.fillStyle = '#D80027';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w / 2 - w / 10, y + h / 4, w / 5, h / 2);
        ctx.fillRect(x + w / 4, y + h / 2 - h / 10, w / 2, h / 5);
    }
    else if (code === 'CN') {
        ctx.fillStyle = '#DE2910';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFDE00';
        ctx.beginPath();
        ctx.arc(x + w / 4, y + h / 4, w / 8, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (code === 'LK') {
        ctx.fillStyle = '#8D153B';
        ctx.fillRect(x, y, w, h);
        const sw = w / 5;
        ctx.fillStyle = '#F77F00';
        ctx.fillRect(x, y, sw, h);
        ctx.fillStyle = '#007A33';
        ctx.fillRect(x + sw, y, sw, h);
        ctx.fillStyle = '#FFBE29';
        ctx.fillRect(x + 2 * sw, y + h / 4, w - 2.5 * sw, h / 2);
    }
    else if (code === 'MV') {
        ctx.fillStyle = '#D21034';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#007E3A';
        ctx.fillRect(x + w / 6, y + h / 6, w * 2 / 3, h * 2 / 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 8, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (code === 'PA') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#0052B4';
        ctx.fillRect(x, y + h / 2, w / 2, h / 2);
        ctx.fillStyle = '#D21034';
        ctx.fillRect(x + w / 2, y, w / 2, h / 2);
    }
    else if (code === 'LR') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#D21034';
        const sh = h / 5;
        ctx.fillRect(x, y, w, sh);
        ctx.fillRect(x, y + 2 * sh, w, sh);
        ctx.fillRect(x, y + 4 * sh, w, sh);
        ctx.fillStyle = '#002F6C';
        ctx.fillRect(x, y, w / 2, h / 2);
    }
    else if (code === 'US') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#B22234';
        const sh = h / 5;
        ctx.fillRect(x, y, w, sh);
        ctx.fillRect(x, y + 2 * sh, w, sh);
        ctx.fillRect(x, y + 4 * sh, w, sh);
        ctx.fillStyle = '#3C3B6E';
        ctx.fillRect(x, y, w * 0.45, h * 0.55);
    }
    else if (code === 'JP') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#BC002D';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, h / 3.5, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (code === 'BR') {
        ctx.fillStyle = '#009739';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FEDF00';
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + 1);
        ctx.lineTo(x + w - 1, y + h / 2);
        ctx.lineTo(x + w / 2, y + h - 1);
        ctx.lineTo(x + 1, y + h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#012169';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, h / 4.5, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (code === 'ZA') {
        ctx.fillStyle = '#E23D28';
        ctx.fillRect(x, y, w, h / 2);
        ctx.fillStyle = '#002395';
        ctx.fillRect(x, y + h / 2, w, h / 2);
        ctx.fillStyle = '#007A4C';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w / 2, y + h / 2);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
    }
    else if (code === 'AU') {
        ctx.fillStyle = '#00008B';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w * 0.45, h * 0.5);
        ctx.fillStyle = '#B22234';
        ctx.fillRect(x + w * 0.18, y, w * 0.09, h * 0.5);
        ctx.fillRect(x, y + h * 0.2, w * 0.45, h * 0.1);
    }
    else {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
}

function drawSternFlag(ctx, sternY, code) {
    if (!code || code === '??') return;
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, sternY);
    ctx.lineTo(2.5, sternY + 2.5);
    ctx.stroke();
    
    drawCountryFlag(ctx, 2.5, sternY + 2.5, 7.5, 5, code);
    ctx.restore();
}

class MapSurveillanceRenderer {
    constructor() {
        this.canvas = document.getElementById('map-canvas');
        this.container = document.getElementById('map-container');
        this.ctx = this.canvas.getContext('2d');
        
        // Viewport navigation parameters
        this.zoom = 12.0;
        this.panX = 0;
        this.panY = 0;
        
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        
        this.selectedVesselId = null;
        this.hoveredVessel = null;
        this.mapStyle = 'ocean'; // Default mode
        
        this.dispatchSim = {
            active: false,
            targetVesselId: null,
            phase: 0,
            timer: 0,
            missionType: 'intercept', // 'intercept' | 'rescue'
            asset1: {
                name: "Interceptor C-421",
                class: "Fast Patrol Vessel",
                speed: "32 kn",
                startLon: 78.5, startLat: 9.3,
                lon: 78.5, lat: 9.3,
                progress: 0,
                failed: false
            },
            asset2: {
                name: "ICGS SAMARATH",
                class: "Offshore Patrol Vessel",
                speed: "26 kn",
                startLon: 80.3, startLat: 13.1,
                lon: 80.3, lat: 13.1,
                progress: 0,
                success: false
            }
        };
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupListeners();
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        this.ctx.scale(dpr, dpr);
    }
    
    gpsToScreen(lon, lat) {
        const pctX = (lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon);
        const pctY = 1.0 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseX = pctX * this.width;
        const baseY = pctY * this.height;
        
        return {
            x: (baseX - centerX) * this.zoom + centerX + this.panX,
            y: (baseY - centerY) * this.zoom + centerY + this.panY
        };
    }
    
    screenToGps(x, y) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        const baseX = (x - this.panX - centerX) / this.zoom + centerX;
        const baseY = (y - this.panY - centerY) / this.zoom + centerY;
        
        return {
            lon: (baseX / this.width) * (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) + MAP_BOUNDS.minLon,
            lat: (1.0 - (baseY / this.height)) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) + MAP_BOUNDS.minLat
        };
    }
    
    setupListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isPanning = true;
            this.startX = e.clientX - this.panX;
            this.startY = e.clientY - this.panY;
        });
        
        window.addEventListener('mouseup', () => this.isPanning = false);
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (this.isPanning) {
                this.panX = e.clientX - this.startX;
                this.panY = e.clientY - this.startY;
                return;
            }
            
            // Update GPS Coordinates HUD
            const gps = this.screenToGps(mouseX, mouseY);
            document.getElementById('map-coords').textContent = formatCoords(gps.lat, gps.lon);
            
            this.checkHover(mouseX, mouseY);
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const gpsBefore = this.screenToGps(mouseX, mouseY);
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
            this.zoom = Math.min(Math.max(this.zoom * zoomFactor, 0.4), 30.0);
            
            const screenAfter = this.gpsToScreen(gpsBefore.lon, gpsBefore.lat);
            this.panX += mouseX - screenAfter.x;
            this.panY += mouseY - screenAfter.y;
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (Math.abs(e.clientX - (this.startX + this.panX)) > 3 || 
                Math.abs(e.clientY - (this.startY + this.panY)) > 3) {
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            this.selectVesselAt(e.clientX - rect.left, e.clientY - rect.top);
        });
    }
    
    checkHover(mouseX, mouseY) {
        let foundHover = null;
        const activeVessels = getFilteredVessels();
        
        for (const vessel of activeVessels) {
            if (this.selectedVesselId && vessel.id !== this.selectedVesselId) {
                continue;
            }
            const pos = this.gpsToScreen(vessel.lon, vessel.lat);
            if (Math.hypot(pos.x - mouseX, pos.y - mouseY) < 8) {
                foundHover = vessel;
                break;
            }
        }
        
        if (this.hoveredVessel !== foundHover) {
            this.hoveredVessel = foundHover;
            this.canvas.style.cursor = foundHover ? 'pointer' : 'grab';
        }
    }
    
    selectVesselAt(mouseX, mouseY) {
        let foundVessel = null;
        const activeVessels = getFilteredVessels();
        
        for (const vessel of activeVessels) {
            if (this.selectedVesselId && vessel.id !== this.selectedVesselId) {
                continue;
            }
            const pos = this.gpsToScreen(vessel.lon, vessel.lat);
            if (Math.hypot(pos.x - mouseX, pos.y - mouseY) < 10) {
                foundVessel = vessel;
                break;
            }
        }
        
        setSelectedVesselGlobal(foundVessel ? foundVessel.id : null);
    }
    
    centerOn(lon, lat) {
        const projected = this.gpsToScreen(lon, lat);
        this.panX += this.width / 2 - projected.x;
        this.panY += this.height / 2 - projected.y;
    }
    
    startDispatchSimulation(targetId) {
        this.dispatchSim.active = true;
        this.dispatchSim.targetVesselId = targetId;
        this.dispatchSim.phase = 1;
        this.dispatchSim.timer = 0;
        
        const target = vessels.find(v => v.id === targetId);
        if (!target) return;
        
        // Set asset 1 start position: offset SW from target (simulates Tuticorin coast)
        const a1StartLon = target.lon - 4.5;
        const a1StartLat = target.lat - 2.5;
        this.dispatchSim.asset1.startLon = a1StartLon;
        this.dispatchSim.asset1.startLat = a1StartLat;
        this.dispatchSim.asset1.lon = a1StartLon;
        this.dispatchSim.asset1.lat = a1StartLat;
        this.dispatchSim.asset1.progress = 0;
        this.dispatchSim.asset1.failed = false;
        
        // Set asset 2 start position: offset NE from target (simulates Chennai / alternate base)
        const a2StartLon = target.lon + 5.0;
        const a2StartLat = target.lat + 3.5;
        this.dispatchSim.asset2.startLon = a2StartLon;
        this.dispatchSim.asset2.startLat = a2StartLat;
        this.dispatchSim.asset2.lon = a2StartLon;
        this.dispatchSim.asset2.lat = a2StartLat;
        this.dispatchSim.asset2.progress = 0;
        this.dispatchSim.asset2.success = false;
        
        const targetName = target.name;
        const isRescue = target.type === 'distress';
        this.dispatchSim.missionType = isRescue ? 'rescue' : 'intercept';
        
        if (isRescue) {
            this.dispatchSim.asset1.name = "Rescue Tug SAMUDRA SHAKTI";
            this.dispatchSim.asset1.class = "Ocean Rescue Tug";
            this.dispatchSim.asset2.name = "SAR Cutter VARUNA";
            this.dispatchSim.asset2.class = "Rapid Response SAR Vessel";
        } else {
            this.dispatchSim.asset1.name = "Interceptor C-421";
            this.dispatchSim.asset1.class = "Fast Patrol Vessel";
            this.dispatchSim.asset2.name = "ICGS SAMARATH";
            this.dispatchSim.asset2.class = "Offshore Patrol Vessel";
        }
        
        updateDispatchUI();
    }
    
    draw(timestamp) {
        const style = getComputedStyle(this.container);
        const mapBg = style.getPropertyValue('--map-bg').trim();
        const mapGrid = style.getPropertyValue('--map-grid').trim();
        const mapLand = style.getPropertyValue('--map-land').trim();
        const mapCoast = style.getPropertyValue('--map-coast').trim();
        const mapEez = style.getPropertyValue('--map-eez').trim();
        const accentColor = style.getPropertyValue('--accent').trim();
        const dangerColor = style.getPropertyValue('--danger').trim();
        const warningColor = style.getPropertyValue('--warning').trim();
        const successColor = style.getPropertyValue('--success').trim();
        const isDark = document.body.classList.contains('dark-theme');
        const isSatellite = (this.mapStyle === 'satellite');
        const mapNeedsLightText = isDark || isSatellite;
        
        const drawnLabelRects = [];
        
        // 1. Draw Water
        if (isSatellite) {
            // Dark satellite ocean radial gradient (deep sea trenches to lighter coasts)
            const oceanGrad = this.ctx.createRadialGradient(this.width/2, this.height/2, 10, this.width/2, this.height/2, this.width * 0.8);
            oceanGrad.addColorStop(0, '#020617'); // Darkest abyss
            oceanGrad.addColorStop(0.4, '#070f22'); 
            oceanGrad.addColorStop(0.8, '#0b162c'); // Deep ocean shelf
            oceanGrad.addColorStop(1, '#111e38'); // Shallow coastal waters
            this.ctx.fillStyle = oceanGrad;
        } else {
            this.ctx.fillStyle = mapBg;
        }
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 2. Draw Lat/Lon Grid lines
        this.ctx.strokeStyle = isSatellite ? 'rgba(16, 185, 129, 0.08)' : mapGrid; // Cyber-green coordinates on satellite
        this.ctx.lineWidth = 0.5;
        this.ctx.fillStyle = isSatellite ? '#10b981' : (mapNeedsLightText ? '#94a3b8' : '#475569');
        this.ctx.font = '9px monospace';
        
        // Longitude lines
        for (let lon = -180; lon <= 180; lon += 20) {
            const start = this.gpsToScreen(lon, 0);
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, 0);
            this.ctx.lineTo(start.x, this.height);
            this.ctx.stroke();
            
            const dir = lon >= 0 ? 'E' : 'W';
            const val = Math.abs(lon);
            this.ctx.fillText(`${val}°${dir}`, start.x + 4, this.height - 8);
        }
        
        // Latitude lines
        for (let lat = -80; lat <= 80; lat += 20) {
            const start = this.gpsToScreen(0, lat);
            this.ctx.beginPath();
            this.ctx.moveTo(0, start.y);
            this.ctx.lineTo(this.width, start.y);
            this.ctx.stroke();
            
            const dir = lat >= 0 ? 'N' : 'S';
            const val = Math.abs(lat);
            this.ctx.fillText(`${val}°${dir}`, 8, start.y - 4);
        }
        
        // 2.5 Draw Background SLOC (Sea Lines of Communication) Highways
        this.ctx.save();
        this.ctx.strokeStyle = isSatellite ? 'rgba(56, 189, 248, 0.08)' : 'rgba(6, 182, 212, 0.12)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([8, 12]);
        
        const drawSloc = (pts) => {
            this.ctx.beginPath();
            pts.forEach((pt, idx) => {
                const pos = this.gpsToScreen(pt.lon, pt.lat);
                if (idx === 0) this.ctx.moveTo(pos.x, pos.y);
                else this.ctx.lineTo(pos.x, pos.y);
            });
            this.ctx.stroke();
        };
        
        // SLOC Lane 1 (International Transit Channel: Suez - Malacca)
        drawSloc([{lon: 64, lat: 6}, {lon: 73.0, lat: 6.5}, {lon: 79.8, lat: 5.5}, {lon: 90.0, lat: 5.8}, {lon: 96, lat: 5.5}]);
        // SLOC Lane 2 (Arabian Sea - Mumbai Corridor)
        drawSloc([{lon: 72.8, lat: 19.0}, {lon: 72.5, lat: 14.0}, {lon: 73.0, lat: 10.0}, {lon: 79.8, lat: 5.5}]);
        // SLOC Lane 3 (Eastern Bay of Bengal highway)
        drawSloc([{lon: 79.8, lat: 5.5}, {lon: 80.3, lat: 13.1}, {lon: 83.3, lat: 17.7}, {lon: 88.2, lat: 22.0}]);
        
        this.ctx.restore();
        
        // 3. Draw EEZ
        this.ctx.beginPath();
        this.ctx.strokeStyle = isSatellite ? 'rgba(6, 182, 212, 0.65)' : mapEez;
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([6, 4]);
        indianEEZ.forEach((pt, idx) => {
            const pos = this.gpsToScreen(pt.lon, pt.lat);
            if (idx === 0) this.ctx.moveTo(pos.x, pos.y);
            else this.ctx.lineTo(pos.x, pos.y);
        });
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // EEZ label
        const eezLabelPos = this.gpsToScreen(69.0, 12.0);
        this.ctx.fillStyle = isSatellite ? 'rgba(6, 182, 212, 0.75)' : (mapNeedsLightText ? 'rgba(14, 116, 144, 0.6)' : 'rgba(37, 99, 235, 0.65)');
        this.ctx.font = 'bold 8px var(--font-heading)';
        this.ctx.fillText("EXCLUSIVE ECONOMIC ZONE (200 NM)", eezLabelPos.x, eezLabelPos.y);
        
        // 4. Draw Geofences
        GEOFENCES.forEach(geo => {
            let stroke = style.getPropertyValue(`--map-${geo.type}-stroke`).trim();
            let fill = style.getPropertyValue(`--map-${geo.type}-fill`).trim();
            
            if (isSatellite) {
                // Brighter glowing paths for satellite dark imagery
                if (geo.type === 'military') {
                    stroke = '#ef4444';
                    fill = 'rgba(239, 68, 68, 0.05)';
                } else if (geo.type === 'ecological') {
                    stroke = '#10b981';
                    fill = 'rgba(16, 185, 129, 0.04)';
                } else if (geo.type === 'fishing') {
                    stroke = '#f59e0b';
                    fill = 'rgba(245, 158, 11, 0.03)';
                }
            }
            
            this.ctx.beginPath();
            geo.polygon.forEach((pt, idx) => {
                const pos = this.gpsToScreen(pt.lon, pt.lat);
                if (idx === 0) this.ctx.moveTo(pos.x, pos.y);
                else this.ctx.lineTo(pos.x, pos.y);
            });
            this.ctx.closePath();
            this.ctx.fillStyle = fill;
            
            this.ctx.fill();
            this.ctx.strokeStyle = stroke;
            this.ctx.lineWidth = 1.2;
            if (geo.type === 'military') this.ctx.setLineDash([4, 2]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            const labelPos = this.gpsToScreen(geo.polygon[0].lon + 0.2, geo.polygon[0].lat - 0.2);
            this.ctx.fillStyle = stroke;
            this.ctx.font = 'bold 8px var(--font-heading)';
            this.ctx.fillText(geo.id === 'geo-mil' ? "ZONE ALPHA (MILITARY)" : geo.id === 'geo-eco' ? "SANCTUARY" : "FISHING AREA", labelPos.x, labelPos.y);
        });
        
        // 5. Draw Land coastlines
        let drawnWorldMap = false;
        const cacheKey = `${isDark ? 'dark' : 'light'}-${this.mapStyle}`;
        const mapImg = mapImagesCache[cacheKey];
        if (mapImg && mapImg.complete && mapImg.naturalWidth !== 0) {
            try {
                const topLeft = this.gpsToScreen(-180, 90);
                const bottomRight = this.gpsToScreen(180, -90);
                this.ctx.drawImage(mapImg, topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
                drawnWorldMap = true;
            } catch (e) {
                console.warn("Failed to draw world map SVG, using fallback", e);
                drawnWorldMap = false;
            }
        }
        
        if (!drawnWorldMap) {
            // Regional Fallback
            if (isSatellite) {
                // High-fidelity dark satellite landmass gradient
                const landGrad = this.ctx.createLinearGradient(0, 0, this.width, this.height);
                landGrad.addColorStop(0, '#062f17'); // Dark pine forest
                landGrad.addColorStop(0.35, '#052e16'); // Forest vegetation
                landGrad.addColorStop(0.7, '#1c1917'); // Mountainous rocky soil
                landGrad.addColorStop(1, '#292524'); // Arid desert stone
                this.ctx.fillStyle = landGrad;
                
                this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; // Glowing satellite radar coastline green
                this.ctx.lineWidth = 1.2;
            } else {
                this.ctx.fillStyle = mapLand;
                this.ctx.strokeStyle = mapCoast;
                this.ctx.lineWidth = 1.0;
            }
            
            // Mainland India
            this.ctx.beginPath();
            mainlandIndia.forEach((pt, idx) => {
                const pos = this.gpsToScreen(pt.lon, pt.lat);
                if (idx === 0) this.ctx.moveTo(pos.x, pos.y);
                else this.ctx.lineTo(pos.x, pos.y);
            });
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Sri Lanka
            this.ctx.beginPath();
            sriLanka.forEach((pt, idx) => {
                const pos = this.gpsToScreen(pt.lon, pt.lat);
                if (idx === 0) this.ctx.moveTo(pos.x, pos.y);
                else this.ctx.lineTo(pos.x, pos.y);
            });
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        // Draw cloud weather overlay if in Satellite view
        if (isSatellite) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'; // Fluffy satellite weather clouds
            const cloudOffset1 = (timestamp / 10000) % 150;
            const cloudOffset2 = (timestamp / 8000) % 120;
            
            // Cloud cluster 1 (drifting over Southern India)
            const c1 = this.gpsToScreen(72.0, 10.0);
            this.ctx.beginPath();
            this.ctx.arc(c1.x + cloudOffset1, c1.y, 45, 0, Math.PI * 2);
            this.ctx.arc(c1.x + cloudOffset1 + 30, c1.y + 10, 60, 0, Math.PI * 2);
            this.ctx.arc(c1.x + cloudOffset1 - 25, c1.y - 15, 35, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Cloud cluster 2 (drifting over Bay of Bengal)
            const c2 = this.gpsToScreen(86.0, 15.0);
            this.ctx.beginPath();
            this.ctx.arc(c2.x - cloudOffset2, c2.y, 70, 0, Math.PI * 2);
            this.ctx.arc(c2.x - cloudOffset2 + 40, c2.y - 15, 50, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Islands
        if (!drawnWorldMap) {
            const drawIslands = (islands) => {
                islands.forEach(isl => {
                    const pos = this.gpsToScreen(isl.lon, isl.lat);
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, 2.2 * this.zoom, 0, Math.PI * 2);
                    this.ctx.fillStyle = mapCoast;
                    this.ctx.fill();
                    
                    if (this.zoom > 16.0) {
                        this.ctx.fillStyle = mapNeedsLightText ? '#cbd5e1' : '#334155';
                        this.ctx.font = '7px var(--font-body)';
                        this.ctx.fillText(isl.label, pos.x + 5, pos.y + 2);
                    }
                });
            };
            drawIslands(lakshadweep);
            drawIslands(maldives);
            drawIslands(andamanNicobar);
        }
        
        // Ports
        PORTS.forEach(port => {
            const pos = this.gpsToScreen(port.lon, port.lat);
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = mapNeedsLightText ? '#ffffff' : '#0f172a';
            this.ctx.fill();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = accentColor;
            this.ctx.stroke();
            
            if (this.zoom > 10.0) {
                this.ctx.fillStyle = mapNeedsLightText ? '#cbd5e1' : '#334155';
                this.ctx.font = 'bold 8px var(--font-body)';
                this.ctx.fillText(port.name, pos.x + 6, pos.y + 3);
            }
        });
        
        // Draw Country Name labels and Flags on the map
        if (this.zoom > 1.5) {
            MAP_COUNTRIES.forEach(country => {
                const pos = this.gpsToScreen(country.lon, country.lat);
                const fw = 14;
                const fh = 9;
                drawCountryFlag(this.ctx, pos.x - fw / 2, pos.y - 12, fw, fh, country.code);
                
                this.ctx.save();
                this.ctx.textAlign = 'center';
                this.ctx.font = 'bold 8px var(--font-heading)';
                
                if (mapNeedsLightText) {
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.fillStyle = '#ffffff';
                } else {
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.fillStyle = '#0f172a';
                }
                this.ctx.lineWidth = 2.5;
                this.ctx.strokeText(country.name, pos.x, pos.y + 4);
                this.ctx.fillText(country.name, pos.x, pos.y + 4);
                this.ctx.restore();
            });
        }
        
        // ── Geographic Feature Labels ──────────────────────────────────────────
        // Continent names, Oceans, Seas, Straits, Gulfs — always drawn (zoom gated)
        {
            const mapText = (text, lon, lat, opts = {}) => {
                const pos = this.gpsToScreen(lon, lat);
                const { font = '9px var(--font-heading)', color = null, spacing = '0em', align = 'center', opacity = 1.0, italic = false } = opts;
                this.ctx.save();
                this.ctx.textAlign = align;
                this.ctx.globalAlpha = 1.0; // Force full solid opacity for maximum contrast
                
                let fillCol, strokeCol;
                if (mapNeedsLightText) {
                    fillCol = '#ffffff';
                    strokeCol = '#000000';
                } else {
                    fillCol = '#0f172a';
                    strokeCol = '#ffffff';
                }
                
                this.ctx.font = `${italic ? 'italic ' : ''}${font}`;
                this.ctx.letterSpacing = spacing;
                
                // Draw text stroke for ultimate legibility over any background texture
                this.ctx.strokeStyle = strokeCol;
                this.ctx.lineWidth = 2.5;
                this.ctx.strokeText(text, pos.x, pos.y);
                
                this.ctx.fillStyle = fillCol;
                this.ctx.fillText(text, pos.x, pos.y);
                this.ctx.restore();
            };

            // Helper for ocean / water labels (slightly italic, spaced, cyan-tinted)
            const waterLabel = (text, lon, lat, fontSize = 11, opacity = 1.0) => {
                const pos = this.gpsToScreen(lon, lat);
                this.ctx.save();
                this.ctx.textAlign = 'center';
                this.ctx.globalAlpha = 1.0; // Force full solid opacity for maximum contrast
                
                let fillCol, strokeCol;
                if (mapNeedsLightText) {
                    fillCol = '#00f0ff';
                    strokeCol = '#000000';
                } else {
                    fillCol = '#0c4a6e'; // Rich navy blue
                    strokeCol = '#ffffff';
                }
                
                this.ctx.font = `italic bold ${fontSize}px var(--font-heading)`;
                this.ctx.letterSpacing = '0.22em';
                
                // Draw text stroke
                this.ctx.strokeStyle = strokeCol;
                this.ctx.lineWidth = 2.5;
                this.ctx.strokeText(text, pos.x, pos.y);
                
                this.ctx.fillStyle = fillCol;
                this.ctx.fillText(text, pos.x, pos.y);
                this.ctx.restore();
            };

            // ── CONTINENT NAMES ────────────────────────────────────────────────
            if (this.zoom > 0.45) {
                const continentOpts = {
                    font: 'bold 13px var(--font-heading)',
                    spacing: '0.28em',
                    opacity: 0.6,
                    color: mapNeedsLightText ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.5)',
                    shadowColor: 'rgba(0,0,0,0.6)',
                    shadowBlur: 6
                };
                mapText('NORTH AMERICA',   -100.0,  54.0,  continentOpts);
                mapText('SOUTH AMERICA',    -58.0, -15.0,  continentOpts);
                mapText('EUROPE',            14.0,  52.5,  continentOpts);
                mapText('AFRICA',            22.0,   5.0,  continentOpts);
                mapText('ASIA',              87.0,  47.0,  continentOpts);
                mapText('AUSTRALIA',        133.0, -26.5,  continentOpts);
                mapText('ANTARCTICA',         0.0, -80.0,  continentOpts);
            }

            // ── OCEAN NAMES ────────────────────────────────────────────────────
            if (this.zoom > 0.42) {
                waterLabel('PACIFIC  OCEAN',        -155.0,   8.0, 13, 0.7);
                waterLabel('PACIFIC  OCEAN',        -140.0, -28.0, 11, 0.6);
                waterLabel('ATLANTIC  OCEAN',        -35.0,  20.0, 13, 0.7);
                waterLabel('ATLANTIC  OCEAN',        -20.0, -32.0, 11, 0.6);
                waterLabel('INDIAN  OCEAN',           73.0, -20.0, 13, 0.7);
                waterLabel('ARCTIC  OCEAN',            0.0,  85.0, 11, 0.6);
                waterLabel('SOUTHERN  OCEAN',          0.0, -60.0, 11, 0.6);
            }

            // ── SEA NAMES ──────────────────────────────────────────────────────
            if (this.zoom > 0.9) {
                waterLabel('NORTH SEA',             3.0,  56.5,  9, 0.7);
                waterLabel('BALTIC SEA',           19.0,  57.8,  9, 0.7);
                waterLabel('MEDITERRANEAN SEA',    18.0,  37.5,  9, 0.7);
                waterLabel('BLACK SEA',            33.5,  43.2,  8, 0.7);
                waterLabel('CASPIAN SEA',          51.0,  42.5,  8, 0.7);
                waterLabel('RED SEA',              38.5,  20.5,  8, 0.7);
                waterLabel('ARABIAN SEA',          63.0,  15.0,  9, 0.7);
                waterLabel('BAY OF BENGAL',        86.0,  14.0,  9, 0.7);
                waterLabel('SOUTH CHINA SEA',     112.5,  13.5,  9, 0.7);
                waterLabel('EAST CHINA SEA',      124.5,  29.0,  8, 0.65);
                waterLabel('SEA OF JAPAN',        135.0,  40.5,  8, 0.65);
                waterLabel('PHILIPPINE SEA',      133.0,  18.0,  9, 0.65);
                waterLabel('CORAL SEA',           155.0, -18.0,  9, 0.65);
                waterLabel('TASMAN SEA',          158.0, -37.0,  8, 0.65);
                waterLabel('BERING SEA',         -174.0,  57.0,  9, 0.65);
                waterLabel('CHUKCHI SEA',        -166.0,  68.5,  8, 0.65);
                waterLabel('BEAUFORT SEA',       -143.0,  72.5,  8, 0.65);
                waterLabel('LABRADOR SEA',        -54.0,  55.0,  8, 0.65);
                waterLabel('HUDSON BAY',          -86.0,  58.0,  9, 0.7);
                waterLabel('CARIBBEAN SEA',       -74.0,  15.0,  9, 0.7);
                waterLabel('GULF OF MEXICO',      -90.0,  24.0,  9, 0.7);
                waterLabel('NORTH ATLANTIC',      -42.0,  42.0,  9, 0.65);
                waterLabel('BARENTS SEA',          40.0,  73.0,  8, 0.65);
                waterLabel('NORWEGIAN SEA',        3.0,  68.0,  8, 0.65);
                waterLabel('WEDDELL SEA',         -38.0, -72.0,  8, 0.65);
                waterLabel('ROSS SEA',            178.0, -74.0,  8, 0.65);
                waterLabel('SEA OF OKHOTSK',      148.0,  54.0,  8, 0.65);
                waterLabel('ANDAMAN SEA',          96.5,  10.5,  8, 0.7);
                waterLabel('JAVA SEA',            110.0,  -5.5,  8, 0.7);
                waterLabel('CELEBES SEA',         122.5,   4.0,  8, 0.65);
                waterLabel('BANDA SEA',           127.5,  -6.0,  8, 0.65);
                waterLabel('TIMOR SEA',           128.0, -13.0,  8, 0.65);
                waterLabel('ARAFURA SEA',         136.0, -10.0,  8, 0.65);
                waterLabel('PERSIAN GULF',         51.5,  26.5,  8, 0.75);
                waterLabel('GULF OF OMAN',         57.5,  22.0,  8, 0.7);
                waterLabel('GULF OF ADEN',         48.0,  12.0,  8, 0.7);
            }

            // ── STRAITS, CHANNELS, GULFS (smaller labels) ─────────────────────
            if (this.zoom > 1.8) {
                const smallWater = (text, lon, lat) => waterLabel(text, lon, lat, 7, 0.58);
                
                smallWater('BERING STRAIT',        -168.5,  65.8);
                smallWater('STRAIT OF MALACCA',     102.0,   2.8);
                smallWater('STRAIT OF HORMUZ',       56.6,  26.4);
                smallWater('STRAIT OF GIBRALTAR',   -5.5,  35.9);
                smallWater('STRAIT OF DOVER',        1.3,  51.1);
                smallWater('STRAIT OF MAGELLAN',   -71.0, -52.5);
                smallWater('DRAKE PASSAGE',         -68.0, -58.0);
                smallWater('SUEZ CANAL',             32.5,  30.5);
                smallWater('PANAMA CANAL',          -79.9,   9.1);
                smallWater('ENGLISH CHANNEL',        -1.2,  50.1);
                smallWater('LUZON STRAIT',          121.5,  19.5);
                smallWater('LOMBOK STRAIT',         115.8,  -8.8);
                smallWater('SUNDA STRAIT',          105.8,  -6.0);
                smallWater('BASS STRAIT',           146.0, -40.5);
                smallWater('GULF OF ANADYR',       -179.0,  64.5);
                smallWater('GULF OF FINLAND',        26.0,  60.0);
                smallWater('GULF OF BOTHNIA',        22.0,  63.5);
                smallWater('GULF OF ST. LAWRENCE',  -62.0,  47.5);
                smallWater('GULF OF CALIFORNIA',   -109.5,  26.5);
                smallWater('GULF OF GUINEA',          2.5,   1.5);
                smallWater('MOZAMBIQUE CHANNEL',     40.5, -18.0);
                smallWater('DAVIS STRAIT',          -57.0,  67.5);
                smallWater('DENMARK STRAIT',        -25.0,  66.0);
                smallWater('TAIWAN STRAIT',         119.5,  24.5);
                smallWater('KOREA STRAIT',          129.5,  34.0);
                smallWater('TSUGARU STRAIT',        140.8,  41.5);
                smallWater('TORRES STRAIT',         142.5, -10.5);
                smallWater('GULF OF CARPENTARIA',   137.0, -14.5);
                smallWater('GULF OF THAILAND',      101.0,   9.5);
                smallWater('GULF OF TONKIN',        108.5,  19.5);
            }

            // ── ADDITIONAL COUNTRY NAMES (not in MAP_COUNTRIES, no flag) ──────
            if (this.zoom > 0.9) {
                const cOpts = { font: 'bold 8px var(--font-heading)', spacing: '0.04em', opacity: 0.58, color: mapNeedsLightText ? 'rgba(226,232,240,0.78)' : 'rgba(30,41,59,0.72)', shadowColor: 'rgba(0,0,0,0.55)', shadowBlur: 3 };
                
                // Americas
                mapText('CANADA',         -96.0,  60.0, cOpts);
                mapText('MEXICO',         -102.0,  23.0, cOpts);
                mapText('ARGENTINA',       -65.0, -36.0, cOpts);
                mapText('CHILE',           -71.0, -33.5, cOpts);
                mapText('COLOMBIA',        -73.5,   4.0, cOpts);
                mapText('VENEZUELA',       -66.0,   8.5, cOpts);
                mapText('PERU',            -75.5,  -9.0, cOpts);
                mapText('BOLIVIA',         -64.5, -16.5, cOpts);
                mapText('CUBA',            -79.5,  22.0, cOpts);
                mapText('GREENLAND',       -42.0,  72.0, cOpts);
                
                // Europe (beyond DE, FR, IT, CH already drawn)
                mapText('UNITED KINGDOM',   -2.0,  54.0, cOpts);
                mapText('SPAIN',            -3.7,  40.4, cOpts);
                mapText('PORTUGAL',         -8.2,  39.5, cOpts);
                mapText('NORWAY',           14.5,  65.5, cOpts);
                mapText('SWEDEN',           17.0,  62.0, cOpts);
                mapText('FINLAND',          26.5,  64.0, cOpts);
                mapText('POLAND',           20.0,  52.0, cOpts);
                mapText('UKRAINE',          31.5,  49.0, cOpts);
                mapText('TURKEY',           35.0,  39.0, cOpts);
                mapText('GREECE',           22.5,  39.5, cOpts);
                mapText('ROMANIA',          25.0,  45.5, cOpts);
                mapText('NETHERLANDS',       5.3,  52.4, cOpts);
                mapText('ICELAND',         -19.0,  65.0, cOpts);
                
                // Asia / Middle East (beyond CN, IN, JP already drawn)
                mapText('RUSSIA',          100.0,  60.0, cOpts);
                mapText('RUSSIA',          -158.0, 62.0, cOpts);  // Chukotka / Far East
                mapText('KAZAKHSTAN',       67.0,  48.0, cOpts);
                mapText('MONGOLIA',        104.0,  46.5, cOpts);
                mapText('PAKISTAN',         68.0,  30.0, cOpts);
                mapText('AFGHANISTAN',      65.0,  33.0, cOpts);
                mapText('IRAN',             53.0,  32.0, cOpts);
                mapText('IRAQ',             44.0,  33.0, cOpts);
                mapText('SAUDI ARABIA',     45.0,  24.0, cOpts);
                mapText('MYANMAR',          96.0,  17.0, cOpts);
                mapText('THAILAND',        101.0,  15.5, cOpts);
                mapText('VIETNAM',         107.5,  16.5, cOpts);
                mapText('MALAYSIA',        109.5,   2.5, cOpts);
                mapText('INDONESIA',       118.0,  -2.0, cOpts);
                mapText('PHILIPPINES',     122.0,  12.5, cOpts);
                mapText('SOUTH KOREA',     127.5,  36.5, cOpts);
                mapText('NORTH KOREA',     127.0,  40.5, cOpts);
                mapText('BANGLADESH',       90.5,  23.5, cOpts);
                mapText('CAMBODIA',        104.8,  12.5, cOpts);
                
                // Africa (beyond ZA, LR already drawn)
                mapText('NIGERIA',          8.5,   9.0, cOpts);
                mapText('ETHIOPIA',        40.0,   9.5, cOpts);
                mapText('KENYA',           37.9,   0.5, cOpts);
                mapText('EGYPT',           30.0,  26.5, cOpts);
                mapText('ALGERIA',          3.0,  28.0, cOpts);
                mapText('ANGOLA',          18.5, -12.0, cOpts);
                mapText('MOZAMBIQUE',      34.5, -18.0, cOpts);
                mapText('MADAGASCAR',      46.5, -19.5, cOpts);
                mapText('GHANA',           -1.2,   7.9, cOpts);
                mapText('SOMALIA',         46.0,   6.0, cOpts);
                mapText('TANZANIA',        34.8,  -6.0, cOpts);
                mapText('SUDAN',           30.0,  15.0, cOpts);
                mapText('MOROCCO',         -5.5,  31.5, cOpts);
                
                // Oceania (beyond AU already drawn)
                mapText('NEW ZEALAND',    172.5, -42.0, cOpts);
                mapText('PAPUA NEW GUINEA', 144.5, -6.5, cOpts);
            }
            
            // ── ISLAND / PENINSULA NAMES ───────────────────────────────────────
            if (this.zoom > 2.5) {
                const islandOpts = { font: '7px var(--font-heading)', spacing: '0.02em', opacity: 0.52, italic: true };
                mapText('Alaska',           -153.0,  64.0, islandOpts);
                mapText('Siberia',           110.0,  65.0, islandOpts);
                mapText('Scandinavia',        16.0,  65.0, islandOpts);
                mapText('Iberian Peninsula',  -5.0,  40.0, islandOpts);
                mapText('Italian Peninsula',  14.0,  42.5, islandOpts);
                mapText('Arabian Peninsula',  45.0,  23.0, islandOpts);
                mapText('Kamchatka',         160.5,  54.5, islandOpts);
                mapText('Indochina',         104.0,  16.0, islandOpts);
                mapText('Indian Subcontinent', 76.5,  20.0, islandOpts);
                mapText('Horn of Africa',     49.5,  10.5, islandOpts);
                mapText('Cape of Good Hope',  18.5, -34.5, islandOpts);
                mapText('Labrador',          -61.0,  53.0, islandOpts);
                mapText('Baja California',  -110.0,  27.0, islandOpts);
                mapText('Yucatan',          -89.5,  19.5, islandOpts);
                mapText('Borneo',           114.5,   0.0, islandOpts);
                mapText('Sumatra',           103.0,  -0.5, islandOpts);
                mapText('New Guinea',        143.0,  -6.0, islandOpts);
                mapText('Hokkaido',          143.0,  43.5, islandOpts);
                mapText('Honshu',            137.5,  36.5, islandOpts);
                mapText('Kyushu',            131.0,  32.5, islandOpts);
            }
        }

        
        // 6. Draw Selected Route Path
        if (this.selectedVesselId) {
            const selVessel = vessels.find(v => v.id === this.selectedVesselId);
            if (selVessel && selVessel.route) {
                const startPos = this.gpsToScreen(selVessel.route.start.lon, selVessel.route.start.lat);
                const currentPos = this.gpsToScreen(selVessel.lon, selVessel.lat);
                const endPos = this.gpsToScreen(selVessel.route.end.lon, selVessel.route.end.lat);
                
                const isDeviant = selVessel.threatScore > 50;
                
                if (isDeviant) {
                    // --- ILLEGAL / DEVIANT ROUTING VIEW ---
                    
                    // 1. Draw Muted Standard Registered Route (What it was supposed to do)
                    this.ctx.beginPath();
                    this.ctx.moveTo(startPos.x, startPos.y);
                    this.ctx.lineTo(endPos.x, endPos.y);
                    this.ctx.strokeStyle = mapNeedsLightText ? 'rgba(148, 163, 184, 0.25)' : 'rgba(71, 85, 105, 0.3)';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.setLineDash([4, 4]);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);
                    
                    if (this.zoom > 1.2) {
                        this.ctx.fillStyle = mapNeedsLightText ? '#cbd5e1' : '#475569';
                        this.ctx.font = 'italic 7px monospace';
                        this.ctx.fillText("REGISTERED SLOC ROUTE (ABANDONED)", (startPos.x + endPos.x)/2 - 40, (startPos.y + endPos.y)/2 - 10);
                    }
                    
                    // 2. Draw Actual Deviated Path (Past Route)
                    this.ctx.beginPath();
                    this.ctx.moveTo(startPos.x, startPos.y);
                    this.ctx.lineTo(currentPos.x, currentPos.y);
                    this.ctx.strokeStyle = dangerColor;
                    this.ctx.lineWidth = 2.2;
                    this.ctx.stroke();
                    
                    // 3. Draw Projected Trajectory (Future Route)
                    this.ctx.beginPath();
                    this.ctx.moveTo(currentPos.x, currentPos.y);
                    const projectionEnd = {
                        x: currentPos.x + (currentPos.x - startPos.x) * 0.4,
                        y: currentPos.y + (currentPos.y - startPos.y) * 0.4
                    };
                    this.ctx.lineTo(projectionEnd.x, projectionEnd.y);
                    this.ctx.strokeStyle = dangerColor;
                    this.ctx.lineWidth = 1.8;
                    this.ctx.setLineDash([3, 3]);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);
                    
                    // 4. Draw Deviation Point marker
                    const devPoint = {
                        x: startPos.x + (currentPos.x - startPos.x) * 0.4,
                        y: startPos.y + (currentPos.y - startPos.y) * 0.4
                    };
                    this.ctx.beginPath();
                    this.ctx.arc(devPoint.x, devPoint.y, 6, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#ef4444';
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // 'X' inside mark
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(devPoint.x - 2, devPoint.y - 2);
                    this.ctx.lineTo(devPoint.x + 2, devPoint.y + 2);
                    this.ctx.moveTo(devPoint.x + 2, devPoint.y - 2);
                    this.ctx.lineTo(devPoint.x - 2, devPoint.y + 2);
                    this.ctx.stroke();
                    
                    if (this.zoom > 1.0) {
                        this.ctx.fillStyle = dangerColor;
                        this.ctx.font = 'bold 7px var(--font-heading)';
                        this.ctx.fillText("LANE DEVIATION POINT", devPoint.x + 8, devPoint.y - 4);
                        
                        this.ctx.fillStyle = '#ef4444';
                        this.ctx.font = 'bold 8px var(--font-heading)';
                        this.ctx.fillText("UNROUTED TRAJECTORY (ILLEGAL)", currentPos.x + 10, currentPos.y + 16);
                    }
                    
                    // Animated glowing node on illegal trajectory
                    const prog = (timestamp % 1500) / 1500;
                    const flowPos = {
                        x: lerp(currentPos.x, projectionEnd.x, prog),
                        y: lerp(currentPos.y, projectionEnd.y, prog)
                    };
                    this.ctx.beginPath();
                    this.ctx.arc(flowPos.x, flowPos.y, 4, 0, Math.PI*2);
                    this.ctx.fillStyle = dangerColor;
                    this.ctx.shadowColor = dangerColor;
                    this.ctx.shadowBlur = 8;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                } else {
                    // 1. Draw Past Compliant Route
                    this.ctx.beginPath();
                    this.ctx.moveTo(startPos.x, startPos.y);
                    this.ctx.lineTo(currentPos.x, currentPos.y);
                    this.ctx.strokeStyle = successColor;
                    this.ctx.lineWidth = 2.0;
                    this.ctx.stroke();
                    
                    // 2. Draw Future Aligned Route
                    this.ctx.beginPath();
                    this.ctx.moveTo(currentPos.x, currentPos.y);
                    this.ctx.lineTo(endPos.x, endPos.y);
                    this.ctx.strokeStyle = successColor;
                    this.ctx.lineWidth = 1.8;
                    this.ctx.setLineDash([4, 4]);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);
                    
                    if (this.zoom > 1.2) {
                        this.ctx.fillStyle = successColor;
                        this.ctx.font = 'bold 7px var(--font-heading)';
                        this.ctx.fillText("SLOC COMPLIANT / ON-ROUTE", currentPos.x + 10, currentPos.y - 12);
                    }
                    
                    const prog = (timestamp % 2000) / 2000;
                    const flowPos = this.gpsToScreen(
                        lerp(selVessel.lon, selVessel.route.end.lon, prog),
                        lerp(selVessel.lat, selVessel.route.end.lat, prog)
                    );
                    this.ctx.beginPath();
                    this.ctx.arc(flowPos.x, flowPos.y, 4, 0, Math.PI*2);
                    this.ctx.fillStyle = successColor;
                    this.ctx.shadowColor = successColor;
                    this.ctx.shadowBlur = 8;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }
        
        // 7. Draw Vessel Markers
        const activeVessels = getFilteredVessels();
        activeVessels.forEach(vessel => {
            if (this.selectedVesselId && vessel.id !== this.selectedVesselId) {
                return;
            }
            const pos = this.gpsToScreen(vessel.lon, vessel.lat);
            const scale = Math.min(2.5, Math.max(0.8, this.zoom / 10.0));
            
            let markerColor = '#94a3b8';
            if (vessel.type === 'cargo') markerColor = successColor;
            else if (vessel.type === 'fishing') markerColor = warningColor;
            else if (vessel.type === 'coastguard') markerColor = accentColor;
            else if (vessel.type === 'emergency') markerColor = '#f97316';
            else if (vessel.type === 'distress') markerColor = '#f97316';  // orange SOS
            else if (vessel.type === 'suspicious') markerColor = dangerColor;
            
            const isSelected = (vessel.id === this.selectedVesselId);
            
            // AIS Lost Signal blinking
            if (vessel.aisStatus === 'Lost') {
                const flash = Math.floor(timestamp / 500) % 2 === 0;
                if (!flash) return;
            }
            
            this.ctx.save();
            this.ctx.translate(pos.x, pos.y);
            this.ctx.rotate((vessel.heading * Math.PI) / 180);
            this.ctx.scale(scale, scale);
            this.ctx.fillStyle = markerColor;
            this.ctx.strokeStyle = mapNeedsLightText ? '#070b14' : '#ffffff';
            this.ctx.lineWidth = 0.8;
            
            if (vessel.type === 'cargo') {
                // ECDIS cargo ship silhouette (long hull, aft bridge superstructure)
                this.ctx.beginPath();
                this.ctx.moveTo(0, -10);
                this.ctx.quadraticCurveTo(3.2, -5, 3.2, 2);
                this.ctx.lineTo(3.2, 9);
                this.ctx.lineTo(-3.2, 9);
                this.ctx.lineTo(-3.2, 2);
                this.ctx.quadraticCurveTo(-3.2, -5, 0, -10);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                // Aft superstructure bridge cabin block
                this.ctx.fillStyle = mapNeedsLightText ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.6)';
                this.ctx.fillRect(-1.8, 3, 3.6, 3.5);
                drawSternFlag(this.ctx, 9, vessel.country);
            } else if (vessel.type === 'fishing') {
                // Commercial trawler silhouette (stubby wide hull, center cabin)
                this.ctx.beginPath();
                this.ctx.moveTo(0, -7);
                this.ctx.quadraticCurveTo(4, -3, 4, 1);
                this.ctx.lineTo(4, 6);
                this.ctx.lineTo(-4, 6);
                this.ctx.lineTo(-4, 1);
                this.ctx.quadraticCurveTo(-4, -3, 0, -7);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                // Central cabin superstructure block
                this.ctx.fillStyle = mapNeedsLightText ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.6)';
                this.ctx.fillRect(-2, -1, 4, 3.5);
                drawSternFlag(this.ctx, 6, vessel.country);
            } else if (vessel.type === 'coastguard' || vessel.type === 'emergency') {
                // Sleek patrol cutter silhouette (pointed hull, forward-center cabin)
                this.ctx.beginPath();
                this.ctx.moveTo(0, -9);
                this.ctx.quadraticCurveTo(2.8, -5, 2.8, 1);
                this.ctx.lineTo(2.8, 8);
                this.ctx.lineTo(-2.8, 8);
                this.ctx.lineTo(-2.8, 1);
                this.ctx.quadraticCurveTo(-2.8, -5, 0, -9);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                // Forward-center bridge cabin block
                this.ctx.fillStyle = mapNeedsLightText ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.6)';
                this.ctx.fillRect(-1.5, -2, 3, 4);
                drawSternFlag(this.ctx, 8, vessel.country);
            } else if (vessel.type === 'suspicious') {
                // Pointed skiff speedboat silhouette (sharp hull, small console, red outboard motor)
                this.ctx.beginPath();
                this.ctx.moveTo(0, -6);
                this.ctx.lineTo(2.5, 0);
                this.ctx.lineTo(2, 6);
                this.ctx.lineTo(-2, 6);
                this.ctx.lineTo(-2.5, 0);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                // Steering console block
                this.ctx.fillStyle = mapNeedsLightText ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.6)';
                this.ctx.fillRect(-1, 0, 2, 2.5);
                
                // Outboard motor highlight
                this.ctx.fillStyle = '#ef4444';
                this.ctx.fillRect(-0.8, 6, 1.6, 1.2);
                drawSternFlag(this.ctx, 6, vessel.country);
                
                // Pulsing hazard ring
                this.ctx.restore();
                this.ctx.save();
                this.ctx.translate(pos.x, pos.y);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, (10 + Math.sin(timestamp / 120) * 2) * scale, 0, Math.PI * 2);
                this.ctx.strokeStyle = markerColor;
                this.ctx.lineWidth = 0.8 * scale;
                this.ctx.stroke();
            } else if (vessel.type === 'distress') {
                // DISTRESS VESSEL: stationary, pulsing SOS marker (orange anchor + ring)
                // Draw hull as a stopped cargo shape, rotated randomly
                this.ctx.beginPath();
                this.ctx.moveTo(0, -9);
                this.ctx.quadraticCurveTo(3, -4, 3, 2);
                this.ctx.lineTo(3, 8);
                this.ctx.lineTo(-3, 8);
                this.ctx.lineTo(-3, 2);
                this.ctx.quadraticCurveTo(-3, -4, 0, -9);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                // Cabin block
                this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
                this.ctx.fillRect(-1.8, 2, 3.6, 3.5);
                drawSternFlag(this.ctx, 8, vessel.country);
                this.ctx.restore();
                
                // Pulsing SOS ring (orange double-ring)
                const sosPhase = (timestamp % 1200) / 1200;
                const sosR = (11 + sosPhase * 14) * scale;
                const sosA = (1.0 - sosPhase) * 0.9;
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, sosR, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(249, 115, 22, ${sosA})`;
                this.ctx.lineWidth = 2.2 * scale;
                this.ctx.stroke();
                // Inner solid ring
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 10 * scale, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#f97316';
                this.ctx.lineWidth = 1.5 * scale;
                this.ctx.stroke();
                
                // SOS text label
                if (this.zoom > 0.9) {
                    this.ctx.fillStyle = '#f97316';
                    this.ctx.font = 'bold 7px monospace';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('SOS', pos.x, pos.y + 22 * scale);
                    this.ctx.textAlign = 'left';
                }
                this.ctx.save(); // re-save to keep ctx state consistent
                this.ctx.translate(pos.x, pos.y);
                this.ctx.rotate((vessel.heading * Math.PI) / 180);
                this.ctx.scale(scale, scale);
            } else {
                // Default skiff / small craft pointed boat
                this.ctx.beginPath();
                this.ctx.moveTo(0, -5);
                this.ctx.lineTo(2, 1);
                this.ctx.lineTo(1.5, 5);
                this.ctx.lineTo(-1.5, 5);
                this.ctx.lineTo(-2, 1);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                drawSternFlag(this.ctx, 5, vessel.country);
            }
            this.ctx.restore();
            
            // Selector Ring
            if (isSelected) {
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 12 * scale, 0, Math.PI * 2);
                this.ctx.strokeStyle = accentColor;
                this.ctx.lineWidth = 1.5 * scale;
                this.ctx.setLineDash([3 * scale, 2 * scale]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                
                this.ctx.beginPath();
                const rad = (12 + (timestamp % 1500) / 1500 * 20) * scale;
                const alpha = 1.0 - (timestamp % 1500) / 1500;
                this.ctx.arc(pos.x, pos.y, rad, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(${mapNeedsLightText ? '6, 182, 212' : '13, 148, 136'}, ${alpha})`;
                this.ctx.lineWidth = 1.0 * scale;
                this.ctx.stroke();
            }
            
            // Labels with spatial collision detection (decluttering)
            let showLabel = false;
            if (isSelected || (this.hoveredVessel && vessel.id === this.hoveredVessel.id)) {
                showLabel = true;
            } else if (vessel.type === 'suspicious') {
                showLabel = true;
            } else if (this.zoom > 15.0) {
                showLabel = true;
            }
            
            if (showLabel) {
                const labelText = vessel.name;
                this.ctx.font = isSelected ? 'bold 9px var(--font-body)' : '8px var(--font-body)';
                const textWidth = this.ctx.measureText(labelText).width;
                const textHeight = 9;
                
                // Try different vertical offsets to avoid overlap: -4, +8, -16, +16
                const offsetsY = [-4, 8, -16, 16];
                let finalOffsetY = null;
                
                for (let oy of offsetsY) {
                    const lx = pos.x + 8;
                    const ly = pos.y + oy;
                    const rect = { x1: lx - 2, y1: ly - textHeight, x2: lx + textWidth + 2, y2: ly + 2 };
                    
                    // Check collision with already drawn labels
                    const collision = drawnLabelRects.some(r => {
                        return !(rect.x2 < r.x1 || rect.x1 > r.x2 || rect.y2 < r.y1 || rect.y1 > r.y2);
                    });
                    
                    if (!collision) {
                        finalOffsetY = oy;
                        drawnLabelRects.push(rect);
                        break;
                    }
                }
                
                if (finalOffsetY !== null) {
                    this.ctx.fillStyle = mapNeedsLightText ? '#ffffff' : '#0f172a';
                    this.ctx.fillText(labelText, pos.x + 8, pos.y + finalOffsetY);
                    
                    if (isSelected || vessel.type === 'suspicious') {
                        this.ctx.fillStyle = markerColor;
                        this.ctx.font = '7px monospace';
                        this.ctx.fillText(`T:${vessel.threatScore}% | ${vessel.speed}kn`, pos.x + 8, pos.y + finalOffsetY + 8);
                    }
                }
            }
        });
        
        // 8. Tooltip
        if (this.hoveredVessel) {
            const pos = this.gpsToScreen(this.hoveredVessel.lon, this.hoveredVessel.lat);
            const tx = pos.x + 12;
            const ty = pos.y - 12;
            
            this.ctx.fillStyle = isDark ? '#1e293b' : '#0f172a';
            this.ctx.strokeStyle = accentColor;
            this.ctx.lineWidth = 1;
            
            const w = 130;
            const h = 48;
            
            this.ctx.beginPath();
            this.ctx.roundRect(tx, ty, w, h, 4);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 9px var(--font-body)';
            this.ctx.fillText(this.hoveredVessel.name, tx + 8, ty + 14);
            
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = '8px var(--font-body)';
            this.ctx.fillText(`Type: ${this.hoveredVessel.class.split('/')[0]}`, tx + 8, ty + 26);
            this.ctx.fillText(`MMSI: ${this.hoveredVessel.mmsi}`, tx + 8, ty + 38);
            
            let badgeColor = successColor;
            if (this.hoveredVessel.threatScore > 75) badgeColor = dangerColor;
            else if (this.hoveredVessel.threatScore > 35) badgeColor = warningColor;
            
            this.ctx.fillStyle = badgeColor;
            this.ctx.fillRect(tx + w - 32, ty + 8, 24, 12);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 7px var(--font-body)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.hoveredVessel.threatScore}%`, tx + w - 20, ty + 17);
            this.ctx.textAlign = 'left';
        }
        
        // 7.8 Draw Live Dispatch Simulation Overlay
        if (this.dispatchSim && this.dispatchSim.active) {
            const target = vessels.find(v => v.id === this.dispatchSim.targetVesselId);
            if (target) {
                const targetPos = this.gpsToScreen(target.lon, target.lat);
                
                // Draw Asset 1 (Interceptor C-421)
                const pos1 = this.gpsToScreen(this.dispatchSim.asset1.lon, this.dispatchSim.asset1.lat);
                const startPos1 = this.gpsToScreen(this.dispatchSim.asset1.startLon, this.dispatchSim.asset1.startLat);
                
                // Draw dashed path line
                this.ctx.beginPath();
                this.ctx.moveTo(startPos1.x, startPos1.y);
                this.ctx.lineTo(targetPos.x, targetPos.y);
                this.ctx.strokeStyle = this.dispatchSim.asset1.failed ? 'rgba(239, 68, 68, 0.45)' : 'rgba(6, 182, 212, 0.6)';
                this.ctx.lineWidth = 1.5;
                this.ctx.setLineDash([3, 3]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                
                // Draw Asset 1 pointed boat marker
                this.ctx.save();
                this.ctx.translate(pos1.x, pos1.y);
                const angle1 = Math.atan2(targetPos.y - pos1.y, targetPos.x - pos1.x);
                this.ctx.rotate(angle1 + Math.PI / 2);
                this.ctx.fillStyle = this.dispatchSim.asset1.failed ? '#ef4444' : '#06b6d4';
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 0.8;
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, -7);
                this.ctx.lineTo(2.5, 0);
                this.ctx.lineTo(2, 6);
                this.ctx.lineTo(-2, 6);
                this.ctx.lineTo(-2.5, 0);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                this.ctx.restore();
                
                // Text label
                this.ctx.fillStyle = this.dispatchSim.asset1.failed ? '#ef4444' : '#06b6d4';
                this.ctx.font = 'bold 7px var(--font-body)';
                this.ctx.fillText(this.dispatchSim.asset1.name + (this.dispatchSim.asset1.failed ? " (FAILED)" : " (EN ROUTE)"), pos1.x + 8, pos1.y - 2);
                
                // Draw Asset 2 (ICGS SAMARATH)
                if (this.dispatchSim.phase >= 3) {
                    const pos2 = this.gpsToScreen(this.dispatchSim.asset2.lon, this.dispatchSim.asset2.lat);
                    const startPos2 = this.gpsToScreen(this.dispatchSim.asset2.startLon, this.dispatchSim.asset2.startLat);
                    
                    // Draw path line
                    this.ctx.beginPath();
                    this.ctx.moveTo(startPos2.x, startPos2.y);
                    this.ctx.lineTo(targetPos.x, targetPos.y);
                    this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
                    this.ctx.lineWidth = 1.8;
                    this.ctx.setLineDash([4, 3]);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);
                    
                    // Draw second cutter
                    this.ctx.save();
                    this.ctx.translate(pos2.x, pos2.y);
                    const angle2 = Math.atan2(targetPos.y - pos2.y, targetPos.x - pos2.x);
                    this.ctx.rotate(angle2 + Math.PI / 2);
                    this.ctx.fillStyle = '#10b981';
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 1.0;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -9);
                    this.ctx.lineTo(2.8, 0);
                    this.ctx.lineTo(2.2, 7);
                    this.ctx.lineTo(-2.2, 7);
                    this.ctx.lineTo(-2.8, 0);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    this.ctx.restore();
                    
                    // Label
                    this.ctx.fillStyle = '#10b981';
                    this.ctx.font = 'bold 7px var(--font-body)';
                    this.ctx.fillText(this.dispatchSim.asset2.name + (this.dispatchSim.asset2.success ? " (BOARDING TARGET)" : " (BACKUP INTERCEPT)"), pos2.x + 8, pos2.y - 2);
                }
            }
        }
    }
}

let mapRenderer;

// Format coordinate strings
function formatCoords(lat, lon) {
    const latDeg = Math.floor(Math.abs(lat));
    const latMin = ((Math.abs(lat) - latDeg) * 60).toFixed(2);
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDeg = Math.floor(Math.abs(lon));
    const lonMin = ((Math.abs(lon) - lonDeg) * 60).toFixed(2);
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${String(latDeg).padStart(2, '0')}Â° ${latMin}' ${latDir}, ${String(lonDeg).padStart(3, '0')}Â° ${lonMin}' ${lonDir}`;
}

// Get filter inputs
function getFilteredVessels() {
    const searchVal = document.getElementById('search').value.toLowerCase().trim();
    const typeVal = document.getElementById('type').value;
    const riskVal = document.getElementById('risk').value;
    const countryVal = document.getElementById('country').value;
    const threatVal = parseInt(document.getElementById('threat-range').value);
    const aisLostVal = document.getElementById('ais-lost').checked;
    
    return vessels.filter(v => {
        // Always show distress vessels (SOS) regardless of filters
        if (v.type === 'distress') return true;
        
        if (searchVal && !v.name.toLowerCase().includes(searchVal) && !v.mmsi.includes(searchVal)) return false;
        if (typeVal !== 'all' && v.type !== typeVal) return false;
        if (riskVal !== 'all') {
            if (riskVal === 'high' && v.threatScore <= 75) return false;
            if (riskVal === 'medium' && (v.threatScore < 30 || v.threatScore > 75)) return false;
            if (riskVal === 'low' && v.threatScore >= 30) return false;
        }
        if (countryVal !== 'all' && v.country !== countryVal) return false;
        if (v.threatScore < threatVal) return false;
        if (!aisLostVal && v.aisStatus === 'Lost') return false;
        return true;
    });
}

function generateVesselHistory(vessel) {
    const history = [];
    const now = new Date();
    
    // Special distress vessel history
    if (vessel.type === 'distress') {
        const t1 = new Date(now.getTime() - 3 * 3600000);
        history.push({ time: t1.toISOString().slice(11, 16) + " UTC", title: "Last Normal Operation", desc: `${vessel.name} last reported normal engine status. Speed: 12.3 kn. All systems nominal.` });
        const t2 = new Date(now.getTime() - 1.5 * 3600000);
        history.push({ time: t2.toISOString().slice(11, 16) + " UTC", title: "âš ï¸ Engine Warning Alarm", desc: "Main engine cooling system fault detected. Chief Engineer notified. Speed reduced to 4 kn." });
        const t3 = new Date(now.getTime() - 55 * 60000);
        history.push({ time: t3.toISOString().slice(11, 16) + " UTC", title: "ðŸ”´ Total Propulsion Loss", desc: "Main engine shutdown. All propulsion lost. Vessel adrift. EPIRB distress beacon activated." });
        const t4 = new Date(now.getTime() - 40 * 60000);
        history.push({ time: t4.toISOString().slice(11, 16) + " UTC", title: "ðŸ“¡ MAYDAY Issued on Ch.16", desc: `Master issued MAYDAY call on VHF Ch.16 and DSC. Crew mustered at emergency stations. MRCC Chennai acknowledged.` });
        return history;
    }
    
    // Normal vessel history
    const depTime = new Date(now.getTime() - 4 * 3600000);
    const depTimeString = depTime.toISOString().slice(11, 16) + " UTC";
    let startPortName = "Coastal Sector";
    if (vessel.route && vessel.route.start) {
        const port = PORTS.find(p => Math.abs(p.lon - vessel.route.start.lon) < 0.2 && Math.abs(p.lat - vessel.route.start.lat) < 0.2);
        if (port) startPortName = port.name;
    }
    history.push({
        time: depTimeString,
        title: "Vessel Departed",
        desc: `Cleared port operations at ${startPortName}. Heading: ${vessel.heading}Â°`
    });
    
    // Event 2: Mid-transit update
    const midTime = new Date(now.getTime() - 2 * 3600000);
    const midTimeString = midTime.toISOString().slice(11, 16) + " UTC";
    history.push({
        time: midTimeString,
        title: "Sea Lane Transit",
        desc: `Registered speed of ${vessel.speed} kn. AIS transponder operating normally.`
    });
    
    // Event 3: Anomaly or EEZ crossed
    const recentTime = new Date(now.getTime() - 45 * 60000);
    const recentTimeString = recentTime.toISOString().slice(11, 16) + " UTC";
    if (vessel.threatScore > 50) {
        history.push({
            time: recentTimeString,
            title: "Route Lane Deviation Detected",
            desc: `Vessel threat index elevated to ${vessel.threatScore}% due to unrouted route path.`
        });
    } else {
        history.push({
            time: recentTimeString,
            title: "Exclusive Economic Zone Entry",
            desc: "Entered territorial monitoring zone. SLOC course compliance check: PASSED."
        });
    }
    
    return history;
}


function setSelectedVesselGlobal(vesselId) {
    mapRenderer.selectedVesselId = vesselId;
    
    const noSelectionEl = document.getElementById('intel-no-selection');
    const detailsEl = document.getElementById('intel-details');
    
    // Reset any running dispatch simulation when switching vessels
    if (mapRenderer.dispatchSim && mapRenderer.dispatchSim.active) {
        hideDispatchPanel();
    }
    
    if (!vesselId) {
        noSelectionEl.classList.remove('hidden');
        detailsEl.classList.add('hidden');
        
        if (mapRenderer) mapRenderer.draw(0);
        return;
    }
    
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) return;
    
    // Auto pan to selected ship
    mapRenderer.centerOn(vessel.lon, vessel.lat);
    
    // Load UI details
    noSelectionEl.classList.add('hidden');
    detailsEl.classList.remove('hidden');
    
    const complianceBadge = document.getElementById('route-compliance-badge');
    if (complianceBadge) {
        const isDeviant = vessel.threatScore > 50;
        complianceBadge.textContent = isDeviant ? "DEVIANT" : "SLOC ALIGNED";
        complianceBadge.className = `route-badge ${isDeviant ? 'critical' : 'aligned'}`;
    }
    
    document.getElementById('vessel-flag').textContent = vessel.flag;
    document.getElementById('vessel-name').textContent = vessel.name;
    document.getElementById('vessel-class').textContent = vessel.class;
    document.getElementById('vessel-mmsi').textContent = vessel.mmsi;
    document.getElementById('vessel-imo').textContent = vessel.imo;
    document.getElementById('vessel-speed').textContent = `${vessel.speed} kn`;
    document.getElementById('vessel-heading').textContent = `${vessel.heading}Â°`;
    
    const countryObj = COUNTRIES.find(c => c.code === vessel.country);
    document.getElementById('vessel-country').textContent = countryObj ? countryObj.name : vessel.country;
    document.getElementById('vessel-ais-status').textContent = vessel.aisStatus;
    
    document.getElementById('threat-score').textContent = vessel.type === 'distress' ? 'SOS' : `${vessel.threatScore}%`;
    
    const classification = document.getElementById('threat-classification');
    if (vessel.type === 'distress') {
        classification.textContent = "ENGINE FAILURE / DISTRESS";
        classification.style.borderColor = '#f97316';
        classification.style.color = '#f97316';
    } else {
        classification.textContent = vessel.threatScore > 75 ? "CRITICAL RISK" : vessel.threatScore > 30 ? "SUSPICIOUS PROFILE" : "LOW RISK";
        classification.style.borderColor = vessel.threatScore > 75 ? 'var(--danger)' : vessel.threatScore > 30 ? 'var(--warning)' : 'var(--success)';
        classification.style.color = vessel.threatScore > 75 ? 'var(--danger)' : vessel.threatScore > 30 ? 'var(--warning)' : 'var(--success)';
    }
    
    // Radial gauge offset (Circumference 126)
    const fillEl = document.getElementById('gauge-fill');
    const offset = vessel.type === 'distress' ? 63 : 126 - (vessel.threatScore / 100) * 126;
    fillEl.style.strokeDashoffset = offset;
    fillEl.style.stroke = vessel.type === 'distress' ? '#f97316' : vessel.threatScore > 75 ? 'var(--danger)' : vessel.threatScore > 30 ? 'var(--warning)' : 'var(--success)';
    
    // Anomaly status
    const anomalyBox = document.getElementById('intel-anomaly-box');
    const anomalyTitle = document.getElementById('anomaly-title');
    const anomalyDesc = document.getElementById('anomaly-desc');
    
    anomalyBox.className = 'alert-box-tactical';
    if (vessel.type === 'distress') {
        anomalyBox.classList.add('warning');
        anomalyTitle.textContent = "ðŸ†˜ ENGINE FAILURE â€” DISTRESS";
        anomalyDesc.textContent = vessel.anomaly;
    } else if (vessel.threatScore > 75) {
        anomalyBox.classList.add('critical');
        anomalyTitle.textContent = "CRITICAL TARGET ANOMALY";
        anomalyDesc.textContent = vessel.anomaly;
    } else if (vessel.threatScore > 30) {
        anomalyBox.classList.add('warning');
        anomalyTitle.textContent = "TACTICAL WARNING PROFILE";
        anomalyDesc.textContent = vessel.anomaly;
    } else {
        anomalyTitle.textContent = "Normal Sailing Behavior";
        anomalyDesc.textContent = "Sailing normally within registered SLOC corridor lanes.";
    }
    
    document.getElementById('vessel-destination').textContent = `${vessel.destination} (ETA: ${vessel.eta})`;
    document.getElementById('recommended-action').textContent = vessel.action;
    document.getElementById('nearest-asset').textContent = vessel.cgAsset;
    
    // Update action button: distress = rescue tug, threat = interceptor, safe = log pass
    const dispatchBtn = document.getElementById('btn-dispatch');
    if (dispatchBtn) {
        if (vessel.type === 'distress') {
            dispatchBtn.innerHTML = '<i data-lucide="anchor"></i> Send Rescue Tug';
            dispatchBtn.style.backgroundColor = '#f97316';
            dispatchBtn.style.color = '#ffffff';
            dispatchBtn.dataset.mode = 'rescue';
        } else if (vessel.threatScore > 50) {
            dispatchBtn.innerHTML = '<i data-lucide="radio"></i> Dispatch Interceptor';
            dispatchBtn.style.backgroundColor = 'var(--danger)';
            dispatchBtn.style.color = '#ffffff';
            dispatchBtn.dataset.mode = 'intercept';
        } else if (vessel.threatScore > 30) {
            dispatchBtn.innerHTML = '<i data-lucide="radio"></i> Dispatch Interceptor';
            dispatchBtn.style.backgroundColor = 'var(--warning)';
            dispatchBtn.style.color = '#ffffff';
            dispatchBtn.dataset.mode = 'intercept';
        } else {
            dispatchBtn.innerHTML = '<i data-lucide="check-circle-2"></i> Log Security Pass';
            dispatchBtn.style.backgroundColor = 'var(--success)';
            dispatchBtn.style.color = '#ffffff';
        }
        lucide.createIcons();
    }
    
    // Render Vessel History
    const historyContainer = document.getElementById('vessel-history');
    if (historyContainer) {
        historyContainer.innerHTML = '';
        const historyList = generateVesselHistory(vessel);
        historyList.forEach(item => {
            const step = document.createElement('div');
            step.style.display = 'flex';
            step.style.gap = '10px';
            step.style.position = 'relative';
            
            step.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent); border: 2px solid var(--bg-card);"></div>
                    <div style="flex-grow: 1; width: 1.5px; background: var(--border-color); min-height: 25px;"></div>
                </div>
                <div style="padding-bottom: 8px;">
                    <span style="font-size: 8px; font-weight: bold; color: var(--text-muted); font-family: monospace;">${item.time}</span>
                    <h6 style="font-size: 9px; font-weight: bold; color: var(--text-primary); margin: 2px 0 1px 0;">${item.title}</h6>
                    <p style="font-size: 8px; color: var(--text-secondary); line-height: 1.3; margin: 0;">${item.desc}</p>
                </div>
            `;
            historyContainer.appendChild(step);
        });
        // Hide last connector line
        if (historyContainer.lastChild) {
            const connector = historyContainer.lastChild.querySelector('div div:nth-child(2)');
            if (connector) connector.style.display = 'none';
        }
    }
    
    if (mapRenderer) mapRenderer.draw(0);
}

// Add custom event to timeline log
function addCustomEventToTimeline(text, type = "info") {
    const feed = document.getElementById('timeline-feed');
    if (!feed) return;
    const now = new Date();
    const timeStr = now.toISOString().slice(11, 19);
    const item = document.createElement('div');
    item.className = 'timeline-item new-update';
    item.innerHTML = `<span class="timeline-time">${timeStr}</span><span class="timeline-badge ${type}">${type === 'critical' ? 'critical alert' : type}</span><span class="timeline-msg">${text}</span>`;
    feed.insertBefore(item, feed.firstChild);
    if (feed.children.length > 20) feed.removeChild(feed.lastChild);
    feed.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => item.classList.remove('new-update'), 2500);
}

// Show the dispatch mission progress panel
function updateDispatchUI() {
    const panel = document.getElementById('dispatch-mission-panel');
    if (!panel) return;
    panel.classList.remove('hidden');
    panel.style.display = 'flex';
}

// Hide dispatch panel and reset simulation
function hideDispatchPanel() {
    const panel = document.getElementById('dispatch-mission-panel');
    if (panel) {
        panel.classList.add('hidden');
        panel.style.display = 'none';
    }
    if (mapRenderer && mapRenderer.dispatchSim) {
        mapRenderer.dispatchSim.active = false;
        mapRenderer.dispatchSim.phase = 0;
    }
}

// Relabel the dispatch mission panel steps for rescue/tug operations
function setRescueMissionLabels() {
    const steps = document.querySelectorAll('#dispatch-mission-panel .mission-step');
    const labels = [
        { title: 'Rescue Tug SAMUDRA SHAKTI Dispatched', sub: 'Ocean Tug Â· 16 kn Â· Kochi Port', status: 'EN ROUTE â†’ CASUALTY' },
        { title: 'Tug Unable to Reach in Time', sub: 'Crew reported worsening water ingress', status: 'AWAITING EVENT' },
        { title: 'SAR Cutter VARUNA Backup Deployed', sub: 'Rapid Response Â· 28 kn Â· Coast Guard Station', status: 'STANDBY' },
        { title: 'Crew Rescued â€” Vessel Secured', sub: 'Tow line secured. MRCC notified.', status: 'AWAITING EVENT' }
    ];
    steps.forEach((step, idx) => {
        if (!labels[idx]) return;
        const t = step.querySelector('.mission-title');
        const s = step.querySelector('.mission-sub');
        const st = step.querySelector('.mission-status');
        if (t) t.textContent = labels[idx].title;
        if (s) s.textContent = labels[idx].sub;
        if (st) st.textContent = labels[idx].status;
    });
    const statusMsg = document.getElementById('dispatch-status-msg');
    if (statusMsg) {
        statusMsg.textContent = 'ðŸŸ  Rescue tug SAMUDRA SHAKTI is en route to distressed vessel...';
        statusMsg.style.borderLeftColor = '#f97316';
    }
}

// Called every rAF frame to advance asset positions
function updateDispatchSimulation(dt) {
    if (!mapRenderer || !mapRenderer.dispatchSim || !mapRenderer.dispatchSim.active) return;
    const sim = mapRenderer.dispatchSim;
    const target = vessels.find(v => v.id === sim.targetVesselId);
    if (!target) return;
    
    sim.timer += dt;
    const SPEED = 0.0004; // degrees per ms â€“ fast enough to be clearly visible
    
    if (sim.phase === 1) {
        // Phase 1: Asset 1 moves toward target for up to 8 seconds before failing
        const dLon = target.lon - sim.asset1.lon;
        const dLat = target.lat - sim.asset1.lat;
        const dist = Math.sqrt(dLon * dLon + dLat * dLat);
        
        if (sim.timer < 8000 && dist > 0.05) {
            const step = SPEED * dt;
            const norm = dist > 0 ? 1 / dist : 0;
            sim.asset1.lon += dLon * norm * step;
            sim.asset1.lat += dLat * norm * step;
        } else if (sim.timer >= 8000 && !sim.asset1.failed) {
            // Fail after 8 seconds
            sim.asset1.failed = true;
            sim.phase = 2;
            sim.timer = 0;
            if (sim.missionType === 'rescue') {
                addCustomEventToTimeline(`âš ï¸ Rescue Tug SAMUDRA SHAKTI unable to reach ${target.name} in time â€” sea state too rough. Requesting SAR cutter backup.`, "critical");
            } else {
                addCustomEventToTimeline(`âš ï¸ Interceptor C-421 reported engine fault â€” unable to complete intercept of ${target.name}. Requesting backup.`, "critical");
            }
            updateDispatchPhaseUI(2);
        }
    }
    
    if (sim.phase === 2 && sim.timer > 2500) {
        // Phase 2 â†’ 3: After 2.5 seconds pause, dispatch backup
        sim.phase = 3;
        sim.timer = 0;
        if (sim.missionType === 'rescue') {
            addCustomEventToTimeline(`ðŸš SAR Cutter VARUNA 2 dispatched from nearest coast guard station to assist ${target.name}.`, "warning");
        } else {
            addCustomEventToTimeline(`ðŸš¢ ICGS SAMARATH dispatched from Chennai base as backup intercept unit for ${target.name}.`, "warning");
        }
        updateDispatchPhaseUI(3);
    }
    
    if (sim.phase >= 3) {
        // Asset 2 moves toward target
        const dLon2 = target.lon - sim.asset2.lon;
        const dLat2 = target.lat - sim.asset2.lat;
        const dist2 = Math.sqrt(dLon2 * dLon2 + dLat2 * dLat2);
        
        if (dist2 > 0.08 && !sim.asset2.success) {
            const step = SPEED * dt * 0.75;
            const norm2 = 1 / dist2;
            sim.asset2.lon += dLon2 * norm2 * step;
            sim.asset2.lat += dLat2 * norm2 * step;
            sim.asset2.progress = Math.min(1.0, sim.asset2.progress + 0.0002);
        } else if (dist2 <= 0.12 && !sim.asset2.success) {
            sim.asset2.success = true;
            sim.phase = 4;
            if (sim.missionType === 'rescue') {
                addCustomEventToTimeline(`âœ… SAR Cutter VARUNA has reached ${target.name}. Crew rescued. Tow line secured. MRCC notified.`, "info");
            } else {
                addCustomEventToTimeline(`âœ… ICGS SAMARATH has intercepted ${target.name}. Boarding party deployed. Target secured.`, "info");
            }
            updateDispatchPhaseUI(4);
        }
    }
}


function updateDispatchPhaseUI(phase) {
    const steps = document.querySelectorAll('#dispatch-mission-panel .mission-step');
    const isRescue = mapRenderer && mapRenderer.dispatchSim && mapRenderer.dispatchSim.missionType === 'rescue';
    
    const interceptMeta = [
        { name: 'Interceptor C-421 Dispatched', sub: 'Fast Patrol Vessel Â· 32 kn Â· Tuticorin Base' },
        { name: 'C-421 Engine Failure', sub: 'Unable to complete intercept â€” mechanical fault' },
        { name: 'ICGS SAMARATH Backup Deployed', sub: 'Offshore Patrol Vessel Â· 26 kn Â· Chennai Base' },
        { name: 'Target Intercepted & Boarded', sub: 'ICGS SAMARATH boarding party secures vessel' }
    ];
    const rescueMeta = [
        { name: 'Rescue Tug SAMUDRA SHAKTI Dispatched', sub: 'Ocean Rescue Tug Â· 16 kn Â· Kochi Port' },
        { name: 'Tug Unable to Reach in Time', sub: 'Sea state too rough â€” requesting SAR cutter' },
        { name: 'SAR Cutter VARUNA Backup Deployed', sub: 'Rapid Response Â· 28 kn Â· Coast Guard Station' },
        { name: 'Crew Rescued â€” Vessel Secured', sub: 'Tow line secured. MRCC notified.' }
    ];
    const stepMeta = isRescue ? rescueMeta : interceptMeta;
    
    const interceptStatus = {
        0: { 1: 'EN ROUTE â†’ TARGET', 2: 'AWAITING EVENT', 3: 'STANDBY', 4: 'AWAITING EVENT' },
        1: { 1: 'EN ROUTE â†’ TARGET', 2: 'AWAITING EVENT', 3: 'STANDBY', 4: 'AWAITING EVENT' },
        2: { 1: 'FAILED âœ•', 2: 'ENGINE FAULT DETECTED', 3: 'STANDBY', 4: 'AWAITING EVENT' },
        3: { 1: 'FAILED âœ•', 2: 'MISSION FAILED', 3: 'EN ROUTE â†’ TARGET', 4: 'AWAITING EVENT' },
        4: { 1: 'FAILED âœ•', 2: 'MISSION FAILED', 3: 'INTERCEPT SUCCESS âœ“', 4: 'âœ… TARGET SECURED' }
    };
    const rescueStatus = {
        0: { 1: 'EN ROUTE â†’ CASUALTY', 2: 'AWAITING EVENT', 3: 'STANDBY', 4: 'AWAITING EVENT' },
        1: { 1: 'EN ROUTE â†’ CASUALTY', 2: 'AWAITING EVENT', 3: 'STANDBY', 4: 'AWAITING EVENT' },
        2: { 1: 'TUG TURNED BACK âœ•', 2: 'SEA STATE TOO ROUGH', 3: 'STANDBY', 4: 'AWAITING EVENT' },
        3: { 1: 'TUG TURNED BACK âœ•', 2: 'PRIMARY TUG FAILED', 3: 'EN ROUTE â†’ CASUALTY', 4: 'AWAITING EVENT' },
        4: { 1: 'TUG TURNED BACK âœ•', 2: 'PRIMARY TUG FAILED', 3: 'RESCUE SUCCESS âœ“', 4: 'âœ… CREW RESCUED' }
    };
    const statusLabels = isRescue ? rescueStatus : interceptStatus;
    
    const colors = {
        active: isRescue ? '#f97316' : '#06b6d4',
        failed: '#ef4444',
        success: '#10b981',
        pending: '#475569'
    };
    
    steps.forEach((step, idx) => {
        const stepNum = idx + 1;
        step.classList.remove('active', 'failed', 'success', 'pending');
        
        let state = 'pending';
        if (stepNum < phase) {
            state = (stepNum === 2) ? 'failed' : 'success';
        } else if (stepNum === phase) {
            state = (phase === 4) ? 'success' : 'active';
        }
        step.classList.add(state);
        
        const dot = step.querySelector('.step-dot');
        const titleEl = step.querySelector('.mission-title');
        const subEl = step.querySelector('.mission-sub');
        const statusEl = step.querySelector('.mission-status');
        
        // Apply meta labels
        if (titleEl && stepMeta[idx]) {
            titleEl.textContent = stepMeta[idx].name;
            titleEl.style.color = state === 'pending' ? '#475569' : '#f8fafc';
        }
        if (subEl && stepMeta[idx]) {
            subEl.textContent = stepMeta[idx].sub;
            subEl.style.color = state === 'pending' ? '#475569' : '#64748b';
        }
        if (statusEl) {
            const label = (statusLabels[phase] || {})[stepNum] || '';
            statusEl.textContent = label;
            statusEl.style.color = colors[state] || '#475569';
        }
        if (dot) {
            if (state === 'active') {
                dot.style.background = colors.active;
                dot.style.border = 'none';
            } else if (state === 'failed') {
                dot.style.background = colors.failed;
                dot.style.border = 'none';
            } else if (state === 'success') {
                dot.style.background = colors.success;
                dot.style.border = 'none';
            } else {
                dot.style.background = 'rgba(255,255,255,0.06)';
                dot.style.border = '2px solid rgba(255,255,255,0.08)';
            }
        }
    });
    
    const statusEl = document.getElementById('dispatch-status-msg');
    if (statusEl) {
        const interceptMsgs = {
            1: 'ðŸ”µ Interceptor C-421 is en route to the target vessel...',
            2: 'ðŸ”´ C-421 engine failure! Requesting backup unit...',
            3: 'ðŸŸ¡ ICGS SAMARATH deploying from Chennai base...',
            4: 'âœ… Target intercepted & secured by ICGS SAMARATH!'
        };
        const rescueMsgs = {
            1: 'ðŸŸ  Rescue Tug SAMUDRA SHAKTI is en route to distressed vessel...',
            2: 'ðŸ”´ Rescue Tug turned back â€” sea state too rough! Backup requested...',
            3: 'ðŸŸ¡ SAR Cutter VARUNA deploying from coast guard station...',
            4: 'âœ… Crew rescued! Vessel secured and tow line attached!'
        };
        const msgs = isRescue ? rescueMsgs : interceptMsgs;
        statusEl.textContent = msgs[phase] || '';
        const borderColors = { 1: isRescue ? '#f97316' : '#06b6d4', 2: '#ef4444', 3: '#f59e0b', 4: '#10b981' };
        statusEl.style.borderLeftColor = borderColors[phase] || '#06b6d4';
    }
}




// Collapsible Panels Toggle
function setupInterfaceCollapsibles() {
    // Collapsible intel panel
    const intelBtn = document.getElementById('btn-toggle-intel');
    const intelPanel = document.getElementById('intel-panel');
    
    if (intelBtn && intelPanel) {
        intelBtn.addEventListener('click', () => {
            const isCollapsed = intelPanel.classList.contains('collapsed');
            const workspace = document.querySelector('.workstation-workspace');
            if (isCollapsed) {
                intelPanel.classList.remove('collapsed');
                if (workspace) workspace.classList.remove('intel-collapsed');
                intelBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
            } else {
                intelPanel.classList.add('collapsed');
                if (workspace) workspace.classList.add('intel-collapsed');
                intelBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
            }
            lucide.createIcons();
            setTimeout(() => mapRenderer.resize(), 300);
        });
    }
    
    // Collapsible filter panel
    const filterBtn = document.getElementById('btn-toggle-filter');
    const filterPanel = document.getElementById('filter-panel');
    
    if (filterBtn && filterPanel) {
        filterBtn.addEventListener('click', () => {
            const isCollapsed = filterPanel.classList.contains('collapsed');
            const workspace = document.querySelector('.workstation-workspace');
            if (isCollapsed) {
                filterPanel.classList.remove('collapsed');
                if (workspace) workspace.classList.remove('filters-collapsed');
                filterBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
            } else {
                filterPanel.classList.add('collapsed');
                if (workspace) workspace.classList.add('filters-collapsed');
                filterBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
            }
            lucide.createIcons();
            setTimeout(() => mapRenderer.resize(), 300);
        });
    }
    
    // Tab switcher
    const tabDossierBtn = document.getElementById('tab-dossier-btn');
    const tabAiBtn = document.getElementById('tab-ai-btn');
    const tabDossier = document.getElementById('tab-dossier');
    const tabAi = document.getElementById('tab-ai');
    
    tabDossierBtn.addEventListener('click', () => {
        tabDossierBtn.classList.add('active');
        tabAiBtn.classList.remove('active');
        tabDossier.classList.remove('hidden');
        tabAi.classList.add('hidden');
    });
    
    tabAiBtn.addEventListener('click', () => {
        tabAiBtn.classList.add('active');
        tabDossierBtn.classList.remove('active');
        tabAi.classList.remove('hidden');
        tabDossier.classList.add('hidden');
    });
    
    // Type button filter handler
    document.querySelectorAll('[data-type-btn]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('[data-type-btn]');
            document.querySelectorAll('[data-type-btn]').forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            document.getElementById('type').value = target.dataset.value;
            if (mapRenderer) mapRenderer.draw(0);
        });
    });
    
    // Risk button filter handler
    document.querySelectorAll('[data-risk-btn]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('[data-risk-btn]');
            document.querySelectorAll('[data-risk-btn]').forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            document.getElementById('risk').value = target.dataset.value;
            if (mapRenderer) mapRenderer.draw(0);
        });
    });
    
    // Search input listener
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (mapRenderer) mapRenderer.draw(0);
        });
    }
    
    // AIS lost checkbox listener
    const aisLostCheck = document.getElementById('ais-lost');
    if (aisLostCheck) {
        aisLostCheck.addEventListener('change', () => {
            if (mapRenderer) mapRenderer.draw(0);
        });
    }

    // Reset filters action
    const resetFiltersBtn = document.querySelector('.reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            document.getElementById('search').value = "";
            document.getElementById('type').value = "all";
            document.getElementById('risk').value = "all";
            document.getElementById('country').value = "all";
            document.getElementById('threat-range').value = 0;
            document.getElementById('ais-lost').checked = true;
            
            // Sync active states on buttons
            document.querySelectorAll('[data-type-btn]').forEach(b => {
                if (b.dataset.value === 'all') b.classList.add('active');
                else b.classList.remove('active');
            });
            document.querySelectorAll('[data-risk-btn]').forEach(b => {
                if (b.dataset.value === 'all') b.classList.add('active');
                else b.classList.remove('active');
            });
            
            setSelectedVesselGlobal(null);
            if (mapRenderer) mapRenderer.draw(0);
        });
    }
    
    // Collapsible timeline panel
    const timelineBtn = document.getElementById('btn-toggle-timeline');
    const timelinePanel = document.getElementById('activity-timeline');
    
    if (timelineBtn && timelinePanel) {
        timelineBtn.addEventListener('click', () => {
            const isCollapsed = timelinePanel.classList.contains('collapsed');
            const workspace = document.querySelector('.workstation-workspace');
            if (isCollapsed) {
                timelinePanel.classList.remove('collapsed');
                if (workspace) {
                    workspace.classList.remove('timeline-collapsed');
                    workspace.classList.remove('timeline-maximized');
                }
                timelineBtn.innerHTML = '<i data-lucide="chevron-down"></i>';
            } else {
                timelinePanel.classList.add('collapsed');
                if (workspace) {
                    workspace.classList.add('timeline-collapsed');
                    workspace.classList.remove('timeline-maximized');
                }
                timelineBtn.innerHTML = '<i data-lucide="chevron-up"></i>';
            }
            lucide.createIcons();
            setTimeout(() => {
                if (mapRenderer) mapRenderer.resize();
            }, 300);
        });
    }

    // Maximize/Minimize timeline panel
    const maxBtn = document.getElementById('btn-maximize-timeline');
    if (maxBtn && timelinePanel) {
        maxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMax = timelinePanel.classList.contains('maximized');
            const workspace = document.querySelector('.workstation-workspace');
            if (isMax) {
                timelinePanel.classList.remove('maximized');
                if (workspace) workspace.classList.remove('timeline-maximized');
                maxBtn.innerHTML = '<i data-lucide="maximize-2"></i>';
            } else {
                timelinePanel.classList.add('maximized');
                timelinePanel.classList.remove('collapsed');
                if (workspace) {
                    workspace.classList.add('timeline-maximized');
                    workspace.classList.remove('timeline-collapsed');
                }
                if (timelineBtn) timelineBtn.innerHTML = '<i data-lucide="chevron-down"></i>';
                maxBtn.innerHTML = '<i data-lucide="minimize-2"></i>';
            }
            lucide.createIcons();
            setTimeout(() => {
                if (mapRenderer) mapRenderer.resize();
            }, 300);
        });
    }
}

function syncVisualFilterControls() {
    const typeVal = document.getElementById('type').value;
    const riskVal = document.getElementById('risk').value;
    
    document.querySelectorAll('[data-type-btn]').forEach(b => {
        if (b.dataset.value === typeVal) b.classList.add('active');
        else b.classList.remove('active');
    });
    
    document.querySelectorAll('[data-risk-btn]').forEach(b => {
        if (b.dataset.value === riskVal) b.classList.add('active');
        else b.classList.remove('active');
    });
}

function triggerMapResize() {
    setTimeout(() => {
        if (mapRenderer) mapRenderer.resize();
    }, 200);
}

// ==========================================================================
// 5. KAVALU AI ASSISTANT SIMULATION
// ==========================================================================

function setupKavaluAISimulation() {
    const chatDialogue = document.getElementById('ai-dialogue');
    
    document.querySelectorAll('.ai-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const btn = e.target.closest('.ai-chip');
            const cmd = btn.dataset.cmd;
            const question = btn.textContent.trim();
            
            // Append User Question
            appendAiBubble('user', question);
            
            // Auto scroll chat
            chatDialogue.scrollTop = chatDialogue.scrollHeight;
            
            // Append Typing Indicator
            const typingBubble = appendAiBubble('bot', `<i data-lucide="loader" class="animate-spin-slow inline-icon"></i> Kavalu AI is processing request...`);
            lucide.createIcons();
            
            setTimeout(() => {
                // Remove typing indicator bubble
                typingBubble.remove();
                
                // Formulate simulated response
                let reply = "";
                
                if (cmd === 'reefs') {
                    reply = `<p><strong>Scanning Marine Sanctuary overlays...</strong></p>
                             <p>Found 1 unauthorized contact inside <em>Marine Coral Biosphere Reserve</em>:</p>
                             <p><strong>FV JAL-DEV-II</strong> (MMSI: 419302198). Threat Score: <strong>78%</strong> (AIS Lost Signal Alert).</p>
                             <p>I have set the search filters and focused the radar map to this vessel.</p>`;
                    
                    // Auto execute action in dashboard
                    document.getElementById('type').value = 'suspicious';
                    document.getElementById('risk').value = 'high';
                    syncVisualFilterControls();
                    setSelectedVesselGlobal('target-jal-dev');
                    
                } else if (cmd === 'highthreat') {
                    reply = `<p><strong>Scanning surveillance platform data...</strong></p>
                             <p>Found 2 active targets with threat scores exceeding 70% threshold:</p>
                             <p>1. <strong>MV SHENG-HAI</strong> (Threat Score: 82% - Restricted military zone entry)</p>
                             <p>2. <strong>FV JAL-DEV-II</strong> (Threat Score: 78% - Coral Reef sanctuary entry, AIS lost)</p>
                             <p>I have adjusted your Threat Score threshold to 70% (Risk Profile: Critical) to isolate these targets.</p>`;
                    
                    document.getElementById('threat-range').value = 70;
                    document.getElementById('risk').value = 'high';
                    syncVisualFilterControls();
                    setSelectedVesselGlobal(null);
                    
                } else if (cmd === 'destination') {
                    const selVesselId = mapRenderer.selectedVesselId;
                    if (selVesselId) {
                        const v = vessels.find(item => item.id === selVesselId);
                        reply = `<p><strong>Analyzing route trajectory for ${v.name}...</strong></p>
                                 <p>Based on heading ${v.heading}Â° and course history, estimated destination is <strong>${v.destination}</strong>.</p>
                                 <p>${v.anomaly}</p>`;
                    } else {
                        reply = `<p>No vessel is currently selected. Please select a vessel on the map first to analyze predicted routes.</p>`;
                    }
                } else if (cmd === 'patrol') {
                    const selVesselId = mapRenderer.selectedVesselId;
                    if (selVesselId) {
                        const v = vessels.find(item => item.id === selVesselId);
                        reply = `<p><strong>Calculating tactical proximity vectors...</strong></p>
                                 <p>Target: <strong>${v.name}</strong></p>
                                 <p>Recommended intercept asset: <strong>${v.cgAsset}</strong>.</p>
                                 <p>Proximity: Intercept path locked. Recommend immediate dispatch coordinates confirmation.</p>`;
                    } else {
                        reply = `<p>Please select a target vessel on the map first to identify nearest Coast Guard assets.</p>`;
                    }
                }
                
                appendAiBubble('bot', reply);
                chatDialogue.scrollTop = chatDialogue.scrollHeight;
            }, 1200);
        });
    });
}

function appendAiBubble(sender, content) {
    const chatDialogue = document.getElementById('ai-dialogue');
    const bubble = document.createElement('div');
    bubble.className = `ai-bubble ${sender}`;
    bubble.innerHTML = content;
    chatDialogue.appendChild(bubble);
    return bubble;
}

// ==========================================================================
// 6. TIMELINE LOG SIMULATOR
// ==========================================================================

const TIMELINE_LOGS = [
    { type: "info", text: "Automated weather alert: Wind speeds reaching 20 kts near Gulf of Mannar." },
    { type: "warning", text: "Vessel COSCO SHANGHAI 102 reported speed reduction of 4 kts in shipping lane." },
    { type: "critical", text: "Kadalu Kavalu Alert: Unauthorized Vessel Entered Protected Zone (MV SHENG-HAI in Military Range)." },
    { type: "suspicious", text: "Kadalu Kavalu Alert: AIS Signal Lost for FV JAL-DEV-II in Coral Reserve." },
    { type: "info", text: "Patrol Vessel ICGS SAMARATH reporting visual contact confirmed with suspicious cargo target." },
    { type: "info", text: "Air surveillance flight CG-782 returned to base. Sector surveillance data synced." },
    { type: "warning", text: "Radar scan detected unidentified drift pattern 14 nm south of Minicoy Island." },
    { type: "suspicious", text: "Kadalu Kavalu Alert: Illegal Fishing Activity Detected in Gujarat Coastal Zone (Trawler cluster)." },
    { type: "info", text: "Rescue helicopter launched from Cochin air station for emergency search sweep." },
    { type: "critical", text: "Kadalu Kavalu Alert: Threat Score escalation on MV SHENG-HAI from 48% to 82%." }
];

function addEventToTimeline(eventObj = null, isInitial = false) {
    const feed = document.getElementById('timeline-feed');
    if (!feed) return;
    
    let event = eventObj;
    if (!event) {
        if (Math.random() > 0.4 && vessels.length > 0) {
            const alertVessels = vessels.filter(v => v.threatScore > 50 || v.type === 'suspicious' || v.type === 'distress');
            if (alertVessels.length > 0) {
                const target = alertVessels[Math.floor(Math.random() * alertVessels.length)];
                if (target.type === 'distress') {
                    event = {
                        type: 'critical',
                        text: `\uD83C\uDD98 DISTRESS beacon active for ${target.name} (${target.country}). Adrift near ${target.destination}.`
                    };
                } else if (target.type === 'suspicious') {
                    event = {
                        type: 'suspicious',
                        text: `⚠️ UNIDENTIFIED contact: ${target.name} (${target.country}) traveling towards other country at ${target.speed} kn.`
                    };
                } else {
                    event = {
                        type: 'warning',
                        text: `🚨 ALERT: Threat score escalation (${target.threatScore}%) on ${target.name} (${target.country}) sailing to ${target.destination}.`
                    };
                }
            }
        }
        if (!event) {
            event = TIMELINE_LOGS[Math.floor(Math.random() * TIMELINE_LOGS.length)];
        }
    }
    const now = new Date();
    const timeStr = now.toISOString().slice(11, 19);
    
    const item = document.createElement('div');
    item.className = 'timeline-item' + (isInitial ? '' : ' new-update');
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'timeline-time';
    timeSpan.textContent = timeStr;
    
    const badgeSpan = document.createElement('span');
    badgeSpan.className = `timeline-badge ${event.type}`;
    badgeSpan.textContent = event.type === 'info' ? 'platform info' : event.type === 'critical' ? 'critical alert' : event.type;
    
    const msgSpan = document.createElement('span');
    msgSpan.className = 'timeline-msg';
    msgSpan.textContent = event.text;
    
    item.appendChild(timeSpan);
    item.appendChild(badgeSpan);
    item.appendChild(msgSpan);
    
    feed.insertBefore(item, feed.firstChild);
    
    if (feed.children.length > 20) feed.removeChild(feed.lastChild);
    
    if (!isInitial) {
        // Direct operator to the new update by scrolling to the top smoothly
        feed.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Remove flash indicator after animation finishes
        setTimeout(() => {
            item.classList.remove('new-update');
        }, 2500);
        
        if (voiceActive) {
            speakAnnouncement(event.text);
        }
    }
}

function populateInitialTimeline() {
    for (let i = 0; i < 6; i++) {
        addEventToTimeline(TIMELINE_LOGS[i % TIMELINE_LOGS.length], true);
    }
}

// ==========================================================================
// 7. TIME ENGINE & POSITION UPDATES
// ==========================================================================

let simSpeed = 1;

function setupTimeEngine() {
    setInterval(() => {
        const clock = document.getElementById('live-utc');
        if (clock) {
            const now = new Date();
            clock.textContent = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        }
    }, 1000);
}

function updateVesselPositions() {
    vessels.forEach(v => {
        // Distress vessels are stationary (engine failure / adrift)
        if (v.distress || v.type === 'distress') return;
        
        if (v.aisStatus === 'Lost' && Math.random() > 0.96) {
            v.lon += (Math.random() - 0.5) * 0.003;
            v.lat += (Math.random() - 0.5) * 0.003;
            return;
        }
        
        const speedKts = v.speed * simSpeed;
        const degPerFrame = (speedKts * 0.00027) / 60;
        
        const rad = (v.heading * Math.PI) / 180;
        v.lon += Math.sin(rad) * degPerFrame;
        v.lat += Math.cos(rad) * degPerFrame;
        
        if (v.lon < MAP_BOUNDS.minLon || v.lon > MAP_BOUNDS.maxLon || 
            v.lat < MAP_BOUNDS.minLat || v.lat > MAP_BOUNDS.maxLat) {
            v.heading = (v.heading + 180) % 360;
        }
        
        if (v.route && Math.hypot(v.lon - v.route.end.lon, v.lat - v.route.end.lat) < 0.2) {
            const temp = v.route.start;
            v.route.start = v.route.end;
            v.route.end = temp;
            v.heading = Math.floor(calculateHeading(v.lon, v.lat, v.route.end.lon, v.route.end.lat));
        }

        // Real-time geofence border monitoring
        GEOFENCES.forEach(geo => {
            const isInsideNow = isPointInPolygon({lon: v.lon, lat: v.lat}, geo.polygon);
            if (!v.insideGeofences) {
                v.insideGeofences = {};
            }
            const wasInside = !!v.insideGeofences[geo.id];
            
            if (isInsideNow && !wasInside) {
                v.insideGeofences[geo.id] = true;
                
                let severity = "info";
                let speechPriority = 'normal';
                if (geo.type === "military") {
                    severity = "critical";
                    speechPriority = 'critical';
                } else if (geo.type === "ecological") {
                    severity = "warning";
                    speechPriority = 'normal';
                }
                
                const alertMsg = `BOUNDARY VIOLATION: Vessel ${v.name} from ${v.country || 'Unknown'} has crossed the perimeter into ${geo.name}.`;
                addEventToTimeline({
                    type: severity,
                    text: `🚨 ${alertMsg}`
                });
                speakAnnouncement(alertMsg, speechPriority);
            } else if (!isInsideNow && wasInside) {
                v.insideGeofences[geo.id] = false;
            }
        });
    });
}

// ==========================================================================
// 8. THEME TOGGLER (Daytime vs. Nighttime views)
// ==========================================================================

function setupThemeToggler() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    toggleBtn.addEventListener('click', () => {
        const body = document.body;
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
        }
        
        // Redraw canvas with the new theme colors
        if (mapRenderer) {
            mapRenderer.draw(0);
        }
    });
    
    // Logout action to return to login screen
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            document.body.className = 'view-login dark-theme';
        });
    }
}

function setupVoiceToggler() {
    const voiceToggle = document.getElementById('voice-toggle');
    if (!voiceToggle) return;
    
    voiceToggle.addEventListener('click', () => {
        voiceActive = !voiceActive;
        const onIcon = voiceToggle.querySelector('.voice-on-icon');
        const offIcon = voiceToggle.querySelector('.voice-off-icon');
        
        if (voiceActive) {
            voiceToggle.classList.add('active');
            if (onIcon) onIcon.style.display = 'block';
            if (offIcon) offIcon.style.display = 'none';
            speakAnnouncement("Voice announcer active.");
        } else {
            voiceToggle.classList.remove('active');
            if (onIcon) onIcon.style.display = 'none';
            if (offIcon) offIcon.style.display = 'block';
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        }
    });
}

function setupHeaderZoomControls() {
    const zoomInBtn = document.getElementById('btn-header-zoom-in');
    const zoomOutBtn = document.getElementById('btn-header-zoom-out');
    
    if (zoomInBtn && zoomOutBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (mapRenderer) {
                mapRenderer.zoom = Math.min(30, mapRenderer.zoom * 1.25);
                mapRenderer.draw(0);
            }
        });
        zoomOutBtn.addEventListener('click', () => {
            if (mapRenderer) {
                mapRenderer.zoom = Math.max(0.4, mapRenderer.zoom / 1.25);
                mapRenderer.draw(0);
            }
        });
    }
}

function setupMapStyleControls() {
    const oceanBtn = document.getElementById('btn-style-ocean');
    const satBtn = document.getElementById('btn-style-satellite');
    
    if (oceanBtn && satBtn) {
        oceanBtn.addEventListener('click', () => {
            oceanBtn.classList.add('active');
            satBtn.classList.remove('active');
            if (mapRenderer) {
                mapRenderer.mapStyle = 'ocean';
                mapRenderer.draw(0);
            }
        });
        satBtn.addEventListener('click', () => {
            satBtn.classList.add('active');
            oceanBtn.classList.remove('active');
            if (mapRenderer) {
                mapRenderer.mapStyle = 'satellite';
                mapRenderer.draw(0);
            }
        });
    }
}

// ==========================================================================
// 9. SYSTEM INITIALIZATION
// ==========================================================================

window.addEventListener('DOMContentLoaded', () => {
    // Load world map SVG
    loadWorldMapSvg();
    
    // 1. Generate Simulated Datasets
    generateInitialVessels();
    
    // 2. Initialize Login Page triggers
    triggerLoginFlow();
    
    // Start the high-fidelity 3D Ocean Wave Login Backdrop animation
    const loginOcean = new Ocean3DAnimation('login-canvas');
    if (loginOcean.canvas) {
        loginOcean.start();
    }
    
    // 3. Initialize Map Renderer
    mapRenderer = new MapSurveillanceRenderer();
    mapRenderer.centerOn(77.5, 10.0); // Center on South India / Sri Lanka corridor
    
    // 4. Hook Interface logic
    setupInterfaceCollapsibles();
    setupKavaluAISimulation();
    setupTimeEngine();
    setupThemeToggler();
    setupVoiceToggler();
    setupHeaderZoomControls();
    setupMapStyleControls();
    syncVisualFilterControls();
    
    const closeBtn = document.getElementById('btn-close-details');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            setSelectedVesselGlobal(null);
        });
    }
    
    // Dispatch interceptor / rescue tug button â†’ launch simulation
    const dispatchBtn = document.getElementById('btn-dispatch');
    if (dispatchBtn) {
        dispatchBtn.addEventListener('click', () => {
            const vid = mapRenderer.selectedVesselId;
            const v = vessels.find(x => x.id === vid);
            if (!v) return;
            
            const isRescue = v.type === 'distress';
            const isThreat = v.threatScore > 30;
            
            // Only activate for threat or distress vessels
            if (!isRescue && !isThreat) return;
            
            // Start simulation
            mapRenderer.startDispatchSimulation(vid);
            
            // Set panel step 1 labels based on mission type
            if (isRescue) {
                setRescueMissionLabels();
                updateDispatchPhaseUI(1);
                addCustomEventToTimeline(`ðŸ†˜ RESCUE ALERT: Dispatching rescue tug to assist ${v.name}. Engine failure reported.`, 'critical');
            } else {
                updateDispatchPhaseUI(1);
            }
        });
    }
    
    const abortBtn = document.getElementById('btn-abort-dispatch');
    if (abortBtn) {
        abortBtn.addEventListener('click', () => {
            hideDispatchPanel();
            addCustomEventToTimeline('Dispatch mission ABORTED by operator.', 'warning');
        });
    }
    
    // 5. Populate logs
    populateInitialTimeline();
    lucide.createIcons();
    
    // 6. Set default selection on load (Initially clear selection to display all vessels)
    setSelectedVesselGlobal(null);
    
    // Timeline incremental updates
    setInterval(() => {
        if (document.body.classList.contains('view-dashboard')) {
            addEventToTimeline();
        }
    }, 15000);
    
    // 7. Core Surveillance Update Loop
    let lastTs = 0;
    function mainSurveillanceLoop(timestamp) {
        const dt = lastTs ? timestamp - lastTs : 16;
        lastTs = timestamp;
        
        if (document.body.classList.contains('view-dashboard')) {
            updateVesselPositions();
            updateDispatchSimulation(dt);
            mapRenderer.draw(timestamp);
            
            // Update active count HUD
            const activeCount = getFilteredVessels().length;
            const countEl = document.getElementById('vessel-count');
            if (countEl) countEl.textContent = activeCount;
            
            // Empty state handling for filters
            const emptyEl = document.getElementById('intel-no-selection');
            if (emptyEl && !emptyEl.classList.contains('hidden')) {
                emptyEl.querySelector('p').textContent = "No active vessels within the selected region.";
            }
        }
        requestAnimationFrame(mainSurveillanceLoop);
    }
    
    requestAnimationFrame(mainSurveillanceLoop);
});
