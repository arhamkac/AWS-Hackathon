"use client";
import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    // Particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.3,
      hue: Math.random() > 0.5 ? 185 : 280, // cyan or purple
      alpha: Math.random() * 0.5 + 0.1,
    }));

    // Data stream columns
    const cols = Math.floor(W / 28);
    const streams = Array.from({ length: cols }, (_, i) => ({
      x: i * 28 + 14,
      y: Math.random() * H,
      speed: Math.random() * 1.5 + 0.5,
      chars: "01アイウエオカキクケコΨΔΩ∞∑∫",
      alpha: Math.random() * 0.06 + 0.01,
      len: Math.floor(Math.random() * 8 + 4),
    }));

    let mouse = { x: W / 2, y: H / 2 };
    const onMouse = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMouse);

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Data streams (matrix rain, very subtle)
      streams.forEach(s => {
        for (let i = 0; i < s.len; i++) {
          const char = s.chars[Math.floor(Math.random() * s.chars.length)];
          const alpha = s.alpha * (1 - i / s.len);
          ctx.fillStyle = i === 0 ? `rgba(0,245,255,${alpha * 3})` : `rgba(0,245,255,${alpha})`;
          ctx.font = "11px monospace";
          ctx.fillText(char, s.x, s.y - i * 14);
        }
        s.y += s.speed;
        if (s.y > H + s.len * 14) s.y = -s.len * 14;
      });

      // Particles
      particles.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.vx += (dx / dist) * 0.05;
          p.vy += (dy / dist) * 0.05;
        }
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.alpha})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const t = 1 - d / 100;
            ctx.strokeStyle = `rgba(0,245,255,${t * 0.06})`;
            ctx.lineWidth = t * 0.8;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}
