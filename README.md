# ⚡ Velox Code

<div align="center">

![Velox Code Banner](https://raw.githubusercontent.com/Syron01/velox-code/main/assets/banner.svg)

**Lightning-fast online code playground** · Dart · HTML · JavaScript

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-velox--code-6b8cff?style=for-the-badge)](https://syron01.github.io/velox-code/)
[![GitHub Stars](https://img.shields.io/github/stars/Syron01/velox-code?style=for-the-badge&color=c792ea)](https://github.com/Syron01/velox-code/stargazers)
[![License MIT](https://img.shields.io/badge/License-MIT-52d88a?style=for-the-badge)](LICENSE)
[![Deploy](https://img.shields.io/github/actions/workflow/status/Syron01/velox-code/deploy.yml?style=for-the-badge&label=Deploy&color=ffcb6b)](https://github.com/Syron01/velox-code/actions)

</div>

---

## 🎯 Why Velox Code?

> **"The competition is slow. Velox is instant."**

| Feature | DartPad | CodePen | **Velox Code** |
|---|---|---|---|
| Dart support | ✅ | ❌ | ✅ |
| Instant HTML preview | ❌ | ✅ | ✅ |
| JS Web Workers | ❌ | partial | ✅ |
| Result caching | ❌ | ❌ | ✅ |
| Material UI | ❌ | ❌ | ✅ |
| Mobile optimized | partial | ❌ | ✅ |
| Dark + Light theme | ❌ | ✅ | ✅ |
| TR / EN language | ❌ | ❌ | ✅ |
| Share via URL | ✅ | ✅ | ✅ |
| Resizable panels | ❌ | ✅ | ✅ |

---

## ✨ Features

### 🚀 Ultra-Fast Execution
- **Dart** → DartPad API with **result cache** (same code = instant replay)
- **HTML** → `srcdoc` injection — **0ms** overhead, truly instant
- **JavaScript** → **Web Workers** for non-blocking sandboxed execution
- JS DOM code auto-detected and runs in isolated iframe

### 🎨 Award-Worthy Design
- **Material Soft Dark** color palette (`#0d0f14` base, `#6b8cff` primary)
- Smooth `cubic-bezier` transitions & micro-animations
- Monaco Editor with **custom Velox dark/light themes**
- Font ligatures (JetBrains Mono / Cascadia Code)
- Bracket pair colorization, smooth cursor animation

### 📱 Mobile First
- Fully responsive — desktop split view / mobile stack view
- **Draggable resizer** (mouse + touch)
- Hamburger sidebar with snippet browser
- Touch-optimized controls

### 🔧 Developer Experience
- `Shift+Enter` → Run code instantly
- `Alt+Shift+F` → Auto-format via Monaco
- **URL sharing** — entire code state encoded in hash
- Settings: font size, tab size, minimap, word wrap, auto-run
- Execution time display (ms)

### 🌍 Internationalization
- 🇬🇧 English / 🇹🇷 Türkçe
- Locale persisted in `localStorage`

---

## 📸 Screenshots

<div align="center">

| Dark Mode | Light Mode |
|---|---|
| ![Dark](https://raw.githubusercontent.com/Syron01/velox-code/main/assets/screenshot-dark.png) | ![Light](https://raw.githubusercontent.com/Syron01/velox-code/main/assets/screenshot-light.png) |

| Mobile View | Dart Execution |
|---|---|
| ![Mobile](https://raw.githubusercontent.com/Syron01/velox-code/main/assets/screenshot-mobile.png) | ![Dart](https://raw.githubusercontent.com/Syron01/velox-code/main/assets/screenshot-dart.png) |

</div>

---

## 🎨 Design System

```
Colors (Dark)          Colors (Light)
──────────────         ──────────────
Background  #0d0f14    Background  #f0f2f8
Surface     #1e2330    Surface     #ffffff
Primary     #6b8cff    Primary     #4466ee
Accent      #c792ea    Text        #1a1f3c
Success     #52d88a
Warning     #ffcb6b
Danger      #ff7070
```

**Typography:** JetBrains Mono (editor) · Inter (UI)

**Design principles:** Minimal surface, maximum contrast, purposeful motion

---

## 🛠️ Tech Stack

```
Frontend:
  Monaco Editor  @0.45.0   — Code editing engine (same as VS Code)
  Feather Icons  @4.29.0   — Minimal SVG icon set
  Vanilla JS     ES2022    — Zero framework dependencies
  CSS Custom Properties    — Full design token system

Execution:
  DartPad API    v3        — Dart compilation (Google-hosted)
  Web Workers              — Sandboxed JS execution
  srcdoc iframe            — Instant HTML preview

Deploy:
  GitHub Pages             — Auto-deploy via GitHub Actions
```

---

## 🚀 Getting Started

### Run Locally

```bash
# Clone
git clone https://github.com/Syron01/velox-code.git
cd velox-code

# Serve (any static file server)
npx serve .
# or
python -m http.server 8080
# or just open index.html in your browser
```

### Deploy Your Own

1. Fork this repo
2. Go to **Settings → Pages**
3. Set source to **GitHub Actions**
4. Push to `main` — it deploys automatically ✅

---

## 📖 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Shift + Enter` | Run code |
| `Alt + Shift + F` | Format code |
| `Ctrl + Z` | Undo |
| `Ctrl + /` | Toggle comment |
| `Ctrl + D` | Select next occurrence |
| `Ctrl + Shift + K` | Delete line |

---

## 🗂️ Project Structure

```
velox-code/
├── index.html              # App shell
├── css/
│   └── style.css           # Design system + all styles (~600 lines)
├── js/
│   ├── i18n.js             # EN/TR internationalization
│   ├── snippets.js         # Example code library
│   ├── editor.js           # Monaco editor manager + custom themes
│   ├── runner.js           # Dart/HTML/JS execution engine
│   └── app.js              # App controller, event wiring
├── assets/
│   └── favicon.svg         # SVG favicon
└── .github/
    └── workflows/
        └── deploy.yml      # Auto-deploy to GitHub Pages
```

---

## 🌐 Live Demo

**[https://syron01.github.io/velox-code/](https://syron01.github.io/velox-code/)**

---

## 📄 License

MIT © [Syron01](https://github.com/Syron01)

---

<div align="center">

Made with ⚡ and a lot of ☕

**[⭐ Star this repo](https://github.com/Syron01/velox-code)** if Velox Code helps you!

</div>
