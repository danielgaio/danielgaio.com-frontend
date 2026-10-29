"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotionPreference(notify: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
function prefersReducedMotion() { return window.matchMedia(reducedMotionQuery).matches; }

const MotionContext = createContext<{ paused: boolean; systemReduced: boolean; toggle: () => void } | null>(null);

export function MotionToggle({ locale }: { locale: "en" | "pt" }) {
  const motion = useContext(MotionContext);
  if (!motion) return null;
  const reduced = motion.paused || motion.systemReduced;
  const label = motion.systemReduced ? (locale === "pt" ? "Movimento reduzido pelo dispositivo" : "Motion reduced by your device") : reduced ? (locale === "pt" ? "Retomar movimento" : "Resume motion") : (locale === "pt" ? "Pausar movimento" : "Pause motion");
  return <button className="motion-toggle" type="button" aria-label={label} title={label} aria-pressed={reduced} disabled={motion.systemReduced} onClick={motion.toggle}><span>{locale === "pt" ? "Movimento" : "Motion"}</span><span aria-hidden="true">{reduced ? (locale === "pt" ? "Pausado" : "Paused") : (locale === "pt" ? "Ativo" : "On")}</span></button>;
}

/** Content is visible before hydration; motion only enhances visible illustrations. */
export function MotionStage({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const systemReduced = useSyncExternalStore(subscribeMotionPreference, prefersReducedMotion, () => false);
  const reduced = paused || systemReduced;
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || reduced) return;
    const animations = new Set<Animation>();
    const seen = new WeakSet<Element>();
    const visibility = () => { node.dataset.motionRunning = String(!document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.classList.toggle("motion-visible", entry.isIntersecting);
        if (!entry.isIntersecting || !entry.target.hasAttribute("data-reveal") || seen.has(entry.target)) continue;
        seen.add(entry.target);
        const animation = entry.target.animate([
          { opacity: 0.3, transform: "translateY(16px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0.04 });
    node.querySelectorAll("[data-reveal], [data-ambient]").forEach(element => observer?.observe(element));
    const focus = () => animations.forEach(animation => animation.finish());
    node.addEventListener("focusin", focus);
    return () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      document.removeEventListener("visibilitychange", visibility);
      node.removeEventListener("focusin", focus);
      node.querySelectorAll(".motion-visible").forEach(element => element.classList.remove("motion-visible"));
      node.dataset.motionRunning = "false";
    };
  }, [reduced]);
  return <MotionContext.Provider value={{ paused, systemReduced, toggle: () => setPaused(value => !value) }}><div ref={root} className={`motion-stage${reduced ? " motion-paused" : ""}`}>{children}</div></MotionContext.Provider>;
}
