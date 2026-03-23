from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import math

# Import Google Places service
from google_places import (
    search_nearby_places, 
    get_place_details, 
    reverse_geocode,
    calculate_distance,
    calculate_walk_time,
    calculate_drive_time
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth")
places_router = APIRouter(prefix="/api/places")
user_router = APIRouter(prefix="/api/user")
cannabis_router = APIRouter(prefix="/api/cannabis")
reviews_router = APIRouter(prefix="/api/reviews")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class TasteProfile(BaseModel):
    vibes: List[str] = []
    cuisines: List[str] = []
    dietary: List[str] = []
    drink_style: Optional[str] = None
    bar_vibes: List[str] = []
    activities: List[str] = []
    travel_style: Optional[str] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    taste_profile: Optional[TasteProfile] = None
    onboarding_completed: bool = False
    saved_places: List[str] = []
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class Place(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    category: str
    subcategories: List[str] = []
    vibe_tags: List[str] = []
    address: str
    neighborhood: str
    city: str
    coordinates: dict
    rating: float
    review_count: int
    price_level: int
    hours: dict = {}
    is_open: bool = True
    closes_at: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    photos: List[str] = []
    description: Optional[str] = None
    match_score: int = 0
    distance_m: int = 0
    walk_mins: int = 0
    drive_mins: int = 0

class TasteProfileUpdate(BaseModel):
    vibes: Optional[List[str]] = None
    cuisines: Optional[List[str]] = None
    dietary: Optional[List[str]] = None
    drink_style: Optional[str] = None
    bar_vibes: Optional[List[str]] = None
    activities: Optional[List[str]] = None
    travel_style: Optional[str] = None

class SavePlaceRequest(BaseModel):
    place_id: str

class ReviewCreate(BaseModel):
    place_id: str
    place_type: str  # 'place' or 'dispensary'
    rating: int  # 1-5
    text: Optional[str] = None
    photos: List[str] = []

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str
    user_id: str
    user_name: str
    user_picture: Optional[str] = None
    place_id: str
    place_type: str
    rating: int
    text: Optional[str] = None
    photos: List[str] = []
    helpful_count: int = 0
    created_at: datetime

# ============== AUTH HELPERS ==============

async def get_current_user(request: Request) -> User:
    """Get current user from session token (cookie or Authorization header)"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return User(**user_doc)

# ============== AUTH ROUTES ==============

@auth_router.post("/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client_http:
        try:
            emergent_response = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if emergent_response.status_code != 200:
                logger.error(f"Emergent auth error: {emergent_response.text}")
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = emergent_response.json()
        except httpx.RequestError as e:
            logger.error(f"Request error: {e}")
            raise HTTPException(status_code=500, detail="Auth service error")
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "taste_profile": None,
            "onboarding_completed": False,
            "saved_places": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Remove old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    # Get user doc
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {"user": user_doc}

@auth_router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return user.model_dump()

@auth_router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out"}

# ============== USER ROUTES ==============

@user_router.put("/taste-profile")
async def update_taste_profile(
    profile: TasteProfileUpdate,
    user: User = Depends(get_current_user)
):
    """Update user's taste profile"""
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    
    if update_data:
        await db.users.update_one(
            {"user_id": user.user_id},
            {
                "$set": {
                    f"taste_profile.{k}": v for k, v in update_data.items()
                }
            }
        )
    
    updated_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated_user

@user_router.post("/complete-onboarding")
async def complete_onboarding(
    profile: TasteProfile,
    user: User = Depends(get_current_user)
):
    """Complete onboarding and save full taste profile"""
    await db.users.update_one(
        {"user_id": user.user_id},
        {
            "$set": {
                "taste_profile": profile.model_dump(),
                "onboarding_completed": True
            }
        }
    )
    
    updated_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated_user

@user_router.post("/save-place")
async def save_place(
    req: SavePlaceRequest,
    user: User = Depends(get_current_user)
):
    """Save a place to user's saved places"""
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$addToSet": {"saved_places": req.place_id}}
    )
    return {"message": "Place saved"}

@user_router.delete("/save-place/{place_id}")
async def unsave_place(
    place_id: str,
    user: User = Depends(get_current_user)
):
    """Remove a place from user's saved places"""
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$pull": {"saved_places": place_id}}
    )
    return {"message": "Place removed"}

@user_router.get("/saved-places")
async def get_saved_places(user: User = Depends(get_current_user)):
    """Get user's saved places"""
    return {"saved_places": user.saved_places}

# ============== PLACES MOCK DATA ==============

