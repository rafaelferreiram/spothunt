import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API, useAuth, useAppLocation } from "@/App";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import LocationEditor from "@/components/LocationEditor";
import NavigationDrawer from "@/components/NavigationDrawer";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Heart,
  NavigationArrow,
  MagnifyingGlass,
  X,
  CaretRight,
  GridFour,
  List,
  User,
  PersonSimpleWalk,
  Car,
  MapPinArea,
  Compass,
  Storefront,
  Leaf
} from "@phosphor-icons/react";

// Cannabis leaf SVG icon
const CannabisLeafIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2c0 0-1.5 2.5-1.5 5c0 1.2 0.3 2.4 0.7 3.5c-1.2-1.5-3.2-3.5-5.7-5c0 0 2 3.5 4.5 5.5c-2-0.5-4.5-0.5-7 0c0 0 4 1.5 7 1.5c-1.5 0.2-3.5 0.8-5 2c0 0 3-0.5 5.5-0.5c-0.3 0.3-0.5 0.8-0.5 1.5l0 7h2l0-7c0-0.7-0.2-1.2-0.5-1.5c2.5 0 5.5 0.5 5.5 0.5c-1.5-1.2-3.5-1.8-5-2c3 0 7-1.5 7-1.5c-2.5-0.5-5-0.5-7 0c2.5-2 4.5-5.5 4.5-5.5c-2.5 1.5-4.5 3.5-5.7 5c0.4-1.1 0.7-2.3 0.7-3.5c0-2.5-1.5-5-1.5-5z"/>
  </svg>
);

const STRAIN_TYPES = [
  { id: "all", name: "All", color: "bg-foreground" },
  { id: "sativa", name: "Sativa", color: "bg-amber-500" },
  { id: "indica", name: "Indica", color: "bg-purple-500" },
  { id: "hybrid", name: "Hybrid", color: "bg-emerald-500" },
];

const EFFECTS = ["Relaxed", "Happy", "Euphoric", "Uplifted", "Creative", "Sleepy", "Energetic", "Focused"];

// Smoke/dispensary sub-filters - matches Home.jsx Smoke tab
const SMOKE_TYPES = [
  { id: "all", name: "All" },
  { id: "dispensary", name: "Dispensary" },
  { id: "cannabis", name: "Cannabis Shop" },
  { id: "cbd", name: "CBD Store" },
  { id: "hemp", name: "Hemp Shop" },
  { id: "coffeeshop", name: "Coffeeshop" },
  { id: "headshop", name: "Head Shop" },
];

