import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, API } from "@/App";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import FeedCard from "@/components/FeedCard";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Plane,
  X,
  Sparkles,
  UtensilsCrossed,
  Beer,
  Coffee,
  Landmark,
  Mountain,
  Clock,
  Navigation,
  Globe
} from "lucide-react";

// Popular cities for quick selection
const POPULAR_CITIES = [
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060, emoji: "🗽" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, emoji: "🗼" },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, emoji: "🎡" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, emoji: "🗾" },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734, emoji: "🌊" },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, emoji: "🌷" },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, emoji: "🏛️" },
  { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, emoji: "🐻" },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393, emoji: "🚃" },
  { name: "Miami", country: "USA", lat: 25.7617, lng: -80.1918, emoji: "🌴" },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437, emoji: "🎬" },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, emoji: "🏙️" },
];

const CATEGORIES = [
  { id: "all", name: "All", icon: Sparkles },
  { id: "restaurant", name: "Food", icon: UtensilsCrossed },
  { id: "bar", name: "Drinks", icon: Beer },
  { id: "cafe", name: "Coffee", icon: Coffee },
  { id: "museum", name: "Culture", icon: Landmark },
  { id: "outdoors", name: "Nature", icon: Mountain },
];

const VisitingPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Check URL params for pre-selected city
  useEffect(() => {
    const cityName = searchParams.get("city");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    
    if (cityName && lat && lng) {
      setSelectedCity({
        name: cityName,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
    }
  }, [searchParams]);

  // Search for cities using Google Geocoding
  const searchCities = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `${API}/places/search-city?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error("City search error:", e);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => searchCities(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCities]);

  // Fetch places when city is selected
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!selectedCity) return;
      
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lat: selectedCity.lat.toString(),
          lng: selectedCity.lng.toString(),
          use_google: "true",
          max_distance: "10000",
        });
        
        if (activeCategory !== "all") {
          params.append("category", activeCategory);
        }

        const res = await fetch(`${API}/places/?${params}`, { credentials: "include" });
        const data = await res.json();
        setPlaces(data.places || []);
      } catch (e) {
        console.error("Places error:", e);
        toast.error("Failed to load places");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [selectedCity, activeCategory]);

  const selectCity = (city) => {
    setSelectedCity(city);
    setSearchQuery("");
    setSearchResults([]);
    setSearchParams({ city: city.name, lat: city.lat, lng: city.lng });
  };

  const clearCity = () => {
    setSelectedCity(null);
    setPlaces([]);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="visiting-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-4 pt-4 pb-3 space-y-3">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">I'm Visiting</h1>
                <p className="text-xs text-muted-foreground">
                  {selectedCity ? selectedCity.name : "Preview any city"}
                </p>
              </div>
            </div>
            {selectedCity && (
              <Button variant="ghost" size="sm" onClick={clearCity} className="rounded-full">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Search */}
          {!selectedCity && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search any city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-full bg-muted/40 border-0 text-sm"
                data-testid="city-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          )}

          {/* Category filters when city selected */}
          {selectedCity && (
            <ScrollArea className="w-full -mx-4 px-4">
              <div className="flex gap-1.5 pb-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`
                        flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                        ${isActive 
                          ? "bg-foreground text-background" 
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          )}
        </div>
      </header>

      <main className="px-4 pt-4">
        {/* Search Results */}
        {!selectedCity && searchQuery && searchResults.length > 0 && (
          <div className="space-y-2 mb-6">
            <p className="text-xs text-muted-foreground px-1">Search results</p>
            {searchResults.map((city, i) => (
              <button
                key={i}
                onClick={() => selectCity(city)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{city.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{city.country}</p>
                </div>
                <Navigation className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* Popular Cities */}
        {!selectedCity && !searchQuery && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Popular Destinations</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => selectCity(city)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-card hover:bg-muted/50 transition-colors text-left"
                  data-testid={`city-${city.name.toLowerCase().replace(" ", "-")}`}
                >
                  <span className="text-2xl">{city.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{city.name}</p>
                    <p className="text-xs text-muted-foreground">{city.country}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Places in selected city */}
        {selectedCity && (
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-64 rounded-3xl bg-muted/30 animate-pulse" />
              ))
            ) : places.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No places found</p>
                <p className="text-sm text-muted-foreground/70">Try a different category</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {places.length} places in {selectedCity.name}
                </p>
                {places.map((place) => (
                  <FeedCard
                    key={place.id}
                    place={place}
                    onClick={() => navigate(`/place/${place.id}`)}
                    savedPlaces={user?.saved_places || []}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default VisitingPage;
