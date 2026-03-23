<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA"/>
</p>

<h1 align="center">
  <br>
  <img src="https://api.iconify.design/mdi:map-marker-radius.svg?color=%23000000" width="80" alt="SpotHunt Logo"/>
  <br>
  SpotHunt
  <br>
</h1>

<h4 align="center">Discover your next favorite spot - A hyperlocal discovery app for travelers and explorers</h4>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-cannabis-database">Cannabis DB</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Places-Google%20Maps%20API-4285F4?style=flat-square&logo=googlemaps" alt="Google Maps"/>
  <img src="https://img.shields.io/badge/Strains-9,523-22C55E?style=flat-square" alt="Strains"/>
  <img src="https://img.shields.io/badge/Dispensaries-6,595+-10B981?style=flat-square" alt="Dispensaries"/>
  <img src="https://img.shields.io/badge/Countries-20+-F59E0B?style=flat-square" alt="Countries"/>
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🗺️ Explore & Discover
- **Real-time Places** - Powered by Google Places API
- **Dual View** - Feed cards or interactive map
- **Smart Filters** - Distance, rating, price, open now
- **Categories** - Eat, Drink, Smoke, Culture, Nature, Coffee

### 🔥 Shuffle Mode
- **Tinder-style Discovery** - Swipe right to save
- **Vibe Filters** - Match your mood
- **One-tap Actions** - Like, skip, or get directions

</td>
<td width="50%">

### 🌿 Cannabis (Weeds)
- **9,523 Strains** - Searchable by effects & flavors
- **6,595+ Dispensaries** - Real photos from Google
- **Strain Journal** - Log your experiences
- **Global Coverage** - USA, Europe, South America

### 📱 PWA Ready
- **Install on Home Screen** - Native app feel
- **Offline Support** - Service worker caching
- **iPhone Optimized** - Notch & Dynamic Island safe

</td>
</tr>
</table>

---

## 📱 Screenshots

<p align="center">
  <i>Mobile-first design with PWA support for iOS and Android</i>
</p>

| Home Feed | Smoke Category | Weeds/Strains | Shuffle Mode |
|:---------:|:--------------:|:-------------:|:------------:|
| Discover nearby places with real photos | Cannabis dispensaries with Google Photos | 9,500+ strains database | Tinder-like place discovery |

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### Frontend
<p align="left">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white" alt="React"/>
  <br>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <br>
  <img src="https://img.shields.io/badge/Shadcn/UI-Components-000000?logo=shadcnui&logoColor=white" alt="Shadcn"/>
  <br>
  <img src="https://img.shields.io/badge/Framer_Motion-Animations-0055FF?logo=framer&logoColor=white" alt="Framer"/>
  <br>
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet&logoColor=white" alt="Leaflet"/>
</p>

</td>
<td valign="top" width="33%">

### Backend
<p align="left">
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white" alt="FastAPI"/>
  <br>
  <img src="https://img.shields.io/badge/Motor-Async_MongoDB-47A248?logo=mongodb&logoColor=white" alt="Motor"/>
  <br>
  <img src="https://img.shields.io/badge/Pydantic-Validation-E92063?logo=pydantic&logoColor=white" alt="Pydantic"/>
  <br>
  <img src="https://img.shields.io/badge/HTTPX-Async_HTTP-764ABC?logoColor=white" alt="HTTPX"/>
</p>

</td>
<td valign="top" width="33%">

### APIs & Services
<p align="left">
  <img src="https://img.shields.io/badge/Google_Places-API-4285F4?logo=googlemaps&logoColor=white" alt="Places"/>
  <br>
  <img src="https://img.shields.io/badge/Distance_Matrix-API-4285F4?logo=googlemaps&logoColor=white" alt="Distance"/>
  <br>
  <img src="https://img.shields.io/badge/Geocoding-API-4285F4?logo=googlemaps&logoColor=white" alt="Geocoding"/>
  <br>
  <img src="https://img.shields.io/badge/Google_Auth-Emergent-EA4335?logo=google&logoColor=white" alt="Auth"/>
</p>

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+  •  Python 3.9+  •  MongoDB  •  Google Maps API Key
```

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/spothunt.git
cd spothunt

# 2. Setup backend
cd backend
pip install -r requirements.txt

# 3. Setup frontend
cd ../frontend
yarn install

# 4. Configure environment variables (see below)

# 5. Start the app
# Backend: uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# Frontend: yarn start
```

### Environment Variables

<details>
<summary><b>Backend</b> <code>/backend/.env</code></summary>

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=spothunt
GOOGLE_MAPS_API_KEY=your_google_api_key
```
</details>

<details>
<summary><b>Frontend</b> <code>/frontend/.env</code></summary>

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```
</details>

