"use client";

import type { SponsorItem } from "@/data/sponsorData/sponsors";

type SponsorCardProps = {
  sponsor: SponsorItem;
};

export default function SponsorCard({ sponsor }: SponsorCardProps) {
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
          marginBottom: "12px",
        }}
      >
        {sponsor.label}
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
          src={sponsor.video}
          poster={sponsor.poster}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            height: "160px",
            objectFit: "cover",
            display: "block",
            background: "black",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: sponsor.website ? "space-between" : "flex-end",
          alignItems: "center",
          gap: "10px",
          marginTop: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Sponsor Preview
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
              padding: "10px 14px",
              borderRadius: "14px",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 700,
              color: "white",
              background: "linear-gradient(90deg, #6d28d9, #9333ea)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Mehr erfahren
          </a>
        )}
      </div>
    </div>
  );
}