"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Motion is an enhancement: the server-rendered content is always visible. */
export function MotionStage({ children, locale }: { children: ReactNode; locale: "en" | "pt" }) {
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let stop = () => {};
    const configure = () => {
      stop();
      if (preference.matches || paused) return;
      const animations = new Set<Animation>();
      const seen = new WeakSet<Element>();
      const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target)) continue;
          seen.add(entry.target);
          observer?.unobserve(entry.target);
          const animation = entry.target.animate([
            { opacity: 0.15, transform: "translateY(24px)" },
            { opacity: 1, transform: "translateY(0)" },
          ], { duration: 800, easing: "cubic-bezier(.2,.7,.2,1)" });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
      }, { threshold: 0.08 });
      node.querySelectorAll("[data-reveal]").forEach(element => observer?.observe(element));
      const hero = node.querySelector<HTMLElement>(".hero");
      const artwork = node.querySelector<HTMLElement>(".hero-artwork");
      let frame = 0;
      const reset = () => { cancelAnimationFrame(frame); if (artwork) artwork.style.transform = ""; };
      const move = (event: PointerEvent) => {
        if (!hero || !artwork || !finePointer.matches || event.pointerType !== "mouse") return;
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { artwork.style.transform = `translate3d(${x * 14}px,${y * 10}px,0) scale(1.025)`; });
      };
      const revealFocusedContent = () => animations.forEach(animation => animation.finish());
      hero?.addEventListener("pointermove", move);
      hero?.addEventListener("pointerleave", reset);
      node.addEventListener("focusin", revealFocusedContent);
      finePointer.addEventListener("change", reset);
      stop = () => {
        observer?.disconnect(); animations.forEach(animation => animation.cancel()); animations.clear(); reset();
        hero?.removeEventListener("pointermove", move); hero?.removeEventListener("pointerleave", reset);
        node.removeEventListener("focusin", revealFocusedContent); finePointer.removeEventListener("change", reset);
      };
    };
    configure();
    preference.addEventListener("change", configure);
    return () => { stop(); preference.removeEventListener("change", configure); };
  }, [paused]);
  return <div ref={root} className={paused ? "motion-paused" : undefined}>{children}<div className="container motion-controls"><button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{locale === "pt" ? "Reduzir movimento" : "Reduce motion"}<span aria-hidden="true">{paused ? (locale === "pt" ? "Ativado" : "On") : (locale === "pt" ? "Desativado" : "Off")}</span></button></div></div>;
}
