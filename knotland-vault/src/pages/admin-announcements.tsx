import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useGetAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, getGetAnnouncementsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Pin, Trash2, Plus } from "lucide-react";

export default function AdminAnnouncementsPage() {
  return <ProtectedLayout adminOnly><AdminAnnouncementsContent /></ProtectedLayout>;
}

function AdminAnnouncementsContent() {
  const { data: announcements, isLoading } = useGetAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setSubmitting(true);
    try {
      await createAnnouncement.mutateAsync({ data: { title, body, pinned } });
      queryClient.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() });
      toast({ title: "Announcement posted!" });
      setTitle(""); setBody(""); setPinned(false);
    } catch {
      toast({ title: "Failed to post", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteAnnouncement.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() });
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Admin</p>
        <h1 className="font-serif text-4xl font-bold text-white">Announcements</h1>
      </div>

      {/* Create Form */}
      <div className="glass rounded-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-4 h-4 text-primary/50" />
          <h2 className="font-serif text-lg text-white">New Announcement</h2>
        </div>
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">Title</Label>
            <Input data-testid="input-announcement-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title..." className="bg-white/4 border-white/8 focus:border-primary/50 text-white placeholder:text-white/20" required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">Message</Label>
            <textarea
              data-testid="input-announcement-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write your announcement..."
              className="w-full bg-white/4 border border-white/8 rounded-sm px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch data-testid="switch-pinned" id="pinned" checked={pinned} onCheckedChange={setPinned} className="data-[state=checked]:bg-primary" />
            <Label htmlFor="pinned" className="text-xs uppercase tracking-[0.15em] text-white/30 cursor-pointer font-sans">Pin this announcement</Label>
          </div>
          <Button data-testid="button-create-announcement" type="submit" disabled={submitting || !title || !body} className="text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-white border-0 font-sans animate-pulse-glow">
            {submitting ? "Posting..." : "Post Announcement"}
          </Button>
        </form>
      </div>

      {/* List */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/20 mb-5 font-sans">All Announcements</p>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-sm bg-white/4" />)}</div>
        ) : announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} data-testid={`card-announcement-${ann.id}`} className="glass rounded-sm p-5 flex gap-4 hover:glass-red transition-all duration-300 group">
                <div className="shrink-0 mt-0.5">
                  {ann.pinned ? <Pin className="w-3.5 h-3.5 text-primary/50" /> : <Megaphone className="w-3.5 h-3.5 text-white/15" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="font-sans font-medium text-sm text-white/80">{ann.title}</p>
                    {ann.pinned && <span className="text-xs uppercase tracking-widest text-primary/50 font-sans">Pinned</span>}
                    <span className="text-xs text-white/20 font-sans ml-auto">{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-white/35 leading-relaxed">{ann.body}</p>
                </div>
                <button
                  data-testid={`button-delete-announcement-${ann.id}`}
                  disabled={deleting === ann.id}
                  onClick={() => handleDelete(ann.id)}
                  className="text-white/15 hover:text-primary transition-colors shrink-0 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-sm p-12 text-center">
            <Megaphone className="w-8 h-8 text-white/10 mx-auto mb-4" />
            <p className="text-white/25 text-sm">No announcements posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
