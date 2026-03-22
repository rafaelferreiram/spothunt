import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  MapPin,
  Star,
  Navigation,
  Car,
  Phone,
  Globe,
  Clock,
  Share2,
  ExternalLink,
  Footprints
} from "lucide-react";

const DispensaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispensary, setDispensary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 40.7128, lng: -74.006 })
      );
    }
  }, []);

  useEffect(() => {
    const fetchDispensary = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (userLocation) {
          params.append("lat", userLocation.lat);
          params.append("lng", userLocation.lng);
        }
        
        const res = await fetch(`${API}/cannabis/dispensaries/${id}?${params}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setDispensary(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userLocation) {
      fetchDispensary();
    }
  }, [id, userLocation]);

  const getCountryFlag = (country) => {
    const flags = { US: "🇺🇸", NL: "🇳🇱", ES: "🇪🇸", CA: "🇨🇦", TH: "🇹🇭", DE: "🇩🇪", PT: "🇵🇹" };
    return flags[country] || "📍";
  };

  const getCountryName = (code) => {
    const names = { 
      US: "United States", 
      NL: "Netherlands", 
      ES: "Spain", 
      CA: "Canada", 
      TH: "Thailand", 
      DE: "Germany",
      PT: "Portugal"
    };
    return names[code] || code;
  };

  const formatDistance = (meters) => {
    if (!meters) return "";
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1609.34).toFixed(1)} mi`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: dispensary.name,
          text: `Check out ${dispensary.name} in ${dispensary.city}`,
          url: window.location.href,
        });
      } catch (err) {
        // Ignore
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" data-testid="dispensary-loading">
        <div className="h-48 bg-muted animate-pulse" />
        <div className="px-6 py-6 space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!dispensary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Dispensary not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8" data-testid="dispensary-detail">
      {/* Hero */}
      <div className="relative h-48 bg-gradient-to-br from-green-500 to-emerald-600">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
            data-testid="dispensary-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Flag */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-5xl">{getCountryFlag(dispensary.country)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 relative">
        {/* Main Card */}
        <div className="bg-card rounded-3xl p-6 shadow-lg border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-foreground">
                {dispensary.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {dispensary.city}, {dispensary.state || getCountryName(dispensary.country)}
              </p>
            </div>
            <Badge variant="outline" className="capitalize shrink-0">
              {dispensary.type || "Dispensary"}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            {dispensary.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{dispensary.rating.toFixed(1)}</span>
              </div>
            )}
            <Badge variant="secondary" className="rounded-full">
              {getCountryFlag(dispensary.country)} {getCountryName(dispensary.country)}
            </Badge>
          </div>

          {/* Distance */}
          {dispensary.distance_m && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl mt-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{formatDistance(dispensary.distance_m)}</span>
              </div>
              {dispensary.walk_mins && (
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{dispensary.walk_mins} min</span>
                </div>
              )}
              {dispensary.drive_mins && (
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{dispensary.drive_mins} min</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {dispensary.maps_deep_link && (
              <Button
                className="h-12 rounded-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open(dispensary.maps_deep_link, "_blank")}
                data-testid="dispensary-maps-btn"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Directions
              </Button>
            )}
            <Button
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => {
                const coords = dispensary.coordinates;
                if (coords) {
                  window.open(`uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${coords.lat}&dropoff[longitude]=${coords.lng}&dropoff[nickname]=${encodeURIComponent(dispensary.name)}`, "_blank");
                }
              }}
              data-testid="dispensary-uber-btn"
            >
              <Car className="w-4 h-4 mr-2" />
              Uber
            </Button>
          </div>
        </div>

        {/* Description */}
        {dispensary.description && (
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold mb-3">About</h3>
            <p className="text-muted-foreground leading-relaxed">
              {dispensary.description}
            </p>
          </div>
        )}

        {/* Address */}
        <div className="mt-6">
          <h3 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            Location
          </h3>
          <div className="p-4 rounded-2xl bg-muted/50">
            <p className="text-foreground">
              {dispensary.address && `${dispensary.address}, `}
              {dispensary.city}
              {dispensary.state && `, ${dispensary.state}`}
              {dispensary.postcode && ` ${dispensary.postcode}`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getCountryName(dispensary.country)}
            </p>
          </div>
        </div>

        {/* Legal Note */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Cannabis laws vary by location. Please verify local regulations before visiting.
            {dispensary.country === "ES" && " Spain cannabis clubs require membership."}
            {dispensary.country === "NL" && " Amsterdam coffeeshops are 18+ only, no hard drugs."}
            {dispensary.country === "TH" && " Thailand allows cannabis but prohibits public smoking."}
          </p>
        </div>

        {/* External Links */}
        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 rounded-full"
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(dispensary.name + " " + dispensary.city)}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Search on Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DispensaryDetail;