MOCK_PLACES = [
    {
        "id": "nyc_1",
        "name": "The Dead Rabbit",
        "category": "bar",
        "subcategories": ["cocktail_bar", "speakeasy", "irish_pub"],
        "vibe_tags": ["hidden_gem", "date_night", "award_winning", "rooftop"],
        "address": "30 Water St, New York, NY 10004",
        "neighborhood": "Financial District",
        "city": "New York",
        "coordinates": {"lat": 40.7033, "lng": -74.0126},
        "rating": 4.8,
        "review_count": 3200,
        "price_level": 3,
        "hours": {"monday": "11:00-04:00", "tuesday": "11:00-04:00", "wednesday": "11:00-04:00", "thursday": "11:00-04:00", "friday": "11:00-04:00", "saturday": "12:00-04:00", "sunday": "12:00-04:00"},
        "is_open": True,
        "closes_at": "04:00",
        "phone": "+1-212-422-7906",
        "website": "https://deadrabbitnyc.com",
        "photos": ["https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800", "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800"],
        "description": "Award-winning cocktail bar known for its Irish whiskey collection and historic setting. Featured in World's 50 Best Bars."
    },
    {
        "id": "nyc_2",
        "name": "Russ & Daughters Cafe",
        "category": "restaurant",
        "subcategories": ["brunch", "jewish_deli", "breakfast"],
        "vibe_tags": ["foodie", "classic", "local_favorite", "instagram"],
        "address": "127 Orchard St, New York, NY 10002",
        "neighborhood": "Lower East Side",
        "city": "New York",
        "coordinates": {"lat": 40.7201, "lng": -73.9887},
        "rating": 4.7,
        "review_count": 2800,
        "price_level": 2,
        "hours": {"monday": "09:00-22:00", "tuesday": "09:00-22:00", "wednesday": "09:00-22:00", "thursday": "09:00-22:00", "friday": "09:00-22:00", "saturday": "08:00-22:00", "sunday": "08:00-22:00"},
        "is_open": True,
        "closes_at": "22:00",
        "phone": "+1-212-475-4880",
        "website": "https://russanddaughters.com",
        "photos": ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800"],
        "description": "Iconic NYC appetizing shop since 1914. Famous for bagels, lox, and traditional Jewish fare."
    },
    {
        "id": "nyc_3",
        "name": "The High Line",
        "category": "outdoors",
        "subcategories": ["park", "walking_tour", "landmark"],
        "vibe_tags": ["instagram", "views", "relaxed", "free"],
        "address": "New York, NY 10011",
        "neighborhood": "Chelsea",
        "city": "New York",
        "coordinates": {"lat": 40.7480, "lng": -74.0048},
        "rating": 4.9,
        "review_count": 52000,
        "price_level": 0,
        "hours": {"monday": "07:00-22:00", "tuesday": "07:00-22:00", "wednesday": "07:00-22:00", "thursday": "07:00-22:00", "friday": "07:00-22:00", "saturday": "07:00-22:00", "sunday": "07:00-22:00"},
        "is_open": True,
        "closes_at": "22:00",
        "phone": None,
        "website": "https://thehighline.org",
        "photos": ["https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800", "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800"],
        "description": "Elevated linear park built on a historic freight rail line. Stunning views of the Hudson River and city skyline."
    },
    {
        "id": "nyc_4",
        "name": "230 Fifth Rooftop Bar",
        "category": "bar",
        "subcategories": ["rooftop_bar", "lounge", "nightclub"],
        "vibe_tags": ["rooftop", "views", "trendy", "date_night"],
        "address": "230 Fifth Ave, New York, NY 10001",
        "neighborhood": "Flatiron",
        "city": "New York",
        "coordinates": {"lat": 40.7441, "lng": -73.9882},
        "rating": 4.3,
        "review_count": 8500,
        "price_level": 3,
        "hours": {"monday": "16:00-02:00", "tuesday": "16:00-02:00", "wednesday": "16:00-02:00", "thursday": "16:00-04:00", "friday": "16:00-04:00", "saturday": "12:00-04:00", "sunday": "12:00-02:00"},
        "is_open": True,
        "closes_at": "02:00",
        "phone": "+1-212-725-4300",
        "website": "https://230-fifth.com",
        "photos": ["https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800", "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800"],
        "description": "NYC's largest outdoor rooftop garden and enclosed penthouse lounge with stunning Empire State Building views."
    },
    {
        "id": "nyc_5",
        "name": "Whitney Museum of American Art",
        "category": "museum",
        "subcategories": ["art_museum", "contemporary_art", "landmark"],
        "vibe_tags": ["cultural", "instagram", "views", "rainy_day"],
        "address": "99 Gansevoort St, New York, NY 10014",
        "neighborhood": "Meatpacking District",
        "city": "New York",
        "coordinates": {"lat": 40.7396, "lng": -74.0089},
        "rating": 4.6,
        "review_count": 15000,
        "price_level": 2,
        "hours": {"monday": "10:30-18:00", "tuesday": "closed", "wednesday": "10:30-18:00", "thursday": "10:30-18:00", "friday": "10:30-22:00", "saturday": "10:30-18:00", "sunday": "10:30-18:00"},
        "is_open": True,
        "closes_at": "18:00",
        "phone": "+1-212-570-3600",
        "website": "https://whitney.org",
        "photos": ["https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800", "https://images.unsplash.com/photo-1566054757965-8c4085344c96?w=800"],
        "description": "World-renowned museum dedicated to 20th and 21st-century American art. Stunning Renzo Piano building with outdoor terraces."
    },
    {
        "id": "nyc_6",
        "name": "Joe's Pizza",
        "category": "restaurant",
        "subcategories": ["pizza", "fast_casual", "late_night"],
        "vibe_tags": ["local_favorite", "classic", "budget_friendly", "late_night"],
        "address": "7 Carmine St, New York, NY 10014",
        "neighborhood": "Greenwich Village",
        "city": "New York",
        "coordinates": {"lat": 40.7305, "lng": -74.0023},
        "rating": 4.5,
        "review_count": 12000,
        "price_level": 1,
        "hours": {"monday": "10:00-05:00", "tuesday": "10:00-05:00", "wednesday": "10:00-05:00", "thursday": "10:00-05:00", "friday": "10:00-05:00", "saturday": "10:00-05:00", "sunday": "10:00-05:00"},
        "is_open": True,
        "closes_at": "05:00",
        "phone": "+1-212-366-1182",
        "website": None,
        "photos": ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800"],
        "description": "Legendary NYC pizza joint serving classic New York slices since 1975. A late-night institution."
    },
    {
        "id": "nyc_7",
        "name": "Bemelmans Bar",
        "category": "bar",
        "subcategories": ["cocktail_bar", "piano_bar", "hotel_bar"],
        "vibe_tags": ["elegant", "date_night", "classic", "live_music"],
        "address": "35 E 76th St, New York, NY 10021",
        "neighborhood": "Upper East Side",
        "city": "New York",
        "coordinates": {"lat": 40.7742, "lng": -73.9634},
        "rating": 4.7,
        "review_count": 1800,
        "price_level": 4,
        "hours": {"monday": "16:30-00:30", "tuesday": "16:30-00:30", "wednesday": "16:30-00:30", "thursday": "16:30-00:30", "friday": "16:30-01:00", "saturday": "16:30-01:00", "sunday": "12:00-00:00"},
        "is_open": True,
        "closes_at": "00:30",
        "phone": "+1-212-744-1600",
        "website": "https://rosewoodhotels.com",
        "photos": ["https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800", "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800"],
        "description": "Iconic Art Deco bar at The Carlyle hotel featuring live jazz and walls painted by Ludwig Bemelmans."
    },
    {
        "id": "nyc_8",
        "name": "Smorgasburg",
        "category": "market",
        "subcategories": ["food_market", "outdoor_market", "weekend"],
        "vibe_tags": ["foodie", "trendy", "instagram", "local_favorite"],
        "address": "90 Kent Ave, Brooklyn, NY 11249",
        "neighborhood": "Williamsburg",
        "city": "New York",
        "coordinates": {"lat": 40.7216, "lng": -73.9614},
        "rating": 4.5,
        "review_count": 6500,
        "price_level": 2,
        "hours": {"monday": "closed", "tuesday": "closed", "wednesday": "closed", "thursday": "closed", "friday": "closed", "saturday": "11:00-18:00", "sunday": "11:00-18:00"},
        "is_open": False,
        "closes_at": "18:00",
        "phone": None,
        "website": "https://smorgasburg.com",
        "photos": ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800"],
        "description": "Brooklyn's famous open-air food market with 100+ local vendors. The ultimate foodie destination."
    },
    {
        "id": "nyc_9",
        "name": "Summit One Vanderbilt",
        "category": "attraction",
        "subcategories": ["observation_deck", "landmark", "experience"],
        "vibe_tags": ["views", "instagram", "trendy", "must_see"],
        "address": "45 E 42nd St, New York, NY 10017",
        "neighborhood": "Midtown",
        "city": "New York",
        "coordinates": {"lat": 40.7527, "lng": -73.9785},
        "rating": 4.8,
        "review_count": 22000,
        "price_level": 3,
        "hours": {"monday": "09:00-23:00", "tuesday": "09:00-23:00", "wednesday": "09:00-23:00", "thursday": "09:00-23:00", "friday": "09:00-23:00", "saturday": "09:00-23:00", "sunday": "09:00-23:00"},
        "is_open": True,
        "closes_at": "23:00",
        "phone": "+1-877-682-1401",
        "website": "https://summitov.com",
        "photos": ["https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800"],
        "description": "Immersive observation experience with mirrored rooms and glass-floor ledges 1,000+ feet above Madison Avenue."
    },
    {
        "id": "nyc_10",
        "name": "Katz's Delicatessen",
        "category": "restaurant",
        "subcategories": ["deli", "jewish_deli", "classic"],
        "vibe_tags": ["classic", "local_favorite", "foodie", "historic"],
        "address": "205 E Houston St, New York, NY 10002",
        "neighborhood": "Lower East Side",
        "city": "New York",
        "coordinates": {"lat": 40.7223, "lng": -73.9874},
        "rating": 4.6,
        "review_count": 28000,
        "price_level": 2,
        "hours": {"monday": "08:00-22:45", "tuesday": "08:00-22:45", "wednesday": "08:00-22:45", "thursday": "08:00-02:45", "friday": "08:00-02:45", "saturday": "08:00-02:45", "sunday": "08:00-22:45"},
        "is_open": True,
        "closes_at": "22:45",
        "phone": "+1-212-254-2246",
        "website": "https://katzsdelicatessen.com",
        "photos": ["https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800", "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=800"],
        "description": "Iconic NYC deli since 1888. Famous for pastrami sandwiches and 'When Harry Met Sally' scene."
    },
    {
        "id": "nyc_11",
        "name": "Brooklyn Bridge Park",
        "category": "outdoors",
        "subcategories": ["park", "waterfront", "landmark"],
        "vibe_tags": ["views", "relaxed", "instagram", "free", "romantic"],
        "address": "334 Furman St, Brooklyn, NY 11201",
        "neighborhood": "DUMBO",
        "city": "New York",
        "coordinates": {"lat": 40.7024, "lng": -73.9967},
        "rating": 4.8,
        "review_count": 35000,
        "price_level": 0,
        "hours": {"monday": "06:00-01:00", "tuesday": "06:00-01:00", "wednesday": "06:00-01:00", "thursday": "06:00-01:00", "friday": "06:00-01:00", "saturday": "06:00-01:00", "sunday": "06:00-01:00"},
        "is_open": True,
        "closes_at": "01:00",
        "phone": None,
        "website": "https://brooklynbridgepark.org",
        "photos": ["https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800"],
        "description": "85-acre waterfront park with stunning Manhattan skyline views, playgrounds, and Jane's Carousel."
    },
    {
        "id": "nyc_12",
        "name": "Please Don't Tell (PDT)",
        "category": "bar",
        "subcategories": ["speakeasy", "cocktail_bar", "hidden"],
        "vibe_tags": ["hidden_gem", "speakeasy", "date_night", "craft_cocktails"],
        "address": "113 St Marks Pl, New York, NY 10009",
        "neighborhood": "East Village",
        "city": "New York",
        "coordinates": {"lat": 40.7273, "lng": -73.9842},
        "rating": 4.5,
        "review_count": 2100,
        "price_level": 3,
        "hours": {"monday": "18:00-02:00", "tuesday": "18:00-02:00", "wednesday": "18:00-02:00", "thursday": "18:00-02:00", "friday": "18:00-03:00", "saturday": "18:00-03:00", "sunday": "18:00-02:00"},
        "is_open": True,
        "closes_at": "02:00",
        "phone": "+1-212-614-0386",
        "website": None,
        "photos": ["https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800", "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800"],
        "description": "Enter through a phone booth inside Crif Dogs. One of NYC's original modern speakeasies with craft cocktails."
    },
    {
        "id": "nyc_13",
        "name": "Xi'an Famous Foods",
        "category": "restaurant",
        "subcategories": ["chinese", "noodles", "fast_casual"],
        "vibe_tags": ["foodie", "budget_friendly", "local_favorite", "spicy"],
        "address": "81 St Marks Pl, New York, NY 10003",
        "neighborhood": "East Village",
        "city": "New York",
        "coordinates": {"lat": 40.7281, "lng": -73.9867},
        "rating": 4.4,
        "review_count": 4500,
        "price_level": 1,
        "hours": {"monday": "11:00-21:00", "tuesday": "11:00-21:00", "wednesday": "11:00-21:00", "thursday": "11:00-21:00", "friday": "11:00-22:00", "saturday": "11:00-22:00", "sunday": "11:00-21:00"},
        "is_open": True,
        "closes_at": "21:00",
        "phone": None,
        "website": "https://xianfoods.com",
        "photos": ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800", "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800"],
        "description": "Hand-pulled noodles and spicy cumin lamb from China's Shaanxi province. A NYC institution."
    },
    {
        "id": "nyc_14",
        "name": "The Met Cloisters",
        "category": "museum",
        "subcategories": ["art_museum", "medieval_art", "garden"],
        "vibe_tags": ["hidden_gem", "cultural", "peaceful", "views"],
        "address": "99 Margaret Corbin Dr, New York, NY 10040",
        "neighborhood": "Fort Tryon Park",
        "city": "New York",
        "coordinates": {"lat": 40.8649, "lng": -73.9319},
        "rating": 4.8,
        "review_count": 8900,
        "price_level": 2,
        "hours": {"monday": "10:00-17:00", "tuesday": "10:00-17:00", "wednesday": "10:00-17:00", "thursday": "10:00-17:00", "friday": "10:00-17:00", "saturday": "10:00-17:00", "sunday": "10:00-17:00"},
        "is_open": True,
        "closes_at": "17:00",
        "phone": "+1-212-923-3700",
        "website": "https://metmuseum.org/visit/met-cloisters",
        "photos": ["https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800", "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800"],
        "description": "Branch of the Met dedicated to medieval European art and architecture. Beautiful gardens and Hudson River views."
    },
    {
        "id": "nyc_15",
        "name": "Levain Bakery",
        "category": "cafe",
        "subcategories": ["bakery", "cookies", "dessert"],
        "vibe_tags": ["foodie", "instagram", "must_try", "local_favorite"],
        "address": "167 W 74th St, New York, NY 10023",
        "neighborhood": "Upper West Side",
        "city": "New York",
        "coordinates": {"lat": 40.7796, "lng": -73.9778},
        "rating": 4.7,
        "review_count": 7800,
        "price_level": 2,
        "hours": {"monday": "08:00-21:00", "tuesday": "08:00-21:00", "wednesday": "08:00-21:00", "thursday": "08:00-21:00", "friday": "08:00-21:00", "saturday": "08:00-21:00", "sunday": "09:00-21:00"},
        "is_open": True,
        "closes_at": "21:00",
        "phone": "+1-212-874-6080",
        "website": "https://levainbakery.com",
        "photos": ["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800"],
        "description": "Famous for massive, gooey chocolate chip walnut cookies. Worth the line."
    }
]

