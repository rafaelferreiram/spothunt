import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useAppLocation } from "@/App";
import { API } from "@/App";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import BottomNav from "@/components/BottomNav";
import FeedCard from "@/components/FeedCard";
import MapView from "@/components/MapView";
import LocationEditor from "@/components/LocationEditor";
import { 
  Search, 
  MapPin, 
  Sparkles,
  UtensilsCrossed,
  Beer,
  Landmark,
  Mountain,
  Trees,
  Coffee,
  ShoppingBag,
  X,
  Map,
  LayoutGrid,
  SlidersHorizontal,
  Star,
  DollarSign,
  Clock,
  ArrowUpDown,
  RotateCcw,
  Heart,
  User,
  Navigation,
  Leaf
} from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "For You", icon: Sparkles },
  { id: "restaurant", name: "Eat", icon: UtensilsCrossed },
  { id: "bar", name: "Drink", icon: Beer },
  { id: "smoke", name: "Smoke", icon: Leaf },
  { id: "museum", name: "Culture", icon: Landmark },
  { id: "attraction", name: "Views", icon: Mountain },
  { id: "outdoors", name: "Nature", icon: Trees },
  { id: "cafe", name: "Coffee", icon: Coffee },
  { id: "market", name: "Markets", icon: ShoppingBag },
];

// Subcategories for food types
const FOOD_TYPES = [
  { id: "all", name: "All" },
  { id: "italian", name: "Italian" },
  { id: "pizza", name: "Pizza" },
  { id: "burger", name: "Burger" },
  { id: "sushi", name: "Sushi" },
  { id: "mexican", name: "Mexican" },
  { id: "bbq", name: "BBQ" },
  { id: "asian", name: "Asian" },
  { id: "seafood", name: "Seafood" },
  { id: "steakhouse", name: "Steakhouse" },
  { id: "vegan", name: "Vegan" },
];

// Subcategories for bar types
const BAR_TYPES = [
  { id: "all", name: "All" },
  { id: "pub", name: "Pub" },
  { id: "rooftop", name: "Rooftop" },
  { id: "dive_bar", name: "Boteco" },
  { id: "wine_bar", name: "Wine Bar" },
  { id: "cocktail", name: "Cocktail" },
  { id: "sports_bar", name: "Sports Bar" },
  { id: "beer_garden", name: "Beer Garden" },
  { id: "lounge", name: "Lounge" },
];

// Subcategories for smoke/cannabis types
const SMOKE_TYPES = [
  { id: "all", name: "All" },
  { id: "dispensary", name: "Dispensary" },
  { id: "cannabis", name: "Cannabis Shop" },
  { id: "cbd", name: "CBD Store" },
  { id: "hemp", name: "Hemp Shop" },
  { id: "coffeeshop", name: "Coffeeshop" },
  { id: "headshop", name: "Head Shop" },
];

