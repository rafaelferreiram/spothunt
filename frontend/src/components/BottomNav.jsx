import { useLocation, useNavigate } from "react-router-dom";
import { Home, Flame, Calendar, User, Plane } from "lucide-react";

// Cannabis leaf SVG icon component - 7-leaflet design with bold outlines
const CannabisLeaf = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none"
    className={className}
  >
    {/* Main stem */}
    <path 
      d="M12 22V14" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    {/* Center leaflet (largest) */}
    <path 
      d="M12 2C12 2 10 5 10 8C10 10 11 12 12 13C13 12 14 10 14 8C14 5 12 2 12 2Z" 
      fill="currentColor"
      stroke="currentColor" 
      strokeWidth="0.5"
    />
    {/* Upper left leaflet */}
    <path 
      d="M12 13C12 13 8 11 6 7C6 7 8 9 10 11C11 12 12 13 12 13Z" 
      fill="currentColor"
      stroke="currentColor" 
      strokeWidth="0.5"
    />
    {/* Upper right leaflet */}
    <path 
      d="M12 13C12 13 16 11 18 7C18 7 16 9 14 11C13 12 12 13 12 13Z" 
      fill="currentColor"
      stroke="currentColor" 
      strokeWidth="0.5"
    />
    {/* Mid left leaflet */}
    <path 
      d="M12 14C12 14 7 12 4 10C4 10 7 11 10 12C11 13 12 14 12 14Z" 
      fill="currentColor"
      stroke="currentColor" 
      strokeWidth="0.5"
    />
    {/* Mid right leaflet */}
    <path 
      d="M12 14C12 14 17 12 20 10C20 10 17 11 14 12C13 13 12 14 12 14Z" 
      fill="currentColor"
      stroke="currentColor" 
      strokeWidth="0.5"
    />
    {/* Lower left leaflet (smaller) */}
    <path 
      d="M12 14.5C12 14.5 9 14 6 13C6 13 9 13.5 11 14C11.5 14.2 12 14.5 12 14.5Z" 
      fill="currentColor"
      stroke="currentColor" 
      strokeWidth="0.5"
    />
    {/* Lower right leaflet (smaller) */}
    <path 
      d="M12 14.5C12 14.5 15 14 18 13C18 13 15 13.5 13 14C12.5 14.2 12 14.5 12 14.5Z" 
      fill="currentColor"
      stroke="currentColor" 
      strokeWidth="0.5"
    />
  </svg>
);

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: "home", path: "/home", icon: Home, label: "Explore" },
    { id: "shuffle", path: "/shuffle", icon: Flame, label: "Shuffle" },
    { id: "visiting", path: "/visiting", icon: Plane, label: "Visit" },
    { id: "plans", path: "/plans", icon: Calendar, label: "Plans" },
    { id: "cannabis", path: "/cannabis", icon: CannabisLeaf, label: "Weeds" },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      data-testid="bottom-nav"
    >
      {/* Gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
      
      {/* Nav bar */}
      <div className="relative px-2 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-card/95 backdrop-blur-2xl rounded-2xl border border-border/20 shadow-lg shadow-black/5">
            <div className="flex justify-around items-center h-14">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all"
                    data-testid={`nav-${item.id}`}
                  >
                    <div className={`
                      relative flex items-center justify-center w-8 h-6 rounded-lg transition-all
                      ${active ? "bg-foreground/10" : ""}
                    `}>
                      <Icon className={`w-[18px] h-[18px] transition-all ${
                        active 
                          ? "text-foreground stroke-[2.5px]" 
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
