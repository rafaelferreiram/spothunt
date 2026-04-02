import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner only if user hasn't dismissed it recently
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowBanner(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up"
      data-testid="install-pwa-banner"
    >
      <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl shadow-black/40 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">Install SpotHunt</p>
          <p className="text-xs text-zinc-400 mt-0.5">Add to your home screen for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shrink-0"
          data-testid="install-pwa-btn"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors shrink-0"
          data-testid="dismiss-pwa-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