const RADIUS_OPTIONS = [
  { value: 1000, label: "1 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
  { value: 25000, label: "25 km" },
  { value: 50000, label: "50 km" },
  { value: 100000, label: "100 km" },
];

const RATING_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 3, label: "3+" },
  { value: 3.5, label: "3.5+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance", icon: Sparkles },
  { value: "distance", label: "Distance", icon: MapPin },
  { value: "rating", label: "Rating", icon: Star },
  { value: "price", label: "Price", icon: DollarSign },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    userLocation, 
    locationName, 
    isCustomLocation, 
    locationLoading, 
    handleLocationChange 
  } = useAppLocation();
  
  const [viewMode, setViewMode] = useState("feed");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    radius: 5000,
    openNow: false,
    minRating: 0,
    priceRange: [0, 4],
    sortBy: "relevance",
  });

  // Temp filters for drawer (apply on confirm)
  const [tempFilters, setTempFilters] = useState(filters);

  const activeFilterCount = [
    filters.radius !== 5000,
    filters.openNow,
    filters.minRating > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 4,
    filters.sortBy !== "relevance",
  ].filter(Boolean).length;

  const fetchPlaces = useCallback(async () => {
    if (!userLocation) return;
    
    // Handle "smoke" category - fetch from cannabis API
    if (activeCategory === "smoke") {
      setLoading(true);
      try {
        // Use larger radius for cannabis (100km) since dispensaries are less dense
        const smokeRadius = Math.max(filters.radius, 100000);
        const params = new URLSearchParams({ 
          lat: userLocation.lat.toString(), 
          lng: userLocation.lng.toString(),
          max_distance: smokeRadius.toString(),
          limit: "30",
        });
        
        if (activeSubcategory !== "all") {
          params.append("search", activeSubcategory);
        }
        if (searchQuery) params.append("search", searchQuery);
        
        console.log("Fetching smoke/dispensaries with params:", params.toString());

        const res = await fetch(`${API}/cannabis/dispensaries?${params}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        
        console.log("Smoke response:", data.total, "dispensaries found");
        
        // Transform dispensary data to place format
        const transformedPlaces = (data.dispensaries || []).map(d => ({
          id: d.shop_id,
          name: d.name,
          category: "smoke",
          subcategories: [d.type || "Dispensary"],
          vibe_tags: ["Cannabis", d.country],
          address: d.address,
          neighborhood: d.city,
          city: d.city,
          coordinates: d.coordinates,
          rating: d.rating || 4.5,
          review_count: d.review_count || 0,
          is_open: true,
          photos: d.photos || [],
          distance_m: d.distance_m,
          walk_mins: d.walk_mins,
          drive_mins: d.drive_mins,
          maps_deep_link: d.maps_deep_link,
          isDispensary: true,
        }));
        
        setPlaces(transformedPlaces);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Regular places fetch
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        lat: userLocation.lat.toString(), 
        lng: userLocation.lng.toString(),
        use_google: "true",
        max_distance: filters.radius.toString(),
      });
      
      if (activeCategory !== "all") params.append("category", activeCategory);
      if (activeSubcategory !== "all") params.append("subcategory", activeSubcategory);
      if (searchQuery) params.append("search", searchQuery);
      if (filters.openNow) params.append("open_now", "true");
      if (filters.minRating > 0) params.append("min_rating", filters.minRating.toString());
      if (filters.priceRange[0] > 0) params.append("min_price", filters.priceRange[0].toString());
      if (filters.priceRange[1] < 4) params.append("max_price", filters.priceRange[1].toString());
      if (filters.sortBy !== "relevance") params.append("sort_by", filters.sortBy);

      const res = await fetch(`${API}/places/?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPlaces(data.places);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userLocation, activeCategory, activeSubcategory, searchQuery, filters]);

  useEffect(() => { 
    if (userLocation) fetchPlaces(); 
  }, [fetchPlaces, userLocation]);

  useEffect(() => {
    const t = setTimeout(() => fetchPlaces(), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const applyFilters = () => {
    setFilters(tempFilters);
    setDrawerOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      radius: 5000,
      openNow: false,
      minRating: 0,
      priceRange: [0, 4],
      sortBy: "relevance",
    };
    setTempFilters(defaultFilters);
  };

  const openDrawer = () => {
    setTempFilters(filters);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-28 sm:pb-24" data-testid="home-page">
      {/* Header with safe area for notch/Dynamic Island */}
      <header 
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 pwa-safe-header"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="px-4 pb-3 space-y-3">
          {/* Top Row: Location & View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isCustomLocation 
                  ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5" 
                  : "bg-gradient-to-br from-primary/20 to-primary/5"
              }`}>
                {isCustomLocation ? (
                  <Navigation className="w-4 h-4 text-amber-500" />
                ) : (
                  <MapPin className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <LocationEditor
                  currentLocation={userLocation}
                  locationName={locationLoading ? "Finding you..." : locationName}
                  onLocationChange={handleLocationChange}
                  className="w-full"
                />
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isCustomLocation && <span className="text-amber-500 font-medium mr-1">Visiting</span>}
                  {RADIUS_OPTIONS.find(r => r.value === filters.radius)?.label || "5 km"} radius
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {/* Favorites Button */}
              <button
                onClick={() => navigate("/favorites")}
                className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center hover:bg-muted transition-colors"
                data-testid="header-favorites-btn"
                title="My Favorites"
              >
                <Heart className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {/* Profile Button */}
              <button
                onClick={() => navigate("/profile")}
                className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center hover:bg-muted transition-colors"
                data-testid="header-profile-btn"
                title="Profile"
              >
                <User className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="flex bg-muted/40 rounded-full p-0.5">
                <button
                  onClick={() => setViewMode("feed")}
                  className={`p-2 rounded-full transition-all ${viewMode === "feed" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  data-testid="feed-view-btn"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2 rounded-full transition-all ${viewMode === "map" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  data-testid="map-view-btn"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-full bg-muted/40 border-0 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/30"
                data-testid="search-input"
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
            
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={openDrawer}
                  className={`h-11 w-11 rounded-full border-0 ${activeFilterCount > 0 ? "bg-primary text-primary-foreground" : "bg-muted/40"}`}
                  data-testid="filter-btn"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-accent-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="text-lg font-semibold">Filters</DrawerTitle>
                    <button 
                      onClick={resetFilters}
                      className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </DrawerHeader>
                
                <div className="px-4 pb-4 space-y-6 overflow-y-auto">
                  {/* Radius */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Distance
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {RADIUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setTempFilters({ ...tempFilters, radius: opt.value })}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            tempFilters.radius === opt.value 
                              ? "bg-foreground text-background" 
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      Minimum Rating
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {RATING_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setTempFilters({ ...tempFilters, minRating: opt.value })}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                            tempFilters.minRating === opt.value 
                              ? "bg-foreground text-background" 
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {opt.value > 0 && <Star className="w-3 h-3 fill-current" />}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Price Range
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4].map((price) => (
                        <button
                          key={price}
                          onClick={() => {
                            const [min, max] = tempFilters.priceRange;
                            if (price >= min && price <= max) {
                              // If in range, narrow it
                              if (price === min && price === max) {
                                setTempFilters({ ...tempFilters, priceRange: [0, 4] });
                              } else if (price === min) {
                                setTempFilters({ ...tempFilters, priceRange: [price + 1, max] });
                              } else if (price === max) {
                                setTempFilters({ ...tempFilters, priceRange: [min, price - 1] });
                              }
                            } else {
                              // Expand range to include
                              setTempFilters({ ...tempFilters, priceRange: [Math.min(min, price), Math.max(max, price)] });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            price >= tempFilters.priceRange[0] && price <= tempFilters.priceRange[1]
                              ? "bg-foreground text-background" 
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {price === 0 ? "Free" : "$".repeat(price)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Open Now */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Hours
                    </label>
                    <button
                      onClick={() => setTempFilters({ ...tempFilters, openNow: !tempFilters.openNow })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        tempFilters.openNow 
                          ? "bg-foreground text-background" 
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Open Now
                    </button>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                      Sort By
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setTempFilters({ ...tempFilters, sortBy: opt.value })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                              tempFilters.sortBy === opt.value 
                                ? "bg-foreground text-background" 
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <DrawerFooter className="pt-2 border-t border-border/40">
                  <Button onClick={applyFilters} className="w-full h-12 rounded-full font-medium">
                    Show Results
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Categories */}
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 px-4 py-2.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setActiveSubcategory("all"); // Reset subcategory when changing category
                  }}
                  className={`
                    flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                    ${isActive 
                      ? "bg-foreground text-background shadow-sm" 
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}
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

        {/* Subcategories for Food */}
        {activeCategory === "restaurant" && (
          <ScrollArea className="w-full border-t border-border/20">
            <div className="flex gap-1.5 px-4 py-2">
              {FOOD_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveSubcategory(type.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all
                    ${activeSubcategory === type.id 
                      ? "bg-foreground/10 text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground"}
                  `}
                  data-testid={`food-type-${type.id}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        )}

        {/* Subcategories for Bars */}
        {activeCategory === "bar" && (
          <ScrollArea className="w-full border-t border-border/20">
            <div className="flex gap-1.5 px-4 py-2">
              {BAR_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveSubcategory(type.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all
                    ${activeSubcategory === type.id 
                      ? "bg-foreground/10 text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground"}
                  `}
                  data-testid={`bar-type-${type.id}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        )}

        {/* Subcategories for Smoke/Cannabis */}
        {activeCategory === "smoke" && (
          <ScrollArea className="w-full border-t border-border/20">
            <div className="flex gap-1.5 px-4 py-2">
              {SMOKE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveSubcategory(type.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all
                    ${activeSubcategory === type.id 
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium" 
                      : "text-muted-foreground hover:text-foreground"}
                  `}
                  data-testid={`smoke-type-${type.id}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        )}
      </header>

      {/* Content */}
      <main className="px-4 pt-4">
        {viewMode === "feed" ? (
          <div className="space-y-3">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded-3xl bg-muted/30 animate-pulse" />
              ))
            ) : places.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No places found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              places.map((place, i) => (
                <FeedCard
                  key={place.id}
                  place={place}
                  onClick={() => {
                    // Navigate to dispensary detail if it's a smoke/dispensary place
                    if (place.isDispensary || activeCategory === "smoke") {
                      navigate(`/dispensary/${place.id}`);
                    } else {
                      navigate(`/place/${place.id}`);
                    }
                  }}
                  savedPlaces={user?.saved_places || []}
                  className={`animate-fade-in`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-220px)] rounded-3xl overflow-hidden shadow-lg">
            <MapView places={places} userLocation={userLocation} onPlaceClick={(id) => {
              // Check if it's a dispensary
              const place = places.find(p => p.id === id);
              if (place?.isDispensary || activeCategory === "smoke") {
                navigate(`/dispensary/${id}`);
              } else {
                navigate(`/place/${id}`);
              }
            }} />
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
