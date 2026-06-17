import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetContent, useGetContentSignedUrl } from "@workspace/api-client-react";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useToast } from "@/hooks/use-toast";
import { Film, Lock, ExternalLink } from "lucide-react";

function ContentCard({ item, hasAccess }: {
  item: { id: number; title: string; description?: string | null; tier_required: string; storage_path: string | null; content_type: string; thumbnail_url?: string | null; created_at: string };
  hasAccess: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const getSignedUrl = useGetContentSignedUrl();
  const { toast } = useToast();

  const handleAccess = async () => {
    try {
      const result = await getSignedUrl.mutateAsync({ id: item.id });
      setUrl(result.signed_url);
    } catch {
      toast({ title: "Access failed", description: "Could not load this content. Try again.", variant: "destructive" });
    }
  };

  return (
    <div data-testid={`card-content-${item.id}`} className={`glass rounded-sm overflow-hidden flex flex-col group transition-all duration-300 ${hasAccess ? "hover:glass-red hover:border-primary/15 border border-transparent" : "opacity-50 border border-transparent"}`}>
      <div className="aspect-video bg-white/3 flex items-center justify-center relative overflow-hidden">
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
        ) : (
          <Film className="w-8 h-8 text-white/10" />
        )}
        {!hasAccess && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-6 h-6 text-primary/60 mx-auto mb-2" />
              <p className="text-xs uppercase tracking-[0.2em] text-primary/60 font-sans">{item.tier_required} only</p>
            </div>
          </div>
        )}
        {hasAccess && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-sans font-medium text-sm text-white/80 leading-snug">{item.title}</h3>
          <span className="text-xs uppercase tracking-widest text-primary/50 font-sans shrink-0">{item.tier_required}</span>
        </div>
        {item.description && <p className="text-xs text-white/30 leading-relaxed flex-1 mb-4">{item.description}</p>}
        {hasAccess && (
          url ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="w-full text-xs uppercase tracking-widest border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary bg-transparent h-9 font-sans">
                <ExternalLink className="w-3 h-3 mr-2" /> Open
              </Button>
            </a>
          ) : (
            <Button size="sm" onClick={handleAccess} disabled={getSignedUrl.isPending} className="w-full text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-white border-0 h-9 font-sans">
              {getSignedUrl.isPending ? "Loading..." : "Access Content"}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export default function ContentPage() {
  return <ProtectedLayout><ContentPageBody /></ProtectedLayout>;
}

function ContentPageBody() {
  useProtectedRoute();
  const [tierFilter, setTierFilter] = useState<string | undefined>(undefined);
  const { data: content, isLoading } = useGetContent(tierFilter ? { tier: tierFilter } : undefined);

  return (
    <div className="space-y-10">
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Exclusive</p>
        <h1 className="font-serif text-4xl font-bold text-white">Content Library</h1>
        <p className="text-white/30 mt-2 text-sm">Premium content curated exclusively for vault members.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", "standard", "vip", "lifetime"].map((t) => {
          const active = (!tierFilter && t === "All") || tierFilter === t;
          return (
            <button
              key={t}
              data-testid={`button-filter-${t}`}
              onClick={() => setTierFilter(t === "All" ? undefined : t)}
              className={`text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-sm font-sans transition-all duration-200 ${active ? "bg-primary text-white" : "glass text-white/40 hover:text-white border border-transparent hover:border-white/10"}`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-sm bg-white/4" />)}
        </div>
      ) : content && content.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((item) => {
            // storage_path is null for items the server determined are above the member's tier
            const hasAccess = item.storage_path !== null;
            return <ContentCard key={item.id} item={item} hasAccess={hasAccess} />;
          })}
        </div>
      ) : (
        <div className="glass rounded-sm p-20 text-center">
          <Film className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="font-serif text-lg text-white/30 mb-2">Content Coming Soon</p>
          <p className="text-sm text-white/20">New drops are on the way. Check back shortly.</p>
        </div>
      )}
    </div>
  );
}
