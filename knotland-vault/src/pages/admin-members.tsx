import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminGetMembers, useAdminUpdateMember, getAdminGetMembersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle2, XCircle, ChevronDown } from "lucide-react";

const ROLES = ["member", "vip", "lifetime", "admin"] as const;
type Role = (typeof ROLES)[number];

const ROLE_COLORS: Record<string, string> = {
  admin: "text-primary",
  lifetime: "text-amber-300",
  vip: "text-amber-400",
  member: "text-white/30",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "border-primary/30 text-primary/80 bg-primary/5",
  lifetime: "border-amber-300/30 text-amber-300/80 bg-amber-300/5",
  vip: "border-amber-400/30 text-amber-400/80 bg-amber-400/5",
  member: "border-white/10 text-white/30 bg-transparent",
};

function RoleDropdown({
  currentRole,
  memberId,
  onUpdate,
  disabled,
}: {
  currentRole: string;
  memberId: string;
  onUpdate: (id: string, role: Role) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={`flex items-center gap-1.5 text-xs uppercase tracking-widest font-sans border rounded-sm px-2.5 py-1 transition-all duration-200 ${ROLE_BADGE[currentRole] ?? "border-white/10 text-white/30"} hover:opacity-80 disabled:opacity-40`}
      >
        {currentRole}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 glass border border-white/10 rounded-sm py-1 min-w-[100px] shadow-2xl">
            {ROLES.filter((r) => r !== currentRole).map((role) => (
              <button
                key={role}
                onClick={() => { onUpdate(memberId, role); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs uppercase tracking-widest font-sans transition-colors hover:bg-white/5 ${ROLE_COLORS[role] ?? "text-white/40"}`}
              >
                {role}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminMembersPage() {
  return <ProtectedLayout adminOnly><AdminMembersContent /></ProtectedLayout>;
}

function AdminMembersContent() {
  const { data: members, isLoading } = useAdminGetMembers();
  const updateMember = useAdminUpdateMember();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleRoleChange = async (id: string, role: Role) => {
    setUpdating(id);
    try {
      await updateMember.mutateAsync({ id, data: { role } });
      queryClient.invalidateQueries({ queryKey: getAdminGetMembersQueryKey() });
      toast({ title: `Role updated to ${role}` });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const filtered = (members ?? []).filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.email.toLowerCase().includes(q) ||
      (m.display_name ?? "").toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  const counts = {
    total: members?.length ?? 0,
    admin: members?.filter((m) => m.role === "admin").length ?? 0,
    lifetime: members?.filter((m) => m.role === "lifetime").length ?? 0,
    vip: members?.filter((m) => m.role === "vip").length ?? 0,
    member: members?.filter((m) => m.role === "member").length ?? 0,
  };

  return (
    <div className="space-y-8">
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Admin</p>
        <h1 className="font-serif text-4xl font-bold text-white">Members</h1>
        <p className="text-white/30 mt-1 text-sm">{counts.total} total members</p>
      </div>

      {/* Tier summary */}
      {!isLoading && members && members.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Admin", count: counts.admin, color: "text-primary" },
            { label: "Lifetime", count: counts.lifetime, color: "text-amber-300" },
            { label: "VIP", count: counts.vip, color: "text-amber-400" },
            { label: "Member", count: counts.member, color: "text-white/40" },
          ].map((tier) => (
            <div key={tier.label} className="glass rounded-sm p-4 text-center">
              <p className={`text-2xl font-serif font-bold ${tier.color}`}>{tier.count}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-sans mt-1">{tier.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by email, name, or role…"
        className="w-full bg-white/4 border border-white/8 rounded-sm px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40"
      />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-sm bg-white/4" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="glass rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium">Member</th>
                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium hidden sm:table-cell">Plan</th>
                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium hidden md:table-cell">Joined</th>
                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium hidden md:table-cell">Verified</th>
                <th className="text-right px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-white/4 hover:bg-white/2 transition-colors last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-sans font-medium text-white/70 truncate max-w-[160px]">
                      {m.display_name ?? m.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-white/25 font-sans truncate max-w-[160px]">{m.email}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {m.plan ? (
                      <span className="text-xs uppercase tracking-widest text-primary/60 font-sans">{m.plan}</span>
                    ) : (
                      <span className="text-white/15 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-white/20 font-sans">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {m.age_verified ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-white/15" />
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <RoleDropdown
                      currentRole={m.role}
                      memberId={m.id}
                      onUpdate={handleRoleChange}
                      disabled={updating === m.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass rounded-sm p-16 text-center">
          <Users className="w-8 h-8 text-white/10 mx-auto mb-4" />
          <p className="text-white/25 text-sm">{search ? "No members match your search." : "No members yet."}</p>
        </div>
      )}
    </div>
  );
}
