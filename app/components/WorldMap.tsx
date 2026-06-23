"use client";

import { useEffect, useRef, useState } from "react";
import type { PeerDot } from "@/lib/types";

const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

function dotColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
}

export default function WorldMap({
  peers,
  me,
  onPeerClick,
  canConnect,
}: {
  peers: PeerDot[];
  me: { lat: number; lng: number } | null;
  onPeerClick: (id: string) => void;
  canConnect: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const meMarkerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const onPeerClickRef = useRef(onPeerClick);
  const canConnectRef = useRef(canConnect);
  useEffect(() => {
    onPeerClickRef.current = onPeerClick;
    canConnectRef.current = canConnect;
  });

  // Init map once
  useEffect(() => {
    if (!KEY || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${KEY}`,
        center: me ? [me.lng, me.lat] : [0, 20],
        zoom: me ? 4 : 1.4,
        attributionControl: false,
      });

      map.on("load", () => {
        if (!cancelled) setReady(true);
      });

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      meMarkerRef.current?.remove();
      meMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "You are here" pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !me) return;
    let cancelled = false;

    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (cancelled) return;

      if (!meMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "pulse-me";
        // el.title = "You are here";
        el.innerHTML = `<span class="pulse-me-label">Me</span>`;
        meMarkerRef.current = new maplibre.Marker({ element: el, anchor: "bottom" })
          .setLngLat([me.lng, me.lat])
          .addTo(map);
      } else {
        meMarkerRef.current.setLngLat([me.lng, me.lat]);
      }
    })();

    return () => { cancelled = true; };
  }, [me, ready]);

  // Peer markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let cancelled = false;

    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (cancelled) return;

      const markers = markersRef.current;
      const seen = new Set<string>();

      for (const peer of peers) {
        seen.add(peer.id);
        let marker = markers.get(peer.id);
        if (!marker) {
          const el = document.createElement("div");
          el.className = "pulse-dot-wrapper";
          el.title = peer.mood ? `${peer.mood} — Tap to connect` : "Tap to connect";

          const dot = document.createElement("button");
          dot.className = "pulse-dot";
          dot.style.background = dotColor(peer.id);

          const badge = document.createElement("span");
          badge.className = "pulse-mood-badge";
          const moodMap: Record<string, string> = {
            "Just saying hi": "👋",
            "Want to talk": "💬",
            "Listening to music": "🎵",
            "Can't sleep": "🌙",
            "Having coffee": "☕",
            "Taking a break": "🎮",
            "Deep in thought": "🧠",
            "Feeling happy": "😊",
          };
          badge.textContent = peer.mood ? (moodMap[peer.mood] ?? "👋") : "👋";

          el.appendChild(dot);
          el.appendChild(badge);
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            if (canConnectRef.current) onPeerClickRef.current(peer.id);
          });
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            if (canConnectRef.current) onPeerClickRef.current(peer.id);
          });
          marker = new maplibre.Marker({ element: el })
            .setLngLat([peer.lng, peer.lat])
            .addTo(map);
          markers.set(peer.id, marker);
        }
        marker.getElement().style.opacity = peer.busy ? "0.35" : "1";
        const existingBadge = marker.getElement().querySelector(".pulse-mood-badge");
        if (existingBadge) {
          const moodMap: Record<string, string> = {
            "Just saying hi": "👋",
            "Want to talk": "💬",
            "Listening to music": "🎵",
            "Can't sleep": "🌙",
            "Having coffee": "☕",
            "Taking a break": "🎮",
            "Deep in thought": "🧠",
            "Feeling happy": "😊",
          };
          existingBadge.textContent = peer.mood ? (moodMap[peer.mood] ?? "👋") : "👋";
        }
      }

      for (const [id, marker] of markers) {
        if (!seen.has(id)) {
          marker.remove();
          markers.delete(id);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [peers, ready]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full bg-zinc-900" />

      {!KEY && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <p className="max-w-md rounded-lg bg-zinc-800 p-4 text-sm text-zinc-200">
            Set <code className="text-emerald-400">NEXT_PUBLIC_MAPTILER_KEY</code> in{" "}
            <code>.env</code> to load the map.
          </p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 rounded-full bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur">
        {peers.length} online
      </div>
    </div>
  );
}