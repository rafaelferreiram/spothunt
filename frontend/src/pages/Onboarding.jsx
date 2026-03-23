import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Flame, 
  Coffee, 
  Building2, 
  Landmark, 
  Wine, 
  TreePine, 
  UtensilsCrossed,
  MapPin,
  Camera,
  Compass,
  Timer,
  Leaf
} from "lucide-react";

const STEPS = [
  {
    id: "vibes",
    title: "What kind of places do you love?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { id: "hidden_gem", label: "Hidden gems", icon: Sparkles, description: "Local favorites" },
      { id: "trendy", label: "Trendy & buzzing", icon: Flame, description: "Popular spots" },
      { id: "cozy", label: "Calm & cozy", icon: Coffee, description: "Relaxed vibes" },
      { id: "rooftop", label: "Rooftops & views", icon: Building2, description: "Sky-high spots" },
      { id: "cultural", label: "Historic & cultural", icon: Landmark, description: "Rich in history" },
      { id: "nightlife", label: "Night out / bars", icon: Wine, description: "Evening fun" },
      { id: "outdoors", label: "Outdoors & parks", icon: TreePine, description: "Nature escapes" },
      { id: "foodie", label: "Foodie adventures", icon: UtensilsCrossed, description: "Culinary gems" },
    ],
  },
  {
    id: "cuisines",
    title: "What do you usually eat?",
    subtitle: "Pick your favorites",
    type: "multi",
    options: [
      { id: "japanese", label: "Japanese" },
      { id: "italian", label: "Italian" },
      { id: "mexican", label: "Mexican" },
      { id: "american", label: "American" },
      { id: "vegan", label: "Vegan" },
      { id: "seafood", label: "Seafood" },
      { id: "bbq", label: "BBQ" },
      { id: "middle_eastern", label: "Middle Eastern" },
      { id: "french", label: "French" },
      { id: "korean", label: "Korean" },
      { id: "indian", label: "Indian" },
      { id: "brunch", label: "Brunch" },
      { id: "pizza", label: "Pizza" },
      { id: "chinese", label: "Chinese" },
      { id: "thai", label: "Thai" },
      { id: "desserts", label: "Desserts" },
    ],
  },
  {
    id: "drinks",
    title: "How about drinks?",
    subtitle: "What's your style?",
    type: "single",
    options: [
      { id: "no_drink", label: "I don't drink", icon: Leaf },
      { id: "casual_beers", label: "Casual beers", icon: Wine },
      { id: "craft_cocktails", label: "Craft cocktails", icon: Wine },
      { id: "natural_wine", label: "Natural wine", icon: Wine },
      { id: "all_drinks", label: "All of the above", icon: Wine },
    ],
    secondary: {
      title: "Bar vibes",
      options: [
        { id: "sports_bar", label: "Sports bar" },
        { id: "speakeasy", label: "Speakeasy" },
        { id: "rooftop_bar", label: "Rooftop bar" },
        { id: "dive_bar", label: "Dive bar" },
        { id: "brewpub", label: "Brewpub" },
        { id: "wine_bar", label: "Wine bar" },
        { id: "live_music_bar", label: "Live music" },
      ],
    },
  },
  {
    id: "activities",
    title: "What do you like to do?",
    subtitle: "Beyond eating and drinking",
    type: "multi",
    options: [
      { id: "museums", label: "Museums" },
      { id: "art_galleries", label: "Art galleries" },
      { id: "live_music", label: "Live music" },
      { id: "comedy_shows", label: "Comedy shows" },
      { id: "markets", label: "Markets" },
      { id: "walking_tours", label: "Walking tours" },
      { id: "shopping", label: "Shopping" },
      { id: "spas", label: "Spas & wellness" },
      { id: "sports_events", label: "Sports events" },
      { id: "theaters", label: "Theaters" },
      { id: "landmarks", label: "Landmarks" },
      { id: "viewpoints", label: "Viewpoints" },
    ],
  },
  {
    id: "travel_style",
    title: "When you visit a new city...",
    subtitle: "What's your travel style?",
    type: "single",
    options: [
      { id: "explorer", label: "The Explorer", icon: Compass, description: "I want everything, surprise me" },
      { id: "content_creator", label: "The Content Creator", icon: Camera, description: "Aesthetic, photogenic, unique" },
      { id: "foodie", label: "The Foodie", icon: UtensilsCrossed, description: "Restaurants and bars, mainly" },
      { id: "efficient", label: "The Efficient Traveler", icon: Timer, description: "Top picks, no fluff" },
      { id: "slow_tourist", label: "The Slow Tourist", icon: Coffee, description: "Relaxed pace, hidden spots" },
    ],
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selections, setSelections] = useState({
    vibes: [],
    cuisines: [],
    drink_style: null,
    bar_vibes: [],
    activities: [],
    travel_style: null,
  });

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const toggleSelection = (stepId, optionId, type) => {
    setSelections((prev) => {
      if (type === "single") {
        return { ...prev, [stepId]: optionId };
      }
      const current = prev[stepId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [stepId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [stepId]: [...current, optionId] };
    });
  };

  const isSelected = (stepId, optionId, type) => {
    if (type === "single") {
      return selections[stepId] === optionId;
    }
    return (selections[stepId] || []).includes(optionId);
  };

  const canProceed = () => {
    if (step.type === "single") {
      const key = step.id === "drinks" ? "drink_style" : step.id;
      return selections[key] !== null;
    }
    return (selections[step.id] || []).length > 0;
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save profile
      setSaving(true);
      try {
        const response = await fetch(`${API}/user/complete-onboarding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(selections),
        });

        if (!response.ok) throw new Error("Failed to save profile");

        const updatedUser = await response.json();
        setUser(updatedUser);
        toast.success("Profile saved! Let's explore.");
        navigate("/home", { replace: true });
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save profile. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="onboarding-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-muted-foreground"
            data-testid="onboarding-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            <span className="font-heading font-semibold">SpotHunt</span>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        <div className="max-w-lg mx-auto onboarding-step" key={currentStep}>
          {/* Step Title */}
          <div className="mb-8">
            <p className="text-sm text-accent font-medium mb-2">
              Step {currentStep + 1} of {STEPS.length}
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-2">
              {step.title}
            </h1>
            <p className="text-muted-foreground">{step.subtitle}</p>
          </div>

          {/* Options Grid */}
          <div className={`grid gap-3 ${step.options[0].description ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            {step.options.map((option) => {
              const key = step.id === "drinks" ? "drink_style" : step.id;
              const selected = isSelected(key, option.id, step.type);
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  onClick={() => toggleSelection(key, option.id, step.type)}
                  className={`
                    p-4 rounded-2xl border-2 text-left transition-all
                    ${selected 
                      ? "border-accent bg-accent/10 shadow-sm" 
                      : "border-border bg-card hover:border-accent/50"
                    }
                  `}
                  data-testid={`option-${option.id}`}
                >
                  <div className="flex items-start gap-3">
                    {Icon && (
                      <div className={`p-2 rounded-xl ${selected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${selected ? "text-foreground" : "text-foreground"}`}>
                        {option.label}
                      </p>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secondary Options (for drinks step) */}
          {step.secondary && selections.drink_style && selections.drink_style !== "no_drink" && (
            <div className="mt-8">
              <h3 className="font-medium text-foreground mb-4">{step.secondary.title}</h3>
              <div className="flex flex-wrap gap-2">
                {step.secondary.options.map((option) => {
                  const selected = (selections.bar_vibes || []).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleSelection("bar_vibes", option.id, "multi")}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${selected 
                          ? "bg-accent text-accent-foreground" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }
                      `}
                      data-testid={`bar-vibe-${option.id}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border/50 px-6 py-4 safe-bottom">
        <Button
          onClick={handleNext}
          disabled={!canProceed() || saving}
          className="w-full h-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg disabled:opacity-50"
          data-testid="onboarding-next-btn"
        >
          {saving ? (
            "Saving..."
          ) : currentStep === STEPS.length - 1 ? (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Start Exploring
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
};

export default Onboarding;
