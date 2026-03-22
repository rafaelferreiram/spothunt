import requests
import sys
import json
from datetime import datetime

class CityBlendAPITester:
    def __init__(self, base_url="https://taste-map-10.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            return {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_health_endpoint(self):
        """Test health endpoint"""
        return self.run_test("Health Endpoint", "GET", "health", 200)

    def test_places_list(self):
        """Test places list endpoint"""
        response = self.run_test(
            "Places List", 
            "GET", 
            "places/?lat=40.7128&lng=-74.0060", 
            200
        )
        
        if response and 'places' in response:
            places_count = len(response['places'])
            self.log_test(f"Places Count Check (Expected 15)", places_count == 15, f"Found {places_count} places")
            
            # Check first place structure
            if places_count > 0:
                place = response['places'][0]
                required_fields = ['id', 'name', 'category', 'coordinates', 'rating']
                missing_fields = [field for field in required_fields if field not in place]
                
                if not missing_fields:
                    self.log_test("Place Structure Check", True, "All required fields present")
                else:
                    self.log_test("Place Structure Check", False, f"Missing fields: {missing_fields}")
        
        return response

    def test_place_detail(self, place_id="nyc_1"):
        """Test single place detail endpoint"""
        return self.run_test(
            f"Place Detail ({place_id})", 
            "GET", 
            f"places/{place_id}?lat=40.7128&lng=-74.0060", 
            200
        )

    def test_categories_list(self):
        """Test categories list endpoint"""
        response = self.run_test("Categories List", "GET", "places/categories/list", 200)
        
        if response and 'categories' in response:
            categories_count = len(response['categories'])
            self.log_test(f"Categories Count Check", categories_count >= 8, f"Found {categories_count} categories")
        
        return response

    def test_auth_me_without_token(self):
        """Test auth/me endpoint without token (should fail)"""
        return self.run_test("Auth Me (No Token)", "GET", "auth/me", 401)

    def create_test_user_session(self):
        """Create a test user and session in MongoDB for testing authenticated routes"""
        print("\n🔧 Creating test user session...")
        
        # This would normally be done via MongoDB, but for testing we'll simulate
        # For now, we'll skip authenticated tests and note this limitation
        self.log_test("Test User Creation", False, "MongoDB access needed for auth testing")
        return False

    def test_authenticated_routes(self):
        """Test routes that require authentication"""
        if not self.session_token:
            print("\n⚠️  Skipping authenticated route tests - no session token")
            self.log_test("Auth Routes Setup", False, "No session token available")
            return

        # Test auth/me with token
        self.run_test("Auth Me (With Token)", "GET", "auth/me", 200)
        
        # Test save place
        self.run_test(
            "Save Place", 
            "POST", 
            "user/save-place", 
            200, 
            {"place_id": "nyc_1"}
        )
        
        # Test get saved places
        self.run_test("Get Saved Places", "GET", "user/saved-places", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting CityBlend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)

        # Test public endpoints
        self.test_root_endpoint()
        self.test_health_endpoint()
        self.test_places_list()
        self.test_place_detail()
        self.test_categories_list()
        self.test_auth_me_without_token()

        # Try to create test user for authenticated tests
        if self.create_test_user_session():
            self.test_authenticated_routes()

        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed")
            return 1

def main():
    tester = CityBlendAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())