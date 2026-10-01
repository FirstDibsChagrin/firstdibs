import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const C = {
  primary: "#0f4c35",
  dark: "#0a3526",
  darker: "#062419",
  light: "#1a6b4a",
  accent: "#16a34a",
  bright: "#22c55e",
  bg: "#f0f4f2",
  text: "#111827",
};

export const FONT = "Inter, sans-serif";
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const out = Easing.bezier(0.16, 1, 0.3, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Screenshots are captured from a 1440x810 CSS-pixel viewport at 2x density.
export const PAGE_W = 1440;
export const PAGE_H = 810;

export type Box = [number, number, number, number];

/* ── Backdrop ─────────────────────────────────────────────── */



export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const g1x = 25 + Math.sin(t * 0.25) * 8;
  const g1y = 20 + Math.cos(t * 0.2) * 6;
  const g2x = 85 + Math.cos(t * 0.18) * 6;
  const g2y = 88 + Math.sin(t * 0.22) * 5;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1300px 900px at ${g1x}% ${g1y}%, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0) 60%),
          radial-gradient(1100px 800px at ${g2x}% ${g2y}%, rgba(26,107,74,0.55) 0%, rgba(26,107,74,0) 65%),
          linear-gradient(135deg, ${C.darker} 0%, ${C.primary} 55%, ${C.dark} 100%)`,
      }}
    >
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern
            id="plus"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${t * 5} ${t * 3})`}
          >
            <path
              d="M28 22v12M22 28h12"
              stroke="white"
              strokeOpacity="0.06"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#plus)" />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ── Camera / browser frame ───────────────────────────────── */

export type CamKey = { f: number; x: number; y: number; z: number };

const ScaleCtx = createContext(1);

const camAt = (cam: CamKey[] | undefined, f: number) => {
  if (!cam || cam.length === 0) return { x: PAGE_W / 2, y: PAGE_H / 2, z: 1 };
  if (cam.length === 1) return cam[0];
  const fs = cam.map((k) => k.f);
  const opt = { ...clamp, easing: inOut };
  // Interpolate segment by segment so each move gets its own ease.
  let i = 0;
  while (i < cam.length - 2 && f > fs[i + 1]) i++;
  const a = cam[i];
  const b = cam[i + 1];
  const p = interpolate(f, [a.f, b.f], [0, 1], opt);
  return {
    x: a.x + (b.x - a.x) * p,
    y: a.y + (b.y - a.y) * p,
    z: a.z + (b.z - a.z) * p,
  };
};

const LockIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 13,
  color = "#6b7280",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="10" width="16" height="11" rx="2.5" fill={color} />
    <path
      d="M8 10V7a4 4 0 0 1 8 0v3"
      stroke={color}
      strokeWidth="2.4"
      fill="none"
    />
  </svg>
);
export { LockIcon };

export const Browser: React.FC<{
  width?: number;
  cam?: CamKey[];
  url?: string;
  children: React.ReactNode;
}> = ({
  width = 1280,
  cam,
  url = "firstdibschagrin.github.io/firstdibs/",
  children,
}) => {
  const f = useCurrentFrame();
  const k = width / PAGE_W;
  const h = PAGE_H * k;
  const c = camAt(cam, f);
  const z = Math.max(1, c.z);
  const hw = PAGE_W / 2 / z;
  const hh = PAGE_H / 2 / z;
  const x = Math.min(Math.max(c.x, hw), PAGE_W - hw);
  const y = Math.min(Math.max(c.y, hh), PAGE_H - hh);
  const s = z * k;
  const tx = width / 2 - x * s;
  const ty = h / 2 - y * s;
  return (
    <div
      style={{
        width,
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        boxShadow:
          "0 50px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          height: 44,
          background: "#f3f4f6",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 8,
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((col) => (
          <div
            key={col}
            style={{ width: 13, height: 13, borderRadius: 7, background: col }}
          />
        ))}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 9,
              padding: "6px 18px",
              minWidth: 440,
              justifyContent: "center",
              fontFamily: FONT,
              fontSize: 15,
              color: "#4b5563",
            }}
          >
            <LockIcon />
            {url}
          </div>
        </div>
        <div style={{ width: 55 }} />
      </div>
      <div
        style={{
          width,
          height: h,
          position: "relative",
          overflow: "hidden",
          background: C.bg,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: PAGE_W,
            height: PAGE_H,
            transformOrigin: "0 0",
            transform: `translate(${tx}px, ${ty}px) scale(${s})`,
          }}
        >
          <ScaleCtx.Provider value={s}>{children}</ScaleCtx.Provider>
        </div>
      </div>
    </div>
  );
};

