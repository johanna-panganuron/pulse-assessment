"use client";

import { useState, useEffect } from "react";
import {
  Hand,
  MessageCircle,
  Music,
  Moon,
  Coffee,
  Gamepad2,
  Brain,
  Smile,
} from "lucide-react";

const MOODS = [
  { icon: Hand, label: "Just saying hi", color: "#34d399" },
  { icon: MessageCircle, label: "Want to talk", color: "#60a5fa" },
  { icon: Music, label: "Listening to music", color: "#a78bfa" },
  { icon: Moon, label: "Can't sleep", color: "#818cf8" },
  { icon: Coffee, label: "Having coffee", color: "#f59e0b" },
  { icon: Gamepad2, label: "Taking a break", color: "#f472b6" },
  { icon: Brain, label: "Deep in thought", color: "#2dd4bf" },
  { icon: Smile, label: "Feeling good", color: "#fb923c" },
];

export default function EntryGate({
  onReady,
}: {
  onReady: (lat: number, lng: number, mood: string) => void;
}) {
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  function enter() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("Your browser doesn't support location access.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        onReady(pos.coords.latitude, pos.coords.longitude, selectedMood.label),
      (err) => {
        setStatus("error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission is required to place you on the map."
            : "Couldn't get your location. Please try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-950 p-6">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #34d399, transparent 70%)",
            animation: "float1 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #818cf8, transparent 70%)",
            animation: "float2 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center gap-8 text-center w-full max-w-sm"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full bg-emerald-400 opacity-20"
              style={{ animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite" }}
            />
            <div
              className="absolute inset-2 rounded-full bg-emerald-400 opacity-30"
              style={{
                animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite 0.3s",
              }}
            />
            <div className="relative h-5 w-5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
          </div>
          <div>
            <h1
              className="text-5xl font-bold tracking-tight text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Pulse
            </h1>
            <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
          </div>
        </div>

        <p className="text-base leading-relaxed text-zinc-400">
          A living globe of anonymous strangers.
          <br />
          Drop onto the map and connect.
        </p>

        {/* Mood picker */}
        <div className="w-full">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
            What's your vibe?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood.label === mood.label;
              return (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood)}
                  className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200"
                  style={{
                    background: isSelected
                      ? `${mood.color}18`
                      : "rgba(255,255,255,0.04)",
                    border: isSelected
                      ? `1px solid ${mood.color}60`
                      : "1px solid rgba(255,255,255,0.06)",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                  title={mood.label}
                >
                  <Icon
                    size={22}
                    style={{ color: isSelected ? mood.color : "#71717a" }}
                  />
                  <span
                    className="text-[9px] leading-tight text-center"
                    style={{ color: isSelected ? mood.color : "#71717a" }}
                  >
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected mood display */}
          <div
            className="mt-3 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm"
            style={{
              background: `${selectedMood.color}10`,
              border: `1px solid ${selectedMood.color}30`,
            }}
          >
            <selectedMood.icon size={16} style={{ color: selectedMood.color }} />
            <span style={{ color: selectedMood.color }} className="font-medium">
              I'm {selectedMood.label}
            </span>
          </div>
        </div>

        {/* Enter button */}
        <div className="flex flex-col items-center gap-3 w-full -mt-5">
          <button
            onClick={enter}
            disabled={status === "locating"}
            className="w-full rounded-full px-10 py-4 font-semibold text-zinc-950 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981)",
              boxShadow: "none",
            }}
          >
            {status === "locating" ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Locating…
              </>
            ) : (
              <>
                <selectedMood.icon size={18} />
                Enter Pulse
              </>
            )}
          </button>

          {status === "error" && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2">
              <span className="text-red-400">⚠</span>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Features row */}
        <div className="flex items-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            No sign-up
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Anonymous
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Nothing stored
          </span>
        </div>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -30px) scale(1.05); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}