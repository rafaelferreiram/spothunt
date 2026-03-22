import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
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

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {} // Ignore errors, use default
      );
    }
  }, []);

  // Fetch place details
  useEffect(() => {
    const fetchPlace = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API}/places/${id}?lat=${userLocation.lat}&lng=${userLocation.lng}`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Place not found");
        const data = await response.json();
        setPlace(data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load place details");
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
      const endpoint = isSaved 
        ? `${API}/user/save-place/${id}`
        : `${API}/user/save-place`;
      
      const response = await fetch(endpoint, {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: isSaved ? undefined : JSON.stringify({ place_id: id }),
      });

      if (!response.ok) throw new Error("Failed to save place");

      // Update local user state
      setUser((prev) => ({
        ...prev,
        saved_places: isSaved
          ? prev.saved_places.filter((p) => p !== id)
          : [...(prev.saved_places || []), id],
      }));

      toast.success(isSaved ? "Removed from saved" : "Saved to your list");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save place");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: `Check out ${place.name} on CityBlend`,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1609.34).toFixed(1)} mi`;
  };

  const getPriceLevel = (level) => {
    return "$".repeat(level) + "$".repeat(4 - level).split("").map(() => "$").join("").slice(0, 4 - level).split("").map((_, i) => <span key={i} className="opacity-30">$</span>);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" data-testid="place-detail-loading">
        <div className="h-72 bg-muted animate-pulse" />
        <div className="px-6 py-6 space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Place not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8" data-testid="place-detail-page">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96">
        <img
          src={place.photos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        
        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm"
            data-testid="back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={saving}
              className={`w-10 h-10 rounded-full backdrop-blur-sm ${
                isSaved ? "bg-accent text-accent-foreground" : "bg-background/80"
              }`}
              data-testid="save-btn"
            >
              <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm"
              data-testid="share-btn"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Match Score Badge */}
        {place.match_score >= 80 && (
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-accent text-accent-foreground px-3 py-1 text-sm font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {place.match_score}% Match
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 relative">
        {/* Main Info Card */}
        <div className="bg-card rounded-3xl p-6 shadow-lg border border-border/50">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-2">
            {place.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="capitalize">{place.category}</span>
            {place.subcategories?.slice(0, 2).map((sub) => (
              <span key={sub}>• {sub.replace(/_/g, " ")}</span>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="font-semibold">{place.rating}</span>
              <span className="text-muted-foreground text-sm">
                ({place.review_count?.toLocaleString()})
              </span>
            </div>
            
            {place.price_level > 0 && (
              <div className="text-sm">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < place.price_level ? "text-foreground" : "text-muted-foreground/30"}
                  >
                    $
                  </span>
                ))}
              </div>
            )}
            
            {place.is_open !== undefined && (
              <Badge variant={place.is_open ? "default" : "secondary"} className="text-xs">
                {place.is_open ? "Open now" : "Closed"}
                {place.is_open && place.closes_at && ` • Closes ${place.closes_at}`}
              </Badge>
            )}
          </div>

          {/* Distance Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatDistance(place.distance_m)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{place.walk_mins} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{place.drive_mins} min</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              asChild
              className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              data-testid="google-maps-btn"
            >
              <a
                href={place.maps_deep_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Google Maps
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-14 rounded-2xl font-semibold"
              data-testid="uber-btn"
            >
              <a
                href={place.uber_deep_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Car className="w-5 h-5 mr-2" />
                Uber
              </a>
            </Button>
          </div>
        </div>

        {/* Why This Matches */}
        {place.match_score >= 70 && (
          <div className="mt-6 p-5 bg-accent/10 rounded-2xl border border-accent/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Why this matches you</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Based on your taste profile, this place aligns with your preferences.
            </p>
            <div className="match-bar h-2">
              <div
                className="match-bar-fill h-full"
                style={{ width: `${place.match_score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {place.match_score}% match
            </p>
          </div>
        )}

        {/* About */}
        {place.description && (
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold mb-3">About</h3>
            <p className="text-muted-foreground leading-relaxed">{place.description}</p>
          </div>
        )}

        {/* Tags */}
        {place.vibe_tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {place.vibe_tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full">
                #{tag.replace(/_/g, "")}
              </Badge>
            ))}
          </div>
        )}

        {/* Contact & Info */}
        <div className="mt-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold">Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-foreground">{place.address}</p>
                <p className="text-sm text-muted-foreground">{place.neighborhood}</p>
              </div>
            </div>
            
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"
              >
                <Phone className="w-5 h-5 text-muted-foreground" />
                {place.phone}
              </a>
            )}
            
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"
              >
                <Globe className="w-5 h-5 text-muted-foreground" />
                Visit website
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Hours */}
        {place.hours && Object.keys(place.hours).length > 0 && (
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Hours
            </h3>
            <div className="grid gap-2 text-sm">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                <div key={day} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{day}</span>
                  <span className="text-foreground">
                    {place.hours[day] === "closed" ? "Closed" : place.hours[day] || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Grid */}
        {place.photos?.length > 1 && (
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold mb-3">Photos</h3>
            <div className="grid grid-cols-2 gap-2">
              {place.photos.slice(0, 4).map((photo, index) => (
                <div
                  key={index}
                  className={`rounded-2xl overflow-hidden ${
                    index === 0 ? "col-span-2 aspect-video" : "aspect-square"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`${place.name} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;
