import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Navigation, Coffee, Wine, Landmark } from "lucide-react";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.onboarding_completed) {
        navigate("/home", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/home";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="landing-loading">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-full bg-accent/30"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden" data-testid="landing-page">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80"
            alt="NYC Skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-12 pt-20">
          {/* Logo */}
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-heading text-xl font-semibold text-foreground">CityBlend</span>
          </div>

          {/* Main Content */}
          <div className="space-y-6 max-w-lg">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight animate-fade-in">
              Discover places you'll actually love
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground animate-fade-in stagger-1">
              Personalized recommendations for food, drinks, culture & hidden gems — wherever you travel.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 animate-fade-in stagger-2">
              <FeaturePill icon={<Coffee className="w-3.5 h-3.5" />} label="Cafes" />
              <FeaturePill icon={<Wine className="w-3.5 h-3.5" />} label="Bars" />
              <FeaturePill icon={<Landmark className="w-3.5 h-3.5" />} label="Museums" />
              <FeaturePill icon={<Navigation className="w-3.5 h-3.5" />} label="Walks" />
            </div>

            {/* CTA Button */}
            <div className="pt-4 animate-fade-in stagger-3">
              <Button
                onClick={handleLogin}
                size="lg"
                className="w-full sm:w-auto h-14 px-8 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                data-testid="google-login-btn"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started with Google
              </Button>
            </div>

            {/* Trust Text */}
            <p className="text-sm text-muted-foreground animate-fade-in stagger-4">
              Free forever • No credit card required
            </p>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10"></div>
      </div>
    </div>
  );
};

const FeaturePill = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-sm text-foreground">
    {icon}
    <span>{label}</span>
  </div>
);

export default Landing;