const Cannabis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    userLocation: globalLocation, 
    locationName: globalLocationName, 
    isCustomLocation, 
    locationLoading,
    handleLocationChange 
  } = useAppLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "spots");
  const [viewMode, setViewMode] = useState("feed");
  const [strains, setStrains] = useState([]);
  const [dispensaries, setDispensaries] = useState([]);
  const [favorites, setFavorites] = useState({ strains: [], dispensaries: [] });
  const [favoriteIds, setFavoriteIds] = useState({ strains: new Set(), dispensaries: new Set() });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [smokeSubFilter, setSmokeSubFilter] = useState("all");
  const [stats, setStats] = useState(null);

  const userLocation = globalLocation;

  useEffect(() => {
    fetch(`${API}/cannabis/stats`).then(res => res.json()).then(setStats).catch(() => {});
  }, []);

  const fetchStrains = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedType !== "all") params.append("strain_type", selectedType);
      if (selectedEffect) params.append("effect", selectedEffect);
      params.append("limit", "30");
      if (userLocation) {
        params.append("lat", userLocation.lat.toString());
        params.append("lng", userLocation.lng.toString());
      }
      const res = await fetch(`${API}/cannabis/strains?${params}`);
      const data = await res.json();
      setStrains(data.strains || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [searchQuery, selectedType, selectedEffect, userLocation]);

  const fetchDispensaries = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (smokeSubFilter !== "all") params.append("search", smokeSubFilter);
      params.append("lat", userLocation.lat.toString());
      params.append("lng", userLocation.lng.toString());
      params.append("limit", "30");
      params.append("max_distance", "100000");
      const res = await fetch(`${API}/cannabis/dispensaries?${params}`);
      const data = await res.json();
      setDispensaries(data.dispensaries || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [searchQuery, userLocation, smokeSubFilter]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch(`${API}/cannabis/favorites`, { credentials: "include" });
      const data = await res.json();
      setFavorites(data);
      const strainIds = new Set(data.strains?.map(s => s.strain_id) || []);
      const dispensaryIds = new Set(data.dispensaries?.map(d => d.shop_id) || []);
      setFavoriteIds({ strains: strainIds, dispensaries: dispensaryIds });
    } catch (e) { console.error(e); }
  }, []);

  const toggleFavorite = async (itemId, itemType, isFavorite) => {
    try {
      if (isFavorite) {
        await fetch(`${API}/cannabis/favorites/${itemId}?item_type=${itemType}`, { method: "DELETE", credentials: "include" });
        toast.success("Removed from favorites");
      } else {
        await fetch(`${API}/cannabis/favorites?item_id=${itemId}&item_type=${itemType}`, { method: "POST", credentials: "include" });
        toast.success("Added to favorites");
      }
      if (itemType === "strain") {
        const newSet = new Set(favoriteIds.strains);
        isFavorite ? newSet.delete(itemId) : newSet.add(itemId);
        setFavoriteIds(prev => ({ ...prev, strains: newSet }));
      } else {
        const newSet = new Set(favoriteIds.dispensaries);
        isFavorite ? newSet.delete(itemId) : newSet.add(itemId);
        setFavoriteIds(prev => ({ ...prev, dispensaries: newSet }));
      }
      if (activeTab === "favorites") fetchFavorites();
    } catch (e) { toast.error("Failed to update favorites"); }
  };

  useEffect(() => {
    if (activeTab === "strains") fetchStrains();
    else if (activeTab === "spots") fetchDispensaries();
    else if (activeTab === "favorites") { fetchFavorites(); setLoading(false); }
  }, [activeTab, fetchStrains, fetchDispensaries, fetchFavorites]);

  useEffect(() => {
    if (activeTab === "spots" && userLocation) fetchDispensaries();
  }, [userLocation, activeTab, fetchDispensaries, smokeSubFilter]);

  useEffect(() => {
    if (activeTab === "strains" && userLocation) fetchStrains();
  }, [userLocation, activeTab, fetchStrains]);

  useEffect(() => { fetchFavorites(); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (activeTab === "strains") fetchStrains();
      else if (activeTab === "spots") fetchDispensaries();
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const formatDistance = (m) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1609.34).toFixed(1)}mi`;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-28" data-testid="cannabis-page">
      <header 
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm pwa-safe-header"
        style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <div className="px-4 pb-4 space-y-4">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Weeds</h1>
              {stats && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.total_strains?.toLocaleString()} strains · {stats.total_dispensaries?.toLocaleString()} spots nearby
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("favorites")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  activeTab === "favorites" ? "bg-red-500/10 text-red-500" : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
                data-testid="header-favorites-btn"
              >
                <Heart weight={activeTab === "favorites" ? "fill" : "regular"} className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center hover:bg-muted transition-colors"
                data-testid="header-profile-btn"
              >
                <User className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CannabisLeafIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Location Row - Show for Spots tab */}
          {activeTab === "spots" && (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isCustomLocation 
                  ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5" 
                  : "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
              }`}>
                {isCustomLocation ? (
                  <Compass weight="fill" className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <MapPin weight="fill" className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <LocationEditor
                  currentLocation={userLocation}
                  locationName={locationLoading ? "Finding you..." : globalLocationName}
                  onLocationChange={handleLocationChange}
                  className="w-full"
                />
                {isCustomLocation && (
                  <p className="text-[10px] text-amber-500 font-medium mt-0.5">Visiting</p>
                )}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={activeTab === "strains" ? "Search strains..." : "Search spots..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-muted/50 border-0 text-sm"
              data-testid="cannabis-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Tab Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              <button
                onClick={() => setActiveTab("spots")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "spots" ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground"
                }`}
                data-testid="spots-tab"
              >
                Spots
              </button>
              <button
                onClick={() => setActiveTab("strains")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "strains" ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground"
                }`}
                data-testid="strains-tab"
              >
                Strains
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  activeTab === "favorites" ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground"
                }`}
                data-testid="favorites-tab"
              >
                <Heart weight={activeTab === "favorites" ? "fill" : "regular"} className="w-3.5 h-3.5" />
                Favs
              </button>
            </div>
            
            {/* View Mode Toggle - For Spots */}
            {activeTab === "spots" && (
              <div className="flex items-center bg-muted/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("feed")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "feed" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="view-feed"
                >
                  <GridFour weight="bold" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="view-list"
                >
                  <List weight="bold" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Filters */}
        {activeTab === "spots" && (
          <div className="border-t border-border/30">
            <ScrollArea className="w-full">
              <div className="flex gap-2 px-4 py-3">
                {SMOKE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSmokeSubFilter(type.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      smokeSubFilter === type.id 
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                        : "bg-muted/30 text-muted-foreground"
                    }`}
                    data-testid={`smoke-filter-${type.id}`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>
        )}

        {activeTab === "strains" && (
          <div className="border-t border-border/30">
            <ScrollArea className="w-full">
              <div className="flex gap-2 px-4 py-3">
                {STRAIN_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      selectedType === type.id ? `${type.color} text-white` : "bg-muted/30 text-muted-foreground"
                    }`}
                    data-testid={`type-${type.id}`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
            <ScrollArea className="w-full border-t border-border/20">
              <div className="flex gap-2 px-4 py-2">
                {EFFECTS.map((effect) => (
                  <button
                    key={effect}
                    onClick={() => setSelectedEffect(selectedEffect === effect ? "" : effect)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                      selectedEffect === effect ? "bg-foreground/10 text-foreground font-medium" : "text-muted-foreground"
                    }`}
                    data-testid={`effect-${effect}`}
                  >
                    {effect}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="px-4 pt-2">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${viewMode === "feed" && activeTab === "spots" ? "h-72" : "h-20"} rounded-2xl bg-muted/30 animate-pulse`} />
            ))}
          </div>
        ) : activeTab === "spots" ? (
          <div className={viewMode === "feed" ? "space-y-4" : "space-y-2"}>
            {dispensaries.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <MapPin weight="thin" className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No spots found</p>
                <p className="text-sm mt-1">Try a different filter or location</p>
              </div>
            ) : viewMode === "feed" ? (
              dispensaries.map((d) => (
                <DispensaryFeedCard 
                  key={d.shop_id} 
                  dispensary={d} 
                  userLocation={userLocation}
                  onClick={() => navigate(`/dispensary/${d.shop_id}`)} 
                  formatDistance={formatDistance}
                  isFavorite={favoriteIds.dispensaries.has(d.shop_id)}
                  onToggleFavorite={() => toggleFavorite(d.shop_id, "dispensary", favoriteIds.dispensaries.has(d.shop_id))}
                />
              ))
            ) : (
              dispensaries.map((d) => (
                <DispensaryRow 
                  key={d.shop_id} 
                  dispensary={d} 
                  onClick={() => navigate(`/dispensary/${d.shop_id}`)} 
                  formatDistance={formatDistance}
                  isFavorite={favoriteIds.dispensaries.has(d.shop_id)}
                  onToggleFavorite={() => toggleFavorite(d.shop_id, "dispensary", favoriteIds.dispensaries.has(d.shop_id))}
                />
              ))
            )}
          </div>
        ) : activeTab === "strains" ? (
          <div className="space-y-2">
            {strains.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CannabisLeafIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No strains found</p>
              </div>
            ) : (
              strains.map((strain) => (
                <StrainRow 
                  key={strain.strain_id} 
                  strain={strain} 
                  onClick={() => navigate(`/strain/${strain.strain_id}`)}
                  isFavorite={favoriteIds.strains.has(strain.strain_id)}
                  onToggleFavorite={() => toggleFavorite(strain.strain_id, "strain", favoriteIds.strains.has(strain.strain_id))}
                />
              ))
            )}
          </div>
        ) : activeTab === "favorites" ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Favorite Strains ({favorites.strains?.length || 0})
              </h3>
              {favorites.strains?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl">
                  <CannabisLeafIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No favorite strains yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.strains?.map((strain) => (
                    <StrainRow 
                      key={strain.strain_id} 
                      strain={strain} 
                      onClick={() => navigate(`/strain/${strain.strain_id}`)}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(strain.strain_id, "strain", true)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Favorite Spots ({favorites.dispensaries?.length || 0})
              </h3>
              {favorites.dispensaries?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl">
                  <MapPin weight="thin" className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No favorite spots yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.dispensaries?.map((d) => (
                    <DispensaryRow 
                      key={d.shop_id} 
                      dispensary={d} 
                      onClick={() => navigate(`/dispensary/${d.shop_id}`)}
                      formatDistance={formatDistance}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(d.shop_id, "dispensary", true)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
};

// Strain row
const StrainRow = ({ strain, onClick, isFavorite = false, onToggleFavorite }) => {
  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", icon: "\u2600\uFE0F" };
    if (t.includes("indica")) return { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", icon: "\uD83C\uDF19" };
    return { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", icon: "\u2728" };
  };
  const style = getTypeStyle(strain.type);
  const effects = (strain.effects || []).filter(e => e && e !== "NULL");
  const isRegionalFavorite = strain.is_regional_favorite;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl ${style.bg} cursor-pointer transition-all active:scale-[0.98] ${isRegionalFavorite ? "ring-2 ring-emerald-500/30" : ""}`}
      data-testid={`strain-${strain.strain_id}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{style.icon}</span>
            <h3 className="font-semibold text-foreground truncate text-base">{strain.name}</h3>
            {isRegionalFavorite && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-medium whitespace-nowrap">
                Popular Here
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-medium ${style.text}`}>{strain.type || "Hybrid"}</span>
            {strain.thc > 0 && <span className="text-xs text-muted-foreground">· {strain.thc.toFixed(0)}% THC</span>}
            {strain.cbd > 0 && <span className="text-xs text-muted-foreground">· {strain.cbd.toFixed(0)}% CBD</span>}
          </div>
          {effects.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
              {effects.slice(0, 4).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="p-2.5 rounded-xl hover:bg-foreground/10 transition-colors touch-manipulation"
            >
              <Heart weight={isFavorite ? "fill" : "regular"} className={`w-5 h-5 ${isFavorite ? "text-red-500" : "text-muted-foreground"}`} />
            </button>
          )}
          <CaretRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

