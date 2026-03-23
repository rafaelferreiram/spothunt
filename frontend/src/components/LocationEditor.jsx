import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Navigation, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { API } from "@/App";

const LocationEditor = ({ 
  currentLocation, 
  locationName, 
  onLocationChange,
  className = "" 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const searchCities = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API}/places/search-city?query=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results) {
            setSuggestions(data.results.slice(0, 5));
          } else if (data.lat && data.lng) {
            // Single result
            setSuggestions([{ 
              name: data.name || searchQuery, 
              lat: data.lat, 
              lng: data.lng,
              formatted: data.formatted_address || searchQuery
            }]);
          }
        }
      } catch (e) {
        console.error("City search error:", e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchCities, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          
          // Reverse geocode to get city name
          try {
            const res = await fetch(
              `${API}/places/reverse-geocode?lat=${latitude}&lng=${longitude}`
            );
            if (res.ok) {
              const data = await res.json();
              onLocationChange(
                { lat: latitude, lng: longitude },
                data.city || data.formatted_address || "Current Location"
              );
            } else {
              onLocationChange(
                { lat: latitude, lng: longitude },
                "Current Location"
              );
            }
          } catch (e) {
            onLocationChange(
              { lat: latitude, lng: longitude },
              "Current Location"
            );
          }
          
          setIsEditing(false);
          setSearchQuery("");
          setSuggestions([]);
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSelectLocation = (suggestion) => {
    onLocationChange(
      { lat: suggestion.lat, lng: suggestion.lng },
      suggestion.name || suggestion.formatted
    );
    setIsEditing(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`flex items-center gap-1.5 text-left group ${className}`}
      >
        <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="text-sm font-medium truncate max-w-[180px] group-hover:text-foreground transition-colors">
          {locationName || "Set location"}
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search city or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-xl text-sm"
          />
          {(searchQuery || loading) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setSearchQuery("");
            setSuggestions([]);
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {(suggestions.length > 0 || isEditing) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {/* Use Current Location */}
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Use current location</p>
              <p className="text-xs text-muted-foreground">GPS</p>
            </div>
          </button>

          {/* Search Results */}
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectLocation(suggestion)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{suggestion.name}</p>
                {suggestion.formatted && suggestion.formatted !== suggestion.name && (
                  <p className="text-xs text-muted-foreground truncate">{suggestion.formatted}</p>
                )}
              </div>
            </button>
          ))}

          {searchQuery.length >= 2 && suggestions.length === 0 && !loading && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationEditor;
