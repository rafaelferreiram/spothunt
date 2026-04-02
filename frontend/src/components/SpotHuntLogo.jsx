const SpotHuntLogo = ({ className = "w-10 h-10", showText = false, textClassName = "" }) => (
  <div className={`flex items-center gap-2.5 ${showText ? "" : ""}`}>
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-label="SpotHunt logo">
      {/* Background */}
      <rect width="100" height="100" rx="22" fill="#0A0A0F"/>
      
      {/* Subtle ring */}
      <circle cx="50" cy="50" r="38" stroke="#0D9F6E" strokeWidth="0.8" strokeOpacity="0.2"/>
      
      {/* Map Pin */}
      <path 
        d="M50 20C39.5 20 31 28.5 31 39C31 52 50 72 50 72C50 72 69 52 69 39C69 28.5 60.5 20 50 20Z" 
        fill="#0D9F6E"
      />
      
      {/* Inner white dot */}
      <circle cx="50" cy="39" r="8" fill="white"/>
      
      {/* Crosshair lines - amber accent */}
      <line x1="50" y1="10" x2="50" y2="16" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
      <line x1="50" y1="78" x2="50" y2="84" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
      <line x1="10" y1="46" x2="16" y2="46" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
      <line x1="84" y1="46" x2="90" y2="46" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
      
      {/* Glow under pin */}
      <ellipse cx="50" cy="74" rx="8" ry="2.5" fill="#0D9F6E" fillOpacity="0.25"/>
    </svg>
    {showText && (
      <span className={`font-semibold tracking-tight ${textClassName}`}>SpotHunt</span>
    )}
  </div>
);

export default SpotHuntLogo;
