import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import {
  X,
  Heart,
  Star,
  MapPin,
  Footprints,
  Car,
  RotateCcw,
  Sparkles,
  UtensilsCrossed,
  Beer,
  Coffee,
  Landmark,
  Mountain,
  Info,
  Flame,
  Zap
} from "lucide-react";

// Cannabis leaf icon
const CannabisIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C12 2 9 7 12 12C15 7 12 2 12 2Z" />
    <path d="M12 12C9.5 8 6 6 6 6C8 10 12 12 12 12Z" />
    <path d="M12 12C14.5 8 18 6 18 6C16 10 12 12 12 12Z" />
    <path d="M12 12C7 9 2 10 2 10C5 11 9 11 12 12Z" />
    <path d="M12 12C17 9 22 10 22 10C19 11 15 11 12 12Z" />
  </svg>
);

const VIBE_FILTERS = [
  { id: "all", name: "Anything", icon: Sparkles, color: "from-violet-500 to-purple-500" },
  { id: "restaurant", name: "Food", icon: UtensilsCrossed, color: "from-orange-500 to-red-500" },
  { id: "bar", name: "Drinks", icon: Beer, color: "from-amber-500 to-yellow-500" },
  { id: "cafe", name: "Coffee", icon: Coffee, color: "from-amber-700 to-orange-600" },
  { id: "museum", name: "Culture", icon: Landmark, color: "from-blue-500 to-indigo-500" },
  { id: "outdoors", name: "Nature", icon: Mountain, color: "from-green-500 to-emerald-500" },
  { id: "dispensary", name: "Weeds", icon: CannabisIcon, color: "from-green-600 to-lime-500" },
];

