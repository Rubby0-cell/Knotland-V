import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/plans", label: "Membership" },
  { href: "/testimonials", label: "Community" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Fixed Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 border border-primary/60 rotate-45 flex items-center justify-center group-hover:border-primary transition-all duration-300 group-hover:glow-red-sm">
                <div className="w-2 h-2 bg-primary rotate-0 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="font-serif text-lg tracking-[0.3em] text-white group-hover:text-primary transition-colors duration-300">KNOT LAND</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 relative group ${location === link.href ? "text-primary" : "text-white/50 hover:text-white"}`}
              >
                {link.label}
                <span className={`absolute -bottom-0.5 left-0 h-px bg-primary transition-all duration-300 ${location === link.href ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="text-xs uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/5">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="text-xs uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-white border-0 px-6 h-10 animate-pulse-glow font-sans font-semibold">
                    Enter Vault
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/70 hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-96 border-b border-white/5" : "max-h-0"}`}>
          <div className="bg-black/95 backdrop-blur-xl px-6 py-6 space-y-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <p className={`text-sm uppercase tracking-[0.2em] py-2 border-b border-white/5 transition-colors ${location === link.href ? "text-primary" : "text-white/60 hover:text-white"}`}>
                  {link.label}
                </p>
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-3">
              {user ? (
                <Link href="/dashboard">
                  <Button className="w-full text-xs tracking-widest bg-primary hover:bg-primary/90">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full text-xs tracking-widest border-white/20 text-white hover:bg-white/5">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full text-xs tracking-widest bg-primary hover:bg-primary/90 animate-pulse-glow">Enter Vault</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-white/5 py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border border-primary/40 rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rotate-0" />
              </div>
              <span className="font-serif text-sm tracking-[0.3em] text-white/60">KNOT LAND</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-8">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="text-xs uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/20">Community</p>
                <div className="flex items-center gap-5">
                  <a href="https://t.me/+Sgj4-pjVnys1OWFk" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-white/30 hover:text-primary transition-colors duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.772l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.787z"/>
                    </svg>
                  </a>
                  <a href="https://x.com/maxwelsaithtech" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="text-white/30 hover:text-primary transition-colors duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="text-white/30 hover:text-primary transition-colors duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.04.031.052a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-white/20 uppercase tracking-widest">Strictly 18+ Adults Only</p>
              <p className="text-xs text-white/15 mt-1">&copy; {new Date().getFullYear()} Knot Land. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
