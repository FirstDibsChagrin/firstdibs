import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Browser,
  C,
  Copy,
  Cursor,
  FONT,
  FloatCard,
  LockIcon,
  Phone,
  Ring,
  Shots,
  Split,
  out,
} from "./components";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useEnter = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (delay: number, dist = 30) => {
    const sp = spring({ frame: f - delay, fps, config: { damping: 200 } });
    return { opacity: sp, transform: `translateY(${(1 - sp) * dist}px)` };
  };
};

/* Center of a captured element box (CSS px) */
const mid = (b: [number, number, number, number]) => ({
  x: b[0] + b[2] / 2,
  y: b[1] + b[3] / 2,
});

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: `linear-gradient(145deg, ${C.bright}, ${C.accent})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.56,
      boxShadow: `0 20px 60px rgba(34,197,94,0.35)`,
    }}
  >
    🏡
  </div>
);

/* ── 1. Intro ─────────────────────────────────────────────── */

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = useEnter();
  const logo = spring({ frame: f - 4, fps, config: { damping: 12, mass: 0.8 } });
  const words = ["Beat", "the", "bid"];
  const words2 = ["before", "it", "starts."];
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        color: "#fff",
      }}
    >
      <div style={{ transform: `scale(${logo})`, opacity: Math.min(1, logo * 1.5) }}>
        <Logo size={150} />
      </div>
      <div
        style={{
          ...e(14),
          marginTop: 40,
          fontSize: 132,
          fontWeight: 800,
          letterSpacing: -4,
          lineHeight: 1,
        }}
      >
        First Dibs
      </div>
      <div style={{ marginTop: 30, fontSize: 46, fontWeight: 700, display: "flex", gap: 14 }}>
        {[...words, ...words2].map((w, i) => (
          <span
            key={i}
            style={{
              ...e(30 + i * 4, 20),
              color: i >= words.length ? C.bright : "#fff",
            }}
          >
            {w}
          </span>
        ))}
      </div>
      <div
        style={{
          ...e(62),
          marginTop: 44,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 26px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.22)",
          background: "rgba(255,255,255,0.07)",
          fontSize: 22,
          color: "rgba(255,255,255,0.85)",
          fontWeight: 500,
        }}
      >
        📍 Homebuyer intelligence for Cuyahoga County, Ohio
      </div>
    </AbsoluteFill>
  );
};

/* ── 2. The problem ───────────────────────────────────────── */

const Stat: React.FC<{
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  at: number;
}> = ({ value, decimals, suffix, label, at }) => {
  const f = useCurrentFrame();
  const e = useEnter();
  const p = interpolate(f, [at, at + 40], [0, 1], { ...clamp, easing: out });
  return (
    <div
      style={{
        ...e(at, 40),
        width: 400,
        padding: "34px 36px",
        borderRadius: 24,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.13)",
      }}
    >
      <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: -2, color: "#fff" }}>
        {(value * p).toFixed(decimals)}
        <span style={{ color: C.bright }}>{suffix}</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 23, lineHeight: 1.4, color: "rgba(255,255,255,0.72)" }}>
        {label}
      </div>
    </div>
  );
};

export const Problem: React.FC = () => {
  const e = useEnter();
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}
    >
      <div
        style={{
          ...e(4),
          fontSize: 58,
          fontWeight: 800,
          letterSpacing: -1.5,
          textAlign: "center",
          lineHeight: 1.12,
          maxWidth: 1400,
        }}
      >
        First-time buyers are bidding against
        <br />
        <span style={{ color: C.bright }}>investors and cash offers.</span>
      </div>
      <div style={{ ...e(24), marginTop: 22, fontSize: 24, color: "rgba(255,255,255,0.6)" }}>
        Lakewood, OH · ZIP 44107, as shown in First Dibs
      </div>
      <div style={{ display: "flex", gap: 32, marginTop: 56 }}>
        <Stat value={32.4} decimals={1} suffix="%" label="of homes sold above asking price" at={34} />
        <Stat value={7.4} decimals={1} suffix="×" label="home prices vs. typical household income" at={44} />
        <Stat value={43} decimals={0} suffix="%" label="estimated investor ownership" at={54} />
      </div>
      <div
        style={{
          ...e(110),
          marginTop: 60,
          fontSize: 30,
          fontWeight: 500,
          color: "rgba(255,255,255,0.88)",
          textAlign: "center",
        }}
      >
        First Dibs maps this competition across{" "}
        <b style={{ color: "#fff" }}>all 51 ZIP codes</b> in Cuyahoga County,
        <br />
        and shows you how to compete anyway.
      </div>
    </AbsoluteFill>
  );
};

/* ── 3. ZIP search ────────────────────────────────────────── */

const BOX = {
  zipInput: [538, 432, 249, 36],
  checkBtn: [795, 428, 119, 43],
  scoreBadge: [1206, 230, 65, 66],
  info: [936, 205, 360, 783],
  presetDefault: [209, 126, 81, 32],
  presetAfford: [298, 126, 140, 32],
  presetInvestor: [446, 126, 133, 32],
  presetSpeed: [587, 126, 171, 32],
  compareToggle: [889, 127, 118, 30],
  rngCorp: [319, 211, 888, 18],
  scoreBadgeW: [1201, 711, 70, 66],
  cmp1: [306, 186, 236, 35],
  cmp2: [550, 186, 236, 35],
  cmp3: [794, 186, 236, 35],
  tabAfford: [260, 64, 125, 48],
  tabToolkit: [385, 64, 122, 48],
  calcIncome: [961, 239, 310, 35],
  calcBtn: [961, 699, 241, 37],
  viewToggle: [403, 170, 250, 33],
  viewAfford: [501, 174, 96, 25],
  escalation: [385, 343, 670, 62],
} as const satisfies Record<string, [number, number, number, number]>;

type B = [number, number, number, number];
const b = (k: keyof typeof BOX) => BOX[k] as unknown as B;

export const Search: React.FC = () => {
  const inp = mid(b("zipInput"));
  const btn = mid(b("checkBtn"));
  return (
    <Split
      copy={
        <Copy
          kicker="01 · ZIP lookup"
          title="Check any ZIP in seconds"
          body="Enter a Cuyahoga County ZIP code and get a 0–100 competition score built from six market signals."
        />
      }
    >
      <Browser
        cam={[
          { f: 0, x: 720, y: 405, z: 1 },
          { f: 30, x: 720, y: 405, z: 1 },
          { f: 48, x: 726, y: 452, z: 1.6 },
          { f: 96, x: 726, y: 452, z: 1.6 },
          { f: 112, x: 720, y: 405, z: 1 },
          { f: 140, x: 720, y: 405, z: 1 },
          { f: 172, x: 1110, y: 420, z: 1.75 },
          { f: 240, x: 1110, y: 440, z: 1.75 },
        ]}
      >
        <Shots
          items={[
            { src: "01_hero", at: 0 },
            { src: "02_type_1", at: 56, dur: 1 },
            { src: "02_type_3", at: 62, dur: 1 },
            { src: "02_type_4", at: 68, dur: 1 },
            { src: "02_type_5", at: 74, dur: 1 },
            { src: "03_zip_selected", at: 100, dur: 12 },
          ]}
        />
        <Ring box={b("scoreBadge")} from={176} to={236} radius={14} />
        <Cursor
          hideAt={100}
          keys={[
            { f: 18, x: 960, y: 640 },
            { f: 44, x: inp.x - 40, y: inp.y, click: true },
            { f: 80, x: inp.x - 40, y: inp.y },
            { f: 92, x: btn.x, y: btn.y, click: true },
            { f: 120, x: btn.x, y: btn.y },
          ]}
        />
      </Browser>
    </Split>
  );
};

/* ── 4. Score breakdown ───────────────────────────────────── */

export const Breakdown: React.FC = () => {
  const f = useCurrentFrame();
  const dim = interpolate(f, [26, 40], [1, 0.45], clamp);
  return (
    <AbsoluteFill>
      <Split
        copy={
          <Copy
            kicker="02 · Score breakdown"
            title="Every score explains itself"
            body="See the six signals behind each ZIP, ranked by how much they drive the score."
            bullets={[
              "Investor ownership (estimated)",
              "Days on market",
              "Sale-to-list ratio",
              "% of homes sold above asking",
              "Home price vs. typical income",
              "Months of supply",
            ]}
          />
        }
      >
        <div style={{ opacity: dim }}>
          <Browser cam={[{ f: 0, x: 520, y: 470, z: 1.2 }]}>
            <Shots items={[{ src: "03_zip_selected", at: 0 }]} />
          </Browser>
        </div>
      </Split>
      <FloatCard
        src="04_info_all_factors"
        width={396}
        aspect={1726 / 720}
        left={1320}
        top={65}
        at={26}
        drift={0}
      />
    </AbsoluteFill>
  );
};

/* ── 5. Presets ───────────────────────────────────────────── */

export const Presets: React.FC = () => {
  const pa = mid(b("presetAfford"));
  const pi = mid(b("presetInvestor"));
  const ps = mid(b("presetSpeed"));
  return (
    <Split
      copy={
        <Copy
          kicker="03 · View presets"
          title="One map, four lenses"
          body="Re-weight the score for what matters most to you, with one click. Lakewood's score updates live."
          bullets={["Default", "Affordability first", "Investor-aware", "Speed of competition"]}
          activeFrom={[0, 66, 121, 176]}
        />
      }
    >
      <Browser
        cam={[
          { f: 0, x: 720, y: 405, z: 1 },
          { f: 30, x: 640, y: 420, z: 1.18 },
          { f: 250, x: 660, y: 420, z: 1.2 },
        ]}
      >
        <Shots
          items={[
            { src: "05_preset_default", at: 0 },
            { src: "05_preset_affordability", at: 66 },
            { src: "05_preset_investor_aware", at: 121 },
            { src: "05_preset_speed", at: 176 },
          ]}
        />
        <Ring box={b("presetAfford")} from={60} to={116} radius={20} pad={4} />
        <Ring box={b("presetInvestor")} from={115} to={171} radius={20} pad={4} />
        <Ring box={b("presetSpeed")} from={170} to={240} radius={20} pad={4} />
        <Cursor
          keys={[
            { f: 14, x: 700, y: 450 },
            { f: 58, x: pa.x, y: pa.y, click: true },
            { f: 98, x: pa.x, y: pa.y },
            { f: 113, x: pi.x, y: pi.y, click: true },
            { f: 153, x: pi.x, y: pi.y },
            { f: 168, x: ps.x, y: ps.y, click: true },
            { f: 240, x: ps.x + 30, y: ps.y + 60 },
          ]}
        />
      </Browser>
    </Split>
  );
};

/* ── 6. Custom weights ────────────────────────────────────── */

export const Weights: React.FC = () => {
  const r = b("rngCorp");
  const xv = (v: number) => r[0] + 8 + (r[2] - 16) * (v / 100);
  const y = r[1] + r[3] / 2;
  const steps = [35, 45, 55, 65, 75, 90];
  const t0 = 66;
  const stepF = (i: number) => t0 + 10 + i * 9;
  return (
    <Split
      copy={
        <Copy
          kicker="04 · Custom weights"
          title="Make the score yours"
          body="Drag any of the six sliders and the whole map recalculates instantly. Weights always normalize to 100%."
          extra={
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
                fontFamily: FONT,
                fontSize: 20,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              <span style={{ lineHeight: 1.35 }}>
                Lakewood, with investor
                <br />
                ownership weighted up
              </span>
              <b style={{ color: "#fff", fontSize: 30, whiteSpace: "nowrap" }}>
                74 → <span style={{ color: "#f87171" }}>84</span>
              </b>
            </div>
          }
        />
      }
    >
      <Browser
        cam={[
          { f: 0, x: 720, y: 405, z: 1 },
          { f: 40, x: 700, y: 330, z: 1.3 },
          { f: 132, x: 760, y: 330, z: 1.3 },
          { f: 156, x: 720, y: 405, z: 1 },
          { f: 172, x: 720, y: 405, z: 1 },
          { f: 196, x: 1000, y: 640, z: 1.55 },
          { f: 240, x: 1000, y: 640, z: 1.6 },
        ]}
      >
        <Shots
          items={[
            { src: "06_weights_open", at: 0 },
            ...steps.map((v, i) => ({ src: `06_w_${v}`, at: stepF(i), dur: 3 })),
          ]}
        />
        <Ring box={b("scoreBadgeW")} from={196} to={250} radius={14} />
        <Cursor
          hideAt={150}
          keys={[
            { f: 16, x: 980, y: 520 },
            { f: t0 - 6, x: xv(25), y, click: true },
            { f: t0, x: xv(25), y },
            ...steps.map((v, i) => ({ f: stepF(i) + 1, x: xv(v), y })),
            { f: 160, x: xv(90), y: y + 10 },
          ]}
        />
      </Browser>
    </Split>
  );
};

/* ── 7. Compare ───────────────────────────────────────────── */

export const Compare: React.FC = () => {
  const ct = mid(b("compareToggle"));
  const c1 = mid(b("cmp1"));
  const c2 = mid(b("cmp2"));
  const c3 = mid(b("cmp3"));
  const f = useCurrentFrame();
  const dim = interpolate(f, [200, 214], [1, 0.45], clamp);
  return (
    <AbsoluteFill>
      <Split
        copy={
          <Copy
            kicker="05 · Compare"
            title="Compare up to three ZIPs"
            body="Put neighborhoods side by side. The highest-risk value in each row gets flagged, and you can print or share the comparison."
            bullets={["44107 · Lakewood", "44118 · Cleveland Heights", "44022 · Chagrin Falls"]}
            activeFrom={[80, 120, 160]}
          />
        }
      >
        <div style={{ opacity: dim }}>
          <Browser
            cam={[
              { f: 0, x: 720, y: 405, z: 1 },
              { f: 50, x: 720, y: 405, z: 1 },
              { f: 70, x: 600, y: 380, z: 1.15 },
              { f: 200, x: 640, y: 400, z: 1.15 },
            ]}
          >
            <Shots
              items={[
                { src: "05_preset_default", at: 0 },
                { src: "07_compare_empty", at: 40 },
                { src: "07_compare_1", at: 80 },
                { src: "07_compare_2", at: 120 },
                { src: "07_compare_3", at: 160 },
              ]}
            />
            <Ring box={b("compareToggle")} from={30} to={66} radius={18} pad={4} />
            <Cursor
              hideAt={190}
              keys={[
                { f: 10, x: 700, y: 460 },
                { f: 32, x: ct.x, y: ct.y, click: true },
                { f: 52, x: ct.x, y: ct.y },
                { f: 70, x: c1.x, y: c1.y, click: true },
                { f: 92, x: c1.x, y: c1.y },
                { f: 110, x: c2.x, y: c2.y, click: true },
                { f: 132, x: c2.x, y: c2.y },
                { f: 150, x: c3.x, y: c3.y, click: true },
                { f: 200, x: c3.x, y: c3.y + 40 },
              ]}
            />
          </Browser>
        </div>
      </Split>
      <FloatCard
        src="07_compare_panel"
        width={520}
        aspect={1226 / 720}
        left={1240}
        top={100}
        at={200}
      />
    </AbsoluteFill>
  );
};

/* ── 8. Affordability ─────────────────────────────────────── */

export const Afford: React.FC = () => {
  const ta = mid(b("tabAfford"));
  const inc = mid(b("calcIncome"));
  const cb = mid(b("calcBtn"));
  const va = mid(b("viewAfford"));
  return (
    <Split
      copy={
        <Copy
          kicker="06 · Affordability"
          title="Can I afford it here?"
          body="Enter income, savings, debts and credit range. See your max price with FHA and conventional loans, and which ZIPs fit your budget."
          extra={
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 18px",
                borderRadius: 12,
                background: "rgba(34,197,94,0.14)",
                border: "1px solid rgba(34,197,94,0.4)",
                fontFamily: FONT,
                fontSize: 19,
                fontWeight: 600,
                color: "#d1fae5",
                whiteSpace: "nowrap",
              }}
            >
              <LockIcon size={18} color="#86efac" />
              Your numbers never leave your browser.
            </div>
          }
        />
      }
    >
      <Browser
        cam={[
          { f: 0, x: 720, y: 405, z: 1 },
          { f: 40, x: 720, y: 405, z: 1 },
          { f: 62, x: 1110, y: 400, z: 1.55 },
          { f: 128, x: 1110, y: 430, z: 1.55 },
          { f: 146, x: 720, y: 405, z: 1 },
          { f: 156, x: 720, y: 405, z: 1 },
          { f: 178, x: 1110, y: 390, z: 1.6 },
          { f: 214, x: 1110, y: 420, z: 1.6 },
          { f: 232, x: 720, y: 405, z: 1 },
          { f: 258, x: 720, y: 405, z: 1 },
          { f: 280, x: 520, y: 430, z: 1.3 },
          { f: 310, x: 520, y: 430, z: 1.32 },
        ]}
      >
        <Shots
          items={[
            { src: "05_preset_default", at: 0 },
            { src: "08_afford_empty", at: 30 },
            { src: "08_afford_filled", at: 76, dur: 22 },
            { src: "09_afford_results_both", at: 132 },
            { src: "09_afford_view_afford", at: 254 },
          ]}
        />
        <Ring box={b("calcBtn")} from={112} to={136} radius={10} pad={4} />
        <Ring box={b("viewToggle")} from={238} to={290} radius={20} pad={4} />
        <Cursor
          keys={[
            { f: 6, x: 640, y: 300 },
            { f: 22, x: ta.x, y: ta.y, click: true },
            { f: 40, x: ta.x, y: ta.y },
            { f: 66, x: inc.x - 60, y: inc.y, click: true },
            { f: 100, x: inc.x - 60, y: inc.y + 10 },
            { f: 120, x: cb.x, y: cb.y, click: true },
            { f: 210, x: cb.x, y: cb.y - 20 },
            { f: 246, x: va.x, y: va.y, click: true },
            { f: 300, x: va.x + 40, y: va.y + 120 },
          ]}
        />
      </Browser>
    </Split>
  );
};

/* ── 9. Beat the Bid toolkit ──────────────────────────────── */

export const Toolkit: React.FC = () => {
  const tt = mid(b("tabToolkit"));
  const esc = b("escalation");
  return (
    <Split
      copy={
        <Copy
          kicker="07 · Beat the Bid"
          title="Strategy, not just data"
          body="A plain-English playbook for financed first-time buyers: when each tactic works, when it doesn't, and what to ask your agent."
          bullets={[
            "Escalation clause",
            "Appraisal gap coverage",
            "Full underwriting pre-approval",
            "Down payment assistance",
            "Free HUD-approved counselors",
          ]}
        />
      }
    >
      <Browser
        cam={[
          { f: 0, x: 720, y: 405, z: 1 },
          { f: 88, x: 720, y: 405, z: 1 },
          { f: 116, x: 720, y: 420, z: 1.5 },
          { f: 220, x: 720, y: 450, z: 1.55 },
        ]}
      >
        <Shots
          items={[
            { src: "05_preset_default", at: 0 },
            { src: "10_toolkit", at: 30 },
            { src: "10_toolkit_escalation", at: 82 },
          ]}
        />
        <Cursor
          hideAt={110}
          keys={[
            { f: 6, x: 640, y: 300 },
            { f: 22, x: tt.x, y: tt.y, click: true },
            { f: 46, x: tt.x, y: tt.y },
            { f: 74, x: esc[0] + 120, y: esc[1] + 20, click: true },
            { f: 120, x: esc[0] + 120, y: esc[1] + 40 },
          ]}
        />
      </Browser>
    </Split>
  );
};

/* ── 10. Methodology ──────────────────────────────────────── */

export const Methodology: React.FC = () => (
  <Split
    copy={
      <Copy
        kicker="08 · Methodology"
        title="Transparent by design"
        body="Every factor, weight, formula and data source is documented, including which numbers are estimates and the programs buyers can apply for."
      />
    }
  >
    <Browser
      url="firstdibschagrin.github.io/firstdibs/methodology.html"
      cam={[
        { f: 0, x: 720, y: 380, z: 1.05 },
        { f: 190, x: 720, y: 430, z: 1.15 },
      ]}
    >
      <Shots
        items={[
          { src: "11_method_top", at: 0 },
          { src: "11_method_six", at: 60, dur: 14 },
          { src: "11_method_you", at: 120, dur: 14 },
        ]}
      />
    </Browser>
  </Split>
);

/* ── 11. Mobile ───────────────────────────────────────────── */

export const Mobile: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p1 = spring({ frame: f - 6, fps, config: { damping: 200 } });
  const p2 = spring({ frame: f - 16, fps, config: { damping: 200 } });
  const float = (o: number) => Math.sin((f + o) / 28) * 6;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 96, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <Copy
          kicker="09 · Any device"
          title="Works on the phone in your pocket"
          body="The layout adapts to any screen, so you can check a ZIP from the driveway of an open house."
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 120 + float(0),
          opacity: p1,
          transform: `translateY(${(1 - p1) * 140}px) rotate(-4deg)`,
        }}
      >
        <Phone src="12_mobile_hero" width={390} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1230,
          top: 90 + float(40),
          opacity: p2,
          transform: `translateY(${(1 - p2) * 140}px) rotate(4deg)`,
        }}
      >
        <Phone src="12_mobile_map" width={390} />
      </div>
    </AbsoluteFill>
  );
};

/* ── 12. Outro ────────────────────────────────────────────── */

export const Outro: React.FC = () => {
  const e = useEnter();
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}
    >
      <div style={e(4)}>
        <Logo size={120} />
      </div>
      <div style={{ ...e(10), marginTop: 34, fontSize: 104, fontWeight: 800, letterSpacing: -3 }}>
        First Dibs
      </div>
      <div style={{ ...e(18), marginTop: 14, fontSize: 40, fontWeight: 700 }}>
        Beat the bid <span style={{ color: C.bright }}>before it starts.</span>
      </div>
      <div
        style={{
          ...e(30),
          marginTop: 48,
          padding: "18px 34px",
          borderRadius: 999,
          background: "#fff",
          color: C.primary,
          fontSize: 30,
          fontWeight: 700,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        }}
      >
        firstdibschagrin.github.io/firstdibs
      </div>
      <div
        style={{
          ...e(44),
          marginTop: 54,
          fontSize: 20,
          color: "rgba(255,255,255,0.62)",
          textAlign: "center",
          lineHeight: 1.8,
        }}
      >
        Built with HTML · CSS · JavaScript · Python · Leaflet
        <br />
        Data: Redfin · Cuyahoga County Fiscal Officer · U.S. Census ACS
      </div>
    </AbsoluteFill>
  );
};
