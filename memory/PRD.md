# CityBlend - Product Requirements Document

## Original Problem Statement
Build CityBlend - a hyperlocal discovery app for travelers. A mobile-first discovery app that surfaces personalized recommendations for places to eat, drink, explore, and experience based on real-time location, a built-in taste profile, and contextual trip intent.

## User Choices
- **Maps Provider**: Leaflet + OpenStreetMap (free, no API key)
- **Places Data**: Mock data (15 NYC places hardcoded)
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

### Data Flow
```
User -> Landing -> Google OAuth -> Emergent Auth
    -> Onboarding (5 steps) -> Home (Feed/Map)
    -> Place Detail -> Google Maps / Uber deep links
```

## User Personas

### Primary: The Urban Explorer
- Travelers visiting new cities
- Wants personalized recommendations
- Values distance/time info
- Uses Google Maps/Uber for navigation

### Secondary: The Local Foodie
- Locals looking for hidden gems
- Saves places for later
- Filters by category and vibe

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

## What's Been Implemented

### Jan 22, 2026
- **MVP Complete**: Full CityBlend app with all core features
- **Backend**: FastAPI with 15 mock NYC places, auth, user profiles, saved places
- **Frontend**: React app with Organic Urban theme, feed/map views, onboarding
- **Auth**: Emergent Google OAuth integration
- **Design**: Custom theme with Fraunces + Plus Jakarta Sans fonts

## Prioritized Backlog

### P0 - Critical (Next)
- None - MVP complete

### P1 - High Priority
- [ ] Add more cities (Paris, London, Tokyo mock data)
- [ ] Real-time "Open Now" based on current time
- [ ] Location search / "I'm visiting X city" feature
- [ ] Trip planning mode with date range

### P2 - Medium Priority
- [ ] Foursquare API integration (free tier)
- [ ] Photo carousel on place cards
- [ ] User reviews/tips
- [ ] Share place/itinerary
- [ ] Offline saved places
- [ ] Push notifications for nearby saved places

### P3 - Nice to Have
- [ ] AI chat "find me a cozy spot for a date"
- [ ] Collaborative trip planning
- [ ] Day plan / itinerary builder
- [ ] AR camera mode
- [ ] Uber fare estimate in card

## Next Tasks
1. Test real Google OAuth flow (not test user)
2. Add more cities to mock data
3. Consider Foursquare API for real place data
4. Add photo carousel to place cards
5. Implement trip mode with date selection

## Technical Notes

### API Endpoints
- `GET /api/places/` - List places with filters
- `GET /api/places/{id}` - Single place detail
- `GET /api/places/categories/list` - Category list
- `POST /api/auth/session` - Exchange OAuth session
- `GET /api/auth/me` - Current user
- `POST /api/user/complete-onboarding` - Save taste profile
- `POST /api/user/save-place` - Save a place
- `DELETE /api/user/save-place/{id}` - Remove saved place

### Match Score Algorithm
```
match_score = 
  (vibe_overlap × 0.30) +
  (cuisine_match × 0.25) +
  (activity_match × 0.20) +
  (rating × 0.10) +
  (distance_score × 0.10) +
  (trending_boost × 0.05)
```

### Distance Calculations
- Walking: 80m/min (~3 mph)
- Driving: 400m/min (city estimate)
