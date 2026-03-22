import { useState } from "react";
import { useAuth } from "@/App";
import { API } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Star,
  Heart,
  MapPin,
  Footprints,
  Car,
  Navigation,
  Sparkles
} from "lucide-react";

const FeedCard = ({ place, onClick, savedPlaces = [], className = "" }) => {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const isSaved = savedPlaces.includes(place.id);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);

    try {
      const endpoint = isSaved
        ? `${API}/user/save-place/${place.id}`
        : `${API}/user/save-place`;

      const response = await fetch(endpoint, {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: isSaved ? undefined : JSON.stringify({ place_id: place.id }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setUser((prev) => ({
        ...prev,
        saved_places: isSaved
          ? prev.saved_places.filter((p) => p !== place.id)
          : [...(prev.saved_places || []), place.id],
      }));

      toast.success(isSaved ? "Removed from saved" : "Saved!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleMapsClick = (e) => {
    e.stopPropagation();
    window.open(place.maps_deep_link, "_blank");
  };

  const handleUberClick = (e) => {
    e.stopPropagation();
    window.open(place.uber_deep_link, "_blank");
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1609.34).toFixed(1)}mi`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      restaurant: "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400",
      bar: "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400",
      museum: "border-amber-600 bg-amber-600/10 text-amber-600 dark:text-amber-400",
      outdoors: "border-green-600 bg-green-600/10 text-green-600 dark:text-green-400",
      cafe: "border-amber-700 bg-amber-700/10 text-amber-700 dark:text-amber-400",
      attraction: "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400",
      market: "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    };
    return colors[category] || "border-primary bg-primary/10 text-primary";
  };

  return (
    <div
      onClick={onClick}
      className={`
        place-card relative rounded-3xl overflow-hidden bg-card border border-border/50 
        shadow-sm hover:shadow-xl cursor-pointer transition-all group
        ${className}
      `}
      data-testid={`place-card-${place.id}`}
    >
      {/* Hero Image */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={place.photos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="place-card-overlay absolute inset-0" />

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center
            transition-all backdrop-blur-sm
            ${isSaved 
              ? "bg-accent text-accent-foreground" 
              : "bg-white/20 text-white hover:bg-white/30"
            }
          `}
          data-testid={`save-card-btn-${place.id}`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
        </button>

        {/* Match Score Badge */}
        {place.match_score >= 85 && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold">
            <Sparkles className="w-3 h-3 mr-1" />
            {place.match_score}% match
          </Badge>
        )}

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge 
            variant="outline" 
            className={`rounded-full border-2 text-xs font-semibold capitalize backdrop-blur-sm ${getCategoryColor(place.category)}`}
          >
            {place.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Subcategories */}
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1">
            {place.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {place.subcategories?.slice(0, 2).map((s) => s.replace(/_/g, " ")).join(" · ")}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="font-semibold">{place.rating}</span>
            <span className="text-muted-foreground">
              ({place.review_count >= 1000 
                ? `${(place.review_count / 1000).toFixed(1)}k` 
                : place.review_count})
            </span>
          </div>
          
          {place.price_level > 0 && (
            <span className="text-muted-foreground">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={i < place.price_level ? "text-foreground" : "opacity-30"}
                >
                  $
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Distance Row */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{formatDistance(place.distance_m)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Footprints className="w-4 h-4" />
            <span>{place.walk_mins} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            <span>{place.drive_mins} min</span>
          </div>
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 italic">
            "{place.description.slice(0, 100)}..."
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMapsClick}
            className="flex-1 rounded-full"
            data-testid={`maps-btn-${place.id}`}
          >
            <Navigation className="w-4 h-4 mr-1" />
            Maps
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUberClick}
            className="flex-1 rounded-full"
            data-testid={`uber-btn-${place.id}`}
          >
            <Car className="w-4 h-4 mr-1" />
            Uber
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
