import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "@/App";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import {
  Search,
  MapPin,
  X,
  Star,
  ChevronRight,
  Leaf,
  Sun,
  Moon
} from "lucide-react";

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
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Greens</h1>
              {stats && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.total_strains.toLocaleString()} strains · {stats.total_dispensaries.toLocaleString()} spots
                </p>
              )}
            </div>
            <div className="text-3xl">🌿</div>
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

          {/* Tab Toggle */}
          <div className="flex gap-2">
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
              <div key={i} className="h-20 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : activeTab === "strains" ? (
          <div className="space-y-2">
            {strains.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-4">🍃</p>
                <p>No strains found</p>
              </div>
            ) : (
              strains.map((strain) => (
                <StrainRow key={strain.strain_id} strain={strain} onClick={() => navigate(`/strain/${strain.strain_id}`)} />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {dispensaries.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-4">📍</p>
                <p>No spots found</p>
              </div>
            ) : (
              dispensaries.map((d) => (
                <DispensaryRow key={d.shop_id} dispensary={d} onClick={() => navigate(`/dispensary/${d.shop_id}`)} formatDistance={formatDistance} />
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
  const flavors = (strain.flavors || []).filter(f => f && f !== "NULL");

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
