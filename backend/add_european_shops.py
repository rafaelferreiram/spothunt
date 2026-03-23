"""
Add more European CBD/THC shops to the database
Includes: Portugal, Spain, Netherlands, Germany, Italy, France, Czech Republic, etc.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Extended European Cannabis Spots
EUROPEAN_SHOPS = [
    # ==================== PORTUGAL ====================
    # Lisbon
    {"shop_id": "pt_lisbon_1", "name": "CBD House Lisboa", "type": "CBD Shop", "address": "Rua Augusta 25", "city": "Lisbon", "state": "Lisbon", "country": "PT", "coordinates": {"lat": 38.7103, "lng": -9.1367}, "description": "Premium CBD products in downtown Lisbon", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "pt_lisbon_2", "name": "Cannadouro", "type": "CBD Shop", "address": "Av. da Liberdade 180", "city": "Lisbon", "state": "Lisbon", "country": "PT", "coordinates": {"lat": 38.7205, "lng": -9.1451}, "description": "High-quality CBD oils and flowers", "rating": 4.6, "is_dispensary": True},
    {"shop_id": "pt_lisbon_3", "name": "Green Leaf Lisboa", "type": "CBD Shop", "address": "Bairro Alto 45", "city": "Lisbon", "state": "Lisbon", "country": "PT", "coordinates": {"lat": 38.7139, "lng": -9.1456}, "description": "CBD and hemp products in historic district", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "pt_lisbon_4", "name": "CBD Portugal Store", "type": "CBD Shop", "address": "Príncipe Real 33", "city": "Lisbon", "state": "Lisbon", "country": "PT", "coordinates": {"lat": 38.7172, "lng": -9.1502}, "description": "Wide selection of CBD products", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "pt_lisbon_5", "name": "HempStore Lisboa", "type": "CBD Shop", "address": "Rossio Square", "city": "Lisbon", "state": "Lisbon", "country": "PT", "coordinates": {"lat": 38.7139, "lng": -9.1399}, "description": "Hemp and CBD specialist", "rating": 4.2, "is_dispensary": True},
    {"shop_id": "pt_lisbon_6", "name": "Alfama CBD", "type": "CBD Shop", "address": "Rua de São Miguel", "city": "Lisbon", "state": "Lisbon", "country": "PT", "coordinates": {"lat": 38.7112, "lng": -9.1305}, "description": "CBD shop in historic Alfama", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "pt_lisbon_7", "name": "CBD Belém", "type": "CBD Shop", "address": "Av. Brasília", "city": "Lisbon", "state": "Lisbon", "country": "PT", "coordinates": {"lat": 38.6972, "lng": -9.2064}, "description": "CBD near Belém Tower", "rating": 4.1, "is_dispensary": True},
    
    # Porto
    {"shop_id": "pt_porto_1", "name": "CBD Porto", "type": "CBD Shop", "address": "Rua de Santa Catarina 112", "city": "Porto", "state": "Porto", "country": "PT", "coordinates": {"lat": 41.1496, "lng": -8.6090}, "description": "Porto's premier CBD store", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "pt_porto_2", "name": "Green Porto Store", "type": "CBD Shop", "address": "Ribeira", "city": "Porto", "state": "Porto", "country": "PT", "coordinates": {"lat": 41.1403, "lng": -8.6130}, "description": "CBD products by the Douro River", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "pt_porto_3", "name": "HempShop Porto", "type": "CBD Shop", "address": "Rua das Flores 50", "city": "Porto", "state": "Porto", "country": "PT", "coordinates": {"lat": 41.1456, "lng": -8.6158}, "description": "Organic hemp and CBD", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "pt_porto_4", "name": "CBD Gaia", "type": "CBD Shop", "address": "Vila Nova de Gaia", "city": "Porto", "state": "Porto", "country": "PT", "coordinates": {"lat": 41.1339, "lng": -8.6173}, "description": "CBD shop across the river", "rating": 4.2, "is_dispensary": True},
    
    # Algarve
    {"shop_id": "pt_algarve_1", "name": "Algarve CBD", "type": "CBD Shop", "address": "Rua do Comércio", "city": "Faro", "state": "Algarve", "country": "PT", "coordinates": {"lat": 37.0179, "lng": -7.9352}, "description": "CBD in sunny Algarve", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "pt_algarve_2", "name": "Lagos Hemp Shop", "type": "CBD Shop", "address": "Old Town", "city": "Lagos", "state": "Algarve", "country": "PT", "coordinates": {"lat": 37.1028, "lng": -8.6730}, "description": "Beachside CBD products", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "pt_algarve_3", "name": "Albufeira Green", "type": "CBD Shop", "address": "Strip", "city": "Albufeira", "state": "Algarve", "country": "PT", "coordinates": {"lat": 37.0882, "lng": -8.2503}, "description": "CBD and hemp products", "rating": 4.1, "is_dispensary": True},
    {"shop_id": "pt_algarve_4", "name": "Portimão CBD", "type": "CBD Shop", "address": "Marina", "city": "Portimão", "state": "Algarve", "country": "PT", "coordinates": {"lat": 37.1359, "lng": -8.5363}, "description": "CBD shop near the marina", "rating": 4.2, "is_dispensary": True},
    
    # Madeira & Azores
    {"shop_id": "pt_madeira_1", "name": "Funchal CBD", "type": "CBD Shop", "address": "Av. do Mar", "city": "Funchal", "state": "Madeira", "country": "PT", "coordinates": {"lat": 32.6501, "lng": -16.9088}, "description": "CBD in paradise", "rating": 4.3, "is_dispensary": True},
    
    # ==================== SPAIN ====================
    # Barcelona (more clubs)
    {"shop_id": "es_bcn_1", "name": "HAZE Barcelona", "type": "Cannabis Club", "address": "El Born", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3851, "lng": 2.1834}, "description": "Premium cannabis social club", "rating": 4.6, "is_dispensary": True},
    {"shop_id": "es_bcn_2", "name": "Kush BCN", "type": "Cannabis Club", "address": "Eixample", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3887, "lng": 2.1624}, "description": "High-quality strains selection", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "es_bcn_3", "name": "420 Barcelona", "type": "Cannabis Club", "address": "Poble Sec", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3742, "lng": 2.1598}, "description": "Friendly atmosphere, good prices", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "es_bcn_4", "name": "Cannabis Club Sants", "type": "Cannabis Club", "address": "Sants", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3768, "lng": 2.1329}, "description": "Local neighborhood club", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "es_bcn_5", "name": "Medical Cannabis BCN", "type": "Cannabis Club", "address": "Sant Gervasi", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.4054, "lng": 2.1401}, "description": "Focus on medical strains", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "es_bcn_6", "name": "CBD Barcelona Shop", "type": "CBD Shop", "address": "Las Ramblas", "city": "Barcelona", "state": "Catalonia", "country": "ES", "coordinates": {"lat": 41.3809, "lng": 2.1731}, "description": "CBD products on famous street", "rating": 4.2, "is_dispensary": True},
    
    # Madrid
    {"shop_id": "es_mad_1", "name": "Madrid Cannabis Club", "type": "Cannabis Club", "address": "Malasaña", "city": "Madrid", "state": "Madrid", "country": "ES", "coordinates": {"lat": 40.4266, "lng": -3.7049}, "description": "Historic neighborhood club", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "es_mad_2", "name": "CBD Madrid Centro", "type": "CBD Shop", "address": "Gran Vía", "city": "Madrid", "state": "Madrid", "country": "ES", "coordinates": {"lat": 40.4200, "lng": -3.7025}, "description": "Central CBD store", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "es_mad_3", "name": "Hemp Store Madrid", "type": "CBD Shop", "address": "Chueca", "city": "Madrid", "state": "Madrid", "country": "ES", "coordinates": {"lat": 40.4229, "lng": -3.6973}, "description": "Hemp and CBD specialist", "rating": 4.2, "is_dispensary": True},
    {"shop_id": "es_mad_4", "name": "La Verde Madrid", "type": "Cannabis Club", "address": "Lavapiés", "city": "Madrid", "state": "Madrid", "country": "ES", "coordinates": {"lat": 40.4089, "lng": -3.6998}, "description": "Alternative neighborhood club", "rating": 4.3, "is_dispensary": True},
    
    # Valencia
    {"shop_id": "es_val_1", "name": "Valencia Cannabis Club", "type": "Cannabis Club", "address": "El Carmen", "city": "Valencia", "state": "Valencia", "country": "ES", "coordinates": {"lat": 39.4785, "lng": -0.3817}, "description": "Club in historic center", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "es_val_2", "name": "CBD Valencia", "type": "CBD Shop", "address": "Ruzafa", "city": "Valencia", "state": "Valencia", "country": "ES", "coordinates": {"lat": 39.4610, "lng": -0.3741}, "description": "Trendy neighborhood CBD shop", "rating": 4.3, "is_dispensary": True},
    
    # Seville
    {"shop_id": "es_sev_1", "name": "Sevilla Verde", "type": "Cannabis Club", "address": "Alameda", "city": "Seville", "state": "Andalusia", "country": "ES", "coordinates": {"lat": 37.3978, "lng": -5.9936}, "description": "Andalusian cannabis culture", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "es_sev_2", "name": "CBD Sevilla", "type": "CBD Shop", "address": "Triana", "city": "Seville", "state": "Andalusia", "country": "ES", "coordinates": {"lat": 37.3835, "lng": -6.0063}, "description": "CBD in flamenco district", "rating": 4.2, "is_dispensary": True},
    
    # Malaga & Costa del Sol
    {"shop_id": "es_mal_1", "name": "Malaga Cannabis Club", "type": "Cannabis Club", "address": "Centro", "city": "Malaga", "state": "Andalusia", "country": "ES", "coordinates": {"lat": 36.7213, "lng": -4.4214}, "description": "Costa del Sol club", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "es_mal_2", "name": "Marbella Green", "type": "Cannabis Club", "address": "Puerto Banús", "city": "Marbella", "state": "Andalusia", "country": "ES", "coordinates": {"lat": 36.4855, "lng": -4.9571}, "description": "Luxury resort area club", "rating": 4.5, "is_dispensary": True},
    
    # Canary Islands
    {"shop_id": "es_can_1", "name": "Tenerife Cannabis Club", "type": "Cannabis Club", "address": "Santa Cruz", "city": "Santa Cruz de Tenerife", "state": "Canary Islands", "country": "ES", "coordinates": {"lat": 28.4636, "lng": -16.2518}, "description": "Island paradise club", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "es_can_2", "name": "Gran Canaria Green", "type": "Cannabis Club", "address": "Las Palmas", "city": "Las Palmas", "state": "Canary Islands", "country": "ES", "coordinates": {"lat": 28.1235, "lng": -15.4363}, "description": "Atlantic island club", "rating": 4.2, "is_dispensary": True},
    
    # ==================== NETHERLANDS ====================
    # Amsterdam (more coffeeshops)
    {"shop_id": "nl_ams_1", "name": "Voyagers", "type": "Coffeeshop", "address": "Zeedijk", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3747, "lng": 4.8999}, "description": "Space-themed coffeeshop", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "nl_ams_2", "name": "420 Cafe", "type": "Coffeeshop", "address": "Singel", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3736, "lng": 4.8882}, "description": "Classic Amsterdam coffeeshop", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "nl_ams_3", "name": "Prix d'Ami", "type": "Coffeeshop", "address": "Haringpakkerssteeg", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3745, "lng": 4.8941}, "description": "Quality cannabis, fair prices", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "nl_ams_4", "name": "Tweede Kamer", "type": "Coffeeshop", "address": "Heisteeg", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3695, "lng": 4.8884}, "description": "Cozy, local favorite", "rating": 4.6, "is_dispensary": True},
    {"shop_id": "nl_ams_5", "name": "Abraxas", "type": "Coffeeshop", "address": "Jonge Roelensteeg", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3730, "lng": 4.8934}, "description": "Multi-level coffeeshop", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "nl_ams_6", "name": "Katsu", "type": "Coffeeshop", "address": "Eerste Van der Helststraat", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3547, "lng": 4.8937}, "description": "De Pijp neighborhood gem", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "nl_ams_7", "name": "Blue Bird", "type": "Coffeeshop", "address": "Sint Antoniesbreestraat", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3709, "lng": 4.9015}, "description": "Bird-themed coffeeshop", "rating": 4.2, "is_dispensary": True},
    {"shop_id": "nl_ams_8", "name": "Super Skunk", "type": "Coffeeshop", "address": "Nieuwendijk", "city": "Amsterdam", "state": "North Holland", "country": "NL", "coordinates": {"lat": 52.3771, "lng": 4.8943}, "description": "Shopping street coffeeshop", "rating": 4.1, "is_dispensary": True},
    
    # Rotterdam
    {"shop_id": "nl_rot_1", "name": "Rockstar", "type": "Coffeeshop", "address": "Nieuwe Binnenweg", "city": "Rotterdam", "state": "South Holland", "country": "NL", "coordinates": {"lat": 51.9145, "lng": 4.4688}, "description": "Rotterdam's best coffeeshop", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "nl_rot_2", "name": "Smokey", "type": "Coffeeshop", "address": "Witte de Withstraat", "city": "Rotterdam", "state": "South Holland", "country": "NL", "coordinates": {"lat": 51.9166, "lng": 4.4774}, "description": "Trendy area coffeeshop", "rating": 4.3, "is_dispensary": True},
    
    # The Hague
    {"shop_id": "nl_hag_1", "name": "Cremers", "type": "Coffeeshop", "address": "Prins Hendrikstraat", "city": "The Hague", "state": "South Holland", "country": "NL", "coordinates": {"lat": 52.0705, "lng": 4.3007}, "description": "Historic Hague coffeeshop", "rating": 4.4, "is_dispensary": True},
    
    # Utrecht
    {"shop_id": "nl_utr_1", "name": "Culture Boat", "type": "Coffeeshop", "address": "Oudegracht", "city": "Utrecht", "state": "Utrecht", "country": "NL", "coordinates": {"lat": 52.0907, "lng": 5.1214}, "description": "Canal-side coffeeshop", "rating": 4.3, "is_dispensary": True},
    
    # ==================== GERMANY ====================
    # Berlin
    {"shop_id": "de_ber_1", "name": "Hanfbar Berlin", "type": "CBD Shop", "address": "Friedrichshain", "city": "Berlin", "state": "Berlin", "country": "DE", "coordinates": {"lat": 52.5144, "lng": 13.4543}, "description": "CBD bar and shop", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "de_ber_2", "name": "CBD Berlin Mitte", "type": "CBD Shop", "address": "Mitte", "city": "Berlin", "state": "Berlin", "country": "DE", "coordinates": {"lat": 52.5200, "lng": 13.4050}, "description": "Central Berlin CBD", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "de_ber_3", "name": "Green Berlin Club", "type": "Cannabis Club", "address": "Neukölln", "city": "Berlin", "state": "Berlin", "country": "DE", "coordinates": {"lat": 52.4812, "lng": 13.4356}, "description": "Berlin's newest cannabis club", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "de_ber_4", "name": "Kreuzberg Cannabis", "type": "Cannabis Club", "address": "Kreuzberg", "city": "Berlin", "state": "Berlin", "country": "DE", "coordinates": {"lat": 52.4934, "lng": 13.4234}, "description": "Alternative neighborhood club", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "de_ber_5", "name": "Prenzlauer Berg Hemp", "type": "CBD Shop", "address": "Prenzlauer Berg", "city": "Berlin", "state": "Berlin", "country": "DE", "coordinates": {"lat": 52.5388, "lng": 13.4244}, "description": "Family-friendly CBD shop", "rating": 4.2, "is_dispensary": True},
    
    # Munich
    {"shop_id": "de_muc_1", "name": "CBD Munich", "type": "CBD Shop", "address": "Schwabing", "city": "Munich", "state": "Bavaria", "country": "DE", "coordinates": {"lat": 48.1621, "lng": 11.5853}, "description": "Bavarian CBD shop", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "de_muc_2", "name": "Hanf München", "type": "CBD Shop", "address": "Glockenbach", "city": "Munich", "state": "Bavaria", "country": "DE", "coordinates": {"lat": 48.1287, "lng": 11.5669}, "description": "Hemp products specialist", "rating": 4.2, "is_dispensary": True},
    
    # Hamburg
    {"shop_id": "de_ham_1", "name": "CBD Hamburg", "type": "CBD Shop", "address": "St. Pauli", "city": "Hamburg", "state": "Hamburg", "country": "DE", "coordinates": {"lat": 53.5511, "lng": 9.9624}, "description": "Reeperbahn area CBD", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "de_ham_2", "name": "Hanf Hamburg", "type": "CBD Shop", "address": "Sternschanze", "city": "Hamburg", "state": "Hamburg", "country": "DE", "coordinates": {"lat": 53.5628, "lng": 9.9639}, "description": "Alternative district hemp shop", "rating": 4.4, "is_dispensary": True},
    
    # Frankfurt
    {"shop_id": "de_fra_1", "name": "Frankfurt CBD Store", "type": "CBD Shop", "address": "Sachsenhausen", "city": "Frankfurt", "state": "Hesse", "country": "DE", "coordinates": {"lat": 50.1025, "lng": 8.6855}, "description": "CBD in apple wine district", "rating": 4.2, "is_dispensary": True},
    
    # Cologne
    {"shop_id": "de_col_1", "name": "Köln CBD", "type": "CBD Shop", "address": "Ehrenfeld", "city": "Cologne", "state": "North Rhine-Westphalia", "country": "DE", "coordinates": {"lat": 50.9476, "lng": 6.9124}, "description": "Trendy Cologne CBD shop", "rating": 4.3, "is_dispensary": True},
    
    # ==================== ITALY ====================
    {"shop_id": "it_rom_1", "name": "CBD Roma", "type": "CBD Shop", "address": "Trastevere", "city": "Rome", "state": "Lazio", "country": "IT", "coordinates": {"lat": 41.8879, "lng": 12.4687}, "description": "CBD in historic Rome", "rating": 4.2, "is_dispensary": True},
    {"shop_id": "it_mil_1", "name": "Milano Hemp", "type": "CBD Shop", "address": "Navigli", "city": "Milan", "state": "Lombardy", "country": "IT", "coordinates": {"lat": 45.4518, "lng": 9.1714}, "description": "CBD in fashion capital", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "it_flo_1", "name": "Firenze CBD", "type": "CBD Shop", "address": "San Lorenzo", "city": "Florence", "state": "Tuscany", "country": "IT", "coordinates": {"lat": 43.7764, "lng": 11.2531}, "description": "CBD in Renaissance city", "rating": 4.2, "is_dispensary": True},
    
    # ==================== CZECH REPUBLIC ====================
    {"shop_id": "cz_prg_1", "name": "Prague CBD", "type": "CBD Shop", "address": "Old Town", "city": "Prague", "state": "Prague", "country": "CZ", "coordinates": {"lat": 50.0875, "lng": 14.4213}, "description": "CBD in medieval city center", "rating": 4.4, "is_dispensary": True},
    {"shop_id": "cz_prg_2", "name": "Hemp Point Prague", "type": "CBD Shop", "address": "Žižkov", "city": "Prague", "state": "Prague", "country": "CZ", "coordinates": {"lat": 50.0833, "lng": 14.4500}, "description": "Alternative district hemp shop", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "cz_prg_3", "name": "Cannabis Praha", "type": "CBD Shop", "address": "Vinohrady", "city": "Prague", "state": "Prague", "country": "CZ", "coordinates": {"lat": 50.0735, "lng": 14.4477}, "description": "Wide CBD selection", "rating": 4.2, "is_dispensary": True},
    
    # ==================== SWITZERLAND ====================
    {"shop_id": "ch_zur_1", "name": "CBD Zürich", "type": "CBD Shop", "address": "Langstrasse", "city": "Zurich", "state": "Zurich", "country": "CH", "coordinates": {"lat": 47.3775, "lng": 8.5290}, "description": "Premium Swiss CBD", "rating": 4.5, "is_dispensary": True},
    {"shop_id": "ch_gen_1", "name": "Geneva Hemp", "type": "CBD Shop", "address": "Plainpalais", "city": "Geneva", "state": "Geneva", "country": "CH", "coordinates": {"lat": 46.1983, "lng": 6.1397}, "description": "Swiss quality CBD products", "rating": 4.4, "is_dispensary": True},
    
    # ==================== AUSTRIA ====================
    {"shop_id": "at_vie_1", "name": "CBD Vienna", "type": "CBD Shop", "address": "Neubau", "city": "Vienna", "state": "Vienna", "country": "AT", "coordinates": {"lat": 48.2000, "lng": 16.3500}, "description": "CBD in cultural capital", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "at_vie_2", "name": "Hanf Wien", "type": "CBD Shop", "address": "Mariahilf", "city": "Vienna", "state": "Vienna", "country": "AT", "coordinates": {"lat": 48.1951, "lng": 16.3525}, "description": "Austrian hemp specialist", "rating": 4.2, "is_dispensary": True},
    
    # ==================== BELGIUM ====================
    {"shop_id": "be_bru_1", "name": "CBD Brussels", "type": "CBD Shop", "address": "Saint-Gilles", "city": "Brussels", "state": "Brussels", "country": "BE", "coordinates": {"lat": 50.8284, "lng": 4.3498}, "description": "CBD in EU capital", "rating": 4.2, "is_dispensary": True},
    {"shop_id": "be_ant_1", "name": "Antwerp Hemp", "type": "CBD Shop", "address": "Eilandje", "city": "Antwerp", "state": "Antwerp", "country": "BE", "coordinates": {"lat": 51.2343, "lng": 4.4065}, "description": "Port city CBD shop", "rating": 4.3, "is_dispensary": True},
    
    # ==================== FRANCE ====================
    {"shop_id": "fr_par_1", "name": "CBD Paris", "type": "CBD Shop", "address": "Le Marais", "city": "Paris", "state": "Île-de-France", "country": "FR", "coordinates": {"lat": 48.8566, "lng": 2.3608}, "description": "CBD in fashionable Marais", "rating": 4.3, "is_dispensary": True},
    {"shop_id": "fr_par_2", "name": "Hemp Store Paris", "type": "CBD Shop", "address": "Bastille", "city": "Paris", "state": "Île-de-France", "country": "FR", "coordinates": {"lat": 48.8534, "lng": 2.3691}, "description": "Hemp products near Bastille", "rating": 4.2, "is_dispensary": True},
    {"shop_id": "fr_mar_1", "name": "CBD Marseille", "type": "CBD Shop", "address": "Vieux-Port", "city": "Marseille", "state": "Provence", "country": "FR", "coordinates": {"lat": 43.2951, "lng": 5.3695}, "description": "Mediterranean CBD shop", "rating": 4.1, "is_dispensary": True},
    
    # ==================== GREECE ====================
    {"shop_id": "gr_ath_1", "name": "Athens CBD", "type": "CBD Shop", "address": "Psyrri", "city": "Athens", "state": "Attica", "country": "GR", "coordinates": {"lat": 37.9785, "lng": 23.7242}, "description": "CBD near Acropolis", "rating": 4.2, "is_dispensary": True},
    
    # ==================== CROATIA ====================
    {"shop_id": "hr_zag_1", "name": "Zagreb Hemp", "type": "CBD Shop", "address": "Upper Town", "city": "Zagreb", "state": "Zagreb", "country": "HR", "coordinates": {"lat": 45.8150, "lng": 15.9819}, "description": "Croatian CBD products", "rating": 4.1, "is_dispensary": True},
    {"shop_id": "hr_spl_1", "name": "Split CBD", "type": "CBD Shop", "address": "Diocletian's Palace", "city": "Split", "state": "Dalmatia", "country": "HR", "coordinates": {"lat": 43.5081, "lng": 16.4402}, "description": "CBD by the Adriatic", "rating": 4.2, "is_dispensary": True},
    
    # ==================== POLAND ====================
    {"shop_id": "pl_war_1", "name": "Warsaw CBD", "type": "CBD Shop", "address": "Praga", "city": "Warsaw", "state": "Masovia", "country": "PL", "coordinates": {"lat": 52.2575, "lng": 21.0352}, "description": "CBD in Polish capital", "rating": 4.1, "is_dispensary": True},
    {"shop_id": "pl_kra_1", "name": "Krakow Hemp", "type": "CBD Shop", "address": "Kazimierz", "city": "Krakow", "state": "Lesser Poland", "country": "PL", "coordinates": {"lat": 50.0513, "lng": 19.9469}, "description": "CBD in historic Jewish quarter", "rating": 4.2, "is_dispensary": True},
]

async def add_european_shops():
    """Add European CBD/THC shops to database"""
    added = 0
    for shop in EUROPEAN_SHOPS:
        result = await db.dispensaries.update_one(
            {'shop_id': shop['shop_id']},
            {'$set': shop},
            upsert=True
        )
        if result.upserted_id or result.modified_count:
            added += 1
    
    print(f"Added/updated {added} European shops")
    
    # Print stats by country
    countries = ['PT', 'ES', 'NL', 'DE', 'IT', 'CZ', 'CH', 'AT', 'BE', 'FR', 'GR', 'HR', 'PL']
    print("\nShops by country:")
    for country in countries:
        count = await db.dispensaries.count_documents({'country': country})
        names = {'PT': 'Portugal', 'ES': 'Spain', 'NL': 'Netherlands', 'DE': 'Germany', 
                 'IT': 'Italy', 'CZ': 'Czech Republic', 'CH': 'Switzerland', 'AT': 'Austria',
                 'BE': 'Belgium', 'FR': 'France', 'GR': 'Greece', 'HR': 'Croatia', 'PL': 'Poland'}
        print(f"  {names.get(country, country)}: {count} shops")
    
    total = await db.dispensaries.count_documents({})
    print(f"\nTotal dispensaries/shops: {total}")

async def main():
    print("Adding European CBD/THC shops...")
    await add_european_shops()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
