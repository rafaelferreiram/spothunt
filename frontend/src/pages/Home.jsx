import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { API } from "@/App";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import FeedCard from "@/components/FeedCard";
import MapView from "@/components/MapView";
import { 
  Search, 
  MapPin, 
  Sparkles,
  UtensilsCrossed,
  Wine,
  Landmark,
  Mountain,
  Trees,
  Coffee,
  ShoppingBag,
  X,
  Map,
  LayoutGrid
} from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "For You", icon: Sparkles },
  { id: "restaurant", name: "Eat", icon: UtensilsCrossed },
  { id: "bar", name: "Drink", icon: Wine },
  { id: "museum", name: "Culture", icon: Landmark },
  { id: "attraction", name: "Views", icon: Mountain },
  { id: "outdoors", name: "Nature", icon: Trees },
  { id: "cafe", name: "Coffee", icon: Coffee },
  { id: "market", name: "Markets", icon: ShoppingBag },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("feed");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("Finding you...");
  const [locationLoading, setLocationLoading] = useState(true);

  // Get user's actual location
  useEffect(() => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          
          // Get location name from coordinates
          try {
            const res = await fetch(`${API}/places/location?lat=${loc.lat}&lng=${loc.lng}`);
            const data = await res.json();
            const name = data.neighborhood 
              ? `${data.neighborhood}, ${data.city}` 
              : data.city || "Your Location";
            setLocationName(name);
          } catch (e) {
            setLocationName("Your Location");
          }
          setLocationLoading(false);
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Default to NYC
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
          setLocationName("New York City");
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
      setLocationName("New York City");
      setLocationLoading(false);
    }
  }, []);

  const fetchPlaces = useCallback(async () => {
    if (!userLocation) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        lat: userLocation.lat.toString(), 
        lng: userLocation.lng.toString(),
        use_google: "true"
      });
      if (activeCategory !== "all") params.append("category", activeCategory);
      if (searchQuery) params.append("search", searchQuery);
      if (openNow) params.append("open_now", "true");

      const res = await fetch(`${API}/places/?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPlaces(data.places);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userLocation, activeCategory, searchQuery, openNow]);

  useEffect(() => { 
    if (userLocation) fetchPlaces(); 
  }, [fetchPlaces, userLocation]);

  useEffect(() => {
    const t = setTimeout(() => fetchPlaces(), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-28" data-testid="home-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <div className="px-4 pt-6 pb-4 space-y-4">
          {/* Location & View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{locationLoading ? "Finding you..." : locationName}</p>
                <p className="text-xs text-muted-foreground">
                  {locationLoading ? "Getting location" : "Nearby places"}
                </p>
              </div>
            </div>

            <div className="flex bg-muted/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode("feed")}
                className={`p-2 rounded-lg transition-all ${viewMode === "feed" ? "bg-background shadow-sm" : ""}`}
                data-testid="feed-view-btn"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg transition-all ${viewMode === "map" ? "bg-background shadow-sm" : ""}`}
                data-testid="map-view-btn"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-muted/50 border-0 text-sm"
              data-testid="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <ScrollArea className="w-full border-t border-border/30">
          <div className="flex gap-2 px-4 py-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all
                    ${isActive ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground"}
                  `}
                  data-testid={`category-${cat.id}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        {/* Filters */}
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={() => setOpenNow(!openNow)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${openNow ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}
            `}
            data-testid="open-now-filter"
          >
            Open Now {openNow && "×"}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-2">
        {viewMode === "feed" ? (
          <div className="space-y-3">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-56 rounded-2xl bg-muted/30 animate-pulse" />)
            ) : places.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-4">🗺️</p>
                <p>No places found</p>
              </div>
            ) : (
              places.map((place, i) => (
                <FeedCard
                  key={place.id}
                  place={place}
                  onClick={() => navigate(`/place/${place.id}`)}
                  savedPlaces={user?.saved_places || []}
                  className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                />
              ))
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-260px)] rounded-2xl overflow-hidden">
            <MapView places={places} userLocation={userLocation} onPlaceClick={(id) => navigate(`/place/${id}`)} />
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
