import { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// 30 minutes in milliseconds
const TIMEOUT_MS = 30 * 60 * 1000;
// Show warning 1 minute before timeout
const WARNING_MS = 1 * 60 * 1000;

export default function AutoLogout() {
  const { signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds warning countdown

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    await signOut();
    navigate("/", { replace: true });
  }, [signOut, navigate]);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    // Hide warning if it was showing
    if (showWarning) {
      setShowWarning(false);
    }

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set new warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
    }, TIMEOUT_MS - WARNING_MS);

    // Set new absolute logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_MS);
  }, [isAuthenticated, showWarning, handleLogout]);

  // Handle countdown when warning is showing
  useEffect(() => {
    if (showWarning && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showWarning && countdown === 0) {
      // Failsafe in case the main timeout doesn't fire exactly
      handleLogout();
    }
  }, [showWarning, countdown, handleLogout]);

  // Attach event listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      // Throttle resetTimer slightly so it doesn't fire 1000x on mousemove
      requestAnimationFrame(() => {
        if (!showWarning) { // Don't reset automatically if warning is showing (force them to click 'Stay logged in')
          resetTimer();
        }
      });
    };

    // Initial setup
    resetTimer();

    // Add listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Cleanup
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetTimer, showWarning]);

  // Keep alive button handler
  const handleKeepAlive = () => {
    setShowWarning(false);
    resetTimer();
  };

  // This component doesn't render anything normally, only the warning modal
  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-400" />

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-xl">Session Expiring</h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                You've been inactive for a while. For your security, we'll log you out in{" "}
                <span className="font-bold text-red-500">{countdown} seconds</span>.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleKeepAlive}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-gray-500 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
