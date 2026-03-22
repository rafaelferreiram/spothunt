import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Reviews from "@/components/Reviews";
import { toast } from "sonner";
import {
  ChevronLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Navigation,
  Car,
  Footprints,
  ExternalLink
} from "lucide-react";

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const fetchPlace = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/places/${id}?lat=${userLocation.lat}&lng=${userLocation.lng}`, { credentials: "include" });
        if (!res.ok) throw new Error("Not found");
        setPlace(await res.json());
      } catch (e) {
        console.error(e);
        toast.error("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id, userLocation]);

  const isSaved = user?.saved_places?.includes(id);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const endpoint = isSaved ? `${API}/user/save-place/${id}` : `${API}/user/save-place`;
      const res = await fetch(endpoint, {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: isSaved ? undefined : JSON.stringify({ place_id: id }),
      });
      if (!res.ok) throw new Error("Failed");
      setUser((prev) => ({
        ...prev,
        saved_places: isSaved
          ? prev.saved_places.filter((p) => p !== id)
          : [...(prev.saved_places || []), id],
      }));
      toast.success(isSaved ? "Removed" : "Saved!");
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: place.name, url: window.location.href });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    }
  };

  const formatDistance = (m) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1609.34).toFixed(1)}mi`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-64 bg-muted animate-pulse" />
        <div className="px-6 py-6 space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8" data-testid="place-detail-page">
      {/* Hero */}
      <div className="relative h-64">
        <img
          src={place.photos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        
        {/* Nav */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
            data-testid="back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center ${
                isSaved ? "bg-foreground text-background" : "bg-background/80"
              }`}
              data-testid="save-btn"
            >
              <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Match Badge */}
        {place.match_score >= 80 && (
          <Badge className="absolute bottom-4 left-4 bg-foreground text-background text-xs font-medium px-3 py-1">
            {place.match_score}% match
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="px-6 -mt-4 relative space-y-6">
        {/* Title */}
        <div>
          <h1 className="font-heading text-2xl font-semibold">{place.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {place.subcategories?.slice(0, 2).map((s) => s.replace(/_/g, " ")).join(" · ")}
          </p>
          
          <div className="flex items-center gap-3 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="font-medium">{place.rating}</span>
            </div>
            {place.price_level > 0 && (
              <span className="text-muted-foreground">
                {"$".repeat(place.price_level)}
                <span className="opacity-30">{"$".repeat(4 - place.price_level)}</span>
              </span>
            )}
            {place.is_open !== undefined && (
              <Badge variant={place.is_open ? "default" : "secondary"} className="text-xs h-5">
                {place.is_open ? "Open" : "Closed"}
              </Badge>
            )}
          </div>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-4 py-3 px-4 rounded-2xl bg-muted/30">
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{formatDistance(place.distance_m)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Footprints className="w-4 h-4" />
            <span>{place.walk_mins} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>{place.drive_mins} min</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            asChild
            className="h-12 rounded-2xl bg-foreground hover:bg-foreground/90 text-background"
            data-testid="google-maps-btn"
          >
            <a href={place.maps_deep_link} target="_blank" rel="noopener noreferrer">
              <Navigation className="w-4 h-4 mr-2" />
              Directions
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-2xl"
            data-testid="uber-btn"
          >
            <a href={place.uber_deep_link} target="_blank" rel="noopener noreferrer">
              <Car className="w-4 h-4 mr-2" />
              Uber
            </a>
          </Button>
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-muted-foreground leading-relaxed">{place.description}</p>
        )}

        {/* Tags */}
        {place.vibe_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {place.vibe_tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">
                #{tag.replace(/_/g, "")}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm">{place.address}</p>
              <p className="text-xs text-muted-foreground">{place.neighborhood}</p>
            </div>
          </div>
          
          {place.phone && (
            <a href={`tel:${place.phone}`} className="flex items-center gap-3 text-sm hover:text-foreground transition-colors">
              <Phone className="w-5 h-5 text-muted-foreground" />
              {place.phone}
            </a>
          )}
          
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-foreground transition-colors">
              <Globe className="w-5 h-5 text-muted-foreground" />
              Visit website
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Hours */}
        {place.hours && Object.keys(place.hours).length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Hours
            </h3>
            <div className="grid gap-1.5 text-sm">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                <div key={day} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{day.slice(0, 3)}</span>
                  <span>{place.hours[day] === "closed" ? "Closed" : place.hours[day] || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="pt-4 border-t border-border/30">
          <Reviews placeId={id} placeType="place" />
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
