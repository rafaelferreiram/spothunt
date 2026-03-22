import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Heart, User } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: "home", path: "/home", icon: Home, label: "Home" },
    { id: "map", path: "/home?view=map", icon: Map, label: "Map" },
    { id: "saved", path: "/saved", icon: Heart, label: "Saved" },
    { id: "profile", path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path) => {
    if (path.includes("?")) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
      data-testid="bottom-nav"
    >
      <div className="glass rounded-full p-2 flex justify-around items-center shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all
                ${active 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
              data-testid={`nav-${item.id}`}
            >
              <Icon className={`w-5 h-5 ${active ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
