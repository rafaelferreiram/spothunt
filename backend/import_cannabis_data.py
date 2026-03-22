import csv
import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

async def import_strains():
    """Import strains from CSV to MongoDB"""
    strains_file = Path('/app/cannabis-data/Dataset/Strains/strains-kushy_api.2017-11-14.csv')
    
    if not strains_file.exists():
        print("Strains file not found!")
        return
    
    strains = []
    with open(strains_file, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parse effects, ailments, flavors
            effects = [e.strip() for e in (row.get('effects') or '').split(',') if e.strip()]
            ailments = [a.strip() for a in (row.get('ailment') or '').split(',') if a.strip()]
            flavors = [fl.strip() for fl in (row.get('flavor') or '').split(',') if fl.strip()]
            
            # Parse THC/CBD values
            try:
                thc = float(row.get('thc') or 0)
                if thc > 100:  # Some values are scaled differently
                    thc = thc / 10
            except:
                thc = 0
            
            try:
                cbd = float(row.get('cbd') or 0)
            except:
                cbd = 0
            
            strain = {
                'strain_id': f"strain_{row['id']}",
                'name': row.get('name', '').strip(),
                'slug': row.get('slug') or row.get('name', '').lower().replace(' ', '-'),
                'type': row.get('type', 'Hybrid'),  # Indica, Sativa, Hybrid
                'description': (row.get('description') or '').replace('<p>', '').replace('</p>', '').strip(),
                'effects': effects,
                'ailments': ailments,
                'flavors': flavors,
                'thc': thc,
                'cbd': cbd,
                'breeder': row.get('breeder') or 'Unknown',
                'image': row.get('image') or None,
            }
            
            if strain['name']:  # Only add strains with names
                strains.append(strain)
    
    # Clear existing and insert
    await db.strains.delete_many({})
    if strains:
        await db.strains.insert_many(strains)
        print(f"Imported {len(strains)} strains")
    
    # Create indexes
    await db.strains.create_index([('name', 'text'), ('description', 'text'), ('effects', 'text')])
    await db.strains.create_index('type')
    await db.strains.create_index('strain_id')

async def import_shops():
    """Import shops/dispensaries from CSV to MongoDB"""
    shops_file = Path('/app/cannabis-data/Dataset/Shops/shops-kushy_api.2017-11-14.csv')
    
    if not shops_file.exists():
        print("Shops file not found!")
        return
    
    shops = []
    with open(shops_file, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                lat = float(row.get('lat') or 0)
                lng = float(row.get('lng') or 0)
            except:
                lat, lng = 0, 0
            
            # Skip shops without valid coordinates
            if lat == 0 or lng == 0:
                continue
            
            shop_type = (row.get('type') or 'Dispensary').strip()
            
            shop = {
                'shop_id': f"shop_{row['id']}",
                'name': row.get('name', '').strip(),
                'slug': row.get('slug', ''),
                'type': shop_type,
                'address': row.get('address', ''),
                'city': row.get('city', ''),
                'state': row.get('state', ''),
                'postcode': row.get('postcode', ''),
                'country': row.get('country', 'US'),
                'coordinates': {'lat': lat, 'lng': lng},
                'image': row.get('featured_image') or row.get('avatar'),
                'description': row.get('description', ''),
                'rating': 4.2,  # Default rating
                'is_dispensary': shop_type.lower() in ['dispensary', 'recreational', 'medical', ''],
            }
            try:
                rating_str = row.get('rating', '')
                if rating_str and rating_str != 'NULL':
                    shop['rating'] = float(rating_str)
            except:
                pass
            
            if shop['name']:
                shops.append(shop)
    
    # Clear existing and insert
    await db.dispensaries.delete_many({})
    if shops:
        await db.dispensaries.insert_many(shops)
        print(f"Imported {len(shops)} shops/dispensaries")
    
    # Create indexes
    await db.dispensaries.create_index([('name', 'text'), ('city', 'text')])
    await db.dispensaries.create_index('state')
    await db.dispensaries.create_index('country')
    await db.dispensaries.create_index('shop_id')
    await db.dispensaries.create_index([('coordinates.lat', 1), ('coordinates.lng', 1)])

# Add European cannabis clubs/coffee shops
EUROPEAN_CANNABIS_SPOTS = [
    # Amsterdam Coffeeshops
    {"shop_id": "eu_1", "name": "The Bulldog", "type": "Coffeeshop", "address": "Leidseplein 15", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3641, "lng": 4.8828}, "description": "Amsterdam's most famous coffeeshop chain since 1975", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "eu_2", "name": "Barney's Coffeeshop", "type": "Coffeeshop", "address": "Haarlemmerstraat 102", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3799, "lng": 4.8875}, "description": "Award-winning coffeeshop known for premium strains", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "eu_3", "name": "Dampkring", "type": "Coffeeshop", "address": "Handboogstraat 29", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3680, "lng": 4.8901}, "description": "Featured in Ocean's Twelve, excellent atmosphere", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "eu_4", "name": "Grey Area", "type": "Coffeeshop", "address": "Oude Leliestraat 2", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3747, "lng": 4.8857}, "description": "American-owned shop with potent strains", "rating": 4.6, "is_dispensary": True},
    {"shop_id": "eu_5", "name": "Greenhouse", "type": "Coffeeshop", "address": "Oudezijds Voorburgwal 191", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3731, "lng": 4.8976}, "description": "Multiple Cannabis Cup winner", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "eu_6", "name": "Amnesia", "type": "Coffeeshop", "address": "Herengracht 133", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3756, "lng": 4.8878}, "description": "Home of the famous Amnesia Haze strain", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "eu_7", "name": "Boerejongens", "type": "Coffeeshop", "address": "Baarsjesweg 239", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3694, "lng": 4.8536}, "description": "Best quality-price ratio in Amsterdam", "rating": 4.7, "is_dispensary": True},
    
    # Barcelona Cannabis Clubs
    {"shop_id": "eu_10", "name": "La Kalada", "type": "Cannabis Club", "address": "Carrer de Còrsega", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3954, "lng": 2.1533}, "description": "Premium cannabis social club in Eixample", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "eu_11", "name": "Green Planet BCN", "type": "Cannabis Club", "address": "El Raval", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3797, "lng": 2.1682}, "description": "Popular club with great variety", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "eu_12", "name": "Choko Cannabis Club", "type": "Cannabis Club", "address": "Carrer de Balmes", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3915, "lng": 2.1528}, "description": "Relaxed atmosphere, quality products", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "eu_13", "name": "High Class BCN", "type": "Cannabis Club", "address": "Gràcia", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.4036, "lng": 2.1566}, "description": "Upscale club with premium selection", "rating": 4.6, "is_dispensary": True},
    {"shop_id": "eu_14", "name": "Dr. Dou", "type": "Cannabis Club", "address": "Carrer del Doctor Dou", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3826, "lng": 2.1701}, "description": "Central location, friendly staff", "rating": 4.2, "is_dispensary": True},
    
    # Thailand (Legal since 2022)
    {"shop_id": "th_1", "name": "High Thailand", "type": "Dispensary", "address": "Sukhumvit Road", "city": "Bangkok", "state": "Bangkok", "country": "TH", "coordinates": {"lat": 13.7400, "lng": 100.5610}, "description": "Premium dispensary in central Bangkok", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "th_2", "name": "Cloud Nine", "type": "Dispensary", "address": "Khao San Road", "city": "Bangkok", "state": "Bangkok", "country": "TH", "coordinates": {"lat": 13.7590, "lng": 100.4970}, "description": "Tourist-friendly cannabis shop", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "th_3", "name": "Phuket High", "type": "Dispensary", "address": "Patong Beach", "city": "Phuket", "state": "Phuket", "country": "TH", "coordinates": {"lat": 7.8961, "lng": 98.2982}, "description": "Beachside dispensary with ocean views", "rating": 4.4, "is_dispensary": True},
    
    # Canada
    {"shop_id": "ca_1", "name": "Tokyo Smoke", "type": "Dispensary", "address": "Queen Street West", "city": "Toronto", "state": "Ontario", "country": "CA", "coordinates": {"lat": 43.6489, "lng": -79.3956}, "description": "Premium cannabis retail experience", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "ca_2", "name": "Hobo Cannabis", "type": "Dispensary", "address": "Bank Street", "city": "Ottawa", "state": "Ontario", "country": "CA", "coordinates": {"lat": 45.4112, "lng": -75.6981}, "description": "Modern dispensary with expert staff", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "ca_3", "name": "Spiritleaf", "type": "Dispensary", "address": "Granville Street", "city": "Vancouver", "state": "British Columbia", "country": "CA", "coordinates": {"lat": 49.2827, "lng": -123.1207}, "description": "West coast cannabis culture", "rating": 4.3, "is_dispensary": True},
    
    # Portugal (Decriminalized)
    {"shop_id": "pt_1", "name": "Bairro Alto CBD", "type": "CBD Shop", "address": "Bairro Alto", "city": "Lisbon", "state": "Lisbon", "country": "PT", "coordinates": {"lat": 38.7139, "lng": -9.1456}, "description": "CBD products in historic district", "rating": 4.2, "is_dispensary": False},
    
    # Germany (Legal 2024)
    {"shop_id": "de_1", "name": "Berlin Cannabis Club", "type": "Cannabis Club", "address": "Kreuzberg", "city": "Berlin", "state": "Berlin", "country": "DE", "coordinates": {"lat": 52.4934, "lng": 13.4234}, "description": "Germany's new cannabis club scene", "rating": 4.3, "is_dispensary": True},
]

async def add_european_spots():
    """Add European cannabis locations"""
    for spot in EUROPEAN_CANNABIS_SPOTS:
        await db.dispensaries.update_one(
            {'shop_id': spot['shop_id']},
            {'$set': spot},
            upsert=True
        )
    print(f"Added {len(EUROPEAN_CANNABIS_SPOTS)} European locations")

async def main():
    print("Starting cannabis data import...")
    await import_strains()
    await import_shops()
    await add_european_spots()
    
    # Print stats
    strain_count = await db.strains.count_documents({})
    shop_count = await db.dispensaries.count_documents({})
    print(f"\nTotal strains: {strain_count}")
    print(f"Total dispensaries/shops: {shop_count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