/* ── Screenshot stack with cross-fades ────────────────────── */

export const Shots: React.FC<{
  items: { src: string; at: number; dur?: number }[];
}> = ({ items }) => {
  const f = useCurrentFrame();
  return (
    <>
      {items.map((it, i) => {
        const d = it.dur ?? 10;
        const o =
          i === 0
            ? 1
            : interpolate(f, [it.at, it.at + d], [0, 1], {
                ...clamp,
                easing: inOut,
              });
        return (
          <Img
            key={i}
            src={staticFile(`shots/${it.src}.png`)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PAGE_W,
              height: PAGE_H,
              opacity: o,
            }}
          />
        );
      })}
    </>
  );
};

/* ── Cursor ───────────────────────────────────────────────── */

export type CursorKey = { f: number; x: number; y: number; click?: boolean };

export const Cursor: React.FC<{ keys: CursorKey[]; hideAt?: number }> = ({
  keys,
  hideAt,
}) => {
  const f = useCurrentFrame();
  const s = useContext(ScaleCtx);
  let i = 0;
  while (i < keys.length - 2 && f > keys[i + 1].f) i++;
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  const p =
    a === b
      ? 0
      : interpolate(f, [a.f, b.f], [0, 1], { ...clamp, easing: inOut });
  const x = a.x + (b.x - a.x) * p;
  const y = a.y + (b.y - a.y) * p;

  const first = keys[0].f;
  let opacity = interpolate(f, [first - 8, first], [0, 1], clamp);
  if (hideAt !== undefined) {
    opacity *= interpolate(f, [hideAt, hideAt + 8], [1, 0], clamp);
  }

  const clicks = keys.filter((k) => k.click).map((k) => k.f);
  let press = 1;
  const ripples: React.ReactNode[] = [];
  clicks.forEach((cf, idx) => {
    const d = f - cf;
    if (d >= -3 && d <= 5) press = Math.min(press, d < 1 ? 0.82 : 0.82 + (d / 5) * 0.18);
    if (d >= 0 && d <= 18) {
      const r = interpolate(d, [0, 18], [6, 34], { ...clamp, easing: out });
      const o = interpolate(d, [0, 18], [0.55, 0], clamp);
      ripples.push(
        <div
          key={idx}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: (r * 2) / s,
            height: (r * 2) / s,
            marginLeft: -r / s,
            marginTop: -r / s,
            borderRadius: "50%",
            border: `${3 / s}px solid ${C.bright}`,
            background: "rgba(34,197,94,0.18)",
            opacity: o,
          }}
        />,
      );
    }
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {ripples}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transformOrigin: "0 0",
          transform: `scale(${press / s})`,
        }}
      >
        <svg
          width="34"
          height="40"
          viewBox="0 0 17 20"
          style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }}
        >
          <path
            d="M1 1 L1 15.5 L4.6 12.2 L7.1 18 L9.6 16.9 L7.2 11.3 L12.1 11.3 Z"
            fill="#111"
            stroke="#fff"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

/* ── Highlight ring around an element ─────────────────────── */

export const Ring: React.FC<{
  box: Box;
  from: number;
  to: number;
  pad?: number;
  radius?: number;
}> = ({ box, from, to, pad = 6, radius = 12 }) => {
  const f = useCurrentFrame();
  const s = useContext(ScaleCtx);
  const o =
    interpolate(f, [from, from + 8], [0, 1], clamp) *
    interpolate(f, [to - 8, to], [1, 0], clamp);
  if (o <= 0) return null;
  const grow = interpolate(f, [from, from + 14], [10, 0], {
    ...clamp,
    easing: out,
  });
  const [x, y, w, h] = box;
  const p = pad + grow / s;
  return (
    <div
      style={{
        position: "absolute",
        left: x - p,
        top: y - p,
        width: w + p * 2,
        height: h + p * 2,
        borderRadius: radius,
        border: `${3 / s}px solid ${C.bright}`,
        boxShadow: `0 0 ${24 / s}px rgba(34,197,94,0.65)`,
        opacity: o,
      }}
    />
  );
};

/* ── Text column ──────────────────────────────────────────── */

