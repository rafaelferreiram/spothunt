"""
Search Google Maps for real cannabis/CBD/THC shops and add to database
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

# European cities to search
CITIES = [
    # Portugal
    {"name": "Lisbon", "country": "PT", "state": "Lisbon", "lat": 38.7223, "lng": -9.1393},
    {"name": "Porto", "country": "PT", "state": "Porto", "lat": 41.1579, "lng": -8.6291},
    {"name": "Faro", "country": "PT", "state": "Algarve", "lat": 37.0194, "lng": -7.9322},
    {"name": "Braga", "country": "PT", "state": "Braga", "lat": 41.5518, "lng": -8.4229},
    {"name": "Coimbra", "country": "PT", "state": "Coimbra", "lat": 40.2033, "lng": -8.4103},
    
    # Spain
    {"name": "Barcelona", "country": "ES", "state": "Catalonia", "lat": 41.3851, "lng": 2.1734},
    {"name": "Madrid", "country": "ES", "state": "Madrid", "lat": 40.4168, "lng": -3.7038},
    {"name": "Valencia", "country": "ES", "state": "Valencia", "lat": 39.4699, "lng": -0.3763},
    {"name": "Seville", "country": "ES", "state": "Andalusia", "lat": 37.3891, "lng": -5.9845},
    {"name": "Malaga", "country": "ES", "state": "Andalusia", "lat": 36.7213, "lng": -4.4214},
    {"name": "Bilbao", "country": "ES", "state": "Basque Country", "lat": 43.2630, "lng": -2.9350},
    
    # Netherlands
    {"name": "Amsterdam", "country": "NL", "state": "North Holland", "lat": 52.3676, "lng": 4.9041},
    {"name": "Rotterdam", "country": "NL", "state": "South Holland", "lat": 51.9244, "lng": 4.4777},
    {"name": "The Hague", "country": "NL", "state": "South Holland", "lat": 52.0705, "lng": 4.3007},
    {"name": "Utrecht", "country": "NL", "state": "Utrecht", "lat": 52.0907, "lng": 5.1214},
    
    # Germany
    {"name": "Berlin", "country": "DE", "state": "Berlin", "lat": 52.5200, "lng": 13.4050},
    {"name": "Munich", "country": "DE", "state": "Bavaria", "lat": 48.1351, "lng": 11.5820},
    {"name": "Hamburg", "country": "DE", "state": "Hamburg", "lat": 53.5511, "lng": 9.9937},
    {"name": "Frankfurt", "country": "DE", "state": "Hesse", "lat": 50.1109, "lng": 8.6821},
    {"name": "Cologne", "country": "DE", "state": "North Rhine-Westphalia", "lat": 50.9375, "lng": 6.9603},
    
    # Czech Republic
    {"name": "Prague", "country": "CZ", "state": "Prague", "lat": 50.0755, "lng": 14.4378},
    
    # Austria
    {"name": "Vienna", "country": "AT", "state": "Vienna", "lat": 48.2082, "lng": 16.3738},
    
    # Italy
    {"name": "Rome", "country": "IT", "state": "Lazio", "lat": 41.9028, "lng": 12.4964},
    {"name": "Milan", "country": "IT", "state": "Lombardy", "lat": 45.4642, "lng": 9.1900},
    
    # France
    {"name": "Paris", "country": "FR", "state": "Île-de-France", "lat": 48.8566, "lng": 2.3522},
    
    # Belgium
    {"name": "Brussels", "country": "BE", "state": "Brussels", "lat": 50.8503, "lng": 4.3517},
    {"name": "Antwerp", "country": "BE", "state": "Antwerp", "lat": 51.2194, "lng": 4.4025},
    
    # Switzerland
    {"name": "Zurich", "country": "CH", "state": "Zurich", "lat": 47.3769, "lng": 8.5417},
    {"name": "Geneva", "country": "CH", "state": "Geneva", "lat": 46.2044, "lng": 6.1432},
    
    # UK
    {"name": "London", "country": "GB", "state": "England", "lat": 51.5074, "lng": -0.1278},
    {"name": "Manchester", "country": "GB", "state": "England", "lat": 53.4808, "lng": -2.2426},
    
    # Poland
    {"name": "Warsaw", "country": "PL", "state": "Masovia", "lat": 52.2297, "lng": 21.0122},
    {"name": "Krakow", "country": "PL", "state": "Lesser Poland", "lat": 50.0647, "lng": 19.9450},
    
    # Greece
    {"name": "Athens", "country": "GR", "state": "Attica", "lat": 37.9838, "lng": 23.7275},
    
    # Croatia
    {"name": "Zagreb", "country": "HR", "state": "Zagreb", "lat": 45.8150, "lng": 15.9819},
    
    # Ireland
    {"name": "Dublin", "country": "IE", "state": "Dublin", "lat": 53.3498, "lng": -6.2603},
    
    # Denmark
    {"name": "Copenhagen", "country": "DK", "state": "Capital Region", "lat": 55.6761, "lng": 12.5683},
    
    # Sweden
    {"name": "Stockholm", "country": "SE", "state": "Stockholm", "lat": 59.3293, "lng": 18.0686},
]

# Search terms
SEARCH_TERMS = ["CBD shop", "cannabis store", "hemp shop", "THC shop", "coffeeshop cannabis", "grow shop"]

async def search_places(lat: float, lng: float, keyword: str):
    """Search Google Places for cannabis-related businesses"""
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={
            "location": f"{lat},{lng}",
            "radius": 10000,  # 10km
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
                # Check if it's actually cannabis-related
                name_lower = place.get("name", "").lower()
                types = place.get("types", [])
                
                # Filter for relevant places
                relevant_keywords = ["cbd", "cannabis", "hemp", "hanf", "weed", "grow", "coffeeshop", "marijuana", "thc", "canapa", "chanvre"]
                is_relevant = any(kw in name_lower for kw in relevant_keywords)
                
                if is_relevant:
                    location = place.get("geometry", {}).get("location", {})
                    
                    # Determine shop type
                    if "coffeeshop" in name_lower or city["country"] == "NL":
                        shop_type = "Coffeeshop"
                    elif "grow" in name_lower:
                        shop_type = "Grow Shop"
                    elif "thc" in name_lower:
                        shop_type = "THC Shop"
                    else:
                        shop_type = "CBD Shop"
                    
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
                        "is_dispensary": True,
                        "source": "google_places"
                    }
                    
                    # Check if not already in list
                    if not any(s["shop_id"] == shop["shop_id"] for s in shops_found):
                        shops_found.append(shop)
            
            await asyncio.sleep(0.2)  # Rate limit
            
        except Exception as e:
            print(f"Error searching {term} in {city['name']}: {e}")
    
    return shops_found

async def main():
    if not API_KEY:
        print("Error: GOOGLE_MAPS_API_KEY not found")
        return
    
    print("Searching Google Maps for cannabis/CBD shops...")
    print(f"Searching {len(CITIES)} cities with {len(SEARCH_TERMS)} search terms...")
    print()
    
    all_shops = []
    
    for city in CITIES:
        print(f"🔍 Searching {city['name']}, {city['country']}...", end=" ")
        shops = await process_city(city)
        all_shops.extend(shops)
        print(f"Found {len(shops)} shops")
        await asyncio.sleep(0.3)  # Rate limit between cities
    
    print()
    print(f"Total unique shops found: {len(all_shops)}")
    
    # Add to database
    added = 0
    for shop in all_shops:
        result = await db.dispensaries.update_one(
            {"shop_id": shop["shop_id"]},
            {"$set": shop},
            upsert=True
        )
        if result.upserted_id:
            added += 1
    
    print(f"Added {added} new shops to database")
    
    # Print summary by country
    print()
    print("Shops by country:")
    countries = {}
    for shop in all_shops:
        c = shop["country"]
        countries[c] = countries.get(c, 0) + 1
    
    for country, count in sorted(countries.items(), key=lambda x: -x[1]):
        print(f"  {country}: {count}")
    
    # Print total
    total = await db.dispensaries.count_documents({})
    print()
    print(f"Total shops in database: {total}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