---

## 📡 API Reference

### 🗺️ Places

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/api/places/` | Search nearby places with filters |
| `GET` | `/api/places/{id}` | Get detailed place information |
| `GET` | `/api/places/search-city` | Search cities by name |
| `GET` | `/api/places/reverse-geocode` | Get city from coordinates |

### 🌿 Cannabis

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/api/cannabis/strains` | Search strains by name, effects, type |
| `GET` | `/api/cannabis/strains/{id}` | Get strain details |
| `GET` | `/api/cannabis/dispensaries` | Get nearby dispensaries with photos |
| `GET` | `/api/cannabis/dispensaries/{id}` | Get dispensary details |
| `GET` | `/api/cannabis/stats` | Database statistics |
| `POST` | `/api/cannabis/journal` | Add strain journal entry |
| `GET` | `/api/cannabis/journal` | Get user's journal entries |

### 👤 User & Auth

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/api/auth/me` | Get current authenticated user |
| `POST` | `/api/auth/login` | Login with email/password |
| `POST` | `/api/auth/register` | Register new account |
| `POST` | `/api/favorites/toggle` | Add/remove from favorites |
| `GET` | `/api/favorites` | Get all user favorites |

---

## 🌍 Cannabis Database

<table>
<tr>
<td>

### 🇺🇸 Americas
| Country | Shops |
|---------|------:|
| USA | 4,790 |
| Canada | 25 |
| Brazil | 315 |
| Uruguay | 250 |

</td>
<td>

### 🇪🇺 Europe
| Country | Shops |
|---------|------:|
| Spain | 237 |
| Germany | 176 |
| Netherlands | 147 |
| Portugal | 93 |
| Italy | 77 |
| UK | 74 |
| France | 70 |

</td>
<td>

### 🌏 Other
| Country | Shops |
|---------|------:|
| Thailand | 85 |
| Czech Rep. | 51 |
| Greece | 49 |
| Poland | 49 |
| Austria | 45 |
| + more | ... |

</td>
</tr>
</table>

<p align="center">
  <b>Total: 6,595 dispensaries • 9,523 strains • 20+ countries</b>
</p>

---

## 📂 Project Structure

```
/app
├── 📁 backend/
│   ├── server.py              # FastAPI application (~2000 lines)
│   ├── google_places.py       # Google APIs integration with caching
│   ├── requirements.txt
│   └── .env
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── sw.js              # Service worker
│   │
│   └── 📁 src/
│       ├── 📁 components/
│       │   ├── BottomNav.jsx      # Navigation bar
│       │   ├── FeedCard.jsx       # Place cards
│       │   ├── LocationEditor.jsx # City search
│       │   ├── MapView.jsx        # Leaflet map
│       │   └── 📁 ui/             # Shadcn components
│       │
│       ├── 📁 pages/
│       │   ├── Home.jsx           # Explore feed
│       │   ├── Cannabis.jsx       # Weeds section
│       │   ├── Shuffle.jsx        # Tinder-like swipe
│       │   ├── Favorites.jsx      # Saved items
│       │   └── ...
│       │
│       ├── App.js                 # Routes & context
│       └── index.css              # Tailwind + PWA styles
│
└── 📁 memory/
    └── PRD.md                     # Product requirements
```

---

## 🎨 Design System

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `#fafafa` | `#0a0a0a` |
| Primary | `#171717` | `#f5f5f5` |
| Accent | `hsl(24, 95%, 53%)` | `hsl(24, 95%, 53%)` |
| Cards | `#ffffff` | `#171717` |

### Typography
- **Font**: Plus Jakarta Sans
- **Headings**: 600 weight
- **Body**: 400 weight

---

## 📱 PWA Features

- ✅ **Installable** - Add to home screen
- ✅ **Responsive** - Mobile-first design
- ✅ **Safe Areas** - iPhone notch & Dynamic Island support
- ✅ **Touch Optimized** - 44px+ touch targets
- ✅ **Service Worker** - Offline caching
- ✅ **Theme Colors** - Native status bar integration

---

## 🙏 Acknowledgments

- [Kushy Dataset](https://github.com/kushyapp/cannabis-dataset) - Cannabis strain data
- [Google Maps Platform](https://developers.google.com/maps) - Places and routing APIs
- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful UI components
- [Emergent](https://emergent.sh) - Hosting and authentication

---

<p align="center">
  <b>Made with ❤️ for travelers and explorers</b>
  <br>
  <sub>SpotHunt © 2024-2026</sub>
</p>
