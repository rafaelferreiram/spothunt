import { useLocation, useNavigate } from "react-router-dom";
import { Home, Flame, Calendar, User, Plane } from "lucide-react";

// Cannabis leaf SVG icon - Classic silhouette with serrated edges
const CannabisLeaf = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Full cannabis leaf silhouette */}
    <path d="M12 2c0 0-1.5 2.5-1.5 5c0 1.2 0.3 2.4 0.7 3.5c-1.2-1.5-3.2-3.5-5.7-5c0 0 2 3.5 4.5 5.5c-2-0.5-4.5-0.5-7 0c0 0 4 1.5 7 1.5c-1.5 0.2-3.5 0.8-5 2c0 0 3-0.5 5.5-0.5c-0.3 0.3-0.5 0.8-0.5 1.5l0 7h2l0-7c0-0.7-0.2-1.2-0.5-1.5c2.5 0 5.5 0.5 5.5 0.5c-1.5-1.2-3.5-1.8-5-2c3 0 7-1.5 7-1.5c-2.5-0.5-5-0.5-7 0c2.5-2 4.5-5.5 4.5-5.5c-2.5 1.5-4.5 3.5-5.7 5c0.4-1.1 0.7-2.3 0.7-3.5c0-2.5-1.5-5-1.5-5z"/>
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
