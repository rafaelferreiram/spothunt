import { useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, User, Sparkles } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: "home", path: "/home", icon: Home, label: "Explore" },
    { id: "cannabis", path: "/cannabis", icon: () => <span className="text-lg">🌿</span>, label: "Greens" },
    { id: "saved", path: "/saved", icon: Heart, label: "Saved" },
    { id: "profile", path: "/profile", icon: User, label: "You" },
  ];

  const isActive = (path) => {
    if (path.includes("?")) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path || location.pathname.startsWith(path.split("?")[0] + "/");
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent"
      data-testid="bottom-nav"
    >
      <div className="max-w-md mx-auto bg-card/90 backdrop-blur-xl rounded-2xl border border-border/30 shadow-xl">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all min-w-[60px]
                  ${active 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
                data-testid={`nav-${item.id}`}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${active ? "bg-primary/10 scale-110" : ""}
                `}>
                  {typeof Icon === 'function' && Icon.toString().includes('span') ? (
                    <Icon />
                  ) : (
                    <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : ""}`} />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-foreground" : ""}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
