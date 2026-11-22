import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-300 cursor-pointer
        ${
          isDark
            ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 shadow-xs"
            : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 shadow-xs"
        }
        hover-lift active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 ${className}`}
    >
      <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
        <FiSun
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 absolute ${
            isDark
              ? "opacity-0 rotate-90 scale-50 pointer-events-none"
              : "opacity-100 rotate-0 scale-100 text-amber-500"
          }`}
        />
        <FiMoon
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 absolute ${
            isDark
              ? "opacity-100 rotate-0 scale-100 text-amber-300"
              : "opacity-0 -rotate-90 scale-50 pointer-events-none"
          }`}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold tracking-wide capitalize">
          {theme} mode
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
