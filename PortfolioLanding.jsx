import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useInView, useScroll, useMotionTemplate } from "framer-motion";

/* ─── DESIGN TOKENS ─── */
const C = {
  bg: "#02020a",
  s1: "#07071a",
  s2: "#0d0d24",
  border: "rgba(255,255,255,0.06)",
  borderBright: "rgba(255,255,255,0.12)",
  text: "#e2e2f0",
  muted: "#6b6b8a",
  dim: "#2a2a40",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  rose: "#f43f5e",
  amber: "#f59e0b",
  emerald: "#10b981",
  pink: "#ec4899",
};

/* ─── UTILS ─── */
const cn = (...c) => c.filter(Boolean).join(" ");

/* ══════════════════════════════════════
   AURORA BACKGROUND
══════════════════════════════════════ */
function Aurora() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[
        { color: "#7c3aed", x: "-10%", y: "-20%", delay: 0, size: 800 },
        { color: "#0891b2", x: "60%", y: "20%", delay: -8, size: 700 },
        { color: "#be185d", x: "20%", y: "60%", delay: -16, size: 600 },
        { color: "#059669", x: "75%", y: "70%", delay: -12, size: 500 },
      ].map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: b.size, height: b.size,
            borderRadius: "50%",
            background: b.color,
            left: b.x, top: b.y,
            filter: "blur(130px)",
            opacity: 0.15,
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
        />
      ))}
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
      }} />
    </div>
  );
}

