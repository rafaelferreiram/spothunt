# 🌆 CityBlend

**Discover amazing places wherever you go** - A hyperlocal discovery app for travelers and explorers.

CityBlend helps you find the best restaurants, bars, cafes, cultural spots, and cannabis dispensaries near you with real-time data from Google Maps.

## ✨ Features

### 🗺️ Explore
- **Feed View** - Scroll through nearby places with photos, ratings, and travel times
- **Map View** - See all spots on an interactive map
- **Smart Filters** - Filter by distance (1-100km), rating, price, and more
- **Category Filters** - Food, Drinks, Coffee, Culture, Nature, Markets

### 🔥 Shuffle
- **Tinder-like Discovery** - Swipe right to save, left to skip
- **Vibe Filters** - Set your mood: Food, Drinks, Coffee, Culture, Nature, or Weeds
- **Drag or Tap** - Swipe cards or use the action buttons

### 🌿 Weeds
- **6,030+ Cannabis Spots** - CBD shops, dispensaries, coffeeshops worldwide
- **9,523 Strains** - Search strains by effects, flavors, and type
- **Real Data** - Sourced from Google Maps for accuracy
- **Coverage**: USA (4,790), Spain (237), Germany (176), Netherlands (147), Portugal (93), + 15 more countries

### 📍 Real-Time Data
- **Google Places API** - Real nearby places, not mock data
- **Google Distance Matrix** - Actual walking and driving times
- **User Location** - Automatic location detection

### 💾 Save & Review
- **Save Places** - Build your personal favorites list
- **Add Reviews** - Share your experience with ratings and comments

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Framer Motion** - Animations (Shuffle swipe)
- **Leaflet** - Map rendering
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **HTTPX** - Async HTTP client

### Database
- **MongoDB** - Document database

### APIs
- **Google Places API** - Place search and details
- **Google Distance Matrix API** - Travel times
- **Google Geocoding API** - Location names
- **Emergent Google Auth** - Social login

## 📱 PWA Support

CityBlend is a Progressive Web App - install it on your phone's home screen for a native app experience!

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- Google Maps API Key

### Environment Variables

**Backend** (`/backend/.env`):
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=cityblend
GOOGLE_MAPS_API_KEY=your_google_api_key
```

**Frontend** (`/frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cityblend.git
cd cityblend
```

2. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Install frontend dependencies**
```bash
cd frontend
yarn install
```

4. **Import cannabis data** (optional)
```bash
cd backend
python import_cannabis_data.py
python add_european_shops.py
python search_usa_shops.py
```

5. **Start the backend**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

6. **Start the frontend**
```bash
cd frontend
yarn start
```

7. **Open in browser**
```
http://localhost:3000
```

## 📡 API Endpoints

### Places
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places/` | Get nearby places with filters |
| GET | `/api/places/{id}` | Get place details |
| GET | `/api/places/location` | Reverse geocode coordinates |

### Cannabis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cannabis/strains` | Search cannabis strains |
| GET | `/api/cannabis/strains/{id}` | Get strain details |
| GET | `/api/cannabis/dispensaries` | Get nearby dispensaries |
| GET | `/api/cannabis/dispensaries/{id}` | Get dispensary details |
| GET | `/api/cannabis/stats` | Get database statistics |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/{type}/{id}` | Get reviews for a place |
| POST | `/api/reviews` | Add a new review |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/user/save-place` | Save a place to favorites |
| DELETE | `/api/user/save-place/{id}` | Remove from favorites |

## 📂 Project Structure

```
/app
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── google_places.py       # Google APIs integration
│   ├── import_cannabis_data.py
│   ├── add_european_shops.py
│   ├── search_usa_shops.py
│   ├── search_google_shops.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   ├── sw.js              # Service worker
│   │   └── icon-*.png         # App icons
│   └── src/
│       ├── components/
│       │   ├── BottomNav.jsx
│       │   ├── FeedCard.jsx
│       │   ├── MapView.jsx
│       │   ├── Reviews.jsx
│       │   └── ui/            # Shadcn components
│       ├── pages/
│       │   ├── Home.jsx       # Explore page
│       │   ├── Shuffle.jsx    # Tinder-like swipe
│       │   ├── Cannabis.jsx   # Weeds section
│       │   ├── PlaceDetail.jsx
│       │   ├── StrainDetail.jsx
│       │   ├── DispensaryDetail.jsx
│       │   └── ...
│       ├── App.js
│       └── index.css
└── memory/
    └── PRD.md                 # Product requirements
```

## 🗄️ Database Schema

### Users
```javascript
{
  email: String,
  name: String,
  picture: String,
  taste_profile: Object,
  onboarding_completed: Boolean,
  saved_places: [String]
}
```

### Strains
```javascript
{
  strain_id: String,
  name: String,
  type: String,  // Indica, Sativa, Hybrid
  description: String,
  effects: [String],
  ailments: [String],
  flavors: [String],
  thc: Number,
  cbd: Number
}
```

### Dispensaries
```javascript
{
  shop_id: String,
  name: String,
  type: String,  // Dispensary, CBD Shop, Coffeeshop
  address: String,
  city: String,
  state: String,
  country: String,
  coordinates: { lat: Number, lng: Number },
  rating: Number,
  is_dispensary: Boolean
}
```

### Reviews
```javascript
{
  user_id: String,
  entity_id: String,
  entity_type: String,  // place, dispensary
  rating: Number,
  comment: String,
  created_at: Date
}
```

## 🌍 Cannabis Coverage

| Region | Countries | Shops |
|--------|-----------|-------|
| 🇺🇸 USA | 24 states | 4,790 |
| 🇪🇸 Spain | Cannabis clubs | 237 |
| 🇩🇪 Germany | CBD/Cannabis clubs | 176 |
| 🇳🇱 Netherlands | Coffeeshops | 147 |
| 🇵🇹 Portugal | CBD shops | 93 |
| 🇮🇹 Italy | CBD shops | 77 |
| 🇬🇧 UK | CBD shops | 74 |
| 🇫🇷 France | CBD shops | 70 |
| + 12 more | Various | 366 |

**Total: 6,030 cannabis/CBD spots worldwide**

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [Kushy Dataset](https://github.com/kushyapp/cannabis-dataset) - Cannabis strain data
- [Google Maps Platform](https://developers.google.com/maps) - Places and routing APIs
- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful UI components
- [Emergent](https://emergent.sh) - Hosting and authentication

---

Made with ❤️ for travelers and explorers 🌍
