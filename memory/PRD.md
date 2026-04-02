# SpotHunt - Product Requirements Document

## Original Problem Statement
Build SpotHunt - a hyperlocal discovery app for travelers. A mobile-first discovery app that surfaces personalized recommendations for places to eat, drink, explore, and experience based on real-time location, a built-in taste profile, and contextual trip intent.

**Update (Session 2)**: Added cannabis/weed dispensary discovery and strain information feature with real data.
**Update (Session 4)**: Integrated Google Places API for real-time place discovery and Google Distance Matrix API for accurate travel times.
**Update (Session 8)**: Renamed app from "CityBlend" to "SpotHunt". Added food/drink type filters and Strain Journal feature.
**Update (Session 11)**: Unified Weeds/Smoke tabs, created SpotHunt logo, removed Journal/Plans, added PWA install prompt, Near Me Now mode.

## User Choices
- **Maps Provider**: Leaflet + OpenStreetMap for display, Google APIs for data
- **Places Data**: Real-time Google Places API (with mock fallback)
- **Travel Times**: Google Distance Matrix API (actual walking/driving times)
- **Geocoding**: Google Geocoding API for location names
- **Cannabis Data**: Real data from Kushy open source dataset (9,523 strains, 2,334 dispensaries)
- **Authentication**: Emergent Google Auth (free social login) + Password auth
- **Theme**: Both dark and light mode
- **Navigation**: Deep links to Google Maps, Waze, Apple Maps via NavigationDrawer

## Architecture

### Frontend (React)
- **Framework**: React 19 with React Router
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Shadcn/UI
- **Icons**: @phosphor-icons/react (primary), lucide-react (legacy)
- **Maps**: react-leaflet + Leaflet
- **State**: React Context for auth, theme, and location
- **PWA**: manifest.json, service worker, install prompt

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **Database**: MongoDB with Motor async driver
- **Auth**: Emergent OAuth + Password auth with JWT

### Data Sources
- **Places**: Google Places API (real-time)
- **Cannabis Strains**: Kushy dataset (9,523 strains)
- **Dispensaries**: Kushy dataset + Google Places (6,595 worldwide)

## Core Requirements

### MVP Features (Implemented)
- [x] Emergent Google OAuth login + Password auth
- [x] 5-step onboarding taste profile
- [x] Feed view with match-scored place cards
- [x] Map view with category-colored markers
- [x] Place detail page with full info
- [x] Distance, walking time, driving time
- [x] "Near Me Now" quick toggle (500m radius, open now, sort by distance)
- [x] NavigationDrawer with Google Maps/Waze/Apple Maps deep links
- [x] Category filtering (Eat, Drink, Smoke, Culture, Views, Nature, Coffee, Markets)
- [x] Sub-category filters for each category
- [x] Open Now filter
- [x] Search functionality
- [x] Save/unsave places
- [x] Dark/Light mode toggle
- [x] Profile page
- [x] Saved places / Favorites
- [x] SpotHunt logo (SVG) in Landing and PWA

### Cannabis Features (Implemented)
- [x] Weeds page with Spots/Strains/Favorites tabs
- [x] Spots tab with sub-filters (Dispensary, Cannabis Shop, CBD Store, Hemp Shop, Coffeeshop, Head Shop)
- [x] Feed and List view modes for dispensaries
- [x] NavigationDrawer on dispensary cards
- [x] 9,523 real cannabis strains with filters
- [x] Strain search with type filters (Indica/Sativa/Hybrid)
- [x] Effect-based filtering
- [x] Regional strain recommendations ("Popular Here")
- [x] Distance-based sorting
- [x] Favorites system for strains and dispensaries

### PWA Features (Implemented)
- [x] Service worker for offline support
- [x] Custom app icons (192px, 512px, apple-touch)
- [x] Install prompt banner (InstallPWA component)
- [x] Safe area support for iPhone notch/Dynamic Island
- [x] Standalone display mode

## Prioritized Backlog

### P0 - Critical
- None - Core features complete

### P1 - High Priority
- [ ] Cannabis dispensary reviews
- [ ] Backend refactoring (split server.py into routers)
- [ ] Increase JWT session duration to 7+ days

### P2 - Medium Priority
- [ ] Trip planning mode with date range
- [ ] Photo carousel on place cards
- [ ] Share place/itinerary
- [ ] Strain comparison feature

### P3 - Nice to Have
- [ ] AI chat "find me a cozy spot for a date"
- [ ] Collaborative trip planning
- [ ] Push notifications for smart alerts

## Next Tasks
1. Cannabis dispensary reviews functionality
2. Backend refactoring - split server.py into modular routers
3. Increase JWT session duration to 7+ days
4. Social sharing features
5. AI-powered recommendations chat

## Technical Notes

### Key API Endpoints
- `GET /api/places/?lat={lat}&lng={lng}` - Nearby places
- `GET /api/places/{place_id}` - Place details
- `GET /api/places/location?lat={lat}&lng={lng}` - Geocoding
- `GET /api/cannabis/strains` - List strains with filters
- `GET /api/cannabis/dispensaries` - List dispensaries with location
- `GET /api/cannabis/favorites` - User favorites
- `POST /api/cannabis/favorites` - Add favorite

### Code Architecture
```
/app/
├── backend/
│   ├── server.py          # Monolithic FastAPI (NEEDS REFACTOR)
│   ├── google_places.py
│   └── .env
├── frontend/
│   ├── public/            # PWA assets, icons, manifest
│   ├── src/
│   │   ├── App.js         # Routes, Contexts (Auth/Theme/Location)
│   │   ├── index.css      # Theme vars, safe areas, animations
│   │   ├── components/
│   │   │   ├── SpotHuntLogo.jsx     # SVG logo
│   │   │   ├── InstallPWA.jsx       # PWA install banner
│   │   │   ├── FeedCard.jsx         # Place card with NavigationDrawer
│   │   │   ├── NavigationDrawer.jsx # Maps deep linking
│   │   │   ├── LocationEditor.jsx   # GPS + city search
│   │   │   ├── BottomNav.jsx        # 4 tabs
│   │   │   ├── MapView.jsx
│   │   │   └── Reviews.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # With SpotHuntLogo
│   │   │   ├── Home.jsx       # Main feed with categories
│   │   │   ├── Cannabis.jsx   # Spots/Strains/Favs (unified)
│   │   │   ├── Shuffle.jsx    # Tinder-like discovery
│   │   │   ├── Visiting.jsx   # City exploration
│   │   │   └── ...
```