/* ══════════════════════════════════════
   SHOOTING STARS
══════════════════════════════════════ */
function ShootingStar({ delay }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${Math.random() * 50}%`,
        left: "-10px",
        width: 2, height: 2,
        borderRadius: "50%",
        background: "white",
        boxShadow: "0 0 6px 2px rgba(255,255,255,0.4)",
      }}
      initial={{ x: -50, y: 0, opacity: 0 }}
      animate={{ x: "120vw", y: "40vh", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: Math.random() * 8 + 4, ease: "easeIn" }}
    />
  );
}

/* ══════════════════════════════════════
   CURSOR GLOW
══════════════════════════════════════ */
function CursorGlow() {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });
  useEffect(() => {
    const m = e => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);
  return (
    <>
      <motion.div style={{
        position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999,
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        translateX: useTransform(sx, v => v - 350),
        translateY: useTransform(sy, v => v - 350),
      }} />
      <motion.div style={{
        position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 10000,
        width: 8, height: 8, borderRadius: "50%",
        background: C.violet, boxShadow: `0 0 15px ${C.violet}`,
        translateX: useTransform(x, v => v - 4),
        translateY: useTransform(y, v => v - 4),
      }} />
    </>
  );
}

/* ══════════════════════════════════════
   TEXT SCRAMBLE
══════════════════════════════════════ */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
function ScrambleText({ text, trigger }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!trigger) return;
    let iter = 0;
    const interval = setInterval(() => {
      setDisplay(text.split("").map((c, i) =>
        i < iter ? c : c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join(""));
      iter += 0.5;
      if (iter >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [trigger, text]);
  return <span>{display}</span>;
}

/* ══════════════════════════════════════
   GRADIENT TEXT
══════════════════════════════════════ */
function GradText({ children, from = C.violet, to = C.cyan, style = {} }) {
  return (
    <span style={{
      background: `linear-gradient(135deg, ${from}, ${to})`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      backgroundClip: "text", ...style,
    }}>{children}</span>
  );
}

/* ══════════════════════════════════════
   MAGNETIC BUTTON
══════════════════════════════════════ */
function MagButton({ children, onClick, variant = "primary", style = {} }) {
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const handleMove = useCallback(e => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.35);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  }, []);
  const handleLeave = () => { x.set(0); y.set(0); };

  const base = {
    position: "relative", border: "none", cursor: "none",
    padding: "12px 28px", borderRadius: 10, fontWeight: 600,
    fontSize: 14, letterSpacing: "0.01em",
    display: "inline-flex", alignItems: "center", gap: 8,
    ...style,
  };
  const styles = variant === "primary"
    ? { background: "linear-gradient(135deg, #7c3aed, #06b6d4)", color: "#fff", boxShadow: "0 0 40px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }
    : { background: "rgba(255,255,255,0.04)", color: C.text, border: `1px solid ${C.borderBright}` };

  return (
    <motion.button
      ref={ref}
      style={{ ...base, ...styles, translateX: sx, translateY: sy }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      {children}
      {variant === "primary" && (
        <motion.div style={{
          position: "absolute", inset: 0, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)",
          pointerEvents: "none",
        }} />
      )}
    </motion.button>
  );
}

/* ══════════════════════════════════════
   GLASS CARD (3D tilt)
══════════════════════════════════════ */
function TiltCard({ children, style = {}, className }) {
  const ref = useRef(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20 });
  const handleMove = e => {
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    rx.set(ny * 14); ry.set(-nx * 14);
  };
  const handleLeave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, backdropFilter: "blur(12px)",
        rotateX: srx, rotateY: sry,
        transformStyle: "preserve-3d",
        position: "relative", overflow: "hidden",
        ...style,
      }}
      whileHover={{ borderColor: "rgba(139,92,246,0.3)", boxShadow: "0 20px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.2)" }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer */}
      <motion.div style={{
        position: "absolute", inset: 0, borderRadius: 16,
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(139,92,246,0.05) 100%)",
        pointerEvents: "none",
      }} />
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════ */
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 2000;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(e * target));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ══════════════════════════════════════
   SECTION REVEAL
══════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};
const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay } }
});

function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={stagger(delay)} initial="hidden" animate={inView ? "show" : "hidden"} style={style}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
function Nav({ onSection }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 800,
        height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 32px",
        background: scrolled ? "rgba(2,2,10,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: "#fff",
        }}>HT</div>
        <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: C.text, letterSpacing: "-0.02em" }}>
          Hashaam Tanveer
        </span>
      </div>
      {/* Links */}
      <div style={{ display: "flex", gap: 4 }}>
        {["About", "Experience", "Stack", "Work", "Contact"].map(l => (
          <motion.button key={l}
            onClick={() => onSection(l.toLowerCase())}
            style={{ background: "transparent", border: "none", cursor: "none", padding: "6px 14px", borderRadius: 8, fontSize: 13, color: C.muted, fontFamily: "'Inter',sans-serif" }}
            whileHover={{ color: C.text, backgroundColor: "rgba(255,255,255,0.05)" }}
          >{l}</motion.button>
        ))}
      </div>
      {/* CTA */}
      <MagButton onClick={() => onSection("contact")} style={{ padding: "8px 20px", fontSize: 13 }}>
        Hire Me ↗
      </MagButton>
    </motion.nav>
  );
}

/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
function Hero({ onSection }) {
  const [scramble, setScramble] = useState(false);
  useEffect(() => { setTimeout(() => setScramble(true), 800); }, []);

  const words = ["Systems", "Pipelines", "Frameworks", "Workflows", "Architecture"];
  const [wi, setWi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWi(p => (p + 1) % words.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", zIndex: 10 }}>
      {/* Floating stars */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 6 }).map((_, i) => <ShootingStar key={i} delay={i * 3} />)}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 100, padding: "5px 16px", marginBottom: 32,
          fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase",
          color: "#a78bfa", fontFamily: "'Inter',sans-serif",
        }}
      >
        <motion.div
          style={{ width: 6, height: 6, borderRadius: "50%", background: C.emerald, boxShadow: `0 0 8px ${C.emerald}` }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        Available for Remote Roles · Islamabad PKT
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontSize: "clamp(52px, 8vw, 110px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em", marginBottom: 28, fontFamily: "'Inter',sans-serif" }}
      >
        <span style={{ display: "block", color: "#fff" }}>Marketing</span>
        <span style={{ display: "block" }}>
          <GradText from={C.violet} to={C.cyan}>
            <AnimatePresence mode="wait">
              <motion.span
                key={wi}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.4 }}
                style={{ display: "inline-block" }}
              >{words[wi]}</motion.span>
            </AnimatePresence>
          </GradText>
        </span>
        <span style={{ display: "block", color: "#fff" }}>Engineered.</span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{ fontSize: 18, color: C.muted, maxWidth: 560, lineHeight: 1.7, marginBottom: 40, fontFamily: "'Inter',sans-serif" }}
      >
        <span style={{ color: C.text, fontWeight: 500 }}>Hashaam Tanveer</span> — 6+ years building the CRM systems,
        automation pipelines, and revenue infrastructure that high-growth teams scale on.
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}
      >
        <MagButton onClick={() => onSection("work")}>Explore Work →</MagButton>
        <MagButton variant="ghost" onClick={() => onSection("contact")} style={{ padding: "12px 28px", fontSize: 14 }}>
          Get in Touch
        </MagButton>
      </motion.div>

      {/* STATS ROW */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        style={{ display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" }}
      >
        {[
          { v: 6, suffix: "+", label: "Years Experience" },
          { v: 25, suffix: "+", label: "Automations Built" },
          { v: 40, suffix: "%", label: "Avg Work Removed" },
          { v: 4, suffix: "", label: "Global Markets" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "'Inter',sans-serif" }}>
              <GradText from={C.violet} to={C.cyan}>
                <Counter target={s.v} suffix={s.suffix} />
              </GradText>
            </div>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginTop: 4, fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
      >
        <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.6))" }} />
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.violet, boxShadow: `0 0 8px ${C.violet}` }} />
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════
   BENTO GRID — ABOUT
══════════════════════════════════════ */
function About() {
  const cells = [
    {
      span: "2", rowSpan: "1",
      content: (
        <div style={{ padding: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.violet, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>// About</div>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff", marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>
            I build the <GradText from={C.violet} to={C.pink}>machine</GradText><br />behind the machine.
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: C.muted, maxWidth: 480, fontFamily: "'Inter',sans-serif" }}>
            Most marketing orgs are held back by broken infrastructure. Leads disappear. Data lives in silos.
            Reporting is a spreadsheet emailed on Fridays. I dismantle all of that — and replace it with systems that compound.
          </p>
        </div>
      ),
    },
    {
      span: "1", rowSpan: "1",
      content: (
        <div style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.cyan, fontFamily: "'Inter',sans-serif" }}>// Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Location", val: "Islamabad, PKT", dot: C.emerald },
              { label: "Availability", val: "Remote · Now", dot: C.emerald },
              { label: "Current Role", val: "Head of Smart Systems", dot: C.violet },
              { label: "MBA", val: "SZABIST · Marketing", dot: C.cyan },
              { label: "AI Diploma", val: "NUST · 2023", dot: C.amber },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.05em", fontFamily: "'Inter',sans-serif" }}>{r.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text, fontWeight: 500, fontFamily: "'Inter',sans-serif" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: r.dot, boxShadow: `0 0 6px ${r.dot}` }} />
                  {r.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Stat cards
    ...[ 
      { v: "6+", label: "Years Active", g: [C.violet, C.pink] },
      { v: "25+", label: "Workflows Built", g: [C.cyan, C.emerald] },
      { v: "30%", label: "Lead Work Cut", g: [C.amber, C.rose] },
      { v: "7+", label: "Enterprise Brands", g: [C.pink, C.violet] },
    ].map(s => ({
      span: "1", rowSpan: "1",
      content: (
        <div style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
          <div style={{ fontSize: "clamp(36px, 3.5vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", fontFamily: "'Inter',sans-serif" }}>
            <GradText from={s.g[0]} to={s.g[1]}>{s.v}</GradText>
          </div>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
        </div>
      ),
    })),
    {
      span: "2", rowSpan: "1",
      content: (
        <div style={{ padding: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.amber, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>// Certifications & Awards</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["HubSpot Marketing Hub ✓", "HubSpot Sales Hub ✓", "Object Detection · NUST", "Team Lead of Year 2023 🏆", "Employee of Month Jan 2023"].map((c, i) => (
              <motion.span key={i} whileHover={{ scale: 1.05 }}
                style={{
                  fontSize: 11, padding: "5px 12px", borderRadius: 6,
                  background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                  color: "#a78bfa", fontFamily: "'Inter',sans-serif", letterSpacing: "0.03em", cursor: "none",
                }}>{c}</motion.span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "0 24px 120px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "auto auto auto",
        gap: 12,
      }}>
        {cells.map((c, i) => (
          <Reveal key={i} delay={i * 0.07} style={{ gridColumn: `span ${c.span}` }}>
            <TiltCard style={{ minHeight: 160 }}>
              {c.content}
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   EXPERIENCE
══════════════════════════════════════ */
const EXP = [
  {
    co: "Magtyne", role: "Head of Smart Systems", period: "Jan 2026 — Present · USA Remote",
    color: C.violet, kpis: [["40%", "Work Removed"], ["n8n", "Engine"], ["∞", "Clients"]],
    points: [
      "Built end-to-end n8n automation systems eliminating 40% of recurring manual work",
      "Designed and launched client websites from wireframes through post-launch handoff",
      "Built Notion operations dashboards and ClickUp project spaces for real-time visibility",
      "Created custom CRM systems on Replit for clients where off-the-shelf tools failed",
    ],
    tags: ["n8n", "Notion", "ClickUp", "Replit", "Zapier"],
  },
  {
    co: "Zones LLC", role: "Marketing Operations Specialist", period: "Jul 2024 — Jan 2026 · Islamabad",
    color: C.cyan, kpis: [["25+", "Workflows"], ["30%", "Lead Work Cut"], ["7+", "Brands"]],
    points: [
      "HubSpot Super Admin: full CRM config, pipelines, lifecycle stages, user roles",
      "Built 25+ automation workflows — lead routing, lifecycle, alerts, webinar follow-ups",
      "Designed Subscriber → MQL → SQL → Opportunity → Customer lifecycle framework",
      "Delivered campaigns for Adobe, Microsoft, Apple, Cisco, Intel, HP, Lenovo",
    ],
    tags: ["HubSpot", "Zapier", "MS Dynamics 365", "Wrike", "Hootsuite"],
  },
  {
    co: "Pixako", role: "Operations Team Lead", period: "Aug 2022 — Jul 2024 · Islamabad",
    color: C.emerald, kpis: [["3", "Ad Platforms"], ["AU", "Partner Market"], ["↑", "Throughput"]],
    points: [
      "Led operational improvements across PR and digital marketing agency",
      "Managed Zoho CRM for full lead-to-close pipeline management",
      "Coordinated campaigns with Australian partners at MediaNet across time zones",
      "Managed Google Ads, Facebook, Instagram campaigns with full attribution",
    ],
    tags: ["Zoho CRM", "Jira", "Google Ads", "Meta Ads", "MediaNet"],
  },
  {
    co: "Pixako", role: "Operations Associate", period: "Aug 2020 — Jul 2022 · Islamabad",
    color: C.amber, kpis: [["10+", "Domains"], ["B2B", "Lead Gen"], ["GA4", "Tracking"]],
    points: [
      "Managed backend operations for 10+ WordPress domains",
      "Ran email marketing campaigns tracked through Google Analytics",
      "Generated B2B leads through structured LinkedIn outreach",
    ],
    tags: ["WordPress", "Google Analytics", "Email Marketing", "LinkedIn"],
  },
  {
    co: "iCrowdNewswire", role: "Data Researcher", period: "May 2020 — Aug 2020 · Remote USA",
    color: C.rose, kpis: [["ZoomInfo", "Data Tool"], ["B2B", "Prospecting"], ["↑", "Response Rate"]],
    points: [
      "B2B prospecting via LinkedIn to qualify leads for account management teams",
      "Used ZoomInfo, Hunter.io, LeadLeaper, Skrapp.io to verify prospect data",
      "Developed outreach templates that improved team response rates",
    ],
    tags: ["ZoomInfo", "Hunter.io", "LinkedIn", "B2B"],
  },
];

function Experience() {
  const [active, setActive] = useState(0);
  const e = EXP[active];
  return (
    <section style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "0 24px 120px" }}>
      <Reveal>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.violet, marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>// Experience</div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginBottom: 56, fontFamily: "'Inter',sans-serif" }}>
          Six years. <GradText from={C.cyan} to={C.emerald}>Four markets.</GradText>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          {/* Sidebar */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            {EXP.map((job, i) => (
              <motion.div key={i}
                onClick={() => setActive(i)}
                style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "none", position: "relative", overflow: "hidden" }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                animate={{ backgroundColor: active === i ? "rgba(139,92,246,0.08)" : "rgba(0,0,0,0)" }}
              >
                {active === i && (
                  <motion.div layoutId="expIndicator" style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                    background: `linear-gradient(to bottom, ${job.color}, transparent)`,
                  }} />
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: active === i ? "#fff" : C.muted, fontFamily: "'Inter',sans-serif", transition: "color 0.2s" }}>{job.co}</div>
                <div style={{ fontSize: 10, color: C.dim, letterSpacing: "0.05em", marginTop: 3, fontFamily: "'Inter',sans-serif" }}>{job.period.split("·")[0]}</div>
              </motion.div>
            ))}
          </div>
          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: 40, background: "rgba(255,255,255,0.01)" }}
            >
              <div style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>
                {e.co}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>
                <GradText from={e.color} to={C.cyan}>{e.role}</GradText>
              </div>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 28, fontFamily: "'Inter',sans-serif" }}>{e.period}</div>
              {/* KPIs */}
              <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
                {e.kpis.map(([v, l], i) => (
                  <div key={i} style={{ padding: "14px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, textAlign: "center", minWidth: 80 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", fontFamily: "'Inter',sans-serif" }}>
                      <GradText from={e.color} to={C.cyan}>{v}</GradText>
                    </div>
                    <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2, fontFamily: "'Inter',sans-serif" }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Points */}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {e.points.map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: 13, color: C.muted, lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
                    <span style={{ color: e.color, flexShrink: 0, marginTop: 3 }}>→</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {e.tags.map((t, i) => (
                  <span key={i} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, background: `${e.color}15`, border: `1px solid ${e.color}30`, color: e.color, fontFamily: "'Inter',sans-serif", letterSpacing: "0.04em" }}>{t}</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

/* ══════════════════════════════════════
   SKILLS
══════════════════════════════════════ */
const SKILLS = [
  { g: "CRM & Automation", color: C.violet, items: [{ n: "HubSpot (Super Admin)", p: 97 }, { n: "n8n", p: 91 }, { n: "Zapier", p: 88 }, { n: "Zoho CRM", p: 82 }, { n: "GoHighLevel", p: 70 }] },
  { g: "Analytics & Ads", color: C.cyan, items: [{ n: "Google Analytics 4", p: 89 }, { n: "Google Ads", p: 82 }, { n: "Meta Ads", p: 80 }, { n: "LinkedIn Ads", p: 74 }, { n: "GTM", p: 75 }] },
  { g: "Project Ops", color: C.emerald, items: [{ n: "ClickUp / Wrike", p: 90 }, { n: "Notion / Airtable", p: 88 }, { n: "Jira", p: 80 }, { n: "Asana", p: 76 }] },
  { g: "Build & Deploy", color: C.amber, items: [{ n: "WordPress", p: 86 }, { n: "Supabase / Replit", p: 74 }, { n: "Bubble / Glide", p: 71 }, { n: "Cursor / Lovable", p: 77 }] },
];

function SkillBar({ n, p, color, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: C.text, fontFamily: "'Inter',sans-serif" }}>{n}</span>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Inter',sans-serif" }}>{p}</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: inView ? `${p}%` : 0 }}
          transition={{ duration: 1.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}88)`, position: "relative" }}
        >
          <div style={{ position: "absolute", right: 0, top: -3, width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
        </motion.div>
      </div>
    </div>
  );
}

