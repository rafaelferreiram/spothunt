import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "@/App";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import {
  Search,
  MapPin,
  X,
  Star,
  ChevronRight,
  LayoutGrid,
  List,
  Navigation,
  Footprints,
  Car,
  Heart,
  ExternalLink
} from "lucide-react";

// Cannabis leaf SVG icon - 7-leaflet design
const CannabisLeafIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C12 2 10 5 10 8C10 10 11 12 12 13C13 12 14 10 14 8C14 5 12 2 12 2Z" />
    <path d="M12 13C12 13 8 11 6 7C6 7 8 9 10 11C11 12 12 13 12 13Z" />
    <path d="M12 13C12 13 16 11 18 7C18 7 16 9 14 11C13 12 12 13 12 13Z" />
    <path d="M12 14C12 14 7 12 4 10C4 10 7 11 10 12C11 13 12 14 12 14Z" />
    <path d="M12 14C12 14 17 12 20 10C20 10 17 11 14 12C13 13 12 14 12 14Z" />
    <path d="M12 14.5C12 14.5 9 14 6 13C6 13 9 13.5 11 14C11.5 14.2 12 14.5 12 14.5Z" />
    <path d="M12 14.5C12 14.5 15 14 18 13C18 13 15 13.5 13 14C12.5 14.2 12 14.5 12 14.5Z" />
  </svg>
);

const STRAIN_TYPES = [
  { id: "all", name: "All", color: "bg-foreground" },
  { id: "sativa", name: "Sativa", color: "bg-amber-500", emoji: "☀️" },
  { id: "indica", name: "Indica", color: "bg-purple-500", emoji: "🌙" },
  { id: "hybrid", name: "Hybrid", color: "bg-emerald-500", emoji: "✨" },
];

const EFFECTS = ["Relaxed", "Happy", "Euphoric", "Uplifted", "Creative", "Sleepy", "Energetic", "Focused"];

