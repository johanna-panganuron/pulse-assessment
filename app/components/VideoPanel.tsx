"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoPanel({
  localStream,
  remoteStream,
  onEnd,
}: {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEnd: () => void;
}) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  useEffect(() => {
    if (localRef.current && localRef.current.srcObject !== localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteRef.current.srcObject !== remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  function toggleMute() {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = muted));
      setMuted(!muted);
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col bg-black"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <div className="relative flex-1">
        {/* Remote video (full screen) */}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
          style={{ background: "#09090b" }}
        />

        {/* Waiting state */}
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}
            >
              <svg className="h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-400">Waiting for stranger's video…</p>
          </div>
        )}

        {/* Local PiP */}
        <div
          className="absolute bottom-4 right-4 overflow-hidden rounded-2xl shadow-2xl"
          style={{
            border: "2px solid rgba(255,255,255,0.1)",
            width: "120px",
            height: "160px",
          }}
        >
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ background: "#18181b" }}
          />
          {!localStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <svg className="h-6 w-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Top bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-zinc-300 font-medium">Live</span>
          </div>
          <span className="text-xs text-zinc-400">Peer-to-peer · end-to-end</span>
        </div>
      </div>

      {/* Controls bar */}
      <div
        className="flex items-center justify-center gap-4 px-6 py-5"
        style={{
          background: "rgba(9,9,11,0.95)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200"
          style={{
            background: muted ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)",
            border: muted ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)",
          }}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* End call button */}
        <button
          onClick={onEnd}
          className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            boxShadow: "0 0 20px rgba(239,68,68,0.4)",
          }}
          title="End call"
        >
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </button>
      </div>
    </div>
  );
}