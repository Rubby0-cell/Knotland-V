import { Link } from "wouter";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { useGetDashboardStats, useGetAnnouncements } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { Crown, Film, CreditCard, Users, Megaphone, Pin, ChevronRight, AlertCircle, Clock, CheckCircle2, XCircle, Globe, Newspaper, Play } from "lucide-react";

function StatCard({ label, value, icon: Icon, sub }: { label: string; value?: string | number; icon: React.ElementType; sub?: React.ReactNode }) {
  return (
    <div className="glass rounded-sm p-6 flex items-center gap-4 hover:glass-red transition-all duration-300 group">
      <div className="w-10 h-10 border border-primary/20 rounded-sm flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors">
        <Icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
      </div>
      <div>
        {sub ?? <p className="text-2xl font-serif font-bold text-white">{value ?? "—"}</p>}
        <p className="text-xs uppercase tracking-[0.2em] text-white/30 mt-0.5 font-sans">{label}</p>
      </div>
    </div>
  );
}

function PaymentChip({ status }: { status?: string | null }) {
  if (!status) return <span className="text-xs text-white/25 uppercase tracking-widest font-sans">No submission</span>;
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    pending: { icon: Clock, cls: "text-amber-400" },
    approved: { icon: CheckCircle2, cls: "text-green-400" },
    rejected: { icon: XCircle, cls: "text-primary" },
  };
  const { icon: Icon, cls } = map[status] ?? { icon: Clock, cls: "" };
  return (
    <span className={`flex items-center gap-1.5 text-xs uppercase tracking-widest font-sans ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {status}
    </span>
  );
}

export default function DashboardPage() {
  return <ProtectedLayout><DashboardContent /></ProtectedLayout>;
}

function DashboardContent() {
  const { profile } = useProtectedRoute();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: announcements, isLoading: annLoading } = useGetAnnouncements({ limit: 3 });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-8 border-b border-white/5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Welcome back</p>
          <h1 className="font-serif text-4xl font-bold text-white">{profile?.display_name ?? profile?.email?.split("@")[0] ?? "Member"}</h1>
        </div>
        {profile?.plan && (
          <div className="flex items-center gap-2 glass-red border border-primary/20 rounded-sm px-4 py-2">
            <Crown className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-xs uppercase tracking-[0.2em] text-primary/80 font-sans">{profile.plan}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-sm bg-white/4" />)
        ) : (
          <>
            <StatCard label="Total Members" value={stats?.total_members} icon={Users} />
            <StatCard label="Announcements" value={stats?.active_announcements} icon={Megaphone} />
            <StatCard label="Content Items" value={stats?.content_items_available} icon={Film} />
            <StatCard label="Payment Status" icon={CreditCard} sub={<PaymentChip status={stats?.my_payment_status} />} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/20 mb-5 font-sans">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/previews", label: "Previews", desc: "Videos & photo teasers", icon: Play },
            { href: "/events", label: "Blog & Events", desc: "News & upcoming drops", icon: Newspaper },
            { href: "/community", label: "Community", desc: "Telegram, Discord, X", icon: Globe },
            { href: "/submit-payment", label: "Submit Payment", desc: "Upgrade your access", icon: CreditCard },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="glass rounded-sm p-5 hover:glass-red transition-all duration-300 cursor-pointer group border border-transparent hover:border-primary/15">
                <action.icon className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors mb-4" />
                <p className="font-sans font-medium text-sm text-white/70 group-hover:text-white transition-colors">{action.label}</p>
                <p className="text-xs text-white/30 mt-0.5">{action.desc}</p>
                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-primary transition-colors mt-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/20 mb-5 font-sans">Latest Announcements</p>
        {annLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-sm bg-white/4" />)}</div>
        ) : announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} data-testid={`card-announcement-${ann.id}`} className="glass rounded-sm p-5 flex gap-4 hover:glass-red transition-all duration-300 group">
                <div className="shrink-0 mt-0.5">
                  {ann.pinned ? <Pin className="w-3.5 h-3.5 text-primary/50" /> : <Megaphone className="w-3.5 h-3.5 text-white/20" />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <p className="font-sans font-medium text-sm text-white/80">{ann.title}</p>
                    {ann.pinned && <span className="text-xs uppercase tracking-widest text-primary/60 font-sans">Pinned</span>}
                  </div>
                  <p className="text-sm text-white/35 leading-relaxed group-hover:text-white/50 transition-colors">{ann.body}</p>
                  <p className="text-xs text-white/20 mt-2 font-sans">{new Date(ann.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-sm p-12 text-center">
            <AlertCircle className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-white/25 text-sm">No announcements yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
