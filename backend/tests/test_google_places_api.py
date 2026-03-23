"""
Backend API Tests for CityBlend - Google Places API Integration
Tests Google Places API, Distance Matrix API, Geocoding API, Cannabis, and Reviews endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Basic health check tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "CityBlend API"
        print("PASS: API root endpoint working")
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("PASS: Health endpoint working")


class TestGooglePlacesAPI:
    """Tests for Google Places API integration"""
    
    def test_places_endpoint_returns_google_source(self):
        """Test /api/places returns places from Google API with source='google'"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": 40.7128, "lng": -74.0060, "use_google": "true"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify source is google
        assert data.get("source") == "google", f"Expected source='google', got '{data.get('source')}'"
        assert "places" in data
        assert len(data["places"]) > 0, "Expected at least one place"
        print(f"PASS: Places endpoint returns {len(data['places'])} places from Google API")
    
    def test_places_have_google_place_ids(self):
        """Test that places have Google place IDs"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": 40.7128, "lng": -74.0060, "use_google": "true"}
        )
        assert response.status_code == 200
        data = response.json()
        
        places = data.get("places", [])
        assert len(places) > 0
        
        # Check first place has google_place_id
        first_place = places[0]
        assert first_place.get("id", "").startswith("google_"), f"Place ID should start with 'google_', got '{first_place.get('id')}'"
        assert "google_place_id" in first_place, "Place should have google_place_id field"
        print(f"PASS: Places have Google place IDs (e.g., {first_place.get('id')})")
    
    def test_places_have_travel_times_from_distance_matrix(self):
        """Test that places have actual travel times from Google Distance Matrix API"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={
                "lat": 40.7128, 
                "lng": -74.0060, 
                "use_google": "true",
                "include_travel_times": "true"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        places = data.get("places", [])
        assert len(places) > 0
        
        first_place = places[0]
        
        # Check travel time fields exist
        assert "walk_mins" in first_place, "Place should have walk_mins"
        assert "drive_mins" in first_place, "Place should have drive_mins"
        
        # Check for text fields from Distance Matrix API (indicates real API data)
        assert "walk_text" in first_place, "Place should have walk_text from Distance Matrix API"
        assert "drive_text" in first_place, "Place should have drive_text from Distance Matrix API"
        
        # Verify values are reasonable
        assert first_place["walk_mins"] > 0, "walk_mins should be positive"
        assert first_place["drive_mins"] > 0, "drive_mins should be positive"
        assert isinstance(first_place["walk_text"], str), "walk_text should be a string"
        assert isinstance(first_place["drive_text"], str), "drive_text should be a string"
        
        print(f"PASS: Places have travel times - walk: {first_place['walk_mins']}min ({first_place['walk_text']}), drive: {first_place['drive_mins']}min ({first_place['drive_text']})")
    
    def test_places_have_required_fields(self):
        """Test that places have all required fields"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": 40.7128, "lng": -74.0060, "use_google": "true"}
        )
        assert response.status_code == 200
        data = response.json()
        
        places = data.get("places", [])
        assert len(places) > 0
        
        required_fields = [
            "id", "name", "category", "address", "coordinates", 
            "rating", "distance_m", "walk_mins", "drive_mins",
            "maps_deep_link", "uber_deep_link"
        ]
        
        first_place = places[0]
        for field in required_fields:
            assert field in first_place, f"Place missing required field: {field}"
        
        # Verify coordinates structure
        assert "lat" in first_place["coordinates"]
        assert "lng" in first_place["coordinates"]
        
        print(f"PASS: Places have all required fields")
    
    def test_places_category_filter(self):
        """Test category filtering works"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={
                "lat": 40.7128, 
                "lng": -74.0060, 
                "use_google": "true",
                "category": "restaurant"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should return places (may be empty if no restaurants nearby)
        assert "places" in data
        print(f"PASS: Category filter works, returned {len(data['places'])} restaurants")


