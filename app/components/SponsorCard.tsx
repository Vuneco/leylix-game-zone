"use client";
import { useState, useRef, useEffect } from "react";
import type { SponsorItem } from "@/data/sponsorData/sponsors";

type SponsorCardProps = {
  sponsor: SponsorItem;
};

export default function SponsorCard({ sponsor }: SponsorCardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const tryPlay = () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  tryPlay();

  const interval = setInterval(() => {
    if (video.paused) {
      tryPlay();
    }
  }, 2000); // alle 2 Sekunden prüfen

  return () => clearInterval(interval);
}, []);

  return (
    <div
      style={{
        marginTop: "14px",
        borderRadius: "22px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
        padding: "14px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
    >
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  }}
>
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 10px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontSize: "11px",
      fontWeight: 700,
      color: "rgba(255,255,255,0.9)",
    }}
  >
    {sponsor.label}
  </div>

  {sponsor.website && (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 12px",
        borderRadius: "12px",
        textDecoration: "none",
        fontSize: "12px",
        fontWeight: 700,
        color: "white",
        background: "linear-gradient(90deg, #6d28d9, #9333ea)",
        border: "1px solid rgba(255,255,255,0.08)",
        whiteSpace: "nowrap",
      }}
    >
      Mehr erfahren
    </a>
  )}
</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "64px 1fr",
          gap: "12px",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            {sponsor.name}
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.68)",
              lineHeight: 1.5,
            }}
          >
            Partner Präsentation Leylix Events.
          </div>
        </div>
      </div>

      <div
  style={{
    position: "relative",
    width: "100%",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.25)",
  }}
>
  <video
    ref={videoRef}
    src={sponsor.video}
    poster={sponsor.poster}
    muted={isMuted}
    autoPlay
    loop
    playsInline
    preload="metadata"
    controls={false}
    style={{
      width: "100%",
      height: "160px",
      objectFit: "cover",
      display: "block",
      background: "black",
    }}
  />

  <button
    type="button"
    onClick={() => setIsMuted((prev) => !prev)}
    style={{
      position: "absolute",
      top: "10px",
      right: "10px",
      width: "38px",
      height: "38px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(0,0,0,0.45)",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: 700,
      backdropFilter: "blur(10px)",
    }}
    aria-label={isMuted ? "Ton einschalten" : "Ton ausschalten"}
    title={isMuted ? "Ton einschalten" : "Ton ausschalten"}
  >
    {isMuted ? "🔇" : "🔊"}
  </button>
</div>
      
    </div>
  );
}