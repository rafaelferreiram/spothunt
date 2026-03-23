# CityBlend - Product Requirements Document

## Original Problem Statement
Build CityBlend - a hyperlocal discovery app for travelers. A mobile-first discovery app that surfaces personalized recommendations for places to eat, drink, explore, and experience based on real-time location, a built-in taste profile, and contextual trip intent.

**Update (Session 2)**: Added cannabis/weed dispensary discovery and strain information feature with real data.
**Update (Session 4)**: Integrated Google Places API for real-time place discovery and Google Distance Matrix API for accurate travel times.

## User Choices
- **Maps Provider**: Leaflet + OpenStreetMap for display, Google APIs for data
- **Places Data**: Real-time Google Places API (with mock fallback)
- **Travel Times**: Google Distance Matrix API (actual walking/driving times)
- **Geocoding**: Google Geocoding API for location names
- **Cannabis Data**: Real data from Kushy open source dataset (9,523 strains, 2,334 dispensaries)
- **Authentication**: Emergent Google Auth (free social login)
- **Theme**: Both dark and light mode with "Organic Urban" design

## Architecture

### Frontend (React)
- **Framework**: React 19 with React Router
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Shadcn/UI
- **Maps**: react-leaflet + Leaflet
- **State**: React Context for auth and theme

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **Database**: MongoDB with Motor async driver
- **Auth**: Emergent OAuth integration

### Data Sources
- **Places**: Mock data (15 NYC locations)
- **Cannabis Strains**: Kushy dataset (9,523 strains with effects, THC/CBD, flavors)
- **Dispensaries**: Kushy dataset + curated EU spots (2,334 locations across USA, Netherlands, Spain, Canada, Thailand, Germany)

## User Personas

### Primary: The Urban Explorer
- Travelers visiting new cities
- Wants personalized recommendations
- Values distance/time info
- Uses Google Maps/Uber for navigation

### Secondary: Cannabis Enthusiast
- Weed smokers looking for dispensaries
- Wants strain information (effects, THC/CBD)
- Needs legal dispensary locations worldwide
- Uses Leafly/Weedmaps for detailed info

## Core Requirements (Static)

### MVP Features (Implemented)
- [x] Emergent Google OAuth login
- [x] 5-step onboarding taste profile
- [x] Feed view with match-scored place cards
- [x] Map view with category-colored markers
- [x] Place detail page with full info
- [x] Distance, walking time, driving time
- [x] Google Maps deep link
- [x] Uber deep link
- [x] Category filtering (8 categories)
- [x] Open Now filter
- [x] Search functionality
- [x] Save/unsave places
- [x] Dark/Light mode toggle
- [x] Profile page with taste profile summary
- [x] Saved places page

### Cannabis Features (Implemented)
- [x] Cannabis page with Strains/Dispensaries tabs
- [x] 9,523 real cannabis strains
- [x] Strain search with type filters (Indica/Sativa/Hybrid)
- [x] Effect-based filtering (Relaxed, Happy, Euphoric, etc.)
- [x] Strain detail page (THC/CBD, effects, medical uses, flavors)
- [x] 2,334 dispensaries (USA, Netherlands, Spain, Canada, Thailand)
- [x] Dispensary search by location
- [x] Distance-based sorting from user location
- [x] Legal notes by country
- [x] External links to Leafly and Weedmaps

## What's Been Implemented

### Jan 22, 2026 (Session 1)
- **MVP Complete**: Full CityBlend app with all core features
- **Backend**: FastAPI with 15 mock NYC places, auth, user profiles, saved places
- **Frontend**: React app with Organic Urban theme, feed/map views, onboarding
- **Auth**: Emergent Google OAuth integration
- **Design**: Custom theme with Fraunces + Plus Jakarta Sans fonts