# ============== DISTANCE HELPERS ==============

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in meters using Haversine formula"""
    R = 6371000  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def calculate_walk_time(distance_m: float) -> int:
    """Calculate walking time in minutes (assuming 80m/min = ~3mph)"""
    return max(1, round(distance_m / 80))

def calculate_drive_time(distance_m: float) -> int:
    """Calculate driving time in minutes (assuming 400m/min in city)"""
    return max(1, round(distance_m / 400))

def calculate_match_score(place: dict, taste_profile: Optional[dict]) -> int:
    """Calculate match score between place and user's taste profile"""
    if not taste_profile:
        return 70  # Default score
    
    score = 50  # Base score
    
    # Vibe matching (30%)
    place_vibes = set(place.get("vibe_tags", []))
    user_vibes = set(taste_profile.get("vibes", []))
    if place_vibes & user_vibes:
        score += 30 * len(place_vibes & user_vibes) / max(len(user_vibes), 1)
    
    # Category/cuisine matching (25%)
    place_cats = set(place.get("subcategories", []))
    user_cuisines = set(taste_profile.get("cuisines", []))
    if place_cats & user_cuisines:
        score += 25 * len(place_cats & user_cuisines) / max(len(user_cuisines), 1)
    
    # Activity matching (20%)
    category_to_activity = {
        "museum": "museums",
        "bar": "nightlife",
        "restaurant": "dining",
        "outdoors": "outdoors",
        "market": "markets",
        "cafe": "coffee"
    }
    user_activities = set(taste_profile.get("activities", []))
    if category_to_activity.get(place.get("category")) in user_activities:
        score += 20
    
    # Rating bonus (10%)
    score += (place.get("rating", 0) / 5) * 10
    
    return min(100, round(score))

