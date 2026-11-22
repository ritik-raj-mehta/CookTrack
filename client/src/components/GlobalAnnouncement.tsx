import { useEffect, useState } from "react";
import axios from "axios";
import { FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

interface AnnouncementData {
  text: string;
  level: "info" | "warning" | "critical";
  maintenanceMode: boolean;
}

const GlobalAnnouncement = () => {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_BASE}/api/platform/announcement`);
        if (res.data?.isSuccess && res.data.hasAnnouncement) {
          setAnnouncement(res.data.announcement);
        }
      } catch {
        // Silently fail if server offline
      }
    };

    fetchAnnouncement();
  }, []);

  if (!announcement || dismissed) return null;

  const levelStyles = {
    info: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40",
    warning: "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400/40",
    critical: "bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400/40",
  }[announcement.level || "info"];

  const Icon = {
    info: FiInfo,
    warning: FiAlertTriangle,
    critical: FiAlertCircle,
  }[announcement.level || "info"];

  return (
    <div
      role="alert"
      className={`w-full border-b py-2.5 px-4 text-xs sm:text-sm font-medium shadow-sm transition-all duration-300 z-50 flex items-center justify-between gap-3 ${levelStyles}`}
    >
      <div className="flex items-center gap-2.5 mx-auto max-w-7xl w-full min-w-0">
        <Icon className="text-base sm:text-lg shrink-0 animate-pulse" />
        <span className="truncate flex-1 font-semibold tracking-wide">
          {announcement.maintenanceMode && (
            <span className="bg-black/20 uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full mr-2 font-mono font-bold">
              MAINTENANCE
            </span>
          )}
          {announcement.text}
        </span>
      </div>

      {!announcement.maintenanceMode && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-black/20 transition cursor-pointer text-white/80 hover:text-white shrink-0"
          aria-label="Dismiss announcement"
        >
          <FiX className="text-base" />
        </button>
      )}
    </div>
  );
};

export default GlobalAnnouncement;
