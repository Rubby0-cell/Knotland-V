import { Link } from "wouter";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { useAdminGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CreditCard, Megaphone, Star, Crown, Film, ChevronRight } from "lucide-react";

export default function AdminPage() {
  return <ProtectedLayout adminOnly><AdminContent /></ProtectedLayout>;
}

function AdminContent() {
  const { data: stats, isLoading } = useAdminGetStats();

  const cards = [
    { label: "Total Members", value: stats?.total_members, icon: Users, href: "/admin/members" },
    { label: "Pending Payments", value: stats?.pending_payments, icon: CreditCard, href: "/admin/payments", alert: (stats?.pending_payments ?? 0) > 0 },
    { label: "Pending Testimonials", value: stats?.pending_testimonials, icon: Star, href: "/admin/testimonials", alert: (stats?.pending_testimonials ?? 0) > 0 },
    { label: "Approved Members", value: stats?.approved_members, icon: Users, href: "/admin/members" },
    { label: "VIP Members", value: stats?.vip_members, icon: Crown, href: "/admin/members" },
    { label: "Lifetime Members", value: stats?.lifetime_members, icon: Crown, href: "/admin/members" },
  ];

  return (
    <div className="space-y-12">
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Admin</p>
        <h1 className="font-serif text-4xl font-bold text-white">Control Panel</h1>
        <p className="text-white/30 mt-1 text-sm">Platform health at a glance.</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-sm bg-white/4" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link key={c.href + c.label} href={c.href}>
              <div className={`glass rounded-sm p-6 flex items-center gap-4 group cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${c.alert ? "glass-red border border-primary/20" : "hover:glass-red border border-transparent hover:border-primary/15"}`}>
                <div className={`w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${c.alert ? "border-primary/30 bg-primary/10" : "border-white/8 group-hover:border-primary/20"}`}>
                  <c.icon className={`w-4 h-4 ${c.alert ? "text-primary" : "text-white/25 group-hover:text-primary/60"} transition-colors`} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-serif font-bold text-white">{c.value ?? "—"}</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/25 font-sans mt-0.5">{c.label}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-primary/40 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/20 mb-5 font-sans">Admin Sections</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/admin/members", label: "Members", desc: "View, edit roles and plans", icon: Users },
            { href: "/admin/payments", label: "Payment Queue", desc: "Approve or reject proofs", icon: CreditCard },
            { href: "/admin/content", label: "Content Library", desc: "Upload and manage vault content", icon: Film },
            { href: "/admin/announcements", label: "Announcements", desc: "Post platform updates", icon: Megaphone },
            { href: "/admin/testimonials", label: "Testimonials", desc: "Review member testimonials", icon: Star },
          ].map((s) => (
            <Link key={s.href} href={s.href}>
              <div className="glass rounded-sm p-5 flex items-center gap-4 hover:glass-red transition-all duration-300 cursor-pointer group border border-transparent hover:border-primary/15">
                <s.icon className="w-4 h-4 text-white/20 group-hover:text-primary/60 transition-colors" />
                <div className="flex-1">
                  <p className="font-sans font-medium text-sm text-white/70 group-hover:text-white transition-colors">{s.label}</p>
                  <p className="text-xs text-white/25">{s.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-primary/40 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