# ============== PLACES ROUTES ==============

@places_router.get("/")
async def get_places(
    lat: float = 40.7128,
    lng: float = -74.0060,
    category: Optional[str] = None,
    open_now: bool = False,
    max_distance: Optional[int] = None,
    search: Optional[str] = None,
    use_google: bool = True,
    request: Request = None
):
    """Get places with optional filters - uses Google Places API or mock data"""
    # Try to get user for personalized scoring
    taste_profile = None
    try:
        user = await get_current_user(request)
        taste_profile = user.taste_profile.model_dump() if user.taste_profile else None
    except Exception:
        pass
    
    # Try Google Places API first
    if use_google and os.environ.get('GOOGLE_MAPS_API_KEY'):
        try:
            google_result = await search_nearby_places(
                lat=lat,
                lng=lng,
                category=category or "all",
                radius=max_distance or 2000,
                keyword=search,
                open_now=open_now
            )
            
            places = google_result.get("places", [])
            
            if places:
                # Add personalized match scores
                for place in places:
                    if taste_profile:
                        place["match_score"] = calculate_match_score(place, taste_profile)
                
                # Sort by match score then distance
                places.sort(key=lambda x: (-x.get("match_score", 0), x.get("distance_m", 9999)))
                
                return {"places": places, "total": len(places), "source": "google"}
        except Exception as e:
            logger.error(f"Google Places error: {e}")
    
    # Fallback to mock data
    results = []
    
    for place in MOCK_PLACES:
        distance_m = calculate_distance(
            lat, lng,
            place["coordinates"]["lat"],
            place["coordinates"]["lng"]
        )
        
        if max_distance and distance_m > max_distance:
            continue
        
        if category and category != "all" and place["category"] != category:
            continue
        
        if open_now and not place["is_open"]:
            continue
        
        if search:
            search_lower = search.lower()
            searchable = f"{place['name']} {place['category']} {' '.join(place['subcategories'])} {' '.join(place['vibe_tags'])} {place['neighborhood']}".lower()
            if search_lower not in searchable:
                continue
        
        place_copy = place.copy()
        place_copy["distance_m"] = round(distance_m)
        place_copy["walk_mins"] = calculate_walk_time(distance_m)
        place_copy["drive_mins"] = calculate_drive_time(distance_m)
        place_copy["match_score"] = calculate_match_score(place, taste_profile)
        place_copy["maps_deep_link"] = f"https://www.google.com/maps/search/?api=1&query={place['coordinates']['lat']},{place['coordinates']['lng']}"
        place_copy["uber_deep_link"] = f"uber://?action=setPickup&pickup=my_location&dropoff[latitude]={place['coordinates']['lat']}&dropoff[longitude]={place['coordinates']['lng']}&dropoff[nickname]={place['name'].replace(' ', '%20')}"
        
        results.append(place_copy)
    
    results.sort(key=lambda x: (-x["match_score"], x["distance_m"]))
    
    return {"places": results, "total": len(results), "source": "mock"}

