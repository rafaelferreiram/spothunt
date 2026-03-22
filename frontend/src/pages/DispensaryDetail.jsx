import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Reviews from "@/components/Reviews";
import {
  ChevronLeft,
  MapPin,
  Star,
  Navigation,
  Car,
  Share2,
  Footprints,
  ExternalLink
} from "lucide-react";

const DispensaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispensary, setDispensary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

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
      if (!userLocation) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ lat: userLocation.lat, lng: userLocation.lng });
        const res = await fetch(`${API}/cannabis/dispensaries/${id}?${params}`);
        if (!res.ok) throw new Error("Not found");
        setDispensary(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDispensary();
  }, [id, userLocation]);

  const flags = { US: "🇺🇸", NL: "🇳🇱", ES: "🇪🇸", CA: "🇨🇦", TH: "🇹🇭", DE: "🇩🇪", PT: "🇵🇹" };
  const countryNames = { US: "United States", NL: "Netherlands", ES: "Spain", CA: "Canada", TH: "Thailand", DE: "Germany", PT: "Portugal" };
  
  const formatDistance = (m) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1609.34).toFixed(1)}mi`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: dispensary.name, url: window.location.href });
      } catch (e) {}
    }
  };

  if (loading || !userLocation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-48 bg-gradient-to-br from-emerald-500/20 to-green-600/20 animate-pulse" />
        <div className="px-6 py-6 space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!dispensary) {
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
    <div className="min-h-screen bg-background pb-8" data-testid="dispensary-detail">
      {/* Hero */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-500/30 to-green-600/30">
        {/* Nav */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
            data-testid="dispensary-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Flag */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl">{flags[dispensary.country] || "📍"}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4 relative space-y-6">
        {/* Title */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/30">
          <h1 className="font-heading text-xl font-semibold">{dispensary.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {dispensary.city}, {dispensary.state || countryNames[dispensary.country]}
          </p>
          
          <div className="flex items-center gap-3 mt-3 text-sm">
            {dispensary.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-medium">{dispensary.rating.toFixed(1)}</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {dispensary.type || "Dispensary"}
            </Badge>
          </div>

          {/* Distance */}
          {dispensary.distance_m && (
            <div className="flex items-center gap-4 mt-4 py-3 px-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{formatDistance(dispensary.distance_m)}</span>
              </div>
              {dispensary.walk_mins && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Footprints className="w-4 h-4" />
                  <span>{dispensary.walk_mins} min</span>
                </div>
              )}
              {dispensary.drive_mins && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Car className="w-4 h-4" />
                  <span>{dispensary.drive_mins} min</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {dispensary.maps_deep_link && (
              <Button
                className="h-11 rounded-xl bg-foreground hover:bg-foreground/90 text-background"
                onClick={() => window.open(dispensary.maps_deep_link, "_blank")}
                data-testid="dispensary-maps-btn"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Directions
              </Button>
            )}
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => {
                const c = dispensary.coordinates;
                if (c) window.open(`uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${c.lat}&dropoff[longitude]=${c.lng}`, "_blank");
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
          <p className="text-muted-foreground leading-relaxed">{dispensary.description}</p>
        )}

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm">
              {dispensary.address && `${dispensary.address}, `}
              {dispensary.city}
              {dispensary.state && `, ${dispensary.state}`}
              {dispensary.postcode && ` ${dispensary.postcode}`}
            </p>
            <p className="text-xs text-muted-foreground">{countryNames[dispensary.country]}</p>
          </div>
        </div>

        {/* Legal Note */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            ⚠️ Cannabis laws vary. Verify local regulations.
            {dispensary.country === "ES" && " Spain clubs require membership."}
            {dispensary.country === "NL" && " 18+ only."}
            {dispensary.country === "TH" && " No public smoking."}
          </p>
        </div>

        {/* External Link */}
        <Button
          variant="outline"
          className="w-full h-11 rounded-xl"
          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(dispensary.name + " " + dispensary.city)}`, "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Search on Google
        </Button>

        {/* Reviews */}
        <div className="pt-4 border-t border-border/30">
          <Reviews placeId={id} placeType="dispensary" />
        </div>
      </div>
    </div>
  );
};

export default DispensaryDetail;
