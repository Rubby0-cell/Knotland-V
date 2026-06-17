import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminGetPayments, useAdminUpdatePayment, getAdminGetPaymentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CreditCard, CheckCircle2, XCircle, ExternalLink, Clock, Copy, Check } from "lucide-react";

function parseCryptoNotes(notes?: string | null) {
  if (!notes) return null;
  const fields: Record<string, string> = {};
  notes.split("|").forEach((part) => {
    const colonIdx = part.indexOf(":");
    if (colonIdx !== -1) {
      const key = part.slice(0, colonIdx).trim();
      const value = part.slice(colonIdx + 1).trim();
      if (key && value) fields[key] = value;
    }
  });
  return Object.keys(fields).length > 0 ? fields : null;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-white/20 hover:text-white/60 transition-colors ml-1 shrink-0"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function CryptoDetails({ notes }: { notes?: string | null }) {
  const parsed = parseCryptoNotes(notes);
  if (!parsed) {
    if (notes) return <p className="text-xs text-white/25 italic mt-1">"{notes}"</p>;
    return null;
  }
  const labelMap: Record<string, string> = {
    "Coin": "Coin",
    "TXID": "Transaction ID",
    "From wallet": "Sender Wallet",
  };
  return (
    <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
      {Object.entries(parsed).map(([key, value]) => (
        <div key={key} className="flex items-start gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-sans w-24 shrink-0 pt-0.5">{labelMap[key] ?? key}</span>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs text-white/55 font-mono break-all leading-relaxed">{value}</span>
            {(key === "TXID" || key === "From wallet") && <CopyBtn text={value} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPaymentsPage() {
  return <ProtectedLayout adminOnly><AdminPaymentsContent /></ProtectedLayout>;
}

function AdminPaymentsContent() {
  const { data: payments, isLoading } = useAdminGetPayments();
  const updatePayment = useAdminUpdatePayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<number | null>(null);
  const [loadingProof, setLoadingProof] = useState<number | null>(null);

  const hasScreenshot = (url: string) => url && url !== "N/A" && url.trim() !== "";

  const handleViewProof = async (id: number, storagePath: string) => {
    if (!hasScreenshot(storagePath)) return;
    setLoadingProof(id);
    try {
      const { data, error } = await supabase.storage.from("Payments-proofs").createSignedUrl(storagePath, 3600);
      if (error || !data?.signedUrl) throw error ?? new Error("Failed to generate URL");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast({ title: "Could not load proof", variant: "destructive" });
    } finally {
      setLoadingProof(null);
    }
  };

  const handleUpdate = async (id: number, status: "approved" | "rejected") => {
    setUpdating(id);
    try {
      await updatePayment.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getAdminGetPaymentsQueryKey() });
      toast({ title: `Payment ${status}` });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const pending = payments?.filter((p) => p.status === "pending") ?? [];
  const processed = payments?.filter((p) => p.status !== "pending") ?? [];

  const StatusChip = ({ status }: { status: string }) => {
    const map: Record<string, { cls: string; icon: React.ElementType }> = {
      pending: { cls: "text-amber-400", icon: Clock },
      approved: { cls: "text-green-400", icon: CheckCircle2 },
      rejected: { cls: "text-primary", icon: XCircle },
    };
    const { cls, icon: Icon } = map[status] ?? { cls: "text-white/30", icon: Clock };
    return (
      <span className={`flex items-center gap-1.5 text-xs uppercase tracking-widest font-sans ${cls}`}>
        <Icon className="w-3 h-3" />{status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Admin</p>
        <h1 className="font-serif text-4xl font-bold text-white">Payment Queue</h1>
        <p className="text-white/30 mt-1 text-sm">{pending.length} pending review</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-sm bg-white/4" />)}</div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-400/70 font-sans flex items-center gap-2">
                <Clock className="w-3 h-3" /> Awaiting Review ({pending.length})
              </p>
              {pending.map((p) => (
                <div key={p.id} className="glass-red border border-primary/15 rounded-sm p-5">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-sans font-semibold text-sm text-white/90">{p.plan_name}</p>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-sans border border-white/8 rounded-sm px-1.5 py-0.5">
                          {new Date(p.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      {/* Parsed crypto details */}
                      <CryptoDetails notes={p.notes} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {hasScreenshot(p.screenshot_url) && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loadingProof === p.id}
                          onClick={() => handleViewProof(p.id, p.screenshot_url)}
                          className="text-xs border-white/10 text-white/40 hover:bg-white/5 bg-transparent h-8 px-3 gap-1.5 font-sans"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {loadingProof === p.id ? "..." : "Screenshot"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={updating === p.id}
                        onClick={() => handleUpdate(p.id, "approved")}
                        className="text-xs bg-green-700 hover:bg-green-600 text-white border-0 h-8 px-3 gap-1.5 font-sans"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === p.id}
                        onClick={() => handleUpdate(p.id, "rejected")}
                        className="text-xs border-primary/30 text-primary/70 hover:bg-primary/10 bg-transparent h-8 px-3 gap-1.5 font-sans"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Processed */}
          {processed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/20 font-sans">Processed ({processed.length})</p>
              {processed.map((p) => (
                <div key={p.id} className="glass rounded-sm p-4 flex items-center gap-4 opacity-55 hover:opacity-75 transition-opacity">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-sans text-sm text-white/60">{p.plan_name}</p>
                      <StatusChip status={p.status} />
                    </div>
                    <p className="text-xs text-white/20 font-sans mt-0.5">{new Date(p.submitted_at).toLocaleDateString()}</p>
                    {p.notes && parseCryptoNotes(p.notes) && (
                      <div className="flex gap-3 mt-1 flex-wrap">
                        {Object.entries(parseCryptoNotes(p.notes)!).map(([k, v]) => (
                          <span key={k} className="text-[10px] text-white/20 font-mono">{k}: {v.length > 16 ? `${v.slice(0, 8)}…${v.slice(-4)}` : v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {hasScreenshot(p.screenshot_url) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loadingProof === p.id}
                      onClick={() => handleViewProof(p.id, p.screenshot_url)}
                      className="text-xs h-7 gap-1 text-white/25 font-sans"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!pending.length && !processed.length && (
            <div className="glass rounded-sm p-16 text-center">
              <CreditCard className="w-8 h-8 text-white/10 mx-auto mb-4" />
              <p className="text-white/25 text-sm">No payment submissions yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