@places_router.get("/nearby")
async def get_nearby_places_google(
    lat: float,
    lng: float,
    category: Optional[str] = "all",
    radius: int = 2000,
    keyword: Optional[str] = None,
    open_now: bool = False,
    request: Request = None
):
    """Get nearby places using Google Places API only"""
    if not os.environ.get('GOOGLE_MAPS_API_KEY'):
        raise HTTPException(status_code=503, detail="Google API not configured")
    
    taste_profile = None
    try:
        user = await get_current_user(request)
        taste_profile = user.taste_profile.model_dump() if user.taste_profile else None
    except Exception:
        pass
    
    result = await search_nearby_places(
        lat=lat,
        lng=lng,
        category=category,
        radius=radius,
        keyword=keyword,
        open_now=open_now
    )
    
    places = result.get("places", [])
    
    # Add personalized match scores
    for place in places:
        if taste_profile:
            place["match_score"] = calculate_match_score(place, taste_profile)
    
    places.sort(key=lambda x: (-x.get("match_score", 0), x.get("distance_m", 9999)))
    
    return {"places": places, "total": len(places)}

@places_router.get("/location")
async def get_location_name(lat: float, lng: float):
    """Get location name from coordinates"""
    location = await reverse_geocode(lat, lng)
    return location

@places_router.get("/{place_id}")
async def get_place(place_id: str, lat: float = 40.7128, lng: float = -74.0060, request: Request = None):
    """Get a single place by ID"""
    taste_profile = None
    try:
        user = await get_current_user(request)
        taste_profile = user.taste_profile.model_dump() if user.taste_profile else None
    except Exception:
        pass
    
    # Check if it's a Google place
    if place_id.startswith("google_"):
        google_place_id = place_id.replace("google_", "")
        place = await get_place_details(google_place_id, lat, lng)
        if place:
            if taste_profile:
                place["match_score"] = calculate_match_score(place, taste_profile)
            return place
        raise HTTPException(status_code=404, detail="Place not found")
    
    # Check mock data
    for place in MOCK_PLACES:
        if place["id"] == place_id:
            place_copy = place.copy()
            
            distance_m = calculate_distance(
                lat, lng,
                place["coordinates"]["lat"],
                place["coordinates"]["lng"]
            )
            
            place_copy["distance_m"] = round(distance_m)
            place_copy["walk_mins"] = calculate_walk_time(distance_m)
            place_copy["drive_mins"] = calculate_drive_time(distance_m)
            place_copy["match_score"] = calculate_match_score(place, taste_profile)
            place_copy["maps_deep_link"] = f"https://www.google.com/maps/search/?api=1&query={place['coordinates']['lat']},{place['coordinates']['lng']}"
            place_copy["uber_deep_link"] = f"uber://?action=setPickup&pickup=my_location&dropoff[latitude]={place['coordinates']['lat']}&dropoff[longitude]={place['coordinates']['lng']}&dropoff[nickname]={place['name'].replace(' ', '%20')}"
            
            return place_copy
    
    raise HTTPException(status_code=404, detail="Place not found")

