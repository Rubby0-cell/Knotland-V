import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { useGetPlans, useGetTestimonials } from "@workspace/api-client-react";
import { CheckCircle2, Lock, Film, Users, Archive, Crown, Star, ChevronDown } from "lucide-react";

/* ─── Age Gate ─────────────────────────────────────────────────────────────── */
function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,26,26,0.15),transparent)]" />
      <div className="relative max-w-sm w-full text-center space-y-8 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
        <div className="relative mx-auto w-16 h-16 animate-float">
          <div className="absolute inset-0 border border-primary/30 rotate-45" />
          <div className="absolute inset-2 border border-primary/15 rotate-45" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="font-serif text-3xl tracking-[0.3em] text-white mb-3">KNOT LAND</h1>
          <p className="text-white/40 text-sm leading-relaxed font-display italic text-lg">"Where curiosity meets instinct"</p>
        </div>
        <div className="glass rounded-sm p-6 space-y-4">
          <p className="text-white/70 text-sm">This is an exclusive 18+ private members vault. You must confirm your age to enter.</p>
          <ul className="text-xs text-white/40 space-y-2 text-left">
            {["I am 18 years of age or older", "I consent to viewing adult content", "Access is not prohibited in my jurisdiction"].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary/60 shrink-0" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <Button data-testid="button-age-confirm" onClick={onConfirm} className="w-full h-12 text-xs uppercase tracking-[0.3em] bg-primary hover:bg-primary/90 text-white font-sans font-semibold animate-pulse-glow border-0">
            I Am 18+ — Enter The Vault
          </Button>
          <a href="https://google.com" className="block text-xs text-white/20 hover:text-white/40 transition-colors tracking-widest uppercase">
            Exit — I am under 18
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Smoke particles ───────────────────────────────────────────────────────── */
function SmokeParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full bg-primary/5"
          style={{
            left: `${15 + i * 14}%`,
            width: `${80 + i * 30}px`,
            height: `${80 + i * 30}px`,
            filter: "blur(40px)",
            animation: `smoke ${7 + i * 2}s ease-in-out ${i * 1.5}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Vault Features ───────────────────────────────────────────────────────── */
const VAULT_FEATURES = [
  { icon: Film, title: "Private Drops", desc: "Exclusive content released only to verified vault members. Never public, never shared." },
  { icon: Users, title: "Secret Community", desc: "A private sanctuary of like-minded individuals. Vetted, discreet, elite." },
  { icon: Archive, title: "Locked Archive", desc: "Years of curated premium content — all accessible, all searchable, all yours." },
  { icon: Crown, title: "Elite Access", desc: "VIP tier unlocks the deepest vault. Experiences designed for those who demand more." },
];

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const { data: plans } = useGetPlans();
  const { data: testimonials } = useGetTestimonials();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStorage.getItem("kv_age_confirmed") === "1") setAgeConfirmed(true);
  }, []);

  const handleAgeConfirm = () => {
    localStorage.setItem("kv_age_confirmed", "1");
    setAgeConfirmed(true);
  };

  return (
    <PublicLayout>
      {!ageConfirmed && <AgeGate onConfirm={handleAgeConfirm} />}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* Layered background */}
        <div className="absolute inset-0 bg-black" />

        {/* Wolf image — blends into black */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/wolf.jpg"
            alt=""
            aria-hidden="true"
            className="absolute w-full h-full object-cover object-[center_30%] opacity-[0.18]"
            style={{ mixBlendMode: "screen", filter: "grayscale(30%) contrast(1.1)" }}
          />
          {/* Vignette: fade all edges to black */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 75% 75% at 50% 45%, transparent 30%, rgba(0,0,0,0.6) 65%, black 90%)" }} />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,black_0%,transparent_15%,transparent_70%,black_100%)]" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-5%,rgba(196,26,26,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(196,26,26,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.8)_85%,black_100%)]" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

        <SmokeParticles />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Eyebrow */}
          <div className="opacity-0 animate-fade-up delay-100 inline-flex items-center gap-3 mb-10" style={{ animationFillMode: "forwards" }}>
            <span className="w-10 h-px bg-primary/60" />
            <span className="text-xs uppercase tracking-[0.4em] text-primary/80 font-sans">Exclusive Private Membership</span>
            <span className="w-10 h-px bg-primary/60" />
          </div>

          {/* Main title */}
          <h1 className="opacity-0 animate-fade-up delay-200 font-serif text-[clamp(4rem,15vw,11rem)] font-black leading-none tracking-tight text-white mb-6" style={{ animationFillMode: "forwards" }}>
            KNOT
            <span className="block text-glow-red text-primary"> LAND</span>
          </h1>

          {/* Tagline */}
          <p className="opacity-0 animate-fade-up delay-300 font-display italic text-[clamp(1.1rem,2.5vw,1.5rem)] text-white/50 mb-12 leading-relaxed" style={{ animationFillMode: "forwards" }}>
            "Where curiosity meets instinct"
          </p>

          {/* CTA Buttons */}
          <div className="opacity-0 animate-fade-up delay-500 flex flex-col sm:flex-row gap-4 justify-center" style={{ animationFillMode: "forwards" }}>
            <Link href="/register">
              <Button data-testid="button-hero-register" className="h-14 px-10 text-xs uppercase tracking-[0.3em] bg-primary hover:bg-primary/90 text-white font-sans font-semibold animate-pulse-glow border-0 w-full sm:w-auto">
                Enter The Vault
              </Button>
            </Link>
            <Link href="/plans">
              <Button data-testid="button-hero-preview" variant="outline" className="h-14 px-10 text-xs uppercase tracking-[0.3em] border-white/20 text-white/80 hover:bg-white/5 hover:border-white/40 hover:text-white transition-all duration-300 w-full sm:w-auto bg-transparent">
                Preview The Vault
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-700 flex flex-col items-center gap-2" style={{ animationFillMode: "forwards" }}>
          <span className="text-xs uppercase tracking-[0.3em] text-white/20">Explore</span>
          <ChevronDown className="w-4 h-4 text-white/20 animate-bounce" />
        </div>
      </section>

      {/* ── Inside The Vault ─────────────────────────────────────────────── */}
      <section className="relative py-32 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(196,26,26,0.04),transparent)]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-5 font-sans">Exclusive Access</p>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-white">Inside The Vault</h2>
            <p className="font-display italic text-white/40 text-xl mt-4 max-w-lg mx-auto">Everything curated. Nothing compromised.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VAULT_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative glass rounded-sm p-8 hover:glass-red transition-all duration-500 cursor-default overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(196,26,26,0.1),transparent)]" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <f.icon className="w-7 h-7 text-primary/60 group-hover:text-primary transition-colors duration-300 mb-6" />
                <h3 className="font-serif text-lg text-white mb-3 tracking-wide">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors duration-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Membership Plans ─────────────────────────────────────────────── */}
      {plans && plans.length > 0 && (
        <section className="relative py-32 px-4">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(196,26,26,0.03),transparent)]" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-5 font-sans">Choose Your Access</p>
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-white">Membership Tiers</h2>
              <p className="font-display italic text-white/40 text-xl mt-4">Ascend at your own pace.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isPopular = plan.tier === "vip";
                return (
                  <div
                    key={plan.id}
                    data-testid={`card-plan-${plan.id}`}
                    className={`relative rounded-sm flex flex-col transition-all duration-500 hover:-translate-y-1 ${isPopular ? "glass-red border border-primary/30 glow-red" : "glass border border-white/5 hover:border-white/10"}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="text-xs uppercase tracking-[0.3em] bg-primary text-white px-4 py-1 font-sans font-semibold">Most Popular</span>
                      </div>
                    )}
                    <div className="p-8 flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-2 font-sans">{plan.tier}</p>
                      <h3 className="font-serif text-2xl text-white mb-6">{plan.name}</h3>
                      <div className="flex items-end gap-1 mb-6">
                        <span className="text-4xl font-bold text-white font-serif">${plan.price_usd}</span>
                        <span className="text-white/30 text-sm mb-1 font-sans">{plan.duration_days ? "/mo" : " once"}</span>
                      </div>
                      <p className="text-white/40 text-sm leading-relaxed mb-6">{plan.description}</p>
                      <ul className="space-y-3">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-sm">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            <span className="text-white/50">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-8 pt-0">
                      <Link href="/register">
                        <Button
                          data-testid={`button-plan-select-${plan.id}`}
                          className={`w-full h-11 text-xs uppercase tracking-[0.3em] font-sans font-semibold ${isPopular ? "bg-primary hover:bg-primary/90 text-white border-0 animate-pulse-glow" : "bg-transparent border border-white/15 text-white/70 hover:bg-white/5 hover:border-white/30 hover:text-white transition-all"}`}
                          variant={isPopular ? "default" : "outline"}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      {testimonials && testimonials.length > 0 && (
        <section className="relative py-32 px-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(196,26,26,0.05),transparent)]" />
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-5 font-sans">Testimonials</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">Members Speak</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {testimonials.slice(0, 4).map((t) => (
                <div key={t.id} data-testid={`card-testimonial-${t.id}`} className="glass rounded-sm p-8 hover:glass-red transition-all duration-500 group">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-display italic text-white/50 text-lg leading-relaxed mb-6 group-hover:text-white/70 transition-colors">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-px bg-primary/40" />
                    <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">{t.display_name ?? "Anonymous Member"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-40 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(196,26,26,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(196,26,26,0.03),transparent)]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-4">
            <span className="w-16 h-px bg-primary/30" />
            <div className="w-2 h-2 border border-primary/60 rotate-45" />
            <span className="w-16 h-px bg-primary/30" />
          </div>
          <h2 className="font-serif text-5xl md:text-7xl font-bold text-white leading-none">
            Are You<br /><span className="text-primary text-glow-red">Ready?</span>
          </h2>
          <p className="font-display italic text-white/40 text-xl">The vault is waiting. Membership is limited.</p>
          <Link href="/register">
            <Button data-testid="button-cta-register" className="h-14 px-12 text-xs uppercase tracking-[0.3em] bg-primary hover:bg-primary/90 text-white font-sans font-semibold animate-pulse-glow border-0 mt-4">
              Claim Your Place
            </Button>
          </Link>
          <p className="text-xs text-white/15 uppercase tracking-widest">18+ Only · Discreet Billing · Cancel Anytime</p>
        </div>
      </section>
    </PublicLayout>
  );
}
