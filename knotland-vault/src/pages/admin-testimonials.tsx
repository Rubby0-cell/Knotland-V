import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTestimonials, useAdminUpdateTestimonial, getGetTestimonialsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Star, CheckCircle2, XCircle, Quote } from "lucide-react";

export default function AdminTestimonialsPage() {
  return <ProtectedLayout adminOnly><AdminTestimonialsContent /></ProtectedLayout>;
}

function AdminTestimonialsContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateTestimonial = useAdminUpdateTestimonial();
  const [updating, setUpdating] = useState<number | null>(null);
  const { data: testimonials, isLoading } = useGetTestimonials();

  const handleUpdate = async (id: number, status: "approved" | "rejected") => {
    setUpdating(id);
    try {
      await updateTestimonial.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getGetTestimonialsQueryKey() });
      toast({ title: `Testimonial ${status}` });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Admin</p>
        <h1 className="font-serif text-4xl font-bold text-white">Testimonial Moderation</h1>
        <p className="text-white/30 mt-1 text-sm">Review and approve member testimonials.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-sm bg-white/4" />)}</div>
      ) : testimonials && testimonials.length > 0 ? (
        <div className="space-y-3">
          {testimonials.map((t) => {
            const statusColors: Record<string, string> = {
              approved: "text-green-400",
              rejected: "text-primary",
              pending: "text-amber-400",
            };
            return (
              <div key={t.id} data-testid={`card-testimonial-${t.id}`} className="glass rounded-sm p-5 flex gap-4 hover:glass-red transition-all duration-300 group">
                <Quote className="w-4 h-4 text-primary/20 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <p className="font-sans font-medium text-sm text-white/70">{t.display_name ?? "Anonymous"}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
                    </div>
                    <span className={`text-xs uppercase tracking-widest font-sans ml-auto ${statusColors[t.status] ?? ""}`}>{t.status}</span>
                  </div>
                  <p className="text-sm text-white/35 leading-relaxed italic">"{t.content}"</p>
                  <p className="text-xs text-white/15 font-sans mt-2">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.status === "approved" ? (
                    <Button size="sm" variant="outline" disabled={updating === t.id} onClick={() => handleUpdate(t.id, "rejected")} className="text-xs border-primary/20 text-primary/60 hover:bg-primary/10 bg-transparent h-8 px-3 gap-1 font-sans">
                      <XCircle className="w-3 h-3" /> Reject
                    </Button>
                  ) : (
                    <Button size="sm" disabled={updating === t.id} onClick={() => handleUpdate(t.id, "approved")} className="text-xs bg-green-700 hover:bg-green-600 text-white border-0 h-8 px-3 gap-1 font-sans">
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-sm p-16 text-center">
          <Quote className="w-8 h-8 text-white/10 mx-auto mb-4" />
          <p className="text-white/25 text-sm">No testimonials to moderate.</p>
        </div>
      )}
    </div>
  );
}