@places_router.get("/categories/list")
async def get_categories():
    """Get all available categories"""
    return {
        "categories": [
            {"id": "all", "name": "For You", "icon": "sparkles"},
            {"id": "restaurant", "name": "Eat", "icon": "utensils"},
            {"id": "bar", "name": "Drink", "icon": "wine"},
            {"id": "museum", "name": "Explore", "icon": "landmark"},
            {"id": "attraction", "name": "Views", "icon": "mountain"},
            {"id": "outdoors", "name": "Outside", "icon": "trees"},
            {"id": "cafe", "name": "Coffee", "icon": "coffee"},
            {"id": "market", "name": "Markets", "icon": "shopping-bag"}
        ]
    }

# ============== CANNABIS ROUTES ==============

@cannabis_router.get("/strains")
async def get_strains(
    search: Optional[str] = None,
    strain_type: Optional[str] = None,  # indica, sativa, hybrid
    effect: Optional[str] = None,
    flavor: Optional[str] = None,
    min_thc: Optional[float] = None,
    max_thc: Optional[float] = None,
    page: int = 1,
    limit: int = 20
):
    """Get cannabis strains with filters"""
    query = {}
    
    if search:
        query["$text"] = {"$search": search}
    
    if strain_type:
        query["type"] = {"$regex": strain_type, "$options": "i"}
    
    if effect:
        query["effects"] = {"$regex": effect, "$options": "i"}
    
    if flavor:
        query["flavors"] = {"$regex": flavor, "$options": "i"}
    
    if min_thc is not None:
        query["thc"] = {"$gte": min_thc}
    
    if max_thc is not None:
        if "thc" in query:
            query["thc"]["$lte"] = max_thc
        else:
            query["thc"] = {"$lte": max_thc}
    
    skip = (page - 1) * limit
    
    cursor = db.strains.find(query, {"_id": 0}).skip(skip).limit(limit)
    strains = await cursor.to_list(length=limit)
    
    total = await db.strains.count_documents(query)
    
    return {
        "strains": strains,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@cannabis_router.get("/strains/{strain_id}")
async def get_strain(strain_id: str):
    """Get a single strain by ID"""
    strain = await db.strains.find_one({"strain_id": strain_id}, {"_id": 0})
    if not strain:
        # Try finding by name
        strain = await db.strains.find_one(
            {"name": {"$regex": f"^{strain_id}$", "$options": "i"}},
            {"_id": 0}
        )
    if not strain:
        raise HTTPException(status_code=404, detail="Strain not found")
    return strain

@cannabis_router.get("/strains/search/{name}")
async def search_strain_by_name(name: str, limit: int = 10):
    """Search strains by name (autocomplete)"""
    cursor = db.strains.find(
        {"name": {"$regex": name, "$options": "i"}},
        {"_id": 0}
    ).limit(limit)
    strains = await cursor.to_list(length=limit)
    return {"strains": strains}

@cannabis_router.get("/dispensaries")
async def get_dispensaries(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
    max_distance: Optional[int] = 50000,  # meters (50km default)
    page: int = 1,
    limit: int = 20
):
    """Get dispensaries with location and filters"""
    query = {"is_dispensary": True}
    
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    if state:
        query["state"] = {"$regex": state, "$options": "i"}
    
    if country:
        query["country"] = country.upper()
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}}
        ]
    
    skip = (page - 1) * limit
    
    cursor = db.dispensaries.find(query, {"_id": 0}).skip(skip).limit(limit)
    dispensaries = await cursor.to_list(length=limit)
    
    # Calculate distances if user location provided
    if lat and lng:
        for disp in dispensaries:
            coords = disp.get("coordinates", {})
            if coords.get("lat") and coords.get("lng"):
                disp["distance_m"] = calculate_distance(
                    lat, lng, coords["lat"], coords["lng"]
                )
                disp["walk_mins"] = calculate_walk_time(disp["distance_m"])
                disp["drive_mins"] = calculate_drive_time(disp["distance_m"])
                disp["maps_deep_link"] = f"https://www.google.com/maps/search/?api=1&query={coords['lat']},{coords['lng']}"
        
        # Sort by distance
        dispensaries.sort(key=lambda x: x.get("distance_m", float("inf")))
        
        # Filter by max distance
        if max_distance:
            dispensaries = [d for d in dispensaries if d.get("distance_m", 0) <= max_distance]
    
    total = await db.dispensaries.count_documents(query)
    
    return {
        "dispensaries": dispensaries,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@cannabis_router.get("/dispensaries/{shop_id}")
async def get_dispensary(shop_id: str, lat: Optional[float] = None, lng: Optional[float] = None):
    """Get a single dispensary by ID"""
    disp = await db.dispensaries.find_one({"shop_id": shop_id}, {"_id": 0})
    if not disp:
        raise HTTPException(status_code=404, detail="Dispensary not found")
    
    coords = disp.get("coordinates", {})
    if lat and lng and coords.get("lat") and coords.get("lng"):
        disp["distance_m"] = calculate_distance(lat, lng, coords["lat"], coords["lng"])
        disp["walk_mins"] = calculate_walk_time(disp["distance_m"])
        disp["drive_mins"] = calculate_drive_time(disp["distance_m"])
        disp["maps_deep_link"] = f"https://www.google.com/maps/search/?api=1&query={coords['lat']},{coords['lng']}"
    
    return disp

@cannabis_router.get("/effects")
async def get_effects():
    """Get all unique effects"""
    pipeline = [
        {"$unwind": "$effects"},
        {"$group": {"_id": "$effects"}},
        {"$sort": {"_id": 1}},
        {"$limit": 50}
    ]
    cursor = db.strains.aggregate(pipeline)
    effects = [doc["_id"] for doc in await cursor.to_list(length=50)]
    return {"effects": [e for e in effects if e]}

@cannabis_router.get("/flavors")
async def get_flavors():
    """Get all unique flavors"""
    pipeline = [
        {"$unwind": "$flavors"},
        {"$group": {"_id": "$flavors"}},
        {"$sort": {"_id": 1}},
        {"$limit": 50}
    ]
    cursor = db.strains.aggregate(pipeline)
    flavors = [doc["_id"] for doc in await cursor.to_list(length=50)]
    return {"flavors": [f for f in flavors if f]}

@cannabis_router.get("/stats")
async def get_cannabis_stats():
    """Get cannabis database statistics"""
    strain_count = await db.strains.count_documents({})
    dispensary_count = await db.dispensaries.count_documents({"is_dispensary": True})
    
    # Count by type
    indica_count = await db.strains.count_documents({"type": {"$regex": "indica", "$options": "i"}})
    sativa_count = await db.strains.count_documents({"type": {"$regex": "sativa", "$options": "i"}})
    hybrid_count = await db.strains.count_documents({"type": {"$regex": "hybrid", "$options": "i"}})
    
    # Count by country
    us_count = await db.dispensaries.count_documents({"country": "US", "is_dispensary": True})
    nl_count = await db.dispensaries.count_documents({"country": "NL", "is_dispensary": True})
    es_count = await db.dispensaries.count_documents({"country": "ES", "is_dispensary": True})
    ca_count = await db.dispensaries.count_documents({"country": "CA", "is_dispensary": True})
    th_count = await db.dispensaries.count_documents({"country": "TH", "is_dispensary": True})
    
    return {
        "total_strains": strain_count,
        "total_dispensaries": dispensary_count,
        "strains_by_type": {
            "indica": indica_count,
            "sativa": sativa_count,
            "hybrid": hybrid_count
        },
        "dispensaries_by_country": {
            "US": us_count,
            "Netherlands": nl_count,
            "Spain": es_count,
            "Canada": ca_count,
            "Thailand": th_count
        }
    }

# ============== REVIEWS ROUTES ==============

@reviews_router.post("/")
async def create_review(
    review_data: ReviewCreate,
    user: User = Depends(get_current_user)
):
    """Create a new review"""
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    
    review = {
        "review_id": review_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "user_picture": user.picture,
        "place_id": review_data.place_id,
        "place_type": review_data.place_type,
        "rating": max(1, min(5, review_data.rating)),  # Clamp between 1-5
        "text": review_data.text,
        "photos": review_data.photos,
        "helpful_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review)
    
    # Return without _id
    review.pop("_id", None)
    return review

@reviews_router.get("/place/{place_id}")
async def get_place_reviews(
    place_id: str,
    place_type: str = "place",
    page: int = 1,
    limit: int = 20
):
    """Get reviews for a place or dispensary"""
    skip = (page - 1) * limit
    
    cursor = db.reviews.find(
        {"place_id": place_id, "place_type": place_type},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    reviews = await cursor.to_list(length=limit)
    total = await db.reviews.count_documents({"place_id": place_id, "place_type": place_type})
    
    # Calculate average rating
    pipeline = [
        {"$match": {"place_id": place_id, "place_type": place_type}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    stats = await db.reviews.aggregate(pipeline).to_list(length=1)
    avg_rating = stats[0]["avg_rating"] if stats else 0
    review_count = stats[0]["count"] if stats else 0
    
    return {
        "reviews": reviews,
        "total": total,
        "avg_rating": round(avg_rating, 1) if avg_rating else 0,
        "review_count": review_count,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@reviews_router.get("/user/{user_id}")
async def get_user_reviews(user_id: str, page: int = 1, limit: int = 20):
    """Get reviews by a user"""
    skip = (page - 1) * limit
    
    cursor = db.reviews.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    reviews = await cursor.to_list(length=limit)
    total = await db.reviews.count_documents({"user_id": user_id})
    
    return {
        "reviews": reviews,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@reviews_router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    user: User = Depends(get_current_user)
):
    """Delete a review (only by owner)"""
    result = await db.reviews.delete_one({
        "review_id": review_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found or not authorized")
    
    return {"message": "Review deleted"}

@reviews_router.post("/{review_id}/helpful")
async def mark_helpful(review_id: str):
    """Mark a review as helpful"""
    result = await db.reviews.update_one(
        {"review_id": review_id},
        {"$inc": {"helpful_count": 1}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Marked as helpful"}

# ============== ROOT ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "CityBlend API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(places_router)
app.include_router(user_router)
app.include_router(cannabis_router)
app.include_router(reviews_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
