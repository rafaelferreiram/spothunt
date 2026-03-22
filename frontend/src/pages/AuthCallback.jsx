import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { API } from "@/App";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get("session_id");

        if (!sessionId) {
          console.error("No session_id found");
          navigate("/", { replace: true });
          return;
        }

        // Exchange session_id for session_token
        const response = await fetch(`${API}/auth/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange session");
        }

        const data = await response.json();
        setUser(data.user);

        // Clear hash from URL and redirect
        window.history.replaceState(null, "", window.location.pathname);

        // Redirect based on onboarding status
        if (data.user.onboarding_completed) {
          navigate("/home", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/", { replace: true });
      }
    };

    processAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" data-testid="auth-callback">
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/30"></div>
        </div>
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
