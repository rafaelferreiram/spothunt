import { useState } from "react";
import { useAuth } from "@/App";
import { API } from "@/App";
import { toast } from "sonner";
import { Star, Heart, MapPin, Footprints, Car, Navigation, Clock } from "lucide-react";

const FeedCard = ({ place, onClick, savedPlaces = [], className = "", style = {} }) => {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSaved = savedPlaces.includes(place.id);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const endpoint = isSaved ? `${API}/user/save-place/${place.id}` : `${API}/user/save-place`;
      const res = await fetch(endpoint, {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: isSaved ? undefined : JSON.stringify({ place_id: place.id }),
      });
      if (!res.ok) throw new Error("Failed");
      setUser((prev) => ({
        ...prev,
        saved_places: isSaved
          ? prev.saved_places.filter((p) => p !== place.id)
          : [...(prev.saved_places || []), place.id],
      }));
      toast.success(isSaved ? "Removed from saved" : "Saved!");
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleMaps = (e) => {
    e.stopPropagation();
    window.open(place.maps_deep_link, "_blank");
  };

  const formatDistance = (m) => {
    if (m < 1000) return `${Math.round(m)}m`;
    return `${(m / 1000).toFixed(1)}km`;
  };

  const priceDisplay = place.price_level > 0 ? "$".repeat(place.price_level) : "Free";

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] bg-card ${className}`}
      style={style}
      data-testid={`place-card-${place.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={place.photos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"}
          alt={place.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md
              ${isSaved 
                ? "bg-white text-rose-500" 
                : "bg-white/20 text-white hover:bg-white/30"}
            `}
            data-testid={`save-card-btn-${place.id}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Match Badge */}
        {place.match_score >= 85 && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-foreground">
              {place.match_score}% match
            </span>
          </div>
        )}

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-lg leading-tight truncate">
                {place.name}
              </h3>
              <p className="text-white/70 text-sm mt-0.5 truncate capitalize">
                {place.subcategories?.slice(0, 2).map((s) => s.replace(/_/g, " ")).join(" · ")}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mt-2.5 text-sm text-white/90">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{place.rating?.toFixed(1) || "—"}</span>
            </span>
            <span className="text-white/50">{priceDisplay}</span>
            <span className="flex items-center gap-1 text-white/70">
              <MapPin className="w-3.5 h-3.5" />
              {formatDistance(place.distance_m)}
            </span>
            {place.is_open !== undefined && (
              <span className={`flex items-center gap-1 ${place.is_open ? "text-emerald-400" : "text-white/50"}`}>
                <Clock className="w-3 h-3" />
                {place.is_open ? "Open" : "Closed"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border/30">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5" title="Walking time">
            <Footprints className="w-3.5 h-3.5" />
            <span className="font-medium">{place.walk_text || `${place.walk_mins} min`}</span>
          </span>
          <span className="flex items-center gap-1.5" title="Driving time">
            <Car className="w-3.5 h-3.5" />
            <span className="font-medium">{place.drive_text || `${place.drive_mins} min`}</span>
          </span>
        </div>
        
        <button
          onClick={handleMaps}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground/5 hover:bg-foreground/10 text-xs font-medium transition-colors"
          data-testid={`maps-btn-${place.id}`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </button>
      </div>
    </div>
  );
};

export default FeedCard;