export const Copy: React.FC<{
  kicker: string;
  title: string;
  body?: string;
  bullets?: string[];
  activeFrom?: number[];
  extra?: React.ReactNode;
  width?: number;
}> = ({ kicker, title, body, bullets, activeFrom, extra, width = 420 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number) => {
    const sp = spring({ frame: f - delay, fps, config: { damping: 200 } });
    return {
      opacity: sp,
      transform: `translateY(${(1 - sp) * 28}px)`,
    };
  };
  let active = -1;
  if (activeFrom) activeFrom.forEach((af, i) => f >= af && (active = i));

  return (
    <div style={{ width, fontFamily: FONT, color: "#fff" }}>
      <div
        style={{
          ...enter(4),
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 2.5,
          color: C.bright,
          textTransform: "uppercase",
        }}
      >
        <div style={{ width: 28, height: 3, borderRadius: 2, background: C.bright }} />
        {kicker}
      </div>
      <div
        style={{
          ...enter(8),
          marginTop: 18,
          fontSize: 54,
          lineHeight: 1.06,
          fontWeight: 800,
          letterSpacing: -1.5,
        }}
      >
        {title}
      </div>
      {body ? (
        <div
          style={{
            ...enter(14),
            marginTop: 22,
            fontSize: 23,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.74)",
            fontWeight: 400,
          }}
        >
          {body}
        </div>
      ) : null}
      {bullets ? (
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
          {bullets.map((b, i) => {
            const on = activeFrom ? i === active : true;
            const hi = activeFrom
              ? interpolate(
                  f,
                  [activeFrom[i], activeFrom[i] + 8],
                  [0, 1],
                  clamp,
                ) *
                (i + 1 < activeFrom.length
                  ? interpolate(
                      f,
                      [activeFrom[i + 1], activeFrom[i + 1] + 8],
                      [1, 0],
                      clamp,
                    )
                  : 1)
              : 0;
            return (
              <div
                key={b}
                style={{
                  ...enter(20 + i * 4),
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 21,
                  fontWeight: 500,
                  padding: "9px 14px",
                  marginLeft: -14,
                  borderRadius: 12,
                  background: `rgba(34,197,94,${0.16 * hi})`,
                  color: on || !activeFrom ? "#fff" : "rgba(255,255,255,0.55)",
                }}
              >
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    background: C.bright,
                    boxShadow: hi > 0.5 ? `0 0 12px ${C.bright}` : "none",
                    flexShrink: 0,
                  }}
                />
                {b}
              </div>
            );
          })}
        </div>
      ) : null}
      {extra ? <div style={{ ...enter(26), marginTop: 28 }}>{extra}</div> : null}
    </div>
  );
};

/* ── Standard split layout: copy left, browser right ──────── */

export const Split: React.FC<{
  copy: React.ReactNode;
  children: React.ReactNode;
}> = ({ copy, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 2, fps, config: { damping: 200 }, durationInFrames: 30 });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {copy}
      </div>
      <div
        style={{
          position: "absolute",
          left: 580,
          top: 158,
          opacity: sp,
          transform: `translateX(${(1 - sp) * 60}px) scale(${0.97 + sp * 0.03})`,
          transformOrigin: "left center",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ── Floating cropped screenshot (card close-up) ──────────── */

export const FloatCard: React.FC<{
  src: string;
  width: number;
  aspect: number; // height / width
  left: number;
  top: number;
  at: number;
  drift?: number;
}> = ({ src, width, aspect, left, top, at, drift = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - at, fps, config: { damping: 18, mass: 0.9 } });
  const o = interpolate(f, [at, at + 8], [0, 1], clamp);
  const dy = interpolate(f, [at, at + 200], [0, -drift], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: top + dy,
        width,
        height: width * aspect,
        opacity: o,
        transform: `translateY(${(1 - sp) * 120}px) scale(${0.92 + sp * 0.08})`,
        borderRadius: 22,
        overflow: "hidden",
        boxShadow:
          "0 60px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.06)",
        background: "#fff",
      }}
    >
      <Img src={staticFile(`shots/${src}.png`)} style={{ width: "100%", display: "block" }} />
    </div>
  );
};

/* ── Phone mockup ─────────────────────────────────────────── */

export const Phone: React.FC<{ src: string; width: number }> = ({ src, width }) => {
  const bezel = 14;
  const screenH = (width - bezel * 2) * (2532 / 1170);
  return (
    <div
      style={{
        width,
        height: screenH + bezel * 2,
        borderRadius: 58,
        background: "linear-gradient(145deg, #2b2f33, #0d0f10)",
        padding: bezel,
        boxShadow:
          "0 60px 120px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.08)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 44,
          overflow: "hidden",
          position: "relative",
          background: "#fff",
        }}
      >
        <Img src={staticFile(`shots/${src}.png`)} style={{ width: "100%", display: "block" }} />
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            width: 110,
            height: 30,
            marginLeft: -55,
            borderRadius: 16,
            background: "#000",
          }}
        />
      </div>
    </div>
  );
};
