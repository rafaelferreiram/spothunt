import { useState } from "react";
import { useAuth, useAppLocation } from "@/App";
import { API } from "@/App";
import { toast } from "sonner";
import NavigationDrawer from "./NavigationDrawer";
import { 
  Star, 
  Heart, 
  MapPin, 
  Clock,
  NavigationArrow
} from "@phosphor-icons/react";

const FeedCard = ({ place, onClick, savedPlaces = [], className = "", style = {} }) => {
  const { user, setUser } = useAuth();
  const { userLocation } = useAppLocation();
  const [saving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
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

  const formatDistance = (m) => {
    if (!m) return "";
    if (m < 1000) return `${Math.round(m)}m`;
    return `${(m / 1000).toFixed(1)}km`;
  };

  const formatTime = (mins) => {
    if (!mins) return "";
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const priceDisplay = place.price_level > 0 ? "$".repeat(place.price_level) : "";

  // Fallback image
  const getImageUrl = () => {
    if (imageError) {
      return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80";
    }
    return place.photos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80";
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.98] bg-zinc-900 border border-white/5 shadow-xl ${className}`}
      style={style}
      data-testid={`place-card-${place.id}`}
    >
      {/* Image Container - Taller for better visual impact */}
      <div className="relative aspect-[16/10] overflow-hidden" onClick={onClick}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        )}
        <img
          src={getImageUrl()}
          alt={place.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Gradient Overlay - More dramatic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-xl
              ${isSaved 
                ? "bg-white text-rose-500 shadow-lg shadow-rose-500/30" 
                : "bg-black/40 text-white hover:bg-black/60 border border-white/10"}
            `}
            data-testid={`save-card-btn-${place.id}`}
          >
            <Heart weight={isSaved ? "fill" : "regular"} className="w-5 h-5" />
          </button>
        </div>

        {/* Match Badge - Neon style */}
        {place.match_score >= 85 && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-xs font-bold text-white shadow-lg shadow-primary/40">
              {place.match_score}% match
            </span>
          </div>
        )}

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-xl leading-tight truncate tracking-tight">
                {place.name}
              </h3>
              <p className="text-white/60 text-sm mt-1 truncate capitalize">
                {place.subcategories?.slice(0, 2).map((s) => s.replace(/_/g, " ")).join(" · ") || place.category}
              </p>
            </div>
          </div>

          {/* Stats Row - More info */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
            {place.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star weight="fill" className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white text-sm">{place.rating?.toFixed(1)}</span>
                {place.review_count > 0 && (
                  <span className="text-white/40 text-xs">({place.review_count})</span>
                )}
              </span>
            )}
            {priceDisplay && (
              <span className="text-emerald-400 font-medium text-sm">{priceDisplay}</span>
            )}
            {place.distance_m && (
              <span className="flex items-center gap-1 text-white/60 text-sm">
                <MapPin weight="fill" className="w-3.5 h-3.5" />
                {formatDistance(place.distance_m)}
              </span>
            )}
            {place.is_open !== undefined && (
              <span className={`flex items-center gap-1 text-sm font-medium ${place.is_open ? "text-emerald-400" : "text-zinc-500"}`}>
                <div className={`w-2 h-2 rounded-full ${place.is_open ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                {place.is_open ? "Open" : "Closed"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Glass morphism */}
      <div className="flex items-center justify-between px-5 py-4 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-5 text-sm text-zinc-400">
          {place.walk_mins && (
            <span className="flex items-center gap-2" title="Walking time">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="2"/>
                <path d="M10 22V13m0-3V7l4 5m0 0-2 10m2-10 2-3"/>
              </svg>
              <span className="font-medium">{formatTime(place.walk_mins)}</span>
            </span>
          )}
          {place.drive_mins && (
            <span className="flex items-center gap-2" title="Driving time">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/>
                <path d="M3 17h2m14 0h2M5 17H3V6l3-3h12l3 3v11h-2m-14 0h10"/>
              </svg>
              <span className="font-medium">{formatTime(place.drive_mins)}</span>
            </span>
          )}
        </div>
        
        {/* Navigation Drawer Button */}
        <NavigationDrawer
          place={place}
          userLocation={userLocation}
          trigger={
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-primary/30"
              data-testid={`directions-btn-${place.id}`}
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

export default FeedCard;
