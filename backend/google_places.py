"""
Google Places API Integration Service
Fetches real nearby places based on user location
"""
import httpx
import os
from typing import List, Optional, Dict, Any
import math
import logging

logger = logging.getLogger(__name__)

PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place"
GEOCODE_BASE_URL = "https://maps.googleapis.com/maps/api/geocode"

def get_api_key():
    """Get Google API key at runtime"""
    return os.environ.get('GOOGLE_MAPS_API_KEY', '')

# Category mapping for Google Places types
CATEGORY_TO_GOOGLE_TYPES = {
    "restaurant": ["restaurant", "cafe", "bakery", "meal_takeaway"],
    "bar": ["bar", "night_club", "liquor_store"],
    "cafe": ["cafe", "coffee_shop"],
    "museum": ["museum", "art_gallery"],
    "attraction": ["tourist_attraction", "amusement_park", "aquarium", "zoo"],
    "outdoors": ["park", "natural_feature", "campground"],
    "market": ["shopping_mall", "grocery_or_supermarket", "convenience_store"],
    "all": ["restaurant", "bar", "cafe", "museum", "tourist_attraction", "park"]
}

# Reverse mapping from Google types to our categories
GOOGLE_TYPE_TO_CATEGORY = {
    "restaurant": "restaurant",
    "cafe": "cafe",
    "bakery": "cafe",
    "meal_takeaway": "restaurant",
    "bar": "bar",
    "night_club": "bar",
    "museum": "museum",
    "art_gallery": "museum",
    "tourist_attraction": "attraction",
    "amusement_park": "attraction",
    "park": "outdoors",
    "natural_feature": "outdoors",
    "shopping_mall": "market",
    "grocery_or_supermarket": "market",
}


async def reverse_geocode(lat: float, lng: float) -> Dict[str, str]:
    """Get location name from coordinates"""
    if not get_api_key():
        return {"city": "Unknown", "neighborhood": "", "country": ""}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GEOCODE_BASE_URL}/json",
                params={
                    "latlng": f"{lat},{lng}",
                    "key": get_api_key(),
                    "result_type": "locality|neighborhood|administrative_area_level_1"
                },
                timeout=10.0
            )
            data = response.json()
            
            if data.get("status") != "OK" or not data.get("results"):
                return {"city": "Unknown", "neighborhood": "", "country": ""}
            
            city = ""
            neighborhood = ""
            country = ""
            state = ""
            
            for result in data["results"]:
                for component in result.get("address_components", []):
                    types = component.get("types", [])
                    if "locality" in types:
                        city = component["long_name"]
                    elif "neighborhood" in types or "sublocality" in types:
                        neighborhood = component["long_name"]
                    elif "administrative_area_level_1" in types:
                        state = component["short_name"]
                    elif "country" in types:
                        country = component["short_name"]
            
            return {
                "city": city or "Unknown",
                "neighborhood": neighborhood,
                "state": state,
                "country": country
            }
    except Exception as e:
        logger.error(f"Reverse geocode error: {e}")
        return {"city": "Unknown", "neighborhood": "", "country": ""}


async def search_nearby_places(
    lat: float,
    lng: float,
    category: str = "all",
    radius: int = 2000,  # meters
    keyword: Optional[str] = None,
    open_now: bool = False,
    page_token: Optional[str] = None
) -> Dict[str, Any]:
    """Search for nearby places using Google Places API"""
    if not get_api_key():
        logger.warning("No Google API key configured")
        return {"places": [], "next_page_token": None}
    
    places = []
    google_types = CATEGORY_TO_GOOGLE_TYPES.get(category, CATEGORY_TO_GOOGLE_TYPES["all"])
    
    try:
        async with httpx.AsyncClient() as client:
            for place_type in google_types[:2]:  # Limit to 2 types to save API calls
                params = {
                    "location": f"{lat},{lng}",
                    "radius": radius,
                    "type": place_type,
                    "key": get_api_key(),
                }
                
                if keyword:
                    params["keyword"] = keyword
                if open_now:
                    params["opennow"] = "true"
                if page_token:
                    params["pagetoken"] = page_token
                
                response = await client.get(
                    f"{PLACES_BASE_URL}/nearbysearch/json",
                    params=params,
                    timeout=15.0
                )
                data = response.json()
                
                if data.get("status") not in ["OK", "ZERO_RESULTS"]:
                    logger.error(f"Places API error: {data.get('status')} - {data.get('error_message', '')}")
                    continue
                
                for result in data.get("results", []):
                    place = transform_google_place(result, lat, lng)
                    if place and place["id"] not in [p["id"] for p in places]:
                        places.append(place)
        
        # Sort by rating and distance
        places.sort(key=lambda x: (-x.get("rating", 0), x.get("distance_m", 9999)))
        
        return {
            "places": places[:20],  # Limit to 20 places
            "next_page_token": data.get("next_page_token")
        }
        
    except Exception as e:
        logger.error(f"Places search error: {e}")
        return {"places": [], "next_page_token": None}


