import { useState } from "react";
import { Link } from "wouter";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { useGetContent, useGetContentSignedUrl } from "@workspace/api-client-react";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Film, Lock, Image, Play, ExternalLink, Crown, ChevronRight } from "lucide-react";

type ContentItem = {
  id: number;
  title: string;
  description?: string | null;
  tier_required: string;
  storage_path: string | null;
  content_type: string;
  thumbnail_url?: string | null;
  created_at: string;
};

function MediaTypeIcon({ type }: { type: string }) {
  if (type === "video") return <Play className="w-5 h-5 text-white/25" />;
  if (type === "photo" || type === "image") return <Image className="w-5 h-5 text-white/25" />;
  return <Film className="w-5 h-5 text-white/25" />;
}

function PreviewCard({ item }: { item: ContentItem }) {
  const [url, setUrl] = useState<string | null>(null);
  const getSignedUrl = useGetContentSignedUrl();
  const { toast } = useToast();

  const handleAccess = async () => {
    try {
      const result = await getSignedUrl.mutateAsync({ id: item.id });
      setUrl(result.signed_url);
    } catch {
      toast({ title: "Could not load preview", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="glass rounded-sm overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-300 group flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-white/3 flex items-center justify-center overflow-hidden">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <MediaTypeIcon type={item.content_type} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans bg-black/60 backdrop-blur-sm border border-white/10 text-white/50 px-2 py-0.5 rounded-sm">
            {item.content_type}
          </span>
        </div>

        {/* Play overlay on hover */}
        {!url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-sans font-medium text-sm text-white/80 group-hover:text-white transition-colors leading-snug mb-1">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-white/30 leading-relaxed line-clamp-2">{item.description}</p>
          )}
        </div>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="w-full text-xs uppercase tracking-widest border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary bg-transparent h-9 font-sans">
              <ExternalLink className="w-3 h-3 mr-2" /> Open
            </Button>
          </a>
        ) : (
          <Button
            size="sm"
            onClick={handleAccess}
            disabled={getSignedUrl.isPending}
            className="w-full text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-white border-0 h-9 font-sans"
          >
            {getSignedUrl.isPending ? "Loading..." : "Watch Preview"}
          </Button>
        )}
      </div>
    </div>
  );
}

function LockedCard({ item }: { item: ContentItem }) {
  const tierLabel: Record<string, string> = { vip: "VIP", lifetime: "Lifetime" };
  return (
    <div className="glass rounded-sm overflow-hidden border border-white/4 flex flex-col opacity-60 hover:opacity-75 transition-opacity duration-300 group">
      <div className="relative aspect-video bg-white/2 flex items-center justify-center overflow-hidden">
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover blur-sm opacity-30" />
        ) : (
          <Film className="w-8 h-8 text-white/6" />
        )}
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 border border-primary/30 rotate-45 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary/50 -rotate-45" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary/50 font-sans">{tierLabel[item.tier_required] ?? item.tier_required} Only</p>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-sans font-medium text-sm text-white/40 leading-snug mb-1">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-white/20 leading-relaxed line-clamp-2">{item.description}</p>
          )}
        </div>
        <Link href="/plans">
          <Button size="sm" variant="outline" className="w-full text-xs uppercase tracking-widest border-white/10 text-white/30 hover:border-primary/30 hover:text-primary/60 bg-transparent h-9 font-sans group-hover:border-primary/20 transition-colors">
            <Crown className="w-3 h-3 mr-2" /> Upgrade
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <Skeleton className="rounded-sm bg-white/4 h-64" />;
}

export default function PreviewsPage() {
  return <ProtectedLayout><PreviewsContent /></ProtectedLayout>;
}

function PreviewsContent() {
  useProtectedRoute();
  const { data: allContent, isLoading } = useGetContent();

  const previews = (allContent ?? []).filter((item) => item.storage_path !== null);
  const locked = (allContent ?? []).filter((item) => item.storage_path === null);

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Members Access</p>
        <h1 className="font-serif text-4xl font-bold text-white">Preview Vault</h1>
        <p className="text-white/30 mt-2 text-sm max-w-xl">
          Exclusive teasers, trailers, and selected photo previews — available to all members. Upgrade your membership to unlock the full archive.
        </p>
      </div>

      {/* Preview Content */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/20 font-sans mb-1">Available to You</p>
            <h2 className="font-serif text-xl text-white">Videos & Photos</h2>
          </div>
          {!isLoading && previews.length > 0 && (
            <span className="text-xs text-white/25 font-sans uppercase tracking-widest">{previews.length} {previews.length === 1 ? "item" : "items"}</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : previews.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previews.map((item) => <PreviewCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="glass rounded-sm p-16 text-center border border-white/5">
            <Film className="w-10 h-10 text-white/10 mx-auto mb-4" />
            <p className="font-serif text-lg text-white/30 mb-2">Preview content coming soon</p>
            <p className="text-sm text-white/20">Teasers and previews will appear here when published.</p>
          </div>
        )}
      </section>

      {/* Locked Archive */}
      {(isLoading || locked.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/40 font-sans mb-1">Premium Archive</p>
              <h2 className="font-serif text-xl text-white/60">Locked Content</h2>
            </div>
            {!isLoading && locked.length > 0 && (
              <span className="text-xs text-white/20 font-sans uppercase tracking-widest">{locked.length} locked</span>
            )}
          </div>

          {/* Upgrade banner */}
          <div className="glass rounded-sm p-6 border border-white/5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-primary/30 rotate-45 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5 text-primary/60 -rotate-45" />
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-white/60">Upgrade to access the full archive</p>
                <p className="text-xs text-white/25 mt-0.5">VIP and Lifetime members get unrestricted access to all drops.</p>
              </div>
            </div>
            <Link href="/plans">
              <Button className="text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-white border-0 font-sans shrink-0 animate-pulse-glow">
                View Plans <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locked.map((item) => <LockedCard key={item.id} item={item} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
