import { ProtectedLayout } from "@/components/layout/protected-layout";
import { useGetAnnouncements } from "@workspace/api-client-react";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { Skeleton } from "@/components/ui/skeleton";
import { Pin, Megaphone, Calendar, Sparkles } from "lucide-react";

function PostCard({
  post,
  featured = false,
}: {
  post: { id: number; title: string; body: string; pinned: boolean; created_at: string };
  featured?: boolean;
}) {
  const date = new Date(post.created_at);
  const formatted = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  if (featured) {
    return (
      <div className="relative glass rounded-sm overflow-hidden border border-primary/20 group hover:border-primary/35 transition-all duration-300 col-span-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
        <div className="relative p-8 md:p-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1.5 text-primary/70">
              <Pin className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-sans">Featured</span>
            </div>
            <span className="w-px h-3 bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-sans">{formatted}</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-4 leading-snug max-w-2xl">{post.title}</h2>
          <p className="text-white/45 leading-relaxed text-sm max-w-2xl">{post.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-sm overflow-hidden border border-transparent hover:border-white/8 hover:glass-red transition-all duration-300 group flex flex-col">
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4">
          {post.pinned ? (
            <Pin className="w-3 h-3 text-primary/50 shrink-0" />
          ) : (
            <Megaphone className="w-3 h-3 text-white/20 shrink-0" />
          )}
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-sans">{formatted}</span>
        </div>
        <h3 className="font-serif text-lg text-white/85 mb-3 leading-snug group-hover:text-white transition-colors">{post.title}</h3>
        <p className="text-sm text-white/35 leading-relaxed flex-1 group-hover:text-white/50 transition-colors line-clamp-4">{post.body}</p>
      </div>
      <div className="px-6 pb-5">
        <div className="h-px bg-white/5 mb-4" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/20 font-sans">Knot Land</span>
      </div>
    </div>
  );
}

function SkeletonPost({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return <Skeleton className="h-52 rounded-sm bg-white/4 col-span-full" />;
  }
  return <Skeleton className="h-52 rounded-sm bg-white/4" />;
}

export default function EventsPage() {
  return <ProtectedLayout><EventsContent /></ProtectedLayout>;
}

function EventsContent() {
  useProtectedRoute();
  const { data: posts, isLoading } = useGetAnnouncements({ limit: 20 });

  const featured = posts?.filter((p) => p.pinned) ?? [];
  const regular = posts?.filter((p) => !p.pinned) ?? [];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Exclusive</p>
        <h1 className="font-serif text-4xl font-bold text-white">Blog & Events</h1>
        <p className="text-white/30 mt-2 text-sm max-w-xl">
          News, announcements, upcoming drops, and exclusive updates — curated for members only.
        </p>
      </div>

      {/* Ticker / latest count */}
      {!isLoading && posts && posts.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-sans uppercase tracking-[0.25em]">{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
          </div>
          {featured.length > 0 && (
            <>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-xs font-sans uppercase tracking-[0.25em] text-white/25">{featured.length} featured</span>
            </>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonPost featured />
          {Array.from({ length: 4 }).map((_, i) => <SkeletonPost key={i} />)}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pinned posts shown as featured */}
          {featured.map((post) => (
            <PostCard key={post.id} post={post} featured />
          ))}
          {/* Regular posts in grid */}
          {regular.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-sm p-20 text-center border border-white/5">
          <Calendar className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="font-serif text-lg text-white/30 mb-2">Nothing yet</p>
          <p className="text-sm text-white/20 max-w-xs mx-auto">
            Blog posts, events, and announcements will appear here when published by the team.
          </p>
        </div>
      )}

      {/* Sidebar hint for admins */}
      <div className="glass rounded-sm p-6 border border-white/5 flex items-start gap-4">
        <Megaphone className="w-4 h-4 text-primary/40 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans mb-1">Stay in the loop</p>
          <p className="text-xs text-white/20 leading-relaxed">
            New drops, exclusive events, and Knot Land updates are posted here first. Check back regularly or watch your inbox for member alerts.
          </p>
        </div>
      </div>
    </div>
  );
}
