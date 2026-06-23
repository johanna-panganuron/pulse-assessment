"use client";

import { useEffect, useState } from "react";

export default function ConnectionPrompt({
  title,
  subtitle,
  acceptLabel,
  declineLabel,
  onAccept,
  onDecline,
}: {
  title: string;
  subtitle?: string;
  acceptLabel: string;
  declineLabel: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-6"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 text-center text-zinc-100"
        style={{
          background: "rgba(24, 24, 27, 0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full bg-emerald-400 opacity-30"
              style={{ animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }}
            />
            <div className="relative h-5 w-5 rounded-full bg-emerald-400" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#a1a1aa",
            }}
          >
            {declineLabel}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981)",
              color: "#052e16",
              boxShadow: "0 0 20px rgba(52,211,153,0.3)",
            }}
          >
            {acceptLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}