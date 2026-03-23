import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, useAuth } from "@/App";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import {
  Heart,
  MapPin,
  Star,
  ChevronRight,
  Trash2,
  User,
  Utensils,
  Beer,
  Coffee,
  Landmark
} from "lucide-react";

// Cannabis leaf icon
const CannabisLeafIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2c0 0-1.5 2.5-1.5 5c0 1.2 0.3 2.4 0.7 3.5c-1.2-1.5-3.2-3.5-5.7-5c0 0 2 3.5 4.5 5.5c-2-0.5-4.5-0.5-7 0c0 0 4 1.5 7 1.5c-1.5 0.2-3.5 0.8-5 2c0 0 3-0.5 5.5-0.5c-0.3 0.3-0.5 0.8-0.5 1.5l0 7h2l0-7c0-0.7-0.2-1.2-0.5-1.5c2.5 0 5.5 0.5 5.5 0.5c-1.5-1.2-3.5-1.8-5-2c3 0 7-1.5 7-1.5c-2.5-0.5-5-0.5-7 0c2.5-2 4.5-5.5 4.5-5.5c-2.5 1.5-4.5 3.5-5.7 5c0.4-1.1 0.7-2.3 0.7-3.5c0-2.5-1.5-5-1.5-5z"/>
  </svg>
);

const TABS = [
  { id: "places", name: "Places", icon: MapPin },
  { id: "cannabis", name: "Cannabis", icon: CannabisLeafIcon },
];

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("places");
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [cannabisFavorites, setCannabisFavorites] = useState({ strains: [], dispensaries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      // Fetch saved places
      const placesRes = await fetch(`${API}/user/saved-places`, { credentials: "include" });
      if (placesRes.ok) {
        const placesData = await placesRes.json();
        setSavedPlaces(placesData.places || []);
      }

      // Fetch cannabis favorites
      const cannabisRes = await fetch(`${API}/cannabis/favorites`, { credentials: "include" });
      if (cannabisRes.ok) {
        const cannabisData = await cannabisRes.json();
        setCannabisFavorites(cannabisData);
      }
    } catch (e) {
      console.error("Error fetching favorites:", e);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedPlace = async (placeId) => {
    try {
      await fetch(`${API}/user/saved-places/${placeId}`, {
        method: "DELETE",
        credentials: "include"
      });
      setSavedPlaces(prev => prev.filter(p => p.id !== placeId));
      toast.success("Removed from favorites");
    } catch (e) {
      toast.error("Failed to remove");
    }
  };

  const removeCannabisFavorite = async (itemId, itemType) => {
    try {
      await fetch(`${API}/cannabis/favorites/${itemId}?item_type=${itemType}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (itemType === "strain") {
        setCannabisFavorites(prev => ({
          ...prev,
          strains: prev.strains.filter(s => s.strain_id !== itemId)
        }));
      } else {
        setCannabisFavorites(prev => ({
          ...prev,
          dispensaries: prev.dispensaries.filter(d => d.shop_id !== itemId)
        }));
      }
      toast.success("Removed from favorites");
    } catch (e) {
      toast.error("Failed to remove");
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      restaurant: Utensils,
      bar: Beer,
      cafe: Coffee,
      museum: Landmark,
    };
    return icons[category] || MapPin;
  };

  const totalCount = savedPlaces.length + (cannabisFavorites.strains?.length || 0) + (cannabisFavorites.dispensaries?.length || 0);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-28 sm:pb-24" data-testid="favorites-page">
      {/* Header with safe area for notch/Dynamic Island */}
      <header 
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40 pwa-safe-header"
        style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <div className="px-4 pb-4 space-y-4">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight">Favorites</h1>
                <p className="text-xs text-muted-foreground">{totalCount} saved items</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center hover:bg-muted transition-colors"
              data-testid="header-profile-btn"
            >
              <User className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tab.id === "places" 
                ? savedPlaces.length 
                : (cannabisFavorites.strains?.length || 0) + (cannabisFavorites.dispensaries?.length || 0);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-background/20" : "bg-foreground/10"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : activeTab === "places" ? (
          <div className="space-y-3">
            {savedPlaces.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No saved places yet</p>
                <p className="text-sm mt-1">Swipe right on Shuffle to save places</p>
              </div>
            ) : (
              savedPlaces.map((place) => {
                const Icon = getCategoryIcon(place.category);
                return (
                  <div
                    key={place.id}
                    className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-xl bg-muted/50 overflow-hidden flex-shrink-0">
                      {place.photos?.[0] ? (
                        <img src={place.photos[0]} alt={place.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => navigate(`/place/${place.id}`)}>
                      <h3 className="font-medium truncate">{place.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="capitalize">{place.category}</span>
                        {place.rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            · <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {place.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSavedPlace(place.id)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Strains */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Strains ({cannabisFavorites.strains?.length || 0})
              </h3>
              {cannabisFavorites.strains?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl">
                  <CannabisLeafIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No favorite strains yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cannabisFavorites.strains?.map((strain) => {
                    const getTypeStyle = (type) => {
                      const t = (type || "").toLowerCase();
                      if (t.includes("sativa")) return { bg: "bg-amber-500/10", icon: "☀️" };
                      if (t.includes("indica")) return { bg: "bg-purple-500/10", icon: "🌙" };
                      return { bg: "bg-emerald-500/10", icon: "✨" };
                    };
                    const style = getTypeStyle(strain.type);
                    return (
                      <div
                        key={strain.strain_id}
                        className={`p-4 rounded-2xl ${style.bg} flex items-center gap-3`}
                      >
                        <span className="text-xl">{style.icon}</span>
                        <div className="flex-1 min-w-0" onClick={() => navigate(`/strain/${strain.strain_id}`)}>
                          <h3 className="font-medium truncate">{strain.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{strain.type || "Hybrid"}</p>
                        </div>
                        <button
                          onClick={() => removeCannabisFavorite(strain.strain_id, "strain")}
                          className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dispensaries */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Dispensaries ({cannabisFavorites.dispensaries?.length || 0})
              </h3>
              {cannabisFavorites.dispensaries?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No favorite spots yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cannabisFavorites.dispensaries?.map((d) => {
                    const flags = { US: "🇺🇸", NL: "🇳🇱", ES: "🇪🇸", BR: "🇧🇷", UY: "🇺🇾", DE: "🇩🇪", PT: "🇵🇹" };
                    return (
                      <div
                        key={d.shop_id}
                        className="p-4 rounded-2xl bg-muted/30 flex items-center gap-3"
                      >
                        <span className="text-xl">{flags[d.country] || "📍"}</span>
                        <div className="flex-1 min-w-0" onClick={() => navigate(`/dispensary/${d.shop_id}`)}>
                          <h3 className="font-medium truncate">{d.name}</h3>
                          <p className="text-xs text-muted-foreground">{d.city}, {d.country}</p>
                        </div>
                        <button
                          onClick={() => removeCannabisFavorite(d.shop_id, "dispensary")}
                          className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default FavoritesPage;