// Feed Card for dispensaries - uses NavigationDrawer like FeedCard
const DispensaryFeedCard = ({ dispensary, userLocation, onClick, formatDistance, isFavorite = false, onToggleFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const flags = { US: "\uD83C\uDDFA\uD83C\uDDF8", NL: "\uD83C\uDDF3\uD83C\uDDF1", ES: "\uD83C\uDDEA\uD83C\uDDF8", CA: "\uD83C\uDDE8\uD83C\uDDE6", TH: "\uD83C\uDDF9\uD83C\uDDED", DE: "\uD83C\uDDE9\uD83C\uDDEA", PT: "\uD83C\uDDF5\uD83C\uDDF9", BR: "\uD83C\uDDE7\uD83C\uDDF7", UY: "\uD83C\uDDFA\uD83C\uDDFE", AT: "\uD83C\uDDE6\uD83C\uDDF9", CH: "\uD83C\uDDE8\uD83C\uDDED", BE: "\uD83C\uDDE7\uD83C\uDDEA", IT: "\uD83C\uDDEE\uD83C\uDDF9", FR: "\uD83C\uDDEB\uD83C\uDDF7", GB: "\uD83C\uDDEC\uD83C\uDDE7", CZ: "\uD83C\uDDE8\uD83C\uDDFF", PL: "\uD83C\uDDF5\uD83C\uDDF1", GR: "\uD83C\uDDEC\uD83C\uDDF7" };
  
  const getFallbackImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=800&q=80",
      "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?w=800&q=80",
      "https://images.unsplash.com/photo-1516709999172-b5ef73c6e7a8?w=800&q=80",
      "https://images.unsplash.com/photo-1457573557536-cb47d0a6eb49?w=800&q=80",
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=80",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80",
    ];
    const hash = dispensary.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return images[hash % images.length];
  };

  const getImageUrl = () => {
    if (imageError) return getFallbackImage();
    if (dispensary.photos?.length > 0 && dispensary.photos[0]) return dispensary.photos[0];
    return getFallbackImage();
  };

  // Build place object for NavigationDrawer
  const placeForNav = {
    name: dispensary.name,
    coordinates: dispensary.coordinates,
    google_place_id: dispensary.google_place_id
  };

  const formatTime = (mins) => {
    if (!mins) return "";
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.98] bg-zinc-900 border border-white/5 shadow-xl"
      data-testid={`dispensary-card-${dispensary.shop_id}`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden" onClick={onClick}>
        {!imageLoaded && <div className="absolute inset-0 bg-zinc-800 animate-pulse" />}
        <img
          src={getImageUrl()}
          alt={dispensary.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-4 right-4">
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-xl ${
                isFavorite ? "bg-white text-rose-500 shadow-lg shadow-rose-500/30" : "bg-black/40 text-white hover:bg-black/60 border border-white/10"
              }`}
            >
              <Heart weight={isFavorite ? "fill" : "regular"} className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Country Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-zinc-900 flex items-center gap-1">
            <span>{flags[dispensary.country] || "\uD83D\uDCCD"}</span>
            {dispensary.country}
          </span>
        </div>

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-bold text-white text-xl leading-tight truncate tracking-tight">
            {dispensary.name}
          </h3>
          <p className="text-white/60 text-sm mt-1 truncate">
            {dispensary.city}{dispensary.state ? `, ${dispensary.state}` : ""} · {dispensary.type || "Dispensary"}
          </p>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
            {dispensary.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star weight="fill" className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white text-sm">{dispensary.rating.toFixed(1)}</span>
              </span>
            )}
            {dispensary.distance_m && (
              <span className="flex items-center gap-1 text-white/60 text-sm">
                <MapPin weight="fill" className="w-3.5 h-3.5" />
                {formatDistance(dispensary.distance_m)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-5 text-sm text-zinc-400">
          {dispensary.walk_mins && (
            <span className="flex items-center gap-2" title="Walking time">
              <PersonSimpleWalk weight="fill" className="w-4 h-4" />
              <span className="font-medium">{formatTime(dispensary.walk_mins)}</span>
            </span>
          )}
          {dispensary.drive_mins && (
            <span className="flex items-center gap-2" title="Driving time">
              <Car weight="fill" className="w-4 h-4" />
              <span className="font-medium">{formatTime(dispensary.drive_mins)}</span>
            </span>
          )}
        </div>
        
        <NavigationDrawer
          place={placeForNav}
          userLocation={userLocation}
          trigger={
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-emerald-600/30"
              data-testid={`directions-btn-${dispensary.shop_id}`}
            >
              <NavigationArrow weight="fill" className="w-4 h-4" />
              <span>Directions</span>
            </button>
          }
        />
      </div>
    </div>
  );
};

// List Row for dispensaries
const DispensaryRow = ({ dispensary, onClick, formatDistance, isFavorite = false, onToggleFavorite }) => {
  const flags = { US: "\uD83C\uDDFA\uD83C\uDDF8", NL: "\uD83C\uDDF3\uD83C\uDDF1", ES: "\uD83C\uDDEA\uD83C\uDDF8", CA: "\uD83C\uDDE8\uD83C\uDDE6", TH: "\uD83C\uDDF9\uD83C\uDDED", DE: "\uD83C\uDDE9\uD83C\uDDEA", PT: "\uD83C\uDDF5\uD83C\uDDF9", BR: "\uD83C\uDDE7\uD83C\uDDF7", UY: "\uD83C\uDDFA\uD83C\uDDFE" };
  
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-2xl bg-muted/30 cursor-pointer transition-all active:scale-[0.98]"
      data-testid={`dispensary-${dispensary.shop_id}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{flags[dispensary.country] || "\uD83D\uDCCD"}</span>
            <h3 className="font-medium text-foreground truncate">{dispensary.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{dispensary.city}</span>
            {dispensary.distance_m && <span>· {formatDistance(dispensary.distance_m)}</span>}
            {dispensary.rating > 0 && (
              <span className="flex items-center gap-0.5">
                · <Star weight="fill" className="w-3 h-3 text-amber-500" /> {dispensary.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
            >
              <Heart weight={isFavorite ? "fill" : "regular"} className={`w-4 h-4 ${isFavorite ? "text-red-500" : "text-muted-foreground"}`} />
            </button>
          )}
          <CaretRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default Cannabis;
