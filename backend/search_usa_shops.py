"""
Search Google Maps for real cannabis/CBD/THC shops in USA
"""
import asyncio
import httpx
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Get API key
API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

# MongoDB
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# USA cities to search - focusing on legal states and major cities
USA_CITIES = [
    # Priority cities for user
    {"name": "New York City", "country": "US", "state": "New York", "lat": 40.7128, "lng": -74.0060},
    {"name": "Manhattan", "country": "US", "state": "New York", "lat": 40.7831, "lng": -73.9712},
    {"name": "Brooklyn", "country": "US", "state": "New York", "lat": 40.6782, "lng": -73.9442},
    {"name": "Queens", "country": "US", "state": "New York", "lat": 40.7282, "lng": -73.7949},
    {"name": "Miami", "country": "US", "state": "Florida", "lat": 25.7617, "lng": -80.1918},
    {"name": "Miami Beach", "country": "US", "state": "Florida", "lat": 25.7907, "lng": -80.1300},
    {"name": "Orlando", "country": "US", "state": "Florida", "lat": 28.5383, "lng": -81.3792},
    {"name": "Tampa", "country": "US", "state": "Florida", "lat": 27.9506, "lng": -82.4572},
    {"name": "Fort Lauderdale", "country": "US", "state": "Florida", "lat": 26.1224, "lng": -80.1373},
    
    # California (Recreational legal)
    {"name": "Los Angeles", "country": "US", "state": "California", "lat": 34.0522, "lng": -118.2437},
    {"name": "San Francisco", "country": "US", "state": "California", "lat": 37.7749, "lng": -122.4194},
    {"name": "San Diego", "country": "US", "state": "California", "lat": 32.7157, "lng": -117.1611},
    {"name": "San Jose", "country": "US", "state": "California", "lat": 37.3382, "lng": -121.8863},
    {"name": "Oakland", "country": "US", "state": "California", "lat": 37.8044, "lng": -122.2712},
    {"name": "Sacramento", "country": "US", "state": "California", "lat": 38.5816, "lng": -121.4944},
    {"name": "Long Beach", "country": "US", "state": "California", "lat": 33.7701, "lng": -118.1937},
    {"name": "Santa Monica", "country": "US", "state": "California", "lat": 34.0195, "lng": -118.4912},
    {"name": "Hollywood", "country": "US", "state": "California", "lat": 34.0928, "lng": -118.3287},
    
    # Colorado (Recreational legal)
    {"name": "Denver", "country": "US", "state": "Colorado", "lat": 39.7392, "lng": -104.9903},
    {"name": "Boulder", "country": "US", "state": "Colorado", "lat": 40.0150, "lng": -105.2705},
    {"name": "Colorado Springs", "country": "US", "state": "Colorado", "lat": 38.8339, "lng": -104.8214},
    
    # Nevada (Recreational legal)
    {"name": "Las Vegas", "country": "US", "state": "Nevada", "lat": 36.1699, "lng": -115.1398},
    {"name": "Reno", "country": "US", "state": "Nevada", "lat": 39.5296, "lng": -119.8138},
    
    # Washington (Recreational legal)
    {"name": "Seattle", "country": "US", "state": "Washington", "lat": 47.6062, "lng": -122.3321},
    {"name": "Portland", "country": "US", "state": "Oregon", "lat": 45.5152, "lng": -122.6784},
    
    # Oregon (Recreational legal)
    {"name": "Eugene", "country": "US", "state": "Oregon", "lat": 44.0521, "lng": -123.0868},
    
    # Massachusetts (Recreational legal)
    {"name": "Boston", "country": "US", "state": "Massachusetts", "lat": 42.3601, "lng": -71.0589},
    {"name": "Cambridge", "country": "US", "state": "Massachusetts", "lat": 42.3736, "lng": -71.1097},
    
    # Illinois (Recreational legal)
    {"name": "Chicago", "country": "US", "state": "Illinois", "lat": 41.8781, "lng": -87.6298},
    
    # Michigan (Recreational legal)
    {"name": "Detroit", "country": "US", "state": "Michigan", "lat": 42.3314, "lng": -83.0458},
    {"name": "Ann Arbor", "country": "US", "state": "Michigan", "lat": 42.2808, "lng": -83.7430},
    
    # Arizona (Recreational legal)
    {"name": "Phoenix", "country": "US", "state": "Arizona", "lat": 33.4484, "lng": -112.0740},
    {"name": "Scottsdale", "country": "US", "state": "Arizona", "lat": 33.4942, "lng": -111.9261},
    {"name": "Tucson", "country": "US", "state": "Arizona", "lat": 32.2226, "lng": -110.9747},
    
    # New Jersey (Recreational legal)
    {"name": "Newark", "country": "US", "state": "New Jersey", "lat": 40.7357, "lng": -74.1724},
    {"name": "Jersey City", "country": "US", "state": "New Jersey", "lat": 40.7178, "lng": -74.0431},
    
    # Other major cities
    {"name": "Atlanta", "country": "US", "state": "Georgia", "lat": 33.7490, "lng": -84.3880},
    {"name": "Houston", "country": "US", "state": "Texas", "lat": 29.7604, "lng": -95.3698},
    {"name": "Austin", "country": "US", "state": "Texas", "lat": 30.2672, "lng": -97.7431},
    {"name": "Dallas", "country": "US", "state": "Texas", "lat": 32.7767, "lng": -96.7970},
    {"name": "Philadelphia", "country": "US", "state": "Pennsylvania", "lat": 39.9526, "lng": -75.1652},
    {"name": "Washington DC", "country": "US", "state": "District of Columbia", "lat": 38.9072, "lng": -77.0369},
    {"name": "Baltimore", "country": "US", "state": "Maryland", "lat": 39.2904, "lng": -76.6122},
    {"name": "Minneapolis", "country": "US", "state": "Minnesota", "lat": 44.9778, "lng": -93.2650},
    {"name": "St. Louis", "country": "US", "state": "Missouri", "lat": 38.6270, "lng": -90.1994},
    {"name": "Nashville", "country": "US", "state": "Tennessee", "lat": 36.1627, "lng": -86.7816},
    {"name": "New Orleans", "country": "US", "state": "Louisiana", "lat": 29.9511, "lng": -90.0715},
    {"name": "San Antonio", "country": "US", "state": "Texas", "lat": 29.4241, "lng": -98.4936},
    {"name": "Charlotte", "country": "US", "state": "North Carolina", "lat": 35.2271, "lng": -80.8431},
    
    # Hawaii (Medical)
    {"name": "Honolulu", "country": "US", "state": "Hawaii", "lat": 21.3069, "lng": -157.8583},
    
    # Alaska (Recreational legal)
    {"name": "Anchorage", "country": "US", "state": "Alaska", "lat": 61.2181, "lng": -149.9003},
]

