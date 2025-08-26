import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-ai-laptop.jpg";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <header
      ref={ref}
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(600px circle at var(--mx,50%) var(--my,30%), hsl(var(--brand-cyan) / 0.12), transparent 40%), radial-gradient(1000px circle at 80% -10%, hsl(var(--brand-purple) / 0.12), transparent 40%)",
      }}
    >
      <div className="container mx-auto py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-enter">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-secondary/20 px-3 py-1 text-xs text-muted-foreground mb-4 shadow-sm dark:border-gray-700/60 dark:bg-gray-800/60 dark:text-gray-400">
              Yapay Zeka Destekli B2B Satış Otomasyonu
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 dark:text-white">
              <span className="block">B2B Satışta Yeni Çağ:</span>
              <span className="text-gradient-hero">Anahtar Teslim Otomasyon</span>
            </h1>
            <div className="mb-6">
              <p className="text-xl md:text-2xl font-semibold text-primary mb-3 dark:text-blue-400">
                "Satışı otomatikleştir, büyümeye odaklan"
              </p>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl dark:text-gray-400">
                Potansiyel müşterilerinizi bulun, onlarla etkileşime geçin ve satış sürecinizi yapay zeka destekli asistanınızla yönetin — hepsi tek platformda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="xl" variant="hero" className="hover-scale" onClick={() => navigate("/login")}>
                Hemen Başla
              </Button>
              <Button size="xl" variant="outlineGlow" className="hover-scale" asChild>
                <a href="#demo" aria-label="Demo İzle" className="dark:text-white dark:border-gray-600">Demo İzle</a>
              </Button>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-8 bg-gradient-hero opacity-30 blur-3xl rounded-full" aria-hidden />
            <img
              src={heroImg}
              alt="AI asistan arayüzünü gösteren izometrik laptop, mor-turkuaz neon parlamalarla"
              loading="eager"
              className="relative w-full rounded-xl border border-border/60 shadow-glow hover-scale dark:border-gray-700/60"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;