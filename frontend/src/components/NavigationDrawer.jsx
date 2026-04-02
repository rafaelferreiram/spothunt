import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { 
  NavigationArrow, 
  MapPin, 
  Car, 
  PersonSimpleWalk,
  X 
} from "@phosphor-icons/react";

// Navigation app icons as SVG
const GoogleMapsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="#4285F4" d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 6.25 12.75 7.88 14.72.38.46 1.06.46 1.44 0C14.45 21.25 20.5 13.75 20.5 8.5 20.5 3.81 16.69 0 12 0z"/>
    <circle fill="#EA4335" cx="12" cy="8.5" r="3.5"/>
  </svg>
);

const WazeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="#33CCFF" d="M12 2C6.48 2 2 6.48 2 12c0 2.05.62 3.95 1.68 5.53L2 22l4.47-1.68A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-3 9a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zm2 3c-.83 1.47-2.5 2.5-5 2.5s-4.17-1.03-5-2.5h10z"/>
  </svg>
);

const AppleMapsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <rect fill="#52C41A" rx="5" width="24" height="24"/>
    <path fill="white" d="M12 5l-7 9h4.5v5h5v-5H19l-7-9z"/>
  </svg>
);

const NavigationDrawer = ({ 
  place, 
  userLocation,
  trigger,
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  
  if (!place || !place.coordinates) return null;
  
  const { lat, lng } = place.coordinates;
  const placeName = encodeURIComponent(place.name || "Destination");
  
  // Calculate distance and time if user location available
  const getDistanceInfo = () => {
    if (!userLocation) return null;
    
    const R = 6371e3; // Earth radius in meters
    const φ1 = userLocation.lat * Math.PI / 180;
    const φ2 = lat * Math.PI / 180;
    const Δφ = (lat - userLocation.lat) * Math.PI / 180;
    const Δλ = (lng - userLocation.lng) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    const walkTime = Math.round(distance / 83.33); // 5 km/h
    const driveTime = Math.round(distance / 500); // 30 km/h with traffic
    
    return {
      distance: distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`,
      walkTime: walkTime < 60 ? `${walkTime} min` : `${Math.round(walkTime/60)}h ${walkTime%60}min`,
      driveTime: driveTime < 60 ? `${driveTime} min` : `${Math.round(driveTime/60)}h ${driveTime%60}min`
    };
  };
  
  const distanceInfo = getDistanceInfo();
  
  // Deep links for navigation apps
  const navigationLinks = {
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${place.google_place_id || ""}&travelmode=driving`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes&z=10`,
    appleMaps: `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&t=m`,
    // Fallback for web
    appleMapsWeb: `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
  };
  
  const handleOpenNavigation = (app) => {
    let url;
    switch (app) {
      case 'google':
        url = navigationLinks.googleMaps;
        break;
      case 'waze':
        url = navigationLinks.waze;
        break;
      case 'apple':
        // Try native first, fallback to web
        url = /iPhone|iPad|iPod/.test(navigator.userAgent) 
          ? navigationLinks.appleMaps 
          : navigationLinks.appleMapsWeb;
        break;
      default:
        url = navigationLinks.googleMaps;
    }
    window.open(url, '_blank');
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button 
            className={`bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 py-3 gap-2 shadow-lg shadow-primary/25 ${className}`}
            data-testid="get-directions-btn"
          >
            <NavigationArrow weight="fill" className="w-5 h-5" />
            Get Directions
          </Button>
        )}
      </DrawerTrigger>
      
      <DrawerContent className="bg-zinc-900 border-zinc-800 rounded-t-3xl">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-700 mt-4" />
        
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-xl font-bold text-white text-center">
            Navigate to {place.name}
          </DrawerTitle>
          
          {/* Distance Info */}
          {distanceInfo && (
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin weight="fill" className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{distanceInfo.distance}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <PersonSimpleWalk weight="fill" className="w-4 h-4 text-amber-400" />
                <span className="text-sm">{distanceInfo.walkTime}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Car weight="fill" className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{distanceInfo.driveTime}</span>
              </div>
            </div>
          )}
        </DrawerHeader>
        
        <div className="p-6 space-y-3">
          {/* Google Maps */}
          <button
            onClick={() => handleOpenNavigation('google')}
            className="w-full flex items-center gap-4 p-4 bg-zinc-800/80 hover:bg-zinc-800 rounded-2xl transition-all active:scale-[0.98] border border-zinc-700/50"
            data-testid="btn-google-directions"
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
              <GoogleMapsIcon />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-white">Google Maps</p>
              <p className="text-sm text-zinc-400">Turn-by-turn navigation</p>
            </div>
            <NavigationArrow weight="bold" className="w-5 h-5 text-zinc-500" />
          </button>
          
          {/* Waze */}
          <button
            onClick={() => handleOpenNavigation('waze')}
            className="w-full flex items-center gap-4 p-4 bg-zinc-800/80 hover:bg-zinc-800 rounded-2xl transition-all active:scale-[0.98] border border-zinc-700/50"
            data-testid="btn-waze-directions"
          >
            <div className="w-12 h-12 rounded-xl bg-[#33CCFF]/10 flex items-center justify-center">
              <WazeIcon />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-white">Waze</p>
              <p className="text-sm text-zinc-400">Real-time traffic alerts</p>
            </div>
            <NavigationArrow weight="bold" className="w-5 h-5 text-zinc-500" />
          </button>
          
          {/* Apple Maps */}
          <button
            onClick={() => handleOpenNavigation('apple')}
            className="w-full flex items-center gap-4 p-4 bg-zinc-800/80 hover:bg-zinc-800 rounded-2xl transition-all active:scale-[0.98] border border-zinc-700/50"
            data-testid="btn-apple-directions"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <MapPin weight="fill" className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-white">Apple Maps</p>
              <p className="text-sm text-zinc-400">Native iOS experience</p>
            </div>
            <NavigationArrow weight="bold" className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        
        <div className="p-6 pt-0">
          <DrawerClose asChild>
            <Button 
              variant="outline" 
              className="w-full rounded-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NavigationDrawer;
