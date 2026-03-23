import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Sparkles, Navigation, Coffee, Beer, Landmark, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

// Cannabis leaf icon
const CannabisIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C12 2 9 7 12 12C15 7 12 2 12 2Z" />
    <path d="M12 12C9.5 8 6 6 6 6C8 10 12 12 12 12Z" />
    <path d="M12 12C14.5 8 18 6 18 6C16 10 12 12 12 12Z" />
    <path d="M12 12C7 9 2 10 2 10C5 11 9 11 12 12Z" />
    <path d="M12 12C17 9 22 10 22 10C19 11 15 11 12 12Z" />
  </svg>
);

const Landing = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login"); // login, register, or null (show buttons)
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.onboarding_completed) {
        navigate("/home", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + "/home";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
      const body = authMode === "register" 
        ? { email: formData.email, password: formData.password, name: formData.name }
        : { email: formData.email, password: formData.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      setUser(data.user);
      toast.success(data.message);
      
      if (data.user.onboarding_completed) {
        navigate("/home", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFormLoading(false);
    }
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
        {/* Background */}
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
          <main className="flex-1 flex flex-col justify-center py-8">
            <div className="space-y-6 max-w-md">
              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight">
                  Find your next
                  <br />
                  <span className="text-muted-foreground">favorite spot</span>
                </h1>
                
                <p className="text-muted-foreground text-base leading-relaxed">
                  Real-time recommendations for restaurants, bars, cafes, and hidden gems — tailored to your taste.
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2">
                <FeatureTag icon={Coffee} label="Cafes" />
                <FeatureTag icon={Beer} label="Bars" />
                <FeatureTag icon={Landmark} label="Culture" />
                <FeatureTag icon={Navigation} label="Walking" />
                <FeatureTag icon={CannabisIcon} label="Weeds" />
              </div>

              {/* Auth Section */}
              {!authMode ? (
                // Initial buttons
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleGoogleLogin}
                    size="lg"
                    className="w-full h-12 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-medium transition-all"
                    data-testid="google-login-btn"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setAuthMode("login")}
                      variant="outline"
                      size="lg"
                      className="flex-1 h-12 rounded-xl font-medium"
                      data-testid="email-login-btn"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => setAuthMode("register")}
                      variant="outline"
                      size="lg"
                      className="flex-1 h-12 rounded-xl font-medium"
                      data-testid="email-register-btn"
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              ) : (
                // Login/Register Form
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-3">
                    {authMode === "register" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-10 h-11 rounded-xl"
                            required
                            data-testid="name-input"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 h-11 rounded-xl"
                          required
                          data-testid="email-input"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={authMode === "register" ? "Min 6 characters" : "Your password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10 h-11 rounded-xl"
                          required
                          minLength={authMode === "register" ? 6 : undefined}
                          data-testid="password-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={formLoading}
                    className="w-full h-12 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-medium"
                    data-testid="submit-btn"
                  >
                    {formLoading ? (
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : authMode === "register" ? (
                      "Create Account"
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="text-muted-foreground">
                      {authMode === "register" ? "Already have an account?" : "Don't have an account?"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
                      className="font-medium text-foreground hover:underline"
                    >
                      {authMode === "register" ? "Sign In" : "Sign Up"}
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setAuthMode(null)}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to all options
                  </button>
                </form>
              )}

              {!authMode && (
                <p className="text-center text-xs text-muted-foreground">
                  Free forever · No credit card required
                </p>
              )}
            </div>
          </main>

          {/* Bottom Image Preview */}
          {!authMode && (
            <div className="pb-8">
              <div className="relative h-40 rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
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
          )}
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

export default Landing;
