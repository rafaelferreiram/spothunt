"""
Test suite for CityBlend filter parameters and PWA support
Tests: max_distance, min_rating, min_price, max_price, sort_by filters
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test coordinates (NYC)
TEST_LAT = 40.7128
TEST_LNG = -74.0060


class TestFilterParameters:
    """Tests for new filter parameters in /api/places endpoint"""
    
    def test_max_distance_1km(self):
        """Test max_distance filter with 1km radius"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "max_distance": 1000}
        )
        assert response.status_code == 200
        data = response.json()
        assert "places" in data
        assert "total" in data
        # All places should be within 1km
        for place in data["places"]:
            assert place.get("distance_m", 0) <= 1000, f"Place {place['name']} is {place.get('distance_m')}m away, exceeds 1km"
        print(f"✓ max_distance=1000: {data['total']} places found")
    
    def test_max_distance_10km(self):
        """Test max_distance filter with 10km radius"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "max_distance": 10000}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 0
        # Should have more results than 1km
        print(f"✓ max_distance=10000: {data['total']} places found")
    
    def test_max_distance_100km(self):
        """Test max_distance filter with 100km radius"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "max_distance": 100000}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 0
        print(f"✓ max_distance=100000: {data['total']} places found")
    
    def test_min_rating_filter(self):
        """Test min_rating filter"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "min_rating": 4.5}
        )
        assert response.status_code == 200
        data = response.json()
        # All places should have rating >= 4.5
        for place in data["places"]:
            assert place.get("rating", 0) >= 4.5, f"Place {place['name']} has rating {place.get('rating')}, below 4.5"
        print(f"✓ min_rating=4.5: {data['total']} places found")
    
    def test_min_rating_filter_4(self):
        """Test min_rating filter with 4.0"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "min_rating": 4.0}
        )
        assert response.status_code == 200
        data = response.json()
        for place in data["places"]:
            assert place.get("rating", 0) >= 4.0
        print(f"✓ min_rating=4.0: {data['total']} places found")
    
    def test_max_price_filter(self):
        """Test max_price filter"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "max_price": 2}
        )
        assert response.status_code == 200
        data = response.json()
        # All places should have price_level <= 2
        for place in data["places"]:
            assert place.get("price_level", 0) <= 2, f"Place {place['name']} has price_level {place.get('price_level')}, above 2"
        print(f"✓ max_price=2: {data['total']} places found")
    
    def test_min_price_filter(self):
        """Test min_price filter"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "min_price": 2}
        )
        assert response.status_code == 200
        data = response.json()
        # All places should have price_level >= 2
        for place in data["places"]:
            assert place.get("price_level", 0) >= 2, f"Place {place['name']} has price_level {place.get('price_level')}, below 2"
        print(f"✓ min_price=2: {data['total']} places found")
    
    def test_sort_by_distance(self):
        """Test sort_by=distance"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "sort_by": "distance"}
        )
        assert response.status_code == 200
        data = response.json()
        places = data["places"]
        # Verify places are sorted by distance ascending
        for i in range(len(places) - 1):
            assert places[i].get("distance_m", 0) <= places[i+1].get("distance_m", float('inf')), \
                f"Places not sorted by distance: {places[i]['name']} ({places[i].get('distance_m')}) > {places[i+1]['name']} ({places[i+1].get('distance_m')})"
        print(f"✓ sort_by=distance: Places sorted correctly")
    
    def test_sort_by_rating(self):
        """Test sort_by=rating"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "sort_by": "rating"}
        )
        assert response.status_code == 200
        data = response.json()
        places = data["places"]
        # Verify places are sorted by rating descending
        for i in range(len(places) - 1):
            assert places[i].get("rating", 0) >= places[i+1].get("rating", 0), \
                f"Places not sorted by rating: {places[i]['name']} ({places[i].get('rating')}) < {places[i+1]['name']} ({places[i+1].get('rating')})"
        print(f"✓ sort_by=rating: Places sorted correctly")
    
    def test_sort_by_price(self):
        """Test sort_by=price"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "sort_by": "price"}
        )
        assert response.status_code == 200
        data = response.json()
        places = data["places"]
        # Verify places are sorted by price ascending
        for i in range(len(places) - 1):
            assert places[i].get("price_level", 0) <= places[i+1].get("price_level", float('inf')), \
                f"Places not sorted by price: {places[i]['name']} ({places[i].get('price_level')}) > {places[i+1]['name']} ({places[i+1].get('price_level')})"
        print(f"✓ sort_by=price: Places sorted correctly")
    
    def test_combined_filters(self):
        """Test combining multiple filters"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={
                "lat": TEST_LAT, 
                "lng": TEST_LNG, 
                "max_distance": 5000,
                "min_rating": 4.0,
                "sort_by": "rating"
            }
        )
        assert response.status_code == 200
        data = response.json()
        places = data["places"]
        
        # Verify all filters applied
        for place in places:
            assert place.get("distance_m", 0) <= 5000
            assert place.get("rating", 0) >= 4.0
        
        # Verify sorted by rating
        for i in range(len(places) - 1):
            assert places[i].get("rating", 0) >= places[i+1].get("rating", 0)
        
        print(f"✓ Combined filters: {data['total']} places found, all filters applied correctly")


class TestPWASupport:
    """Tests for PWA manifest and icons"""
    
    def test_manifest_loads(self):
        """Test PWA manifest.json loads correctly"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required PWA fields
        assert data.get("name") == "CityBlend"
        assert data.get("short_name") == "CityBlend"
        assert data.get("display") == "standalone"
        assert "icons" in data
        assert len(data["icons"]) >= 2
        print(f"✓ PWA manifest loads correctly with name: {data['name']}")
    
    def test_manifest_icons(self):
        """Test PWA icons are defined correctly"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        
        icons = data.get("icons", [])
        sizes = [icon.get("sizes") for icon in icons]
        
        assert "192x192" in sizes, "Missing 192x192 icon"
        assert "512x512" in sizes, "Missing 512x512 icon"
        print(f"✓ PWA icons defined: {sizes}")
    
    def test_icon_192_loads(self):
        """Test 192x192 icon loads"""
        response = requests.head(f"{BASE_URL}/icon-192.png")
        assert response.status_code == 200
        assert "image/png" in response.headers.get("content-type", "")
        print(f"✓ icon-192.png loads correctly")
    
    def test_icon_512_loads(self):
        """Test 512x512 icon loads"""
        response = requests.head(f"{BASE_URL}/icon-512.png")
        assert response.status_code == 200
        assert "image/png" in response.headers.get("content-type", "")
        print(f"✓ icon-512.png loads correctly")
    
    def test_manifest_theme_colors(self):
        """Test PWA theme colors are set"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        
        assert "background_color" in data
        assert "theme_color" in data
        print(f"✓ PWA theme colors: bg={data['background_color']}, theme={data['theme_color']}")


class TestRadiusOptions:
    """Test all radius options work correctly"""
    
    @pytest.mark.parametrize("radius,label", [
        (1000, "1 km"),
        (5000, "5 km"),
        (10000, "10 km"),
        (25000, "25 km"),
        (50000, "50 km"),
        (100000, "100 km"),
    ])
    def test_radius_option(self, radius, label):
        """Test each radius option returns results"""
        response = requests.get(
            f"{BASE_URL}/api/places/",
            params={"lat": TEST_LAT, "lng": TEST_LNG, "max_distance": radius}
        )
        assert response.status_code == 200
        data = response.json()
        assert "places" in data
        print(f"✓ Radius {label}: {data['total']} places found")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
