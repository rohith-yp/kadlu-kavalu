# Kadalu Kavalu — Guardian of the Sea 🛡️⚓

**Real-time Advanced Tactical Maritime Surveillance & Sonar Command Hub**

A high-fidelity coastal surveillance simulation platform built with HTML, CSS, and Vanilla JavaScript.

---

## Features

- 🌊 **3D Gerstner Ocean Wave Animation** on the login screen using mathematical wave superposition
- 🗺️ **Interactive Maritime Map** with vessel tracking across the India–Sri Lanka channel
- 🚢 **Live Vessel Intelligence** — cargo ships, coast guard patrols, unknown radar contacts
- 🆘 **Distress & Rescue Simulation** — detect halted vessels, dispatch rescue tugs
- 📡 **Sonar Radar Sweeps** with volumetric glow and GPS targeting locks
- 🌙 **Dark / Light Theme Toggle**
- 🔍 **Filter & Search** vessels by type, status, and region

## Getting Started

```bash
# Serve locally with Python
python -m http.server 8080
```

Open **http://localhost:8080** in your browser.

## Tech Stack

- **HTML5 Canvas** — custom 2D/3D rendering engine (no WebGL)
- **Vanilla CSS** — glassmorphism, animations, responsive layout
- **Vanilla JavaScript** — Gerstner wave physics, map renderer, simulation engine
- **Lucide Icons** — crisp SVG icon set

## Project Structure

```
├── index.html   — App shell & layout
├── style.css    — Design system & animations
└── app.js       — Full simulation & rendering engine (~3100 lines)
```

---

*Built for coastal security awareness. All vessel data is simulated.*
