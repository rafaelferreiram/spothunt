import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Sparkles, Navigation, Coffee, Beer, Landmark, Eye, EyeOff, Mail, Lock, User, Flame, Plane, Calendar, Filter, Star, Clock } from "lucide-react";

// Cannabis leaf icon - 7-leaflet design
const CannabisIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Center leaflet (largest) */}
    <path d="M12 2C12 2 10 5 10 8C10 10 11 12 12 13C13 12 14 10 14 8C14 5 12 2 12 2Z" />
    {/* Upper left leaflet */}
    <path d="M12 13C12 13 8 11 6 7C6 7 8 9 10 11C11 12 12 13 12 13Z" />
    {/* Upper right leaflet */}
    <path d="M12 13C12 13 16 11 18 7C18 7 16 9 14 11C13 12 12 13 12 13Z" />
    {/* Mid left leaflet */}
    <path d="M12 14C12 14 7 12 4 10C4 10 7 11 10 12C11 13 12 14 12 14Z" />
    {/* Mid right leaflet */}
    <path d="M12 14C12 14 17 12 20 10C20 10 17 11 14 12C13 13 12 14 12 14Z" />
    {/* Lower left leaflet */}
    <path d="M12 14.5C12 14.5 9 14 6 13C6 13 9 13.5 11 14C11.5 14.2 12 14.5 12 14.5Z" />
    {/* Lower right leaflet */}
    <path d="M12 14.5C12 14.5 15 14 18 13C18 13 15 13.5 13 14C12.5 14.2 12 14.5 12 14.5Z" />
  </svg>
);

const Landing = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState(null); // login, register, forgot, reset, or null
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    newPassword: "",
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
      if (authMode === "forgot") {
        // Request password reset
        const res = await fetch(`${API}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await res.json();
        
        if (data.reset_token) {
          setResetToken(data.reset_token);
          toast.success("Reset code generated! Check below.");
          setAuthMode("reset");
        } else {
          toast.info(data.message);
        }
        return;
      }

      if (authMode === "reset") {
        // Reset password with token
        const res = await fetch(`${API}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            reset_token: resetToken, 
            new_password: formData.newPassword 
          }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || "Reset failed");
        }
        
        setUser(data.user);
        toast.success("Password reset successful!");
        navigate("/home", { replace: true });
        return;
      }

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
              ) : authMode === "forgot" ? (
                // Forgot Password Form
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="text-center mb-4">
                    <h2 className="font-semibold text-lg">Reset Password</h2>
                    <p className="text-sm text-muted-foreground">Enter your email to get a reset code</p>
                  </div>
                  
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
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={formLoading}
                    className="w-full h-12 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-medium"
                  >
                    {formLoading ? (
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : "Get Reset Code"}
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              ) : authMode === "reset" ? (
                // Reset Password Form
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="text-center mb-4">
                    <h2 className="font-semibold text-lg">Enter New Password</h2>
                    <p className="text-sm text-muted-foreground">Use the code below to reset</p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground mb-1">Your reset code:</p>
                    <p className="font-mono font-bold text-lg">{resetToken}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="pl-10 pr-10 h-11 rounded-xl"
                        required
                        minLength={6}
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
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={formLoading}
                    className="w-full h-12 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-medium"
                  >
                    {formLoading ? (
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : "Reset Password"}
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Sign In
                  </button>
                </form>
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                        {authMode === "login" && (
                          <button
                            type="button"
                            onClick={() => setAuthMode("forgot")}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
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

          {/* Feature Showcase Section - Only shown when not in auth mode */}
          {!authMode && (
            <div className="pb-8 space-y-6">
              {/* App Preview Card */}
              <div className="relative h-44 rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  alt="Restaurant interior"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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

              {/* Feature Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">What you can do</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FeatureCard 
                    icon={Flame} 
                    title="Shuffle Mode" 
                    description="Swipe through places Tinder-style"
                    color="bg-orange-500/10 text-orange-600"
                  />
                  <FeatureCard 
                    icon={Filter} 
                    title="Smart Filters" 
                    description="Distance, rating, price & more"
                    color="bg-blue-500/10 text-blue-600"
                  />
                  <FeatureCard 
                    icon={Plane} 
                    title="I'm Visiting" 
                    description="Explore any city worldwide"
                    color="bg-purple-500/10 text-purple-600"
                  />
                  <FeatureCard 
                    icon={Calendar} 
                    title="Day Planner" 
                    description="Build & share itineraries"
                    color="bg-green-500/10 text-green-600"
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-around py-4 bg-muted/30 rounded-2xl">
                <StatItem icon={CannabisIcon} value="6,000+" label="Dispensaries" />
                <div className="w-px h-8 bg-border" />
                <StatItem icon={Star} value="Real" label="Google Reviews" />
                <div className="w-px h-8 bg-border" />
                <StatItem icon={Clock} value="Live" label="Travel Times" />
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

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="p-3 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2`}>
      <Icon className="w-4 h-4" />
    </div>
    <h4 className="font-medium text-sm">{title}</h4>
    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
  </div>
);

const StatItem = ({ icon: Icon, value, label }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-1.5 mb-1">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="font-semibold text-sm">{value}</span>
    </div>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default Landing;
