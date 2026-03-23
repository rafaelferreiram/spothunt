import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "@/App";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import {
  ChevronLeft,
  User,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Compass
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const getTravelStyleLabel = (style) => {
    const styles = {
      explorer: "The Explorer",
      content_creator: "The Content Creator",
      foodie: "The Foodie",
      efficient: "The Efficient Traveler",
      slow_tourist: "The Slow Tourist",
    };
    return styles[style] || style;
  };

  const getTravelStyleIcon = (style) => {
    const icons = {
      explorer: Compass,
      content_creator: Sparkles,
      foodie: UtensilsCrossed,
      efficient: Sparkles,
      slow_tourist: Sparkles,
    };
    const Icon = icons[style] || Compass;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="profile-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground"
            data-testid="profile-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="font-heading text-lg font-semibold">Profile</h1>
          
          <div className="w-10" />
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{user?.name}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            {user?.taste_profile?.travel_style && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {getTravelStyleIcon(user.taste_profile.travel_style)}
                <span className="ml-1">{getTravelStyleLabel(user.taste_profile.travel_style)}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Taste Profile Summary */}
        {user?.taste_profile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">Your Taste Profile</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/onboarding")}
                className="text-accent"
                data-testid="edit-profile-btn"
              >
                Edit
              </Button>
            </div>

            {/* Vibes */}
            {user.taste_profile.vibes?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Vibes you love</p>
                <div className="flex flex-wrap gap-2">
                  {user.taste_profile.vibes.map((vibe) => (
                    <Badge key={vibe} variant="outline" className="rounded-full capitalize">
                      {vibe.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Cuisines */}
            {user.taste_profile.cuisines?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Cuisines</p>
                <div className="flex flex-wrap gap-2">
                  {user.taste_profile.cuisines.map((cuisine) => (
                    <Badge key={cuisine} variant="outline" className="rounded-full capitalize">
                      {cuisine.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Drink Style */}
            {user.taste_profile.drink_style && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Drink style</p>
                <Badge variant="outline" className="rounded-full capitalize">
                  <Wine className="w-3 h-3 mr-1" />
                  {user.taste_profile.drink_style.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Menu Items */}
        <div className="space-y-2">
          <MenuItem
            icon={<Heart className="w-5 h-5" />}
            label="Saved Places"
            value={`${user?.saved_places?.length || 0} saved`}
            onClick={() => navigate("/saved")}
            testId="saved-places-menu"
          />
          
          <MenuItem
            icon={theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            label="Dark Mode"
            action={
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="theme-toggle"
              />
            }
          />
        </div>

        <Separator />

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log out
        </Button>

        {/* App Info */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            SpotHunt v1.0.0 • Made with ❤️ for travelers
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

const MenuItem = ({ icon, label, value, action, onClick, testId }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`
      w-full flex items-center gap-3 p-4 rounded-xl transition-colors
      ${onClick ? "hover:bg-muted cursor-pointer" : "cursor-default"}
    `}
    data-testid={testId}
  >
    <div className="text-muted-foreground">{icon}</div>
    <span className="flex-1 text-left font-medium text-foreground">{label}</span>
    {value && <span className="text-sm text-muted-foreground">{value}</span>}
    {action}
    {onClick && !action && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
  </button>
);

export default Profile;
