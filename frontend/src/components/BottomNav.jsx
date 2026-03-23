import { useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, User, Leaf } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: "home", path: "/home", icon: Home, label: "Explore" },
    { id: "cannabis", path: "/cannabis", icon: Leaf, label: "Greens" },
    { id: "saved", path: "/saved", icon: Heart, label: "Saved" },
    { id: "profile", path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path) => {
    if (path.includes("?")) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path || location.pathname.startsWith(path.split("?")[0] + "/");
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      data-testid="bottom-nav"
    >
      {/* Gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
      
      {/* Nav bar */}
      <div className="relative px-4 pb-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card/95 backdrop-blur-2xl rounded-2xl border border-border/20 shadow-lg shadow-black/5">
            <div className="flex justify-around items-center h-16">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all"
                    data-testid={`nav-${item.id}`}
                  >
                    <div className={`
                      relative flex items-center justify-center w-10 h-8 rounded-xl transition-all
                      ${active ? "bg-foreground/10" : ""}
                    `}>
                      <Icon className={`w-5 h-5 transition-all ${
                        active 
                          ? "text-foreground stroke-[2px]" 
                          : "text-muted-foreground"
                      }`} />
                      {active && (
                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-foreground" />
                      )}
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
