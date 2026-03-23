import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API, useAuth } from "@/App";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
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
  ExternalLink,
  BookOpen,
  Plus,
  Calendar,
  Trash2,
  User
} from "lucide-react";

// Cannabis leaf SVG icon - Classic silhouette
const CannabisLeafIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2c0 0-1.5 2.5-1.5 5c0 1.2 0.3 2.4 0.7 3.5c-1.2-1.5-3.2-3.5-5.7-5c0 0 2 3.5 4.5 5.5c-2-0.5-4.5-0.5-7 0c0 0 4 1.5 7 1.5c-1.5 0.2-3.5 0.8-5 2c0 0 3-0.5 5.5-0.5c-0.3 0.3-0.5 0.8-0.5 1.5l0 7h2l0-7c0-0.7-0.2-1.2-0.5-1.5c2.5 0 5.5 0.5 5.5 0.5c-1.5-1.2-3.5-1.8-5-2c3 0 7-1.5 7-1.5c-2.5-0.5-5-0.5-7 0c2.5-2 4.5-5.5 4.5-5.5c-2.5 1.5-4.5 3.5-5.7 5c0.4-1.1 0.7-2.3 0.7-3.5c0-2.5-1.5-5-1.5-5z"/>
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
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "strains");
  const [viewMode, setViewMode] = useState("feed"); // "feed" or "list"
  const [strains, setStrains] = useState([]);
  const [dispensaries, setDispensaries] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalStats, setJournalStats] = useState(null);
  const [favorites, setFavorites] = useState({ strains: [], dispensaries: [] });
  const [favoriteIds, setFavoriteIds] = useState({ strains: new Set(), dispensaries: new Set() });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [stats, setStats] = useState(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    strain_name: "",
    strain_type: "hybrid",
    rating: 5,
    effects_felt: [],
    flavor_notes: "",
    notes: "",
    location: ""
  });

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

  const fetchJournal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/cannabis/journal`, { credentials: "include" });
      const data = await res.json();
      setJournalEntries(data.entries || []);
      
      // Also fetch stats
      const statsRes = await fetch(`${API}/cannabis/journal/stats`, { credentials: "include" });
      const statsData = await statsRes.json();
      setJournalStats(statsData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const handleAddJournalEntry = async () => {
    if (!newEntry.strain_name.trim()) {
      toast.error("Please enter a strain name");
      return;
    }
    
    try {
      const res = await fetch(`${API}/cannabis/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          strain_id: `custom_${Date.now()}`,
          strain_name: newEntry.strain_name,
          strain_type: newEntry.strain_type,
          rating: newEntry.rating,
          effects_felt: newEntry.effects_felt,
          flavor_notes: newEntry.flavor_notes,
          notes: newEntry.notes,
          location: newEntry.location
        })
      });
      
      if (!res.ok) throw new Error("Failed to save");
      
      toast.success("Journal entry saved!");
      setShowAddEntry(false);
      setNewEntry({
        strain_name: "",
        strain_type: "hybrid",
        rating: 5,
        effects_felt: [],
        flavor_notes: "",
        notes: "",
        location: ""
      });
      fetchJournal();
    } catch (e) {
      toast.error("Failed to save entry");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const res = await fetch(`${API}/cannabis/journal/${entryId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Failed to delete");
      
      toast.success("Entry deleted");
      fetchJournal();
    } catch (e) {
      toast.error("Failed to delete entry");
    }
  };

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/cannabis/favorites`, { credentials: "include" });
      const data = await res.json();
      setFavorites(data);
      
      // Create sets for quick lookup
      const strainIds = new Set(data.strains?.map(s => s.strain_id) || []);
      const dispensaryIds = new Set(data.dispensaries?.map(d => d.shop_id) || []);
      setFavoriteIds({ strains: strainIds, dispensaries: dispensaryIds });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const toggleFavorite = async (itemId, itemType, isFavorite) => {
    try {
      if (isFavorite) {
        await fetch(`${API}/cannabis/favorites/${itemId}?item_type=${itemType}`, {
          method: "DELETE",
          credentials: "include"
        });
        toast.success("Removed from favorites");
      } else {
        await fetch(`${API}/cannabis/favorites?item_id=${itemId}&item_type=${itemType}`, {
          method: "POST",
          credentials: "include"
        });
        toast.success("Added to favorites");
      }
      
      // Update local state
      if (itemType === "strain") {
        const newSet = new Set(favoriteIds.strains);
        isFavorite ? newSet.delete(itemId) : newSet.add(itemId);
        setFavoriteIds(prev => ({ ...prev, strains: newSet }));
      } else {
        const newSet = new Set(favoriteIds.dispensaries);
        isFavorite ? newSet.delete(itemId) : newSet.add(itemId);
        setFavoriteIds(prev => ({ ...prev, dispensaries: newSet }));
      }
      
      // Refresh favorites if on that tab
      if (activeTab === "favorites") fetchFavorites();
    } catch (e) {
      toast.error("Failed to update favorites");
    }
  };

  useEffect(() => {
    if (activeTab === "strains") fetchStrains();
    else if (activeTab === "dispensaries") fetchDispensaries();
    else if (activeTab === "journal") fetchJournal();
    else if (activeTab === "favorites") fetchFavorites();
  }, [activeTab, fetchStrains, fetchDispensaries, fetchJournal, fetchFavorites]);

  // Load favorites on mount for heart icons
  useEffect(() => {
    fetchFavorites();
  }, []);

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
            <div className="flex items-center gap-2">
              {/* Favorites Button */}
              <button
                onClick={() => setActiveTab("favorites")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  activeTab === "favorites" 
                    ? "bg-red-500/10 text-red-500" 
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
                data-testid="header-favorites-btn"
                title="My Favorites"
              >
                <Heart className={`w-4 h-4 ${activeTab === "favorites" ? "fill-current" : ""}`} />
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

              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CannabisLeafIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
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
            <div className="flex flex-1 gap-1">
              <button
                onClick={() => setActiveTab("strains")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "dispensaries" 
                    ? "bg-foreground text-background" 
                    : "bg-muted/50 text-muted-foreground"
                }`}
                data-testid="dispensaries-tab"
              >
                Spots
              </button>
              <button
                onClick={() => setActiveTab("journal")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  activeTab === "journal" 
                    ? "bg-foreground text-background" 
                    : "bg-muted/50 text-muted-foreground"
                }`}
                data-testid="journal-tab"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Journal
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  activeTab === "favorites" 
                    ? "bg-foreground text-background" 
                    : "bg-muted/50 text-muted-foreground"
                }`}
                data-testid="favorites-tab"
              >
                <Heart className="w-3.5 h-3.5" />
                Favs
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
        ) : activeTab === "dispensaries" ? (
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
        ) : activeTab === "journal" ? (
          /* Journal Tab Content */
          <div className="space-y-4">
            {/* Stats Row */}
            {journalStats && journalStats.total_entries > 0 && (
              <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-2xl">
                <div className="text-center">
                  <p className="text-2xl font-bold">{journalStats.total_entries}</p>
                  <p className="text-xs text-muted-foreground">Entries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{journalStats.unique_strains}</p>
                  <p className="text-xs text-muted-foreground">Strains</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {journalStats.average_rating}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            )}

            {/* Add Entry Button / Form */}
            {showAddEntry ? (
              <div className="p-4 bg-card rounded-2xl border border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">New Entry</h3>
                  <button onClick={() => setShowAddEntry(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                
                <Input
                  placeholder="Strain name"
                  value={newEntry.strain_name}
                  onChange={(e) => setNewEntry({ ...newEntry, strain_name: e.target.value })}
                  className="h-11 rounded-xl"
                />
                
                <div className="flex gap-2">
                  {["sativa", "indica", "hybrid"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewEntry({ ...newEntry, strain_type: type })}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                        newEntry.strain_type === type
                          ? "bg-foreground text-background"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewEntry({ ...newEntry, rating: star })}
                        className="p-1"
                      >
                        <Star className={`w-6 h-6 ${star <= newEntry.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Effects felt</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EFFECTS.map((effect) => (
                      <button
                        key={effect}
                        onClick={() => {
                          const effects = newEntry.effects_felt.includes(effect)
                            ? newEntry.effects_felt.filter(e => e !== effect)
                            : [...newEntry.effects_felt, effect];
                          setNewEntry({ ...newEntry, effects_felt: effects });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                          newEntry.effects_felt.includes(effect)
                            ? "bg-emerald-500/20 text-emerald-600"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {effect}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Textarea
                  placeholder="Notes (optional)"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="rounded-xl resize-none"
                  rows={3}
                />
                
                <Input
                  placeholder="Location (optional)"
                  value={newEntry.location}
                  onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
                  className="h-11 rounded-xl"
                />
                
                <Button onClick={handleAddJournalEntry} className="w-full h-11 rounded-xl">
                  Save Entry
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddEntry(true)}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground flex items-center justify-center gap-2 hover:border-foreground/30 hover:text-foreground transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Journal Entry
              </button>
            )}

            {/* Journal Entries */}
            {journalEntries.length === 0 && !showAddEntry ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No journal entries yet</p>
                <p className="text-sm mt-1">Start tracking your cannabis experiences</p>
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.map((entry) => (
                  <JournalEntryCard 
                    key={entry.entry_id} 
                    entry={entry} 
                    onDelete={() => handleDeleteEntry(entry.entry_id)} 
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "favorites" ? (
          /* Favorites Tab Content */
          <div className="space-y-6">
            {/* Favorite Strains */}
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

            {/* Favorite Dispensaries */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Favorite Spots ({favorites.dispensaries?.length || 0})
              </h3>
              {favorites.dispensaries?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
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

const StrainRow = ({ strain, onClick, isFavorite = false, onToggleFavorite }) => {
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
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

// Feed Card View for Dispensaries (consistent with FeedCard design)
const DispensaryFeedCard = ({ dispensary, onClick, formatDistance, isFavorite = false, onToggleFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const flags = { US: "🇺🇸", NL: "🇳🇱", ES: "🇪🇸", CA: "🇨🇦", TH: "🇹🇭", DE: "🇩🇪", PT: "🇵🇹", BR: "🇧🇷", UY: "🇺🇾", AT: "🇦🇹", CH: "🇨🇭", BE: "🇧🇪", IT: "🇮🇹", FR: "🇫🇷", GB: "🇬🇧", CZ: "🇨🇿", PL: "🇵🇱", GR: "🇬🇷" };
  
  // Fallback cannabis-related images
  const getFallbackImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=800&q=80", // Cannabis buds
      "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?w=800&q=80", // Dispensary products
      "https://images.unsplash.com/photo-1516709999172-b5ef73c6e7a8?w=800&q=80", // CBD oils
      "https://images.unsplash.com/photo-1457573557536-cb47d0a6eb49?w=800&q=80", // Nature/plants
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=80", // Green plants
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80", // Storefront
    ];
    // Use dispensary name for consistent image per card
    const hash = dispensary.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return images[hash % images.length];
  };

  // Get the best available image
  const getImageUrl = () => {
    // If image already errored, use fallback
    if (imageError) {
      return getFallbackImage();
    }
    // Use real Google photo if available
    if (dispensary.photos && dispensary.photos.length > 0 && dispensary.photos[0]) {
      return dispensary.photos[0];
    }
    // Use fallback
    return getFallbackImage();
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleMaps = (e) => {
    e.stopPropagation();
    if (dispensary.maps_deep_link) {
      window.open(dispensary.maps_deep_link, "_blank");
    } else {
      const { lat, lng } = dispensary.coordinates || {};
      if (lat && lng) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
      }
    }
  };

  // Check if using real Google photo
  const hasRealPhoto = dispensary.photos && dispensary.photos.length > 0 && dispensary.photos[0] && !imageError;

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
          src={getImageUrl()}
          alt={dispensary.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`
                w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md
                ${isFavorite 
                  ? "bg-white text-rose-500" 
                  : "bg-white/20 text-white hover:bg-white/30"}
              `}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        {/* Country Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-foreground flex items-center gap-1">
            <span>{flags[dispensary.country] || "📍"}</span>
            {dispensary.country}
          </span>
        </div>

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white text-lg leading-tight truncate">
            {dispensary.name}
          </h3>
          <p className="text-white/70 text-sm mt-0.5 truncate">
            {dispensary.city}{dispensary.state ? `, ${dispensary.state}` : ""}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mt-2 text-sm text-white/90">
            {dispensary.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{dispensary.rating.toFixed(1)}</span>
              </span>
            )}
            <span className="text-white/60">{dispensary.type || "Dispensary"}</span>
            {dispensary.distance_m && (
              <span className="text-white/60">
                {formatDistance(dispensary.distance_m)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border/30">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {dispensary.walk_mins && (
            <span className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5" />
              <span>{dispensary.walk_mins} min</span>
            </span>
          )}
          {dispensary.drive_mins && (
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" />
              <span>{dispensary.drive_mins} min</span>
            </span>
          )}
        </div>
        
        <button
          onClick={handleMaps}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-medium transition-colors hover:bg-foreground/90"
        >
          <Navigation className="w-3.5 h-3.5" />
          Directions
        </button>
      </div>
    </div>
  );
};

// List Row View for Dispensaries (original)
const DispensaryRow = ({ dispensary, onClick, formatDistance, isFavorite = false, onToggleFavorite }) => {
  const flags = { US: "🇺🇸", NL: "🇳🇱", ES: "🇪🇸", CA: "🇨🇦", TH: "🇹🇭", DE: "🇩🇪", PT: "🇵🇹", BR: "🇧🇷", UY: "🇺🇾" };
  
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
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

// Journal Entry Card
const JournalEntryCard = ({ entry, onDelete }) => {
  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return { bg: "bg-amber-500/10", text: "text-amber-600", icon: "☀️" };
    if (t.includes("indica")) return { bg: "bg-purple-500/10", text: "text-purple-600", icon: "🌙" };
    return { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: "✨" };
  };
  
  const style = getTypeStyle(entry.strain_type);
  const date = new Date(entry.date);
  
  return (
    <div className={`p-4 rounded-2xl ${style.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{style.icon}</span>
            <h3 className="font-medium text-foreground">{entry.strain_name}</h3>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs ${style.text} capitalize`}>{entry.strain_type || "Hybrid"}</span>
            <span className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < entry.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} 
                />
              ))}
            </span>
          </div>
          
          {entry.effects_felt?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.effects_felt.map((effect) => (
                <span key={effect} className="px-2 py-0.5 rounded-full bg-foreground/5 text-xs">
                  {effect}
                </span>
              ))}
            </div>
          )}
          
          {entry.notes && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{entry.notes}</p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date.toLocaleDateString()}
            </span>
            {entry.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {entry.location}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Cannabis;