// Swipeable Card Component
const SwipeCard = ({ place, onSwipe, onInfo, active }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const formatDistance = (m) => {
    if (!m) return "";
    if (m < 1000) return `${Math.round(m)}m`;
    return `${(m / 1000).toFixed(1)}km`;
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ x, rotate, zIndex: active ? 10 : 0 }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) {
          onSwipe("right");
        } else if (info.offset.x < -100) {
          onSwipe("left");
        }
      }}
      animate={{ scale: active ? 1 : 0.95, y: active ? 0 : 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card cursor-grab active:cursor-grabbing">
        {/* Image */}
        <img
          src={place.photos?.[0] || `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800`}
          alt={place.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

        {/* LIKE indicator */}
        <motion.div
          className="absolute top-1/3 right-8 px-6 py-2 rounded-lg border-4 border-green-500 rotate-12 pointer-events-none"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-green-500 font-bold text-3xl">LIKE</span>
        </motion.div>

        {/* NOPE indicator */}
        <motion.div
          className="absolute top-1/3 left-8 px-6 py-2 rounded-lg border-4 border-red-500 -rotate-12 pointer-events-none"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-red-500 font-bold text-3xl">NOPE</span>
        </motion.div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <Badge className="bg-white/90 text-foreground backdrop-blur-sm px-3 py-1">
            {formatDistance(place.distance_m)} away
          </Badge>
          {place.match_score >= 80 && (
            <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1">
              {place.match_score}% match
            </Badge>
          )}
        </div>

        {/* Info Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfo(place);
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <h2 className="font-bold text-2xl text-white mb-1 line-clamp-2">
            {place.name}
          </h2>
          <p className="text-white/70 text-sm mb-3 capitalize line-clamp-1">
            {place.subcategories?.slice(0, 2).join(" · ") || place.type || place.category}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-white/90">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{place.rating?.toFixed(1) || "—"}</span>
            </span>
            {place.walk_mins && (
              <span className="flex items-center gap-1">
                <Footprints className="w-4 h-4" />
                {place.walk_mins} min
              </span>
            )}
            {place.drive_mins && (
              <span className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                {place.drive_mins} min
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ShufflePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVibe, setActiveVibe] = useState("all");
  const [userLocation, setUserLocation] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 40.7128, lng: -74.0060 }),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  }, []);

  // Fetch places based on vibe filter
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!userLocation) return;
      setLoading(true);

      try {
        let allPlaces = [];

        if (activeVibe === "dispensary") {
          const res = await fetch(
            `${API}/cannabis/dispensaries?lat=${userLocation.lat}&lng=${userLocation.lng}&limit=30&max_distance=30000`
          );
          const data = await res.json();
          allPlaces = (data.dispensaries || []).map(d => ({
            ...d,
            id: d.shop_id,
            category: "dispensary",
            photos: [d.image || `https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=800`],
          }));
        } else {
          const params = new URLSearchParams({
            lat: userLocation.lat.toString(),
            lng: userLocation.lng.toString(),
            use_google: "true",
            max_distance: "10000",
          });
          if (activeVibe !== "all") params.append("category", activeVibe);

          const res = await fetch(`${API}/places/?${params}`, { credentials: "include" });
          const data = await res.json();
          allPlaces = data.places || [];
        }

        // Shuffle the array
        const shuffled = allPlaces.sort(() => Math.random() - 0.5);
        setPlaces(shuffled);
        setCurrentIndex(0);
      } catch (e) {
        console.error("Error fetching places:", e);
        toast.error("Failed to load places");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [userLocation, activeVibe]);

  const handleSwipe = async (direction) => {
    const place = places[currentIndex];
    if (!place) return;

    if (direction === "right") {
      try {
        await fetch(`${API}/user/save-place`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ place_id: place.id }),
        });
        setUser(prev => ({
          ...prev,
          saved_places: [...(prev?.saved_places || []), place.id],
        }));
        toast.success(`Saved ${place.name}!`, { duration: 1500 });
      } catch (e) {
        // Silent fail
      }
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleInfo = (place) => {
    if (place.category === "dispensary") {
      navigate(`/dispensary/${place.shop_id || place.id}`);
    } else {
      navigate(`/place/${place.id}`);
    }
  };

  const resetCards = () => {
    const shuffled = [...places].sort(() => Math.random() - 0.5);
    setPlaces(shuffled);
    setCurrentIndex(0);
  };

  const currentPlace = places[currentIndex];
  const nextPlace = places[currentIndex + 1];
  const hasMore = currentIndex < places.length;

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="shuffle-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Shuffle</h1>
                <p className="text-xs text-muted-foreground">Swipe to discover</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetCards}
              className="rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Vibe Filters */}
          <ScrollArea className="w-full -mx-4 px-4">
            <div className="flex gap-2 pb-1">
              {VIBE_FILTERS.map((vibe) => {
                const Icon = vibe.icon;
                const isActive = activeVibe === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => {
                      setActiveVibe(vibe.id);
                      setCurrentIndex(0);
                    }}
                    className={`
                      flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                      ${isActive 
                        ? `bg-gradient-to-r ${vibe.color} text-white shadow-lg` 
                        : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}
                    `}
                    data-testid={`vibe-${vibe.id}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {vibe.name}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </header>

      {/* Card Stack */}
      <main className="relative px-4 pt-6">
        <div className="relative h-[55vh] max-h-[480px] w-full max-w-sm mx-auto">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Flame className="w-12 h-12 text-pink-500 animate-pulse mx-auto mb-3" />
                <p className="text-muted-foreground">Finding places...</p>
              </div>
            </div>
          ) : !hasMore ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">That's all!</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You've seen all nearby spots
                </p>
                <Button onClick={resetCards} className="rounded-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Shuffle Again
                </Button>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {nextPlace && (
                <SwipeCard
                  key={nextPlace.id + "-next"}
                  place={nextPlace}
                  onSwipe={() => {}}
                  onInfo={handleInfo}
                  active={false}
                />
              )}
              {currentPlace && (
                <SwipeCard
                  key={currentPlace.id}
                  place={currentPlace}
                  onSwipe={handleSwipe}
                  onInfo={handleInfo}
                  active={true}
                />
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Action Buttons */}
        {hasMore && !loading && (
          <>
            <div className="flex justify-center gap-6 mt-8">
              <button
                onClick={() => handleSwipe("left")}
                className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center border border-border/50 hover:scale-110 active:scale-95 transition-transform"
                data-testid="swipe-left-btn"
              >
                <X className="w-8 h-8 text-red-500" />
              </button>
              <button
                onClick={() => handleSwipe("right")}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                data-testid="swipe-right-btn"
              >
                <Heart className="w-8 h-8 text-white" />
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Swipe right to save • Left to skip
            </p>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ShufflePage;
