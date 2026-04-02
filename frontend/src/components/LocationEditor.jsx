import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { API } from "@/App";
import { 
  MagnifyingGlass, 
  X, 
  Crosshair, 
  MapPin, 
  CircleNotch,
  NavigationArrow
} from "@phosphor-icons/react";

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
  const [gettingLocation, setGettingLocation] = useState(false);
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
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }
    setGettingLocation(true);
    
    // High accuracy GPS settings
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log(`GPS: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
        
        try {
          const res = await fetch(`${API}/places/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const locationText = data.neighborhood 
              ? `${data.neighborhood}, ${data.city}`
              : data.city || "Current Location";
            onLocationChange({ lat: latitude, lng: longitude }, locationText);
          } else {
            onLocationChange({ lat: latitude, lng: longitude }, "Current Location");
          }
        } catch (e) {
          onLocationChange({ lat: latitude, lng: longitude }, "Current Location");
        }
        setIsEditing(false);
        setSearchQuery("");
        setSuggestions([]);
        setGettingLocation(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setGettingLocation(false);
        alert("Unable to get location. Enable location permissions.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSelectLocation = (suggestion) => {
    onLocationChange({ lat: suggestion.lat, lng: suggestion.lng }, suggestion.name || suggestion.formatted);
    setIsEditing(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)} 
        className={`flex items-center gap-2 text-left group ${className}`}
        data-testid="location-editor-btn"
      >
        <span className="text-sm font-semibold truncate max-w-[200px] group-hover:text-primary transition-colors">
          {locationName || "Set location"}
        </span>
        <NavigationArrow weight="bold" className="w-3.5 h-3.5 text-zinc-500 group-hover:text-primary transition-colors rotate-45" />
      </button>
    );
  }

  return (
    <div className="relative z-50">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            ref={inputRef} 
            type="text" 
            placeholder="Search city or address..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-10 pr-10 h-11 rounded-xl text-sm bg-zinc-800/80 border-zinc-700/50 placeholder:text-zinc-500" 
          />
          {(searchQuery || loading) && (
            <button onClick={() => { setSearchQuery(""); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? <CircleNotch className="w-4 h-4 text-zinc-500 animate-spin" /> : <X className="w-4 h-4 text-zinc-500" />}
            </button>
          )}
        </div>
        <button onClick={() => { setIsEditing(false); setSearchQuery(""); setSuggestions([]); }} className="text-sm font-medium text-zinc-400 hover:text-white">
          Cancel
        </button>
      </div>

      {(suggestions.length > 0 || isEditing) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Use Precise GPS Location */}
          <button 
            onClick={handleUseCurrentLocation} 
            disabled={gettingLocation} 
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-800/80 transition-colors border-b border-zinc-800"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gettingLocation ? 'bg-primary/20' : 'bg-blue-500/10'}`}>
              {gettingLocation ? <CircleNotch className="w-5 h-5 text-primary animate-spin" /> : <Crosshair className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-white">{gettingLocation ? "Getting precise location..." : "Use precise location"}</p>
              <p className="text-xs text-zinc-500">High accuracy GPS</p>
            </div>
          </button>

          {suggestions.map((suggestion, index) => (
            <button 
              key={index} 
              onClick={() => handleSelectLocation(suggestion)} 
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-800/80 transition-colors border-b border-zinc-800 last:border-b-0"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                <MapPin weight="fill" className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{suggestion.name}</p>
                {suggestion.formatted && suggestion.formatted !== suggestion.name && (
                  <p className="text-xs text-zinc-500 truncate">{suggestion.formatted}</p>
                )}
              </div>
            </button>
          ))}

          {searchQuery.length >= 2 && suggestions.length === 0 && !loading && (
            <div className="px-4 py-4 text-sm text-zinc-500 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationEditor;
