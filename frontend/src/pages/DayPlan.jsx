import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock,
  GripVertical,
  Plus,
  X,
  Star,
  Footprints,
  Car,
  Trash2,
  Share2,
  Download,
  ChevronRight,
  Coffee,
  UtensilsCrossed,
  Beer,
  Landmark,
  Sparkles,
  Edit3,
  Check
} from "lucide-react";

const DayPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);

  // Load saved places and plans
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load plans from localStorage
        const storedPlans = JSON.parse(localStorage.getItem("cityblend_plans") || "[]");
        setPlans(storedPlans);

        // Load saved places
        if (user?.saved_places?.length > 0) {
          const placesData = [];
          for (const placeId of user.saved_places.slice(0, 20)) {
            try {
              const res = await fetch(`${API}/places/${placeId}`, { credentials: "include" });
              if (res.ok) {
                const place = await res.json();
                placesData.push(place);
              }
            } catch (e) {
              // Skip failed places
            }
          }
          setSavedPlaces(placesData);
        }
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Save plans to localStorage
  const savePlans = (updatedPlans) => {
    localStorage.setItem("cityblend_plans", JSON.stringify(updatedPlans));
    setPlans(updatedPlans);
  };

  // Create new plan
  const createPlan = () => {
    const newPlan = {
      id: `plan_${Date.now()}`,
      title: `My Trip ${plans.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      places: [],
      createdAt: new Date().toISOString()
    };
    const updatedPlans = [...plans, newPlan];
    savePlans(updatedPlans);
    setCurrentPlan(newPlan);
    setPlanTitle(newPlan.title);
  };

  // Update current plan
  const updateCurrentPlan = (updates) => {
    if (!currentPlan) return;
    
    const updatedPlan = { ...currentPlan, ...updates };
    setCurrentPlan(updatedPlan);
    
    const updatedPlans = plans.map(p => 
      p.id === currentPlan.id ? updatedPlan : p
    );
    savePlans(updatedPlans);
  };

  // Add place to plan
  const addPlace = (place) => {
    if (!currentPlan) return;
    
    // Check if already in plan
    if (currentPlan.places.some(p => p.id === place.id)) {
      toast.error("Already in your plan");
      return;
    }

    const planPlace = {
      id: place.id,
      name: place.name,
      category: place.category,
      rating: place.rating,
      photo: place.photos?.[0],
      walk_mins: place.walk_mins,
      drive_mins: place.drive_mins,
      time: "",
      notes: ""
    };

    updateCurrentPlan({ places: [...currentPlan.places, planPlace] });
    setShowAddPlace(false);
    toast.success(`Added ${place.name}`);
  };

  // Remove place from plan
  const removePlace = (placeId) => {
    if (!currentPlan) return;
    updateCurrentPlan({
      places: currentPlan.places.filter(p => p.id !== placeId)
    });
  };

  // Reorder places (drag and drop)
  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newPlaces = [...currentPlan.places];
    const draggedPlace = newPlaces[draggedItem];
    newPlaces.splice(draggedItem, 1);
    newPlaces.splice(index, 0, draggedPlace);
    
    setDraggedItem(index);
    updateCurrentPlan({ places: newPlaces });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Update place time
  const updatePlaceTime = (placeId, time) => {
    if (!currentPlan) return;
    updateCurrentPlan({
      places: currentPlan.places.map(p =>
        p.id === placeId ? { ...p, time } : p
      )
    });
  };

  // Delete plan
  const deletePlan = (planId) => {
    const updatedPlans = plans.filter(p => p.id !== planId);
    savePlans(updatedPlans);
    if (currentPlan?.id === planId) {
      setCurrentPlan(null);
    }
    toast.success("Plan deleted");
  };

  // Share plan
  const sharePlan = () => {
    if (!currentPlan) return;
    
    const text = `My ${currentPlan.title}\n\n` + 
      currentPlan.places.map((p, i) => 
        `${i + 1}. ${p.name}${p.time ? ` at ${p.time}` : ""}`
      ).join("\n");
    
    if (navigator.share) {
      navigator.share({ title: currentPlan.title, text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "restaurant": return UtensilsCrossed;
      case "bar": return Beer;
      case "cafe": return Coffee;
      case "museum": return Landmark;
      default: return MapPin;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="dayplan-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Day Plans</h1>
                <p className="text-xs text-muted-foreground">
                  {currentPlan ? `${currentPlan.places.length} stops` : `${plans.length} plans`}
                </p>
              </div>
            </div>
            {currentPlan ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={sharePlan} className="rounded-full">
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentPlan(null)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Button onClick={createPlan} size="sm" className="rounded-full">
                <Plus className="w-4 h-4 mr-1" />
                New Plan
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 pt-4">
        {!currentPlan ? (
          // Plans List
          <div className="space-y-3">
            {plans.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No plans yet</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Create your first day plan to organize your trip
                </p>
                <Button onClick={createPlan} className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-card rounded-2xl p-4 border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => {
                        setCurrentPlan(plan);
                        setPlanTitle(plan.title);
                      }}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-semibold">{plan.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {plan.places.length} places · {plan.date}
                      </p>
                      {plan.places.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {plan.places.slice(0, 4).map((p) => (
                            <div
                              key={p.id}
                              className="w-8 h-8 rounded-lg bg-muted overflow-hidden"
                            >
                              {p.photo && (
                                <img src={p.photo} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                          {plan.places.length > 4 && (
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              +{plan.places.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Current Plan Editor
          <div className="space-y-4">
            {/* Plan Title */}
            <div className="flex items-center gap-2">
              {editingTitle ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="h-10"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    onClick={() => {
                      updateCurrentPlan({ title: planTitle });
                      setEditingTitle(false);
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingTitle(true)}
                  className="flex items-center gap-2 text-lg font-semibold hover:text-primary"
                >
                  {currentPlan.title}
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Date */}
            <Input
              type="date"
              value={currentPlan.date}
              onChange={(e) => updateCurrentPlan({ date: e.target.value })}
              className="w-fit"
            />

            {/* Places List */}
            <div className="space-y-2">
              {currentPlan.places.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
                  <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Add places to your plan
                  </p>
                </div>
              ) : (
                currentPlan.places.map((place, index) => {
                  const Icon = getCategoryIcon(place.category);
                  return (
                    <div
                      key={place.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`
                        flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50
                        ${draggedItem === index ? "opacity-50" : ""}
                        cursor-move
                      `}
                    >
                      <div className="text-muted-foreground cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{place.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {place.rating && (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {place.rating.toFixed(1)}
                            </span>
                          )}
                          {place.walk_mins && (
                            <span className="flex items-center gap-0.5">
                              <Footprints className="w-3 h-3" />
                              {place.walk_mins}m
                            </span>
                          )}
                        </div>
                      </div>

                      <Input
                        type="time"
                        value={place.time}
                        onChange={(e) => updatePlaceTime(place.id, e.target.value)}
                        className="w-24 h-8 text-xs"
                        placeholder="Time"
                      />

                      <button
                        onClick={() => removePlace(place.id)}
                        className="p-2 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}

              {/* Add Place Button */}
              <Button
                variant="outline"
                onClick={() => setShowAddPlace(true)}
                className="w-full h-12 rounded-2xl border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Place
              </Button>
            </div>
          </div>
        )}

        {/* Add Place Modal */}
        {showAddPlace && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
            <div className="w-full bg-background rounded-t-3xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Add Place</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddPlace(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <ScrollArea className="h-[60vh]">
                <div className="p-4 space-y-2">
                  {savedPlaces.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No saved places yet</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setShowAddPlace(false);
                          navigate("/home");
                        }}
                      >
                        Explore places
                      </Button>
                    </div>
                  ) : (
                    savedPlaces.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => addPlace(place)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                          {place.photos?.[0] ? (
                            <img src={place.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{place.name}</p>
                          <p className="text-xs text-muted-foreground truncate capitalize">
                            {place.category}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default DayPlanPage;