function Stack() {
  return (
    <section style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "0 24px 120px" }}>
      <Reveal>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.violet, marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>// Technical Stack</div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginBottom: 56, fontFamily: "'Inter',sans-serif" }}>
          What's running <GradText from={C.amber} to={C.rose}>under the hood.</GradText>
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {SKILLS.map((group, gi) => (
          <Reveal key={gi} delay={gi * 0.08}>
            <TiltCard style={{ padding: 28 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: group.color, marginBottom: 20, fontFamily: "'Inter',sans-serif" }}>{group.g}</div>
              {group.items.map((s, i) => (
                <SkillBar key={i} {...s} color={group.color} i={i} />
              ))}
            </TiltCard>
          </Reveal>
        ))}
      </div>
      {/* Tool pill cloud */}
      <Reveal delay={0.3} style={{ marginTop: 24 }}>
        <TiltCard style={{ padding: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>// Full Tool Inventory</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["HubSpot", "n8n", "Zapier", "Zoho CRM", "MS Dynamics 365", "GoHighLevel", "Salesforce", "Marketo", "GA4", "GTM", "Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads", "Amazon Ads", "Hootsuite", "ClickUp", "Wrike", "Jira", "Asana", "Notion", "Airtable", "WordPress", "Bubble", "Shopify", "Squarespace", "Webflow", "Lovable", "Bolt", "Glide", "Supabase", "Replit", "Vercel", "Netlify", "Cursor", "Canva", "Bynder", "Power Automate", "SEO", "ABM", "Lead Scoring"].map((t, i) => (
              <motion.span key={i} whileHover={{ scale: 1.08, background: "rgba(139,92,246,0.15)" }}
                style={{
                  fontSize: 11, padding: "4px 12px", borderRadius: 6,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: C.muted, fontFamily: "'Inter',sans-serif", cursor: "none", transition: "all 0.2s",
                }}
              >{t}</motion.span>
            ))}
          </div>
        </TiltCard>
      </Reveal>
    </section>
  );
}