class TestGeocodingAPI:
    """Tests for Google Geocoding API integration"""
    
    def test_location_endpoint(self):
        """Test /api/places/location returns location data"""
        response = requests.get(
            f"{BASE_URL}/api/places/location",
            params={"lat": 40.7128, "lng": -74.0060}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should have city field
        assert "city" in data, "Response should have city field"
        assert "neighborhood" in data, "Response should have neighborhood field"
        
        print(f"PASS: Location endpoint returns city='{data.get('city')}', neighborhood='{data.get('neighborhood')}'")


class TestCannabisAPI:
    """Tests for Cannabis/Greens endpoints"""
    
    def test_strains_endpoint(self):
        """Test /api/cannabis/strains returns strain data"""
        response = requests.get(
            f"{BASE_URL}/api/cannabis/strains",
            params={"limit": 5}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "strains" in data
        assert "total" in data
        assert len(data["strains"]) > 0, "Should return at least one strain"
        
        # Check strain structure
        strain = data["strains"][0]
        assert "name" in strain
        assert "type" in strain
        
        print(f"PASS: Strains endpoint returns {len(data['strains'])} strains, total: {data['total']}")
    
    def test_dispensaries_endpoint(self):
        """Test /api/cannabis/dispensaries returns dispensary data"""
        response = requests.get(
            f"{BASE_URL}/api/cannabis/dispensaries",
            params={"limit": 5}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "dispensaries" in data
        assert "total" in data
        assert len(data["dispensaries"]) > 0, "Should return at least one dispensary"
        
        # Check dispensary structure
        disp = data["dispensaries"][0]
        assert "name" in disp
        assert "city" in disp
        
        print(f"PASS: Dispensaries endpoint returns {len(data['dispensaries'])} dispensaries, total: {data['total']}")
    
    def test_cannabis_stats(self):
        """Test /api/cannabis/stats returns statistics"""
        response = requests.get(f"{BASE_URL}/api/cannabis/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_strains" in data
        assert "total_dispensaries" in data
        assert data["total_strains"] > 0
        assert data["total_dispensaries"] > 0
        
        print(f"PASS: Cannabis stats - {data['total_strains']} strains, {data['total_dispensaries']} dispensaries")


class TestReviewsAPI:
    """Tests for Reviews endpoints"""
    
    def test_get_place_reviews(self):
        """Test /api/reviews/place/{place_id} returns reviews"""
        # Use a Google place ID
        place_id = "google_ChIJTXb6QRdawokRPZZKPYmvWcU"
        response = requests.get(f"{BASE_URL}/api/reviews/place/{place_id}")
        assert response.status_code == 200
        data = response.json()
        
        assert "reviews" in data
        assert "total" in data
        assert "avg_rating" in data
        assert "review_count" in data
        
        print(f"PASS: Reviews endpoint returns {data['total']} reviews for place")
    
    def test_create_review_requires_auth(self):
        """Test creating review requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/reviews/",
            json={
                "place_id": "test_place",
                "place_type": "place",
                "rating": 5,
                "text": "Test review"
            }
        )
        # Should return 401 without auth
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Create review requires authentication (401)")


class TestCategoriesAPI:
    """Tests for Categories endpoint"""
    
    def test_categories_list(self):
        """Test /api/places/categories/list returns categories"""
        response = requests.get(f"{BASE_URL}/api/places/categories/list")
        assert response.status_code == 200
        data = response.json()
        
        assert "categories" in data
        assert len(data["categories"]) > 0
        
        # Check category structure
        cat = data["categories"][0]
        assert "id" in cat
        assert "name" in cat
        assert "icon" in cat
        
        print(f"PASS: Categories endpoint returns {len(data['categories'])} categories")


class TestNearbyPlacesAPI:
    """Tests for /api/places/nearby endpoint"""
    
    def test_nearby_places_endpoint(self):
        """Test /api/places/nearby returns places from Google"""
        response = requests.get(
            f"{BASE_URL}/api/places/nearby",
            params={
                "lat": 40.7128, 
                "lng": -74.0060,
                "category": "all",
                "radius": 2000
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "places" in data
        assert "total" in data
        
        print(f"PASS: Nearby places endpoint returns {data['total']} places")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
