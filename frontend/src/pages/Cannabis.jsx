import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import {
  Search,
  Leaf,
  MapPin,
  Sparkles,
  Zap,
  Moon,
  Sun,
  X,
  SlidersHorizontal,
  Navigation,
  Star,
  ChevronRight
} from "lucide-react";

const STRAIN_TYPES = [
  { id: "all", name: "All", icon: Leaf, color: "bg-green-500" },
  { id: "sativa", name: "Sativa", icon: Sun, color: "bg-amber-500", description: "Energizing & uplifting" },
  { id: "indica", name: "Indica", icon: Moon, color: "bg-purple-500", description: "Relaxing & calming" },
  { id: "hybrid", name: "Hybrid", icon: Sparkles, color: "bg-emerald-500", description: "Balanced effects" },
];

const POPULAR_EFFECTS = [
  "Relaxed", "Happy", "Euphoric", "Uplifted", "Creative", 
  "Sleepy", "Energetic", "Focused", "Hungry", "Talkative"
];

const Cannabis = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "strains");
  const [strains, setStrains] = useState([]);
  const [dispensaries, setDispensaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [stats, setStats] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 40.7128, lng: -74.006 }) // NYC default
      );
    }
  }, []);

  // Fetch stats
  useEffect(() => {
    fetch(`${API}/cannabis/stats`)
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  // Fetch strains
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
    } catch (error) {
      console.error("Fetch strains error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedEffect]);

  // Fetch dispensaries
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
    } catch (error) {
      console.error("Fetch dispensaries error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, userLocation]);

  useEffect(() => {
    if (activeTab === "strains") {
      fetchStrains();
    } else {
      fetchDispensaries();
    }
  }, [activeTab, fetchStrains, fetchDispensaries]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeTab === "strains") fetchStrains();
      else fetchDispensaries();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const formatDistance = (meters) => {
    if (!meters) return "";
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1609.34).toFixed(1)}mi`;
  };

  const getTypeColor = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30";
    if (t.includes("indica")) return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
    return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  };

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="cannabis-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-4 space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-semibold">Cannabis</h1>
                <p className="text-xs text-muted-foreground">
                  {stats ? `${stats.total_strains.toLocaleString()} strains · ${stats.total_dispensaries.toLocaleString()} spots` : "Loading..."}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={activeTab === "strains" ? "Search strains, effects..." : "Search dispensaries..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-full bg-muted border-0 focus-visible:ring-2 focus-visible:ring-green-500"
              data-testid="cannabis-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-full bg-muted p-1">
              <TabsTrigger 
                value="strains" 
                className="rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white"
                data-testid="strains-tab"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Strains
              </TabsTrigger>
              <TabsTrigger 
                value="dispensaries" 
                className="rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white"
                data-testid="dispensaries-tab"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Dispensaries
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Strain Type Filters (only for strains tab) */}
        {activeTab === "strains" && (
          <ScrollArea className="w-full">
            <div className="flex gap-2 px-4 pb-3">
              {STRAIN_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                      ${isActive 
                        ? `${type.color} text-white shadow-lg` 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }
                    `}
                    data-testid={`type-${type.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.name}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        )}

        {/* Effect Filters (only for strains tab) */}
        {activeTab === "strains" && (
          <ScrollArea className="w-full border-t border-border/50">
            <div className="flex gap-2 px-4 py-3">
              {POPULAR_EFFECTS.map((effect) => {
                const isActive = selectedEffect === effect;
                return (
                  <button
                    key={effect}
                    onClick={() => setSelectedEffect(isActive ? "" : effect)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                      ${isActive 
                        ? "bg-green-500 text-white" 
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }
                    `}
                    data-testid={`effect-${effect}`}
                  >
                    {effect}
                    {isActive && <X className="w-3 h-3 ml-1 inline" />}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        )}
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : activeTab === "strains" ? (
          <div className="space-y-3">
            {strains.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No strains found</p>
              </div>
            ) : (
              strains.map((strain) => (
                <StrainCard
                  key={strain.strain_id}
                  strain={strain}
                  onClick={() => navigate(`/strain/${strain.strain_id}`)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {dispensaries.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No dispensaries found nearby</p>
              </div>
            ) : (
              dispensaries.map((disp) => (
                <DispensaryCard
                  key={disp.shop_id}
                  dispensary={disp}
                  onClick={() => navigate(`/dispensary/${disp.shop_id}`)}
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

// Strain Card Component
const StrainCard = ({ strain, onClick }) => {
  const getTypeGradient = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return "from-amber-500 to-orange-500";
    if (t.includes("indica")) return "from-purple-500 to-violet-600";
    return "from-emerald-500 to-green-600";
  };

  const getTypeBg = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return "bg-amber-500/10";
    if (t.includes("indica")) return "bg-purple-500/10";
    return "bg-emerald-500/10";
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-2xl border border-border/50 cursor-pointer
        transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]
        ${getTypeBg(strain.type)}
      `}
      data-testid={`strain-${strain.strain_id}`}
    >
      <div className="flex items-start gap-4">
        {/* Type Indicator */}
        <div className={`
          w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeGradient(strain.type)}
          flex items-center justify-center flex-shrink-0
        `}>
          <Leaf className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">{strain.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{strain.type || "Hybrid"}</p>
            </div>
            {strain.thc > 0 && (
              <Badge variant="outline" className="text-xs font-mono shrink-0">
                THC {strain.thc.toFixed(1)}%
              </Badge>
            )}
          </div>

          {/* Effects */}
          {strain.effects?.length > 0 && strain.effects.some(e => e && e !== "NULL") && (
            <div className="flex flex-wrap gap-1 mt-2">
              {strain.effects.filter(e => e && e !== "NULL").slice(0, 3).map((effect, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {effect}
                </span>
              ))}
              {strain.effects.filter(e => e && e !== "NULL").length > 3 && (
                <span className="text-xs text-muted-foreground">+{strain.effects.filter(e => e && e !== "NULL").length - 3}</span>
              )}
            </div>
          )}

          {/* Flavors */}
          {strain.flavors?.length > 0 && strain.flavors.some(f => f && f !== "NULL") && (
            <p className="text-xs text-muted-foreground mt-1">
              🍃 {strain.flavors.filter(f => f && f !== "NULL").slice(0, 3).join(", ")}
            </p>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </div>
  );
};

// Dispensary Card Component
const DispensaryCard = ({ dispensary, onClick, formatDistance }) => {
  const getCountryFlag = (country) => {
    const flags = { US: "🇺🇸", NL: "🇳🇱", ES: "🇪🇸", CA: "🇨🇦", TH: "🇹🇭", DE: "🇩🇪", PT: "🇵🇹" };
    return flags[country] || "📍";
  };

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-2xl bg-card border border-border/50 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
      data-testid={`dispensary-${dispensary.shop_id}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
          <span className="text-2xl">{getCountryFlag(dispensary.country)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground line-clamp-1">{dispensary.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {dispensary.city}, {dispensary.state || dispensary.country}
          </p>
          
          <div className="flex items-center gap-3 mt-2 text-sm">
            {dispensary.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{dispensary.rating.toFixed(1)}</span>
              </div>
            )}
            {dispensary.distance_m && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{formatDistance(dispensary.distance_m)}</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {dispensary.type || "Dispensary"}
            </Badge>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </div>
  );
};

export default Cannabis;