/* ══════════════════════════════════════
   WORK
══════════════════════════════════════ */
const WORK = [
  { num: "01", tags: ["HubSpot", "RevOps", "CRM"], title: "Full Lifecycle CRM Architecture", company: "Zones LLC", desc: "Rebuilt HubSpot end-to-end. 25+ workflows, Subscriber→Customer lifecycle, HubSpot × Dynamics 365 sync, 7 Fortune 500 partner programs.", metric: "30%", metricLabel: "Manual work cut", color: C.violet },
  { num: "02", tags: ["n8n", "Automation"], title: "n8n Automation Infrastructure", company: "Magtyne", desc: "End-to-end automation systems replacing repetitive human work. Multi-client deployment, zero-drift pipelines that run without babysitting.", metric: "40%", metricLabel: "Time saved", color: C.cyan },
  { num: "03", tags: ["Campaigns", "Attribution"], title: "Enterprise Partner Campaign Engine", company: "Zones LLC", desc: "Landing pages, nurture sequences, and attribution dashboards for Adobe, Microsoft, Apple, Cisco, Intel, HP, Lenovo partner programs.", metric: "7+", metricLabel: "Enterprise brands", color: C.emerald },
  { num: "04", tags: ["Ops", "Notion", "ClickUp"], title: "Client Ops Dashboard System", company: "Magtyne", desc: "Notion dashboards and ClickUp project spaces built with senior management. Real-time visibility across all concurrent client engagements.", metric: "10+", metricLabel: "Clients managed", color: C.amber },
  { num: "05", tags: ["WordPress", "Ads", "GA4"], title: "Multi-Domain Digital Infrastructure", company: "Pixako", desc: "Backend ops for 10+ WordPress domains. Google Ads, Meta, Instagram campaigns with full GA4 conversion tracking and attribution.", metric: "10+", metricLabel: "Domains managed", color: C.rose },
];

