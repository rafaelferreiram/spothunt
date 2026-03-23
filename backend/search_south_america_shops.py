"""
Script to search and add cannabis shops from South America (Uruguay and Brazil)
Using Google Places API
"""
import asyncio
import httpx
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import math

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
GOOGLE_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# South American cities to search
SOUTH_AMERICA_CITIES = {
    "UY": [  # Uruguay - Cannabis fully legal since 2013
        {"name": "Montevideo", "lat": -34.9011, "lng": -56.1645},
        {"name": "Punta del Este", "lat": -34.9667, "lng": -54.9500},
        {"name": "Colonia del Sacramento", "lat": -34.4626, "lng": -57.8400},
        {"name": "Salto", "lat": -31.3833, "lng": -57.9667},
        {"name": "Maldonado", "lat": -34.9000, "lng": -54.9500},
    ],
    "BR": [  # Brazil - CBD shops and hemp products
        {"name": "São Paulo", "lat": -23.5505, "lng": -46.6333},
        {"name": "Rio de Janeiro", "lat": -22.9068, "lng": -43.1729},
        {"name": "Brasília", "lat": -15.7942, "lng": -47.8822},
        {"name": "Curitiba", "lat": -25.4290, "lng": -49.2671},
        {"name": "Porto Alegre", "lat": -30.0346, "lng": -51.2177},
        {"name": "Belo Horizonte", "lat": -19.9167, "lng": -43.9345},
        {"name": "Florianópolis", "lat": -27.5954, "lng": -48.5480},
    ],
}

SEARCH_TERMS = [
    "cannabis dispensary",
    "cannabis shop",
    "CBD shop",
    "hemp store",
    "marijuana dispensary",
    "cannabis club",
    "grow shop",
    "headshop",
]

async def search_places(lat: float, lng: float, keyword: str, radius: int = 50000):
    """Search Google Places API for cannabis-related shops"""
    if not GOOGLE_API_KEY:
        print("No Google API key found!")
        return []
    
    places = []
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    async with httpx.AsyncClient() as client:
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "keyword": keyword,
            "key": GOOGLE_API_KEY,
        }
        
        try:
            response = await client.get(url, params=params, timeout=15.0)
            data = response.json()
            
            if data.get("status") == "OK":
                for result in data.get("results", []):
                    place = {
                        "place_id": result.get("place_id"),
                        "name": result.get("name"),
                        "address": result.get("vicinity", ""),
                        "lat": result["geometry"]["location"]["lat"],
                        "lng": result["geometry"]["location"]["lng"],
                        "rating": result.get("rating", 0),
                        "user_ratings_total": result.get("user_ratings_total", 0),
                        "types": result.get("types", []),
                    }
                    places.append(place)
        except Exception as e:
            print(f"Error searching {keyword} at {lat},{lng}: {e}")
    
    return places

async def add_shops_for_country(country_code: str, cities: list):
    """Add shops for a specific country"""
    all_shops = []
    seen_place_ids = set()
    
    # Get existing place_ids to avoid duplicates
    existing = await db.shops.find({"country": country_code}, {"place_id": 1}).to_list(1000)
    for shop in existing:
        if shop.get("place_id"):
            seen_place_ids.add(shop["place_id"])
    
    print(f"\n{'='*50}")
    print(f"Searching {country_code}...")
    print(f"{'='*50}")
    
    for city in cities:
        print(f"\n📍 {city['name']}:")
        city_shops = []
        
        for term in SEARCH_TERMS:
            places = await search_places(city["lat"], city["lng"], term)
            
            for place in places:
                if place["place_id"] not in seen_place_ids:
                    seen_place_ids.add(place["place_id"])
                    
                    # Determine shop type
                    shop_type = "Cannabis Shop"
                    name_lower = place["name"].lower()
                    if "cbd" in name_lower:
                        shop_type = "CBD Shop"
                    elif "grow" in name_lower:
                        shop_type = "Grow Shop"
                    elif "head" in name_lower:
                        shop_type = "Headshop"
                    elif "dispensary" in name_lower or "dispensário" in name_lower:
                        shop_type = "Dispensary"
                    elif "club" in name_lower:
                        shop_type = "Cannabis Club"
                    
                    shop = {
                        "shop_id": f"shop_{place['place_id'][:12]}",
                        "name": place["name"],
                        "type": shop_type,
                        "address": place["address"],
                        "city": city["name"],
                        "state": "",
                        "country": country_code,
                        "coordinates": {
                            "lat": place["lat"],
                            "lng": place["lng"]
                        },
                        "is_dispensary": True,
                        "source": "google_places",
                        "place_id": place["place_id"],
                        "rating": place["rating"],
                        "review_count": place["user_ratings_total"],
                    }
                    city_shops.append(shop)
            
            await asyncio.sleep(0.2)  # Rate limiting
        
        if city_shops:
            print(f"   Found {len(city_shops)} shops")
            all_shops.extend(city_shops)
        else:
            print(f"   No shops found")
    
    return all_shops

async def main():
    print("🌿 South America Cannabis Shop Finder")
    print("="*50)
    
    total_added = 0
    
    for country_code, cities in SOUTH_AMERICA_CITIES.items():
        shops = await add_shops_for_country(country_code, cities)
        
        if shops:
            # Insert into database
            result = await db.shops.insert_many(shops)
            print(f"\n✅ Added {len(result.inserted_ids)} shops for {country_code}")
            total_added += len(result.inserted_ids)
    
    # Print summary
    print("\n" + "="*50)
    print("📊 SUMMARY")
    print("="*50)
    
    for country_code in SOUTH_AMERICA_CITIES.keys():
        count = await db.shops.count_documents({"country": country_code, "is_dispensary": True})
        country_names = {"UY": "Uruguay 🇺🇾", "BR": "Brazil 🇧🇷"}
        print(f"{country_names.get(country_code, country_code)}: {count} shops")
    
    total = await db.shops.count_documents({"is_dispensary": True})
    print(f"\nTotal cannabis shops worldwide: {total}")
    
    print(f"\n✅ Done! Added {total_added} new shops from South America")

if __name__ == "__main__":
    asyncio.run(main())