### Jan 22, 2026 (Session 3)
- **Minimalistic Design**: Clean, minimal UI across all pages
- **Reviews System**: Users can write 1-5 star reviews with text
- **Cannabis Tab Icon**: Changed to 🌿 emoji with "Greens" label
- **Cleaner Cards**: Streamlined place and strain cards
- **Review API**: Full CRUD for reviews on places, dispensaries, and strains
- **Cannabis Feature**: Full strain and dispensary discovery
- **Real Data**: Imported Kushy open source cannabis dataset
- **9,523 Strains**: With effects, THC/CBD, flavors, medical uses
- **2,334 Dispensaries**: USA (2,304), Netherlands (7), Spain (5), Canada (13), Thailand (3)
- **Mobile-First**: Clean, minimalistic responsive design
- **External Links**: Integration with Leafly and Weedmaps for more info

### March 23, 2026 (Session 4)
- **Google Places API**: Real-time nearby place discovery worldwide
- **Distance Matrix API**: Actual walking and driving times from Google
- **Geocoding API**: Location name resolution from coordinates
- **Travel Times**: Real walk_mins, drive_mins, walk_text, drive_text
- **Fixed Integration**: Backend properly calls Google APIs and enriches places
- **100% Test Pass**: All 15 backend tests pass, full frontend working

### March 23, 2026 (Session 5) - UI Overhaul & Filters
- **Advanced Filters**: Customizable radius (1km-100km), rating (3+/3.5+/4+/4.5+), price range, sort options
- **Filter Drawer**: Modern bottom sheet UI for all filter options
- **UI Redesign**: Clean minimalist design with neutral gray color scheme
- **PWA Support**: manifest.json, service worker, app icons for installable app
- **Updated Components**: Landing, Home, FeedCard, BottomNav all redesigned
- **37 Backend Tests**: All passing including new filter parameters

## Prioritized Backlog

### P0 - Critical (Next)
- None - Core features complete with Google APIs and advanced filters

### P1 - High Priority
- [ ] "I'm Visiting" mode - preview places in different cities
- [ ] Day Plan Builder - drag-and-drop itinerary
- [ ] Cannabis dispensary reviews
- [ ] Establishment age filter ("Open since X years")

### P2 - Medium Priority
- [ ] Location search / "I'm visiting X city" feature
- [ ] Trip planning mode with date range
- [ ] Photo carousel on place cards
- [ ] Share place/itinerary
- [ ] Strain comparison feature

### P3 - Nice to Have
- [ ] AI chat "find me a cozy spot for a date"
- [ ] Collaborative trip planning
- [ ] Push notifications for smart alerts
- [ ] AR camera mode
- [ ] Strain Journal for cannabis users

## Next Tasks
1. Implement "I'm Visiting" feature for city preview
2. Add Day Plan Builder with drag-and-drop
3. Cannabis dispensary reviews
4. Social sharing features

## Technical Notes

### Google API Endpoints
- `GET /api/places/?lat={lat}&lng={lng}` - Real nearby places from Google
- `GET /api/places/{place_id}` - Place details (supports google_ prefix IDs)
- `GET /api/places/nearby` - Direct Google Places search
- `GET /api/places/location?lat={lat}&lng={lng}` - Geocoding for location name

### Distance Matrix Integration
Places are enriched with actual travel times:
- `walk_mins` - Actual walking time from Google
- `drive_mins` - Actual driving time from Google
- `walk_text` - Human readable (e.g., "11 mins")
- `drive_text` - Human readable (e.g., "8 mins")
- `distance_m` - Walking distance in meters

### Cannabis API Endpoints
- `GET /api/cannabis/strains` - List strains with filters
- `GET /api/cannabis/strains/{id}` - Single strain detail
- `GET /api/cannabis/strains/search/{name}` - Autocomplete search
- `GET /api/cannabis/dispensaries` - List dispensaries with location
- `GET /api/cannabis/dispensaries/{id}` - Single dispensary detail
- `GET /api/cannabis/effects` - List all effects
- `GET /api/cannabis/flavors` - List all flavors
- `GET /api/cannabis/stats` - Database statistics

### Data Coverage by Country
| Country | Dispensaries | Status |
|---------|-------------|--------|
| USA | 2,304 | Recreational/Medical |
| Netherlands | 7 | Coffeeshops |
| Spain | 5 | Cannabis Clubs |
| Canada | 13 | Recreational |
| Thailand | 3 | Recreational (2022) |
| Germany | 1 | Cannabis Clubs (2024) |
