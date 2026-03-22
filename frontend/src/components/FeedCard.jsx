import { useState } from "react";
import { useAuth } from "@/App";
import { API } from "@/App";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Star, Heart, MapPin, Footprints, Car, Navigation } from "lucide-react";

const FeedCard = ({ place, onClick, savedPlaces = [], className = "" }) => {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
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
      toast.success(isSaved ? "Removed" : "Saved!");
    } catch (e) {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleMaps = (e) => {
    e.stopPropagation();
    window.open(place.maps_deep_link, "_blank");
  };

  const formatDistance = (m) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1609.34).toFixed(1)}mi`;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.98] ${className}`}
      data-testid={`place-card-${place.id}`}
    >
      {/* Image */}
      <div className="relative h-48">
        <img
          src={place.photos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all
            ${isSaved ? "bg-white text-foreground" : "bg-black/30 backdrop-blur-sm text-white"}
          `}
          data-testid={`save-card-btn-${place.id}`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-current text-rose-500" : ""}`} />
        </button>

        {/* Match Score */}
        {place.match_score >= 85 && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-foreground text-xs font-medium backdrop-blur-sm">
            {place.match_score}%
          </Badge>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-lg leading-tight">{place.name}</h3>
          <p className="text-sm text-white/80 mt-0.5 capitalize">
            {place.subcategories?.slice(0, 2).map((s) => s.replace(/_/g, " ")).join(" · ")}
          </p>
          
          <div className="flex items-center gap-3 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{place.rating}</span>
            </div>
            <span className="text-white/60">
              {place.price_level > 0 && "$".repeat(place.price_level)}
            </span>
            <div className="flex items-center gap-1 text-white/70">
              <MapPin className="w-3.5 h-3.5" />
              <span>{formatDistance(place.distance_m)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between p-3 bg-card border-t border-border/30">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5" />
            {place.walk_mins}min
          </span>
          <span className="flex items-center gap-1">
            <Car className="w-3.5 h-3.5" />
            {place.drive_mins}min
          </span>
        </div>
        
        <button
          onClick={handleMaps}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs font-medium hover:bg-muted transition-colors"
          data-testid={`maps-btn-${place.id}`}
        >
          <Navigation className="w-3 h-3" />
          Go
        </button>
      </div>
    </div>
  );
};

export default FeedCard;
