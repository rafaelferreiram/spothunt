import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Leaf,
  Zap,
  Heart,
  Brain,
  Moon,
  Sun,
  Sparkles,
  Share2,
  ExternalLink
} from "lucide-react";

const StrainDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [strain, setStrain] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrain = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/cannabis/strains/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setStrain(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStrain();
  }, [id]);

  const getTypeGradient = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return "from-amber-500 to-orange-500";
    if (t.includes("indica")) return "from-purple-500 to-violet-600";
    return "from-emerald-500 to-green-600";
  };

  const getTypeIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return Sun;
    if (t.includes("indica")) return Moon;
    return Sparkles;
  };

  const getEffectIcon = (effect) => {
    const e = (effect || "").toLowerCase();
    if (e.includes("relax") || e.includes("calm")) return "😌";
    if (e.includes("happy") || e.includes("euphori")) return "😊";
    if (e.includes("uplift") || e.includes("energet")) return "⚡";
    if (e.includes("creat")) return "🎨";
    if (e.includes("sleep") || e.includes("drowsy")) return "😴";
    if (e.includes("focus")) return "🎯";
    if (e.includes("hungry")) return "🍔";
    if (e.includes("talk")) return "💬";
    return "✨";
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: strain.name,
          text: `Check out ${strain.name} - ${strain.type}`,
          url: window.location.href,
        });
      } catch (err) {
        // Ignore
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" data-testid="strain-loading">
        <div className="h-48 bg-muted animate-pulse" />
        <div className="px-6 py-6 space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!strain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Strain not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(strain.type);

  return (
    <div className="min-h-screen bg-background pb-8" data-testid="strain-detail">
      {/* Hero */}
      <div className={`relative h-48 bg-gradient-to-br ${getTypeGradient(strain.type)}`}>
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
            data-testid="strain-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Centered Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Leaf className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 relative">
        {/* Main Card */}
        <div className="bg-card rounded-3xl p-6 shadow-lg border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-foreground">
                {strain.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <TypeIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground capitalize">{strain.type || "Hybrid"}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1 capitalize">
              {strain.type || "Hybrid"}
            </Badge>
          </div>

          {/* THC/CBD Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">THC</span>
                <span className="text-lg font-bold text-foreground">
                  {strain.thc > 0 ? `${strain.thc.toFixed(1)}%` : "N/A"}
                </span>
              </div>
              {strain.thc > 0 && (
                <Progress value={Math.min(strain.thc * 3, 100)} className="h-2" />
              )}
            </div>
            <div className="p-4 rounded-2xl bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CBD</span>
                <span className="text-lg font-bold text-foreground">
                  {strain.cbd > 0 ? `${strain.cbd.toFixed(1)}%` : "N/A"}
                </span>
              </div>
              {strain.cbd > 0 && (
                <Progress value={Math.min(strain.cbd * 10, 100)} className="h-2" />
              )}
            </div>
          </div>

          {/* Breeder */}
          {strain.breeder && strain.breeder !== "Unknown" && (
            <div className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium">Breeder:</span> {strain.breeder}
            </div>
          )}
        </div>

        {/* Effects */}
        {strain.effects?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Effects
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {strain.effects.map((effect, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <span className="text-xl">{getEffectIcon(effect)}</span>
                  <span className="text-sm font-medium">{effect}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Uses */}
        {strain.ailments?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              May Help With
            </h3>
            <div className="flex flex-wrap gap-2">
              {strain.ailments.map((ailment, i) => (
                <Badge key={i} variant="outline" className="rounded-full">
                  {ailment}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Flavors */}
        {strain.flavors?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold mb-4">
              🍃 Flavors & Aromas
            </h3>
            <div className="flex flex-wrap gap-2">
              {strain.flavors.map((flavor, i) => (
                <Badge key={i} variant="secondary" className="rounded-full">
                  {flavor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {strain.description && (
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold mb-3">About</h3>
            <p className="text-muted-foreground leading-relaxed">
              {strain.description}
            </p>
          </div>
        )}

        {/* External Links */}
        <div className="mt-8 space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 rounded-full"
            onClick={() => window.open(`https://www.leafly.com/search?q=${encodeURIComponent(strain.name)}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Leafly
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-full"
            onClick={() => window.open(`https://weedmaps.com/strains?filter[q]=${encodeURIComponent(strain.name)}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Weedmaps
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StrainDetail;