async def get_place_details(place_id: str, lat: float = 0, lng: float = 0) -> Optional[Dict[str, Any]]:
    """Get detailed information about a place"""
    if not get_api_key():
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{PLACES_BASE_URL}/details/json",
                params={
                    "place_id": place_id,
                    "fields": "place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,opening_hours,formatted_phone_number,website,photos,types,reviews,vicinity",
                    "key": get_api_key(),
                },
                timeout=15.0
            )
            data = response.json()
            
            if data.get("status") != "OK":
                logger.error(f"Place details error: {data.get('status')}")
                return None
            
            result = data.get("result", {})
            return transform_google_place_details(result, lat, lng)
            
    except Exception as e:
        logger.error(f"Place details error: {e}")
        return None


def transform_google_place(result: Dict, user_lat: float, user_lng: float) -> Optional[Dict]:
    """Transform Google Places result to our format"""
    try:
        location = result.get("geometry", {}).get("location", {})
        place_lat = location.get("lat", 0)
        place_lng = location.get("lng", 0)
        
        # Calculate distance
        distance_m = calculate_distance(user_lat, user_lng, place_lat, place_lng)
        
        # Get category from types
        types = result.get("types", [])
        category = "attraction"
        for t in types:
            if t in GOOGLE_TYPE_TO_CATEGORY:
                category = GOOGLE_TYPE_TO_CATEGORY[t]
                break
        
        # Get photo URL
        photos = result.get("photos", [])
        photo_url = None
        if photos:
            photo_ref = photos[0].get("photo_reference")
            if photo_ref:
                photo_url = f"{PLACES_BASE_URL}/photo?maxwidth=800&photo_reference={photo_ref}&key={get_api_key()}"
        
        # Extract neighborhood from vicinity
        vicinity = result.get("vicinity", "")
        neighborhood = vicinity.split(",")[-1].strip() if "," in vicinity else vicinity
        
        return {
            "id": f"google_{result.get('place_id', '')}",
            "google_place_id": result.get("place_id"),
            "name": result.get("name", "Unknown"),
            "category": category,
            "subcategories": [t.replace("_", " ") for t in types[:3]],
            "vibe_tags": extract_vibe_tags(result),
            "address": result.get("vicinity", ""),
            "neighborhood": neighborhood,
            "city": "",  # Will be filled by reverse geocode
            "coordinates": {"lat": place_lat, "lng": place_lng},
            "rating": result.get("rating", 0),
            "review_count": result.get("user_ratings_total", 0),
            "price_level": result.get("price_level", 0),
            "is_open": result.get("opening_hours", {}).get("open_now", True),
            "photos": [photo_url] if photo_url else [],
            "distance_m": round(distance_m),
            "walk_mins": calculate_walk_time(distance_m),
            "drive_mins": calculate_drive_time(distance_m),
            "maps_deep_link": f"https://www.google.com/maps/place/?q=place_id:{result.get('place_id')}",
            "uber_deep_link": f"uber://?action=setPickup&pickup=my_location&dropoff[latitude]={place_lat}&dropoff[longitude]={place_lng}&dropoff[nickname]={result.get('name', '').replace(' ', '%20')}",
            "match_score": calculate_base_match_score(result),
        }
    except Exception as e:
        logger.error(f"Transform error: {e}")
        return None