function Work() {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "0 24px 120px" }}>
      <Reveal>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.violet, marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>// Selected Work</div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginBottom: 56, fontFamily: "'Inter',sans-serif" }}>
          Five dispatches <GradText from={C.rose} to={C.amber}>from the field.</GradText>
        </h2>
      </Reveal>
      <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {WORK.map((w, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <motion.div
              onHoverStart={() => setHovered(i)} onHoverEnd={() => setHovered(null)}
              style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", alignItems: "center", gap: 24, padding: "24px 28px", borderBottom: i < WORK.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", cursor: "none", position: "relative", overflow: "hidden" }}
              animate={{ backgroundColor: hovered === i ? "rgba(255,255,255,0.03)" : "transparent" }}
            >
              <motion.div
                style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${w.color}, transparent)` }}
                initial={{ scaleY: 0 }} animate={{ scaleY: hovered === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: C.dim, letterSpacing: "0.08em" }}>{w.num}</span>
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  {w.tags.map((t, j) => (
                    <span key={j} style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)", color: C.dim, fontFamily: "'Inter',sans-serif" }}>{t}</span>
                  ))}
                  <span style={{ fontSize: 9, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 4, background: `${w.color}15`, border: `1px solid ${w.color}25`, color: w.color, fontFamily: "'Inter',sans-serif" }}>{w.company}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-0.01em", fontFamily: "'Inter',sans-serif" }}>{w.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 540, fontFamily: "'Inter',sans-serif" }}>{w.desc}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", fontFamily: "'Inter',sans-serif" }}>
                  <GradText from={w.color} to={C.cyan}>{w.metric}</GradText>
                </div>
                <div style={{ fontSize: 10, color: C.dim, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>{w.metricLabel}</div>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   CONTACT
══════════════════════════════════════ */
function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "0 24px 160px" }}>
      <Reveal>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.violet, marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>// Contact</div>
        <h2 style={{ fontSize: "clamp(40px, 5vw, 80px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 64, lineHeight: 0.95, fontFamily: "'Inter',sans-serif" }}>
          Ready to ship<br /><GradText from={C.violet} to={C.cyan}>something great?</GradText>
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Left */}
        <Reveal>
          <TiltCard style={{ padding: 48, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 40, fontFamily: "'Inter',sans-serif" }}>
                Whether you need a HubSpot rebuild from scratch, an n8n pipeline that holds up under pressure, or a RevOps partner who owns the outcome — this is where it starts.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Email", val: "hashaamtanveerk@gmail.com", href: "mailto:hashaamtanveerk@gmail.com" },
                  { label: "WhatsApp", val: "+92-336-5717-466", href: "tel:+923365717466" },
                  { label: "LinkedIn", val: "Connect Here", href: "#" },
                ].map((l, i) => (
                  <motion.a key={i} href={l.href}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", textDecoration: "none", cursor: "none" }}
                    whileHover={{ paddingLeft: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.dim, fontFamily: "'Inter',sans-serif" }}>{l.label}</span>
                    <motion.span style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: "'Inter',sans-serif" }} whileHover={{ color: C.violet }}>{l.val} →</motion.span>
                  </motion.a>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 32, fontSize: 11, color: C.dim, fontFamily: "'Inter',sans-serif" }}>
              <motion.div style={{ width: 6, height: 6, borderRadius: "50%", background: C.emerald, boxShadow: `0 0 8px ${C.emerald}` }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              Available for remote work · Islamabad, PKT +5:00
            </div>
          </TiltCard>
        </Reveal>
        {/* Form */}
        <Reveal delay={0.1}>
          <TiltCard style={{ padding: 40 }}>
            {!sent ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { label: "Your Name", ph: "Full name", type: "text" },
                  { label: "Email", ph: "you@company.com", type: "email" },
                  { label: "Organization", ph: "Company or context", type: "text" },
                ].map((f, i) => (
                  <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 0 }}>
                    <label style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.dim, padding: "14px 0 2px", display: "block", fontFamily: "'Inter',sans-serif" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.ph} style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.text, width: "100%", padding: "4px 0 14px", caretColor: C.violet, fontFamily: "'Inter',sans-serif" }} />
                  </div>
                ))}
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <label style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.dim, padding: "14px 0 2px", display: "block", fontFamily: "'Inter',sans-serif" }}>What needs to be built?</label>
                  <textarea placeholder="Describe the project, role, or challenge…" style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.text, width: "100%", padding: "4px 0 14px", minHeight: 90, resize: "none", caretColor: C.violet, fontFamily: "'Inter',sans-serif" }} />
                </div>
                <motion.button
                  onClick={() => { setSent(true); setTimeout(() => setSent(false), 4000); }}
                  style={{ marginTop: 24, background: "linear-gradient(135deg, #7c3aed, #06b6d4)", color: "#fff", border: "none", padding: "15px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "none", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Inter',sans-serif", boxShadow: "0 4px 24px rgba(124,58,237,0.3)" }}
                  whileHover={{ opacity: 0.9, y: -1 }} whileTap={{ scale: 0.97 }}
                >
                  <span>Send Message</span><span>→</span>
                </motion.button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: 40 }}
              >
                <motion.div animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }} style={{ fontSize: 48, marginBottom: 16 }}>✓</motion.div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>Message Sent</div>
                <div style={{ fontSize: 13, color: C.muted, fontFamily: "'Inter',sans-serif" }}>Hashaam will respond shortly.</div>
              </motion.div>
            )}
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(2,2,10,0.8)", backdropFilter: "blur(20px)" }}>
      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: C.dim }}>© 2026 Hashaam Tanveer · Marketing Infrastructure</span>
      <div style={{ display: "flex", gap: 24 }}>
        {["Email", "LinkedIn", "Resume PDF"].map(l => (
          <motion.a key={l} href="#" style={{ fontSize: 12, color: C.dim, textDecoration: "none", cursor: "none", fontFamily: "'Inter',sans-serif" }}
            whileHover={{ color: C.text }}>{l}</motion.a>
        ))}
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════
   INTRO SCREEN
══════════════════════════════════════ */
function Intro({ onDone }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v += Math.random() * 18 + 4;
      if (v >= 100) { v = 100; clearInterval(id); setTimeout(onDone, 400); }
      setPct(Math.floor(v));
    }, 60);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginBottom: 40, fontFamily: "'Inter',sans-serif" }}
      >Hashaam Tanveer</motion.div>
      <div style={{ width: 200, height: 1, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden", marginBottom: 16 }}>
        <motion.div style={{ height: "100%", background: "linear-gradient(90deg, #7c3aed, #06b6d4)", width: `${pct}%`, transition: "width 0.06s linear" }} />
      </div>
      <div style={{ fontSize: 11, color: C.dim, fontFamily: "'Inter',sans-serif", letterSpacing: "0.05em" }}>{pct}%</div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   APP ROOT
══════════════════════════════════════ */
export default function App() {
  const [ready, setReady] = useState(false);
  const refs = {
    about: useRef(null), experience: useRef(null),
    stack: useRef(null), work: useRef(null), contact: useRef(null),
  };
  const scrollTo = key => {
    const map = { about: refs.about, experience: refs.experience, stack: refs.stack, work: refs.work, contact: refs.contact };
    map[key]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter',sans-serif", overflowX: "hidden" }}>
      <AnimatePresence>{!ready && <Intro onDone={() => setReady(true)} />}</AnimatePresence>
      {ready && (
        <>
          <CursorGlow />
          <Aurora />
          <Nav onSection={scrollTo} />
          <Hero onSection={scrollTo} />
          <div ref={refs.about}><About /></div>
          <div ref={refs.experience}><Experience /></div>
          <div ref={refs.stack}><Stack /></div>
          <div ref={refs.work}><Work /></div>
          <div ref={refs.contact}><Contact /></div>
          <Footer />
        </>
      )}
    </div>
  );
}
