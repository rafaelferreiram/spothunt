# CityBlend - Product Requirements Document

## Original Problem Statement
Build CityBlend - a hyperlocal discovery app for travelers. A mobile-first discovery app that surfaces personalized recommendations for places to eat, drink, explore, and experience based on real-time location, a built-in taste profile, and contextual trip intent.

**Update (Session 2)**: Added cannabis/weed dispensary discovery and strain information feature with real data.

## User Choices
- **Maps Provider**: Leaflet + OpenStreetMap (free, no API key)
- **Places Data**: Mock data (15 NYC places hardcoded)
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

### Jan 22, 2026 (Session 2)
- **Cannabis Feature**: Full strain and dispensary discovery
- **Real Data**: Imported Kushy open source cannabis dataset
- **9,523 Strains**: With effects, THC/CBD, flavors, medical uses
- **2,334 Dispensaries**: USA (2,304), Netherlands (7), Spain (5), Canada (13), Thailand (3)
- **Mobile-First**: Clean, minimalistic responsive design
- **External Links**: Integration with Leafly and Weedmaps for more info

## Prioritized Backlog

### P0 - Critical (Next)
- None - Core features complete

### P1 - High Priority
- [ ] Add more cities for places (Paris, London, Tokyo)
- [ ] Real-time "Open Now" based on current time
- [ ] Foursquare API for real place data
- [ ] Cannabis dispensary reviews

### P2 - Medium Priority
- [ ] Location search / "I'm visiting X city" feature
- [ ] Trip planning mode with date range
- [ ] Photo carousel on place cards
- [ ] User reviews/tips
- [ ] Share place/itinerary
- [ ] Strain comparison feature

### P3 - Nice to Have
- [ ] AI chat "find me a cozy spot for a date"
- [ ] Collaborative trip planning
- [ ] Day plan / itinerary builder
- [ ] Leafly API integration (when approved)
- [ ] Cannabis club membership tracking

## Next Tasks
1. Consider adding Foursquare API for real place data
2. Add cannabis dispensary reviews/ratings
3. Implement strain favorites/bookmarks
4. Add more EU cannabis clubs (Germany legal since 2024)

## Technical Notes

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