# Search terms
SEARCH_TERMS = ["dispensary", "cannabis dispensary", "CBD store", "marijuana dispensary", "weed dispensary", "hemp store"]

async def search_places(lat: float, lng: float, keyword: str):
    """Search Google Places for cannabis-related businesses"""
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={
            "location": f"{lat},{lng}",
            "radius": 15000,  # 15km for larger US cities
            "keyword": keyword,
            "key": API_KEY
        })
        data = response.json()
        
        if data.get("status") == "OK":
            return data.get("results", [])
        return []

async def process_city(city: dict):
    """Search for cannabis shops in a city"""
    shops_found = []
    
    for term in SEARCH_TERMS:
        try:
            results = await search_places(city["lat"], city["lng"], term)
            
            for place in results:
                name_lower = place.get("name", "").lower()
                
                # Filter for relevant places
                relevant_keywords = ["dispensary", "cannabis", "cbd", "hemp", "marijuana", "weed", "thc", "greenleaf", "curaleaf", "trulieve", "surterra", "medmen", "cookies", "stiiizy"]
                is_relevant = any(kw in name_lower for kw in relevant_keywords)
                
                # Also check types
                types = place.get("types", [])
                if "store" in types or "health" in types:
                    is_relevant = True
                
                if is_relevant or "dispensary" in term.lower():
                    location = place.get("geometry", {}).get("location", {})
                    
                    # Determine shop type
                    if "medical" in name_lower:
                        shop_type = "Medical Dispensary"
                    elif "recreational" in name_lower:
                        shop_type = "Recreational Dispensary"
                    elif "cbd" in name_lower:
                        shop_type = "CBD Shop"
                    else:
                        shop_type = "Dispensary"
                    
                    shop = {
                        "shop_id": f"google_{place.get('place_id', '')}",
                        "google_place_id": place.get("place_id"),
                        "name": place.get("name"),
                        "type": shop_type,
                        "address": place.get("vicinity", ""),
                        "city": city["name"],
                        "state": city["state"],
                        "country": city["country"],
                        "coordinates": {
                            "lat": location.get("lat"),
                            "lng": location.get("lng")
                        },
                        "rating": place.get("rating", 4.0),
                        "user_ratings_total": place.get("user_ratings_total", 0),
                        "is_dispensary": True,
                        "source": "google_places"
                    }
                    
                    # Check if not already in list
                    if not any(s["shop_id"] == shop["shop_id"] for s in shops_found):
                        shops_found.append(shop)
            
            await asyncio.sleep(0.15)  # Rate limit
            
        except Exception as e:
            print(f"Error searching {term} in {city['name']}: {e}")
    
    return shops_found

async def main():
    if not API_KEY:
        print("Error: GOOGLE_MAPS_API_KEY not found")
        return
    
    print("🇺🇸 Searching Google Maps for USA cannabis/CBD shops...")
    print(f"Searching {len(USA_CITIES)} cities with {len(SEARCH_TERMS)} search terms...")
    print()
    
    all_shops = []
    
    for city in USA_CITIES:
        print(f"🔍 Searching {city['name']}, {city['state']}...", end=" ", flush=True)
        shops = await process_city(city)
        all_shops.extend(shops)
        print(f"Found {len(shops)} shops")
        await asyncio.sleep(0.2)  # Rate limit between cities
    
    print()
    print(f"Total unique shops found: {len(all_shops)}")
    
    # Add to database
    added = 0
    updated = 0
    for shop in all_shops:
        result = await db.dispensaries.update_one(
            {"shop_id": shop["shop_id"]},
            {"$set": shop},
            upsert=True
        )
        if result.upserted_id:
            added += 1
        elif result.modified_count:
            updated += 1
    
    print(f"Added {added} new shops, updated {updated} existing")
    
    # Print summary by state
    print()
    print("Shops by state:")
    states = {}
    for shop in all_shops:
        s = shop["state"]
        states[s] = states.get(s, 0) + 1
    
    for state, count in sorted(states.items(), key=lambda x: -x[1]):
        print(f"  {state}: {count}")
    
    # Print total
    total = await db.dispensaries.count_documents({})
    us_total = await db.dispensaries.count_documents({"country": "US"})
    print()
    print(f"Total US shops: {us_total}")
    print(f"Total worldwide: {total}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
