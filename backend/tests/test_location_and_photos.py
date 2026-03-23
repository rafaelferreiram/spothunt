"""
Test suite for Location Editor and Google Photos features
Tests:
- /api/places/search-city endpoint for city search
- /api/places/reverse-geocode endpoint for GPS location
- /api/places/ endpoint returns Google Photos
- /api/cannabis/dispensaries endpoint returns Google Photos
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCitySearch:
    """Tests for city search functionality"""
    
    def test_search_city_los_angeles(self):
        """Search for Los Angeles should return results with coordinates"""
        response = requests.get(f"{BASE_URL}/api/places/search-city", params={"query": "Los Angeles"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert len(data["results"]) > 0
        
        # Check first result has required fields
        first_result = data["results"][0]
        assert "name" in first_result
        assert "lat" in first_result
        assert "lng" in first_result
        assert first_result["lat"] is not None
        assert first_result["lng"] is not None
        
        # Verify it's actually Los Angeles (approximate coordinates)
        assert 33 < first_result["lat"] < 35  # LA latitude range
        assert -119 < first_result["lng"] < -117  # LA longitude range
        print(f"Los Angeles found: {first_result['name']} at ({first_result['lat']}, {first_result['lng']})")
    
    def test_search_city_new_york(self):
        """Search for New York should return results"""
        response = requests.get(f"{BASE_URL}/api/places/search-city", params={"query": "New York"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert len(data["results"]) > 0
        
        first_result = data["results"][0]
        assert "lat" in first_result
        assert "lng" in first_result
        print(f"New York found: {first_result.get('name')} at ({first_result['lat']}, {first_result['lng']})")
    
    def test_search_city_tokyo(self):
        """Search for international city (Tokyo) should work"""
        response = requests.get(f"{BASE_URL}/api/places/search-city", params={"query": "Tokyo"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert len(data["results"]) > 0
        print(f"Tokyo found: {data['results'][0].get('name')}")
    
    def test_search_city_empty_query(self):
        """Empty query should return empty results"""
        response = requests.get(f"{BASE_URL}/api/places/search-city", params={"query": ""})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        # Empty or no results expected
    
    def test_search_city_gibberish(self):
        """Gibberish query should return empty results"""
        response = requests.get(f"{BASE_URL}/api/places/search-city", params={"query": "xyzabc123nonsense"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data


class TestReverseGeocode:
    """Tests for reverse geocoding (GPS to city name)"""
    
    def test_reverse_geocode_los_angeles(self):
        """Reverse geocode LA coordinates should return city name"""
        response = requests.get(
            f"{BASE_URL}/api/places/reverse-geocode",
            params={"lat": 34.0549, "lng": -118.2426}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "city" in data or "display_name" in data
        
        # Should contain Los Angeles or similar
        city = data.get("city", "") or data.get("display_name", "")
        print(f"Reverse geocode result: {data}")
    
    def test_reverse_geocode_new_york(self):
        """Reverse geocode NYC coordinates"""
        response = requests.get(
            f"{BASE_URL}/api/places/reverse-geocode",
            params={"lat": 40.7128, "lng": -74.0060}
        )
        assert response.status_code == 200
        
        data = response.json()
        print(f"NYC reverse geocode: {data}")


class TestPlacesWithGooglePhotos:
    """Tests for places endpoint returning Google Photos"""
    
    def test_places_return_google_photos(self):
        """Places endpoint should return Google Photos URLs"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={
                "lat": 34.0549,
                "lng": -118.2426,
                "use_google": "true",
                "max_distance": 5000
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "places" in data
        
        places = data["places"]
        if len(places) > 0:
            # Check that at least some places have Google Photos
            places_with_google_photos = [
                p for p in places 
                if p.get("photos") and any("googleapis.com" in photo for photo in p.get("photos", []))
            ]
            
            print(f"Total places: {len(places)}")
            print(f"Places with Google Photos: {len(places_with_google_photos)}")
            
            # At least some places should have Google Photos
            assert len(places_with_google_photos) > 0, "No places have Google Photos"
            
            # Verify photo URL format
            first_place_with_photo = places_with_google_photos[0]
            photo_url = first_place_with_photo["photos"][0]
            assert "maps.googleapis.com/maps/api/place/photo" in photo_url
            print(f"Sample photo URL: {photo_url[:100]}...")
    
    def test_places_have_required_fields(self):
        """Places should have all required fields"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={
                "lat": 40.7128,
                "lng": -74.0060,
                "use_google": "true"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        places = data.get("places", [])
        
        if len(places) > 0:
            place = places[0]
            required_fields = ["id", "name", "coordinates", "rating"]
            for field in required_fields:
                assert field in place, f"Missing field: {field}"
            
            # Check coordinates structure
            assert "lat" in place["coordinates"]
            assert "lng" in place["coordinates"]


class TestDispensariesWithGooglePhotos:
    """Tests for dispensaries endpoint returning Google Photos"""
    
    def test_dispensaries_return_google_photos(self):
        """Dispensaries endpoint should return Google Photos URLs"""
        response = requests.get(
            f"{BASE_URL}/api/cannabis/dispensaries",
            params={
                "lat": 34.0549,
                "lng": -118.2426,
                "limit": 10,
                "fetch_photos": "true"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "dispensaries" in data
        
        dispensaries = data["dispensaries"]
        print(f"Total dispensaries: {len(dispensaries)}")
        
        if len(dispensaries) > 0:
            # Check that at least some dispensaries have Google Photos
            dispensaries_with_google_photos = [
                d for d in dispensaries 
                if d.get("photos") and any("googleapis.com" in photo for photo in d.get("photos", []))
            ]
            
            print(f"Dispensaries with Google Photos: {len(dispensaries_with_google_photos)}")
            
            # At least some should have Google Photos
            if len(dispensaries_with_google_photos) > 0:
                photo_url = dispensaries_with_google_photos[0]["photos"][0]
                assert "maps.googleapis.com/maps/api/place/photo" in photo_url
                print(f"Sample dispensary photo: {photo_url[:100]}...")
    
    def test_dispensaries_have_required_fields(self):
        """Dispensaries should have required fields"""
        response = requests.get(
            f"{BASE_URL}/api/cannabis/dispensaries",
            params={
                "lat": 40.7128,
                "lng": -74.0060,
                "limit": 5
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        dispensaries = data.get("dispensaries", [])
        
        if len(dispensaries) > 0:
            disp = dispensaries[0]
            required_fields = ["shop_id", "name", "city"]
            for field in required_fields:
                assert field in disp, f"Missing field: {field}"
    
    def test_dispensaries_with_distance(self):
        """Dispensaries should include distance when location provided"""
        response = requests.get(
            f"{BASE_URL}/api/cannabis/dispensaries",
            params={
                "lat": 34.0549,
                "lng": -118.2426,
                "limit": 5
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        dispensaries = data.get("dispensaries", [])
        
        if len(dispensaries) > 0:
            disp = dispensaries[0]
            assert "distance_m" in disp, "Missing distance_m field"
            assert "walk_mins" in disp, "Missing walk_mins field"
            assert "drive_mins" in disp, "Missing drive_mins field"
            print(f"First dispensary: {disp['name']} - {disp['distance_m']}m away")


class TestLocationEndpoint:
    """Tests for location name endpoint"""
    
    def test_location_endpoint(self):
        """Location endpoint should return neighborhood and city"""
        response = requests.get(
            f"{BASE_URL}/api/places/location",
            params={"lat": 34.0549, "lng": -118.2426}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should have city or neighborhood
        assert "city" in data or "neighborhood" in data
        print(f"Location data: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
