import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import FeedCard from "@/components/FeedCard";
import MapView from "@/components/MapView";
import { 
  Search, 
  MapPin, 
  SlidersHorizontal,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Landmark,
  Mountain,
  Trees,
  Coffee,
  ShoppingBag,
  X
} from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "For You", icon: Sparkles },
  { id: "restaurant", name: "Eat", icon: UtensilsCrossed },
  { id: "bar", name: "Drink", icon: Wine },
  { id: "museum", name: "Explore", icon: Landmark },
  { id: "attraction", name: "Views", icon: Mountain },
  { id: "outdoors", name: "Outside", icon: Trees },
  { id: "cafe", name: "Coffee", icon: Coffee },
  { id: "market", name: "Markets", icon: ShoppingBag },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("feed"); // 'feed' or 'map'
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // NYC default
  const [locationName, setLocationName] = useState("New York City");

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // For demo, we'll keep NYC as the name
          // In production, you'd reverse geocode
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Keep default NYC location
        }
      );
    }
  }, []);

  // Fetch places
  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
      });

      if (activeCategory !== "all") {
        params.append("category", activeCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (openNow) {
        params.append("open_now", "true");
      }

      const response = await fetch(`${API}/places/?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch places");

      const data = await response.json();
      setPlaces(data.places);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, activeCategory, searchQuery, openNow]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPlaces();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handlePlaceClick = (placeId) => {
    navigate(`/place/${placeId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="home-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 space-y-3">
          {/* Location & View Toggle */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-left" data-testid="location-selector">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{locationName}</p>
                <p className="text-xs text-muted-foreground">Exploring nearby</p>
              </div>
            </button>

            {/* View Toggle */}
            <div className="flex bg-muted rounded-full p-1">
              <button
                onClick={() => setViewMode("feed")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === "feed"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                data-testid="feed-view-btn"
              >
                Feed
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                data-testid="map-view-btn"
              >
                Map
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search places, vibes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-full bg-muted border-0 focus-visible:ring-2 focus-visible:ring-accent"
              data-testid="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 pb-3">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${isActive 
                      ? "bg-accent text-accent-foreground shadow-sm" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                  data-testid={`category-${category.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        {/* Active Filters */}
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={() => setOpenNow(!openNow)}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${openNow 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground"
              }
            `}
            data-testid="open-now-filter"
          >
            Open Now
            {openNow && <X className="w-3 h-3 ml-1" />}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {viewMode === "feed" ? (
          <div className="space-y-4">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-muted animate-pulse"
                />
              ))
            ) : places.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No places found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              places.map((place, index) => (
                <FeedCard
                  key={place.id}
                  place={place}
                  onClick={() => handlePlaceClick(place.id)}
                  savedPlaces={user?.saved_places || []}
                  className={`animate-fade-in stagger-${Math.min(index + 1, 5)}`}
                />
              ))
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-280px)] rounded-3xl overflow-hidden">
            <MapView
              places={places}
              userLocation={userLocation}
              onPlaceClick={handlePlaceClick}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;
