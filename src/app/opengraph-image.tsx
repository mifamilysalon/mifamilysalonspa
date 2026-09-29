import { ImageResponse } from "next/og";

export const alt = "Family Hair Salon & Wellness Spa in Farmington, MI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: "linear-gradient(135deg, #1a0a14 0%, #3d0a28 45%, #7a1048 100%)",
          color: "#f7f0f3",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: 0.85,
            marginBottom: 16,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Farmington, Michigan
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.05, maxWidth: 980 }}>
          Family Hair Salon & Wellness Spa
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            opacity: 0.9,
            fontFamily: "system-ui, sans-serif",
            maxWidth: 900,
          }}
        >
          Hair · Skin · Nails · Wellness · Private women&apos;s suite
        </div>
      </div>
    ),
    { ...size },
  );
}
