import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Star, Navigation, Car, MapPin, X } from "lucide-react";

// Fix for default marker icons in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon creator
const createCustomIcon = (category, isSelected = false) => {
  const colors = {
    restaurant: "#f97316",
    bar: "#8b5cf6",
    museum: "#d97706",
    outdoors: "#16a34a",
    cafe: "#b45309",
    attraction: "#0ea5e9",
    market: "#f43f5e",
    default: "#1a4d2e",
  };

  const emojis = {
    restaurant: "🍽️",
    bar: "🍸",
    museum: "🏛️",
    outdoors: "🌿",
    cafe: "☕",
    attraction: "🌆",
    market: "🛍️",
  };

  const color = colors[category] || colors.default;
  const emoji = emojis[category] || "📍";
  const size = isSelected ? 40 : 32;

  return L.divIcon({
    className: "custom-marker-wrapper",
    html: `
      <div style="
        background: white;
        border: 2px solid ${color};
        border-radius: 999px;
        padding: 4px 8px;
        font-size: ${isSelected ? "16px" : "14px"};
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transform: ${isSelected ? "scale(1.1)" : "scale(1)"};
        transition: transform 0.2s;
        white-space: nowrap;
      ">
        <span>${emoji}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// User location marker
const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #3b82f6;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Map component to handle view changes
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

const MapView = ({ places, userLocation, onPlaceClick }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const mapRef = useRef(null);

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1609.34).toFixed(1)}mi`;
  };

  return (
    <div className="relative w-full h-full" data-testid="map-view">
      <MapContainer
        ref={mapRef}
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={[userLocation.lat, userLocation.lng]} zoom={14} />

        {/* User location marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-semibold">You are here</p>
            </div>
          </Popup>
        </Marker>

        {/* Place markers */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.coordinates.lat, place.coordinates.lng]}
            icon={createCustomIcon(place.category, selectedPlace?.id === place.id)}
            eventHandlers={{
              click: () => handleMarkerClick(place),
            }}
          />
        ))}
      </MapContainer>

      {/* Bottom Sheet with Selected Place */}
      {selectedPlace && (
        <div className="absolute bottom-0 left-0 right-0 z-10 animate-slide-up">
          <div className="bg-card rounded-t-3xl shadow-2xl border-t border-border/50 p-4">
            {/* Handle */}
            <div className="flex justify-center mb-3">
              <div className="w-12 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              data-testid="close-map-card"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Place Card */}
            <div 
              className="flex gap-4 cursor-pointer"
              onClick={() => onPlaceClick(selectedPlace.id)}
              data-testid={`map-card-${selectedPlace.id}`}
            >
              <img
                src={selectedPlace.photos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200"}
                alt={selectedPlace.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-foreground line-clamp-1">
                  {selectedPlace.name}
                </h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedPlace.category}
                </p>
                
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                    <span className="font-medium">{selectedPlace.rating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {formatDistance(selectedPlace.distance_m)}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(selectedPlace.maps_deep_link, "_blank");
                    }}
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1" />
                    Directions
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(selectedPlace.uber_deep_link, "_blank");
                    }}
                  >
                    <Car className="w-3.5 h-3.5 mr-1" />
                    Uber
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Cards Carousel at Bottom (when no place selected) */}
      {!selectedPlace && places.length > 0 && (
        <div className="absolute bottom-4 left-0 right-0 z-10">
          <ScrollArea className="w-full">
            <div className="flex gap-3 px-4 pb-2">
              {places.slice(0, 8).map((place) => (
                <div
                  key={place.id}
                  onClick={() => handleMarkerClick(place)}
                  className="flex-shrink-0 w-48 bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  data-testid={`mini-card-${place.id}`}
                >
                  <img
                    src={place.photos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200"}
                    alt={place.name}
                    className="w-full h-20 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-1">{place.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <span>{place.rating}</span>
                      <span>•</span>
                      <span>{formatDistance(place.distance_m)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default MapView;
