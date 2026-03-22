# Auth Testing Playbook for CityBlend

## Step 1: Create Test User & Session

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  taste_profile: {
    vibes: ['hidden_gem', 'foodie', 'rooftop'],
    cuisines: ['japanese', 'italian', 'brunch'],
    dietary: [],
    drink_style: 'craft_cocktails',
    bar_vibes: ['speakeasy', 'rooftop_bar'],
    activities: ['museums', 'live_music'],
    travel_style: 'explorer'
  },
  onboarding_completed: true,
  saved_places: [],
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API

```bash
# Test auth endpoint
curl -X GET "https://taste-map-10.preview.emergentagent.com/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test places endpoint
curl -X GET "https://taste-map-10.preview.emergentagent.com/api/places/?lat=40.7128&lng=-74.006"

# Test save place
curl -X POST "https://taste-map-10.preview.emergentagent.com/api/user/save-place" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"place_id": "nyc_1"}'
```

## Step 3: Browser Testing

```javascript
// Set cookie and navigate
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "taste-map-10.preview.emergentagent.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto("https://taste-map-10.preview.emergentagent.com/home");
```

## Checklist
- [ ] User document has user_id field
- [ ] Session user_id matches user's user_id exactly
- [ ] All queries use `{"_id": 0}` projection
- [ ] API returns user data (not 401/404)
- [ ] Dashboard loads without redirect

## Success Indicators
✅ /api/auth/me returns user data
✅ Dashboard loads without redirect
✅ CRUD operations work

## Failure Indicators
❌ "User not found" errors
❌ 401 Unauthorized responses
❌ Redirect to login page
