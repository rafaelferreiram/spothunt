import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Reviews from "@/components/Reviews";
import {
  ChevronLeft,
  Share2,
  ExternalLink,
  Zap,
  Heart
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
        setStrain(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStrain();
  }, [id]);

  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sativa")) return { gradient: "from-amber-500 to-orange-500", emoji: "☀️", name: "Sativa" };
    if (t.includes("indica")) return { gradient: "from-purple-500 to-violet-600", emoji: "🌙", name: "Indica" };
    return { gradient: "from-emerald-500 to-green-600", emoji: "✨", name: "Hybrid" };
  };

  const getEffectEmoji = (effect) => {
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
        await navigator.share({ title: strain.name, url: window.location.href });
      } catch (e) {}
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-40 bg-muted animate-pulse" />
        <div className="px-6 py-6 space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!strain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  const style = getTypeStyle(strain.type);
  const effects = (strain.effects || []).filter(e => e && e !== "NULL");
  const ailments = (strain.ailments || []).filter(a => a && a !== "NULL");
  const flavors = (strain.flavors || []).filter(f => f && f !== "NULL");

  return (
    <div className="min-h-screen bg-background pb-8" data-testid="strain-detail">
      {/* Hero */}
      <div className={`relative h-40 bg-gradient-to-br ${style.gradient}`}>
        {/* Nav */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
            data-testid="strain-back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Emoji */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl">{style.emoji}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4 relative space-y-6">
        {/* Title Card */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-xl font-semibold">{strain.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{style.name}</p>
            </div>
            <Badge variant="outline" className="text-xs">{style.name}</Badge>
          </div>

          {/* THC/CBD */}
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">THC</span>
                <span className="font-mono font-medium">
                  {strain.thc > 0 ? `${strain.thc.toFixed(1)}%` : "—"}
                </span>
              </div>
              {strain.thc > 0 && <Progress value={Math.min(strain.thc * 3, 100)} className="h-1.5" />}
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">CBD</span>
                <span className="font-mono font-medium">
                  {strain.cbd > 0 ? `${strain.cbd.toFixed(1)}%` : "—"}
                </span>
              </div>
              {strain.cbd > 0 && <Progress value={Math.min(strain.cbd * 10, 100)} className="h-1.5" />}
            </div>
          </div>

          {strain.breeder && strain.breeder !== "Unknown" && strain.breeder !== "Unknown Breeder" && (
            <p className="text-xs text-muted-foreground mt-4">Breeder: {strain.breeder}</p>
          )}
        </div>

        {/* Effects */}
        {effects.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Effects
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {effects.map((effect, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
                  <span>{getEffectEmoji(effect)}</span>
                  <span className="text-sm">{effect}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical */}
        {ailments.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              May Help With
            </h3>
            <div className="flex flex-wrap gap-2">
              {ailments.map((a, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-muted/50">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Flavors */}
        {flavors.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">🍃 Flavors</h3>
            <div className="flex flex-wrap gap-2">
              {flavors.map((f, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-muted/30">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {strain.description && strain.description !== "NULL" && (
          <p className="text-muted-foreground leading-relaxed">{strain.description}</p>
        )}

        {/* External Links */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={() => window.open(`https://www.leafly.com/search?q=${encodeURIComponent(strain.name)}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Leafly
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={() => window.open(`https://weedmaps.com/strains?filter[q]=${encodeURIComponent(strain.name)}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Weedmaps
          </Button>
        </div>

        {/* Reviews */}
        <div className="pt-4 border-t border-border/30">
          <Reviews placeId={id} placeType="strain" />
        </div>
      </div>
    </div>
  );
};

export default StrainDetail;
