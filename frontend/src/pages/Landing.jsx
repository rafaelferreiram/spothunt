import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Navigation, Coffee, Wine, Landmark, Leaf } from "lucide-react";

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
    const redirectUrl = window.location.origin + "/home";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="landing-loading">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-foreground/20 animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-foreground/20 animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-foreground/20 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden" data-testid="landing-page">
      <div className="relative min-h-screen flex flex-col">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-background" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col px-6">
          {/* Header */}
          <header className="pt-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center">
                <MapPin className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-semibold">CityBlend</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col justify-center py-12">
            <div className="space-y-8 max-w-md">
              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight animate-fade-in">
                  Find your next
                  <br />
                  <span className="text-muted-foreground">favorite spot</span>
                </h1>
                
                <p className="text-muted-foreground text-lg leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
                  Real-time recommendations for restaurants, bars, cafes, and hidden gems — tailored to your taste.
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <FeatureTag icon={Coffee} label="Cafes" />
                <FeatureTag icon={Wine} label="Bars" />
                <FeatureTag icon={Landmark} label="Culture" />
                <FeatureTag icon={Navigation} label="Walking" />
                <FeatureTag icon={Leaf} label="Greens" />
              </div>

              {/* Stats */}
              <div className="flex gap-8 py-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <Stat value="Real-time" label="Google Places" />
                <Stat value="9,500+" label="Strains" />
                <Stat value="2,300+" label="Dispensaries" />
              </div>

              {/* CTA */}
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="w-full h-14 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-semibold text-base transition-all hover:scale-[1.01] active:scale-[0.99]"
                  data-testid="google-login-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Free forever · No credit card required
                </p>
              </div>
            </div>
          </main>

          {/* Bottom Image Preview */}
          <div className="pb-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="relative h-48 rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                alt="Restaurant interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="text-white">
                    <p className="font-medium text-sm">Discover nearby</p>
                    <p className="text-xs text-white/70">Based on your location</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureTag = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground">
    <Icon className="w-3.5 h-3.5" />
    {label}
  </div>
);

const Stat = ({ value, label }) => (
  <div>
    <p className="font-semibold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default Landing;
