import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import FeedCard from "@/components/FeedCard";
import { ChevronLeft, Heart, MapPin } from "lucide-react";

const SavedPlaces = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
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
        () => {}
      );
    }
  }, []);

  // Fetch saved places
  useEffect(() => {
    const fetchSavedPlaces = async () => {
      if (!user?.saved_places?.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch all places and filter by saved IDs
        const response = await fetch(
          `${API}/places/?lat=${userLocation.lat}&lng=${userLocation.lng}`,
          { credentials: "include" }
        );
        
        if (!response.ok) throw new Error("Failed to fetch places");
        
        const data = await response.json();
        const savedPlaces = data.places.filter((p) =>
          user.saved_places.includes(p.id)
        );
        setPlaces(savedPlaces);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPlaces();
  }, [user?.saved_places, userLocation]);

  const handlePlaceClick = (placeId) => {
    navigate(`/place/${placeId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="saved-places-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground"
            data-testid="saved-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="font-heading text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            Saved Places
          </h1>
          
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-semibold mb-2">No saved places yet</h2>
            <p className="text-muted-foreground mb-6">
              Tap the heart icon on any place to save it here
            </p>
            <Button
              onClick={() => navigate("/home")}
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
              data-testid="explore-btn"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Explore Places
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {places.length} saved {places.length === 1 ? "place" : "places"}
            </p>
            {places.map((place, index) => (
              <FeedCard
                key={place.id}
                place={place}
                onClick={() => handlePlaceClick(place.id)}
                savedPlaces={user?.saved_places || []}
                className={`animate-fade-in stagger-${Math.min(index + 1, 5)}`}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default SavedPlaces;
