import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import {
  LockKeyhole,
  LayoutDashboard,
  Film,
  CreditCard,
  User,
  Star,
  ShieldAlert,
  Users,
  LogOut,
  Menu,
  FileText,
  Megaphone,
  X,
  Globe,
  Newspaper,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useAdminGetStats } from "@workspace/api-client-react";
import { useAdminPaymentWatch } from "@/hooks/use-admin-payment-watch";
import { useToast } from "@/hooks/use-toast";

/* ─── Admin-only hook container (avoids conditional hook calls) ─────────── */
function AdminWatcher({
  onPendingCount,
}: {
  onPendingCount: (n: number) => void;
}) {
  const { toast } = useToast();
  const { data: stats } = useAdminGetStats({
    query: { refetchInterval: 30_000 },
  });

  const prevPending = useRef<number | null>(null);

  useEffect(() => {
    const n = stats?.pending_payments ?? 0;
    onPendingCount(n);

    // Toast only when count increases (not on initial load)
    if (prevPending.current !== null && n > prevPending.current) {
      toast({
        title: "💳 New payment received",
        description: "A member submitted a new crypto payment. Review it in the Payment Queue.",
      });
    }
    prevPending.current = n;
  }, [stats?.pending_payments, onPendingCount, toast]);

  // Realtime: instant invalidation + toast on new INSERT
  useAdminPaymentWatch(() => {
    // The stats refetch triggered by the hook will hit the useEffect above
    // and fire the toast automatically via the count increase check.
  });

  return null;
}

/* ─── Main Layout ────────────────────────────────────────────────────────── */
export function ProtectedLayout({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, profile, loading } = useProtectedRoute(adminOnly);
  const { signOut } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border border-primary/30 rotate-45 animate-spin" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-3 border border-primary/10 rotate-45" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LockKeyhole className="w-4 h-4 text-primary/60" />
          </div>
        </div>
        <p className="font-serif text-xs tracking-[0.4em] text-white/30 uppercase">Verifying Access</p>
      </div>
    );
  }

  if (!user || (adminOnly && profile?.role !== "admin")) return null;

  const isAdmin = profile?.role === "admin";

  const memberLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/previews", label: "Previews", icon: Play },
    { href: "/content", label: "Full Archive", icon: Film },
    { href: "/events", label: "Blog & Events", icon: Newspaper },
    { href: "/community", label: "Community", icon: Globe },
    { href: "/plans", label: "Membership", icon: Star },
    { href: "/submit-payment", label: "Submit Payment", icon: CreditCard },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: ShieldAlert, badge: 0 },
    { href: "/admin/members", label: "Members", icon: Users, badge: 0 },
    { href: "/admin/payments", label: "Payments", icon: FileText, badge: pendingPayments },
    { href: "/admin/content", label: "Content", icon: Film, badge: 0 },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone, badge: 0 },
    { href: "/admin/testimonials", label: "Testimonials", icon: Star, badge: 0 },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 border border-primary/50 rotate-45 group-hover:border-primary transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary rotate-0" />
            </div>
          </div>
          <span className="font-serif text-sm tracking-[0.3em] text-white/80 group-hover:text-white transition-colors">KNOT LAND</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-8 px-4 space-y-8">
        {/* Member Links */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/20 mb-3 px-2 font-sans">Member Access</p>
          <nav className="space-y-0.5">
            {memberLinks.map((link) => {
              const active = location === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group ${active ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-white/40 hover:text-white hover:bg-white/4"}`}>
                    <Icon className={`w-4 h-4 transition-colors ${active ? "text-primary" : "group-hover:text-white/70"}`} />
                    <span className="text-xs uppercase tracking-[0.15em] font-sans font-medium">{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Links */}
        {isAdmin && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/40 mb-3 px-2 font-sans">Admin</p>
            <nav className="space-y-0.5">
              {adminLinks.map((link) => {
                const active = location === link.href;
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group ${active ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-white/30 hover:text-white hover:bg-white/4"}`}>
                      <Icon className={`w-4 h-4 transition-colors ${active ? "text-primary" : "group-hover:text-primary/70"}`} />
                      <span className="text-xs uppercase tracking-[0.15em] font-sans font-medium flex-1">{link.label}</span>
                      {link.badge > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold font-sans flex items-center justify-center leading-none">
                          {link.badge > 99 ? "99+" : link.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="px-4 py-6 border-t border-white/5">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-white/70 transition-colors group"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs uppercase tracking-[0.15em] font-sans">Disconnect</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex text-foreground">
      {/* Admin realtime watcher — mounts only for admin users */}
      {isAdmin && <AdminWatcher onPendingCount={setPendingPayments} />}

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 hidden md:flex flex-col bg-[#080808] fixed top-0 bottom-0 left-0 z-40">
        <NavContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Mobile Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-5 md:hidden bg-black/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 border border-primary/50 rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary" />
              </div>
            </div>
            <span className="font-serif text-sm tracking-[0.3em] text-white/80">KNOT LAND</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Pending badge in mobile header */}
            {isAdmin && pendingPayments > 0 && (
              <Link href="/admin/payments">
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold font-sans flex items-center justify-center cursor-pointer">
                  {pendingPayments}
                </span>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60 hover:text-white h-8 w-8">
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute top-0 left-0 bottom-0 w-72 bg-[#080808] border-r border-white/5">
              <NavContent />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-5 py-8 md:px-10 md:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