const Cannabis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "strains");
  const [viewMode, setViewMode] = useState("feed"); // "feed" or "list"
  const [strains, setStrains] = useState([]);
  const [dispensaries, setDispensaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 40.7128, lng: -74.006 })
      );
    }
  }, []);

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
      const res = await fetch(`${API}/cannabis/strains?${params}`);
      const data = await res.json();
      setStrains(data.strains || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [searchQuery, selectedType, selectedEffect]);

  const fetchDispensaries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (userLocation) {
        params.append("lat", userLocation.lat);
        params.append("lng", userLocation.lng);
      }
      params.append("limit", "30");
      const res = await fetch(`${API}/cannabis/dispensaries?${params}`);
      const data = await res.json();
      setDispensaries(data.dispensaries || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [searchQuery, userLocation]);

  useEffect(() => {
    if (activeTab === "strains") fetchStrains();
    else fetchDispensaries();
  }, [activeTab, fetchStrains, fetchDispensaries]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (activeTab === "strains") fetchStrains();
      else fetchDispensaries();
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const formatDistance = (m) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1609.34).toFixed(1)}mi`;

  return (
    <div className="min-h-screen bg-background pb-28" data-testid="cannabis-page">
      {/* Minimal Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <div className="px-4 pt-6 pb-4 space-y-4">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Weeds</h1>
              {stats && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.total_strains.toLocaleString()} strains · {stats.total_dispensaries.toLocaleString()} spots nearby
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CannabisLeafIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

          {/* Tab Toggle with View Mode */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-2">
              <button
                onClick={() => setActiveTab("strains")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === "strains" 
                    ? "bg-foreground text-background" 
                    : "bg-muted/50 text-muted-foreground"
                }`}
                data-testid="strains-tab"
              >
                Strains
              </button>
              <button
                onClick={() => setActiveTab("dispensaries")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === "dispensaries" 
                    ? "bg-foreground text-background" 
                    : "bg-muted/50 text-muted-foreground"
                }`}
                data-testid="dispensaries-tab"
              >
                Spots
              </button>
            </div>
            
            {/* View Mode Toggle - Only for Spots */}
            {activeTab === "dispensaries" && (
              <div className="flex items-center bg-muted/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("feed")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "feed" 
                      ? "bg-background shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="view-feed"
                  title="Feed view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" 
                      ? "bg-background shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="view-list"
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        {activeTab === "strains" && (
          <div className="border-t border-border/30">
            <ScrollArea className="w-full">
              <div className="flex gap-2 px-4 py-3">
                {STRAIN_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all
                      ${selectedType === type.id 
                        ? `${type.color} text-white` 
                        : "bg-muted/30 text-muted-foreground"
                      }
                    `}
                    data-testid={`type-${type.id}`}
                  >
                    {type.emoji && <span className="mr-1">{type.emoji}</span>}
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
                    className={`
                      px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all
                      ${selectedEffect === effect 
                        ? "bg-foreground/10 text-foreground font-medium" 
                        : "text-muted-foreground"
                      }
                    `}
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
              <div key={i} className={`${viewMode === "feed" && activeTab === "dispensaries" ? "h-72" : "h-20"} rounded-2xl bg-muted/30 animate-pulse`} />
            ))}
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
                <StrainRow key={strain.strain_id} strain={strain} onClick={() => navigate(`/strain/${strain.strain_id}`)} />
              ))
            )}
          </div>
        ) : (
          <div className={viewMode === "feed" ? "space-y-4" : "space-y-2"}>
            {dispensaries.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No spots found</p>
              </div>
            ) : viewMode === "feed" ? (
              dispensaries.map((d) => (
                <DispensaryFeedCard 
                  key={d.shop_id} 
                  dispensary={d} 
                  onClick={() => navigate(`/dispensary/${d.shop_id}`)} 
                  formatDistance={formatDistance} 
                />
              ))
            ) : (
              dispensaries.map((d) => (
                <DispensaryRow 
                  key={d.shop_id} 
                  dispensary={d} 
                  onClick={() => navigate(`/dispensary/${d.shop_id}`)} 
                  formatDistance={formatDistance} 
                />
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

const StrainRow = ({ strain, onClick }) => {
  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", icon: "☀️" };
    if (t.includes("indica")) return { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", icon: "🌙" };
    return { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", icon: "✨" };
  };
  
  const style = getTypeStyle(strain.type);
  const effects = (strain.effects || []).filter(e => e && e !== "NULL");

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl ${style.bg} cursor-pointer transition-all active:scale-[0.98]`}
      data-testid={`strain-${strain.strain_id}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{style.icon}</span>
            <h3 className="font-medium text-foreground truncate">{strain.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs ${style.text}`}>{strain.type || "Hybrid"}</span>
            {strain.thc > 0 && <span className="text-xs text-muted-foreground">· {strain.thc.toFixed(0)}% THC</span>}
          </div>
          {effects.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5 truncate">
              {effects.slice(0, 3).join(" · ")}
            </p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );
};

// Feed Card View for Dispensaries (similar to FeedCard)
const DispensaryFeedCard = ({ dispensary, onClick, formatDistance }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const flags = { US: "🇺🇸", NL: "🇳🇱", ES: "🇪🇸", CA: "🇨🇦", TH: "🇹🇭", DE: "🇩🇪", PT: "🇵🇹" };
  
  // Generate a consistent image based on the dispensary name for variety
  const getImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1616690710400-a16d146927c5?w=800&q=80", // Cannabis store
      "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=800&q=80", // Cannabis buds
      "https://images.unsplash.com/photo-1585063560370-1519bcea7882?w=800&q=80", // Cannabis plant
      "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?w=800&q=80", // Dispensary interior
      "https://images.unsplash.com/photo-1587404105811-d33b1bb2a87b?w=800&q=80", // Cannabis leaf
    ];
    const index = dispensary.name.length % images.length;
    return images[index];
  };

  const handleMaps = (e) => {
    e.stopPropagation();
    const { lat, lng } = dispensary.coordinates || {};
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
    }
  };

  // Estimate walk/drive times based on distance
  const walkMins = dispensary.distance_m ? Math.round(dispensary.distance_m / 80) : null;
  const driveMins = dispensary.distance_m ? Math.round(dispensary.distance_m / 400) : null;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] bg-card"
      data-testid={`dispensary-card-${dispensary.shop_id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={getImage()}
          alt={dispensary.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Country Flag Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-foreground flex items-center gap-1">
            <span>{flags[dispensary.country] || "📍"}</span>
            {dispensary.country}
          </span>
        </div>

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-lg leading-tight truncate">
                {dispensary.name}
              </h3>
              <p className="text-white/70 text-sm mt-0.5 truncate">
                {dispensary.city}{dispensary.state ? `, ${dispensary.state}` : ""}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mt-2.5 text-sm text-white/90">
            {dispensary.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{dispensary.rating.toFixed(1)}</span>
              </span>
            )}
            {dispensary.distance_m && (
              <span className="flex items-center gap-1 text-white/70">
                <MapPin className="w-3.5 h-3.5" />
                {formatDistance(dispensary.distance_m)}
              </span>
            )}
            <span className="text-emerald-400 flex items-center gap-1">
              <CannabisLeafIcon className="w-3.5 h-3.5" />
              {dispensary.type || "Dispensary"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border/30">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {walkMins && (
            <span className="flex items-center gap-1.5" title="Walking time">
              <Footprints className="w-3.5 h-3.5" />
              <span className="font-medium">{walkMins} min</span>
            </span>
          )}
          {driveMins && (
            <span className="flex items-center gap-1.5" title="Driving time">
              <Car className="w-3.5 h-3.5" />
              <span className="font-medium">{driveMins} min</span>
            </span>
          )}
        </div>
        
        <button
          onClick={handleMaps}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground/5 hover:bg-foreground/10 text-xs font-medium transition-colors"
          data-testid={`maps-btn-${dispensary.shop_id}`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </button>
      </div>
    </div>
  );
};

// List Row View for Dispensaries (original)
const DispensaryRow = ({ dispensary, onClick, formatDistance }) => {
  const flags = { US: "🇺🇸", NL: "🇳🇱", ES: "🇪🇸", CA: "🇨🇦", TH: "🇹🇭", DE: "🇩🇪", PT: "🇵🇹" };
  
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-2xl bg-muted/30 cursor-pointer transition-all active:scale-[0.98]"
      data-testid={`dispensary-${dispensary.shop_id}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{flags[dispensary.country] || "📍"}</span>
            <h3 className="font-medium text-foreground truncate">{dispensary.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{dispensary.city}</span>
            {dispensary.distance_m && <span>· {formatDistance(dispensary.distance_m)}</span>}
            {dispensary.rating > 0 && (
              <span className="flex items-center gap-0.5">
                · <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {dispensary.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );
};

export default Cannabis;