def transform_google_place_details(result: Dict, user_lat: float, user_lng: float) -> Dict:
    """Transform detailed Google Places result"""
    location = result.get("geometry", {}).get("location", {})
    place_lat = location.get("lat", 0)
    place_lng = location.get("lng", 0)
    
    distance_m = calculate_distance(user_lat, user_lng, place_lat, place_lng) if user_lat and user_lng else 0
    
    # Get photos
    photos = []
    for photo in result.get("photos", [])[:5]:
        photo_ref = photo.get("photo_reference")
        if photo_ref:
            photos.append(f"{PLACES_BASE_URL}/photo?maxwidth=800&photo_reference={photo_ref}&key={get_api_key()}")
    
    # Get hours
    hours = {}
    opening_hours = result.get("opening_hours", {})
    for period in opening_hours.get("periods", []):
        day_names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        day = period.get("open", {}).get("day", 0)
        open_time = period.get("open", {}).get("time", "0000")
        close_time = period.get("close", {}).get("time", "2359")
        hours[day_names[day]] = f"{open_time[:2]}:{open_time[2:]}-{close_time[:2]}:{close_time[2:]}"
    
    types = result.get("types", [])
    category = "attraction"
    for t in types:
        if t in GOOGLE_TYPE_TO_CATEGORY:
            category = GOOGLE_TYPE_TO_CATEGORY[t]
            break
    
    # Extract from address
    address = result.get("formatted_address", "")
    neighborhood = result.get("vicinity", "").split(",")[-1].strip() if result.get("vicinity") else ""
    
    return {
        "id": f"google_{result.get('place_id', '')}",
        "google_place_id": result.get("place_id"),
        "name": result.get("name", "Unknown"),
        "category": category,
        "subcategories": [t.replace("_", " ") for t in types[:3]],
        "vibe_tags": extract_vibe_tags(result),
        "address": address,
        "neighborhood": neighborhood,
        "city": "",
        "coordinates": {"lat": place_lat, "lng": place_lng},
        "rating": result.get("rating", 0),
        "review_count": result.get("user_ratings_total", 0),
        "price_level": result.get("price_level", 0),
        "hours": hours,
        "is_open": opening_hours.get("open_now", True),
        "closes_at": None,
        "phone": result.get("formatted_phone_number"),
        "website": result.get("website"),
        "photos": photos,
        "description": extract_description(result),
        "distance_m": round(distance_m),
        "walk_mins": calculate_walk_time(distance_m),
        "drive_mins": calculate_drive_time(distance_m),
        "maps_deep_link": f"https://www.google.com/maps/place/?q=place_id:{result.get('place_id')}",
        "uber_deep_link": f"uber://?action=setPickup&pickup=my_location&dropoff[latitude]={place_lat}&dropoff[longitude]={place_lng}&dropoff[nickname]={result.get('name', '').replace(' ', '%20')}",
        "match_score": calculate_base_match_score(result),
        "google_reviews": [
            {
                "author": r.get("author_name"),
                "rating": r.get("rating"),
                "text": r.get("text"),
                "time": r.get("relative_time_description")
            }
            for r in result.get("reviews", [])[:5]
        ]
    }


def extract_vibe_tags(result: Dict) -> List[str]:
    """Extract vibe tags from place data"""
    tags = []
    types = result.get("types", [])
    
    if result.get("rating", 0) >= 4.5:
        tags.append("highly_rated")
    if result.get("user_ratings_total", 0) > 1000:
        tags.append("popular")
    if "bar" in types or "night_club" in types:
        tags.append("nightlife")
    if "cafe" in types:
        tags.append("cozy")
    if "park" in types:
        tags.append("outdoors")
    if "museum" in types or "art_gallery" in types:
        tags.append("cultural")
    if result.get("price_level", 0) <= 1:
        tags.append("budget_friendly")
    if result.get("price_level", 0) >= 3:
        tags.append("upscale")
    
    return tags[:5]


def extract_description(result: Dict) -> str:
    """Extract or generate description"""
    reviews = result.get("reviews", [])
    if reviews:
        # Use first review snippet as description
        first_review = reviews[0].get("text", "")
        if len(first_review) > 150:
            return first_review[:147] + "..."
        return first_review
    return ""


def calculate_base_match_score(result: Dict) -> int:
    """Calculate base match score from place data"""
    score = 50
    
    rating = result.get("rating", 0)
    if rating >= 4.5:
        score += 30
    elif rating >= 4.0:
        score += 20
    elif rating >= 3.5:
        score += 10
    
    reviews = result.get("user_ratings_total", 0)
    if reviews > 1000:
        score += 15
    elif reviews > 500:
        score += 10
    elif reviews > 100:
        score += 5
    
    return min(score, 99)


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in meters using Haversine formula"""
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def calculate_walk_time(distance_m: float) -> int:
    """Calculate walking time in minutes (80m/min ~ 3mph)"""
    return max(1, round(distance_m / 80))


def calculate_drive_time(distance_m: float) -> int:
    """Calculate driving time in minutes (400m/min in city)"""
    return max(1, round(distance_m / 400))
