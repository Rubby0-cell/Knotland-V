import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminGetContent,
  useAdminCreateContent,
  useAdminUpdateContent,
  useAdminDeleteContent,
  getAdminGetContentQueryKey,
  type AdminContentItem,
} from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Film, Plus, Trash2, Upload, Lock, Crown, Star, Pencil, Check, X } from "lucide-react";

const TIERS = ["standard", "vip", "lifetime"] as const;
type Tier = (typeof TIERS)[number];

const TIER_ICONS: Record<string, React.ElementType> = { standard: Star, vip: Crown, lifetime: Lock };
const TIER_COLOR: Record<string, string> = {
  standard: "text-white/40",
  vip: "text-amber-400/70",
  lifetime: "text-primary/70",
};

// ─── Inline Edit Row ────────────────────────────────────────────────────────
function EditRow({
  item,
  onSave,
  onCancel,
  saving,
}: {
  item: AdminContentItem;
  onSave: (data: { title: string; description: string; tier_required: Tier; content_type: string; thumbnail_url: string }) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [tier, setTier] = useState<Tier>(item.tier_required as Tier);
  const [contentType, setContentType] = useState(item.content_type);
  const [thumbnailUrl, setThumbnailUrl] = useState(item.thumbnail_url ?? "");

  return (
    <tr className="border-b border-white/4 bg-white/3">
      <td colSpan={5} className="px-5 py-5">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/25 font-sans">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/4 border-white/10 focus:border-primary/50 text-white placeholder:text-white/20 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/25 font-sans">Content Type</Label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-white/4 border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 h-9"
              >
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.15em] text-white/25 font-sans">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-white/4 border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/25 font-sans">Access Tier</Label>
              <div className="flex gap-2">
                {TIERS.map((t) => {
                  const Icon = TIER_ICONS[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-sm border text-xs uppercase tracking-widest font-sans transition-all ${
                        tier === t
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-white/8 bg-white/3 text-white/25 hover:border-white/15"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/25 font-sans">Thumbnail URL</Label>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="bg-white/4 border-white/10 focus:border-primary/50 text-white placeholder:text-white/20 h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              disabled={saving || !title}
              onClick={() => onSave({ title, description, tier_required: tier, content_type: contentType, thumbnail_url: thumbnailUrl })}
              className="text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-white border-0 font-sans h-8 px-4"
            >
              <Check className="w-3 h-3 mr-1.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={saving}
              className="text-xs uppercase tracking-widest text-white/30 hover:text-white/60 font-sans h-8 px-3"
            >
              <X className="w-3 h-3 mr-1.5" />
              Cancel
            </Button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminContentPage() {
  return (
    <ProtectedLayout adminOnly>
      <AdminContentBody />
    </ProtectedLayout>
  );
}

function AdminContentBody() {
  const { data: items, isLoading } = useAdminGetContent();
  const createContent = useAdminCreateContent();
  const updateContent = useAdminUpdateContent();
  const deleteContent = useAdminDeleteContent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Upload form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState<Tier>("standard");
  const [contentType, setContentType] = useState("video");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Table interaction state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return;
    setUploading(true);
    try {
      const path = `content/${tier}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage.from("member-content").upload(path, file);
      if (uploadError) throw uploadError;

      await createContent.mutateAsync({
        data: { title, description: description || undefined, tier_required: tier, storage_path: path, content_type: contentType, thumbnail_url: thumbnailUrl || undefined },
      });

      queryClient.invalidateQueries({ queryKey: getAdminGetContentQueryKey() });
      toast({ title: "Content item added!" });
      setTitle(""); setDescription(""); setTier("standard"); setContentType("video"); setThumbnailUrl(""); setFile(null);
    } catch (err: unknown) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (
    id: number,
    data: { title: string; description: string; tier_required: Tier; content_type: string; thumbnail_url: string },
  ) => {
    setSavingId(id);
    try {
      await updateContent.mutateAsync({
        id,
        data: {
          title: data.title,
          description: data.description || undefined,
          tier_required: data.tier_required,
          content_type: data.content_type,
          thumbnail_url: data.thumbnail_url || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getAdminGetContentQueryKey() });
      toast({ title: "Saved" });
      setEditingId(null);
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteContent.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getAdminGetContentQueryKey() });
      toast({ title: "Item deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Admin</p>
        <h1 className="font-serif text-4xl font-bold text-white">Content Library</h1>
        <p className="text-white/30 mt-1 text-sm">Upload, edit, and manage tier-gated content for vault members.</p>
      </div>

      {/* ── Upload Form ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-4 h-4 text-primary/50" />
          <h2 className="font-serif text-lg text-white">Add New Content</h2>
        </div>
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Content title..." required className="bg-white/4 border-white/8 focus:border-primary/50 text-white placeholder:text-white/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">Content Type *</Label>
              <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full bg-white/4 border border-white/8 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50">
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">Description</Label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional description..." className="w-full bg-white/4 border border-white/8 rounded-sm px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">Access Tier *</Label>
              <div className="flex gap-2">
                {TIERS.map((t) => {
                  const Icon = TIER_ICONS[t];
                  return (
                    <button key={t} type="button" onClick={() => setTier(t)} className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-sm border text-xs uppercase tracking-widest font-sans transition-all ${tier === t ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 bg-white/3 text-white/30 hover:border-white/15"}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">Thumbnail URL</Label>
              <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." className="bg-white/4 border-white/8 focus:border-primary/50 text-white placeholder:text-white/20" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-white/30 font-sans">File *</Label>
            <div className={`border border-dashed rounded-sm p-8 text-center transition-all ${file ? "border-primary/40 bg-primary/5" : "border-white/10 hover:border-white/20"}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0] ?? null); }}>
              <Upload className="w-6 h-6 text-white/15 mx-auto mb-3" />
              {file ? (
                <div>
                  <p className="font-sans text-sm text-white/70">{file.name}</p>
                  <p className="text-xs text-white/30 mt-1 font-sans">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <p className="text-sm text-white/25">Drag & drop or browse to upload</p>
              )}
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-4 text-xs text-white/30 file:mr-3 file:text-xs file:font-sans file:bg-white/8 file:text-white/60 file:border-0 file:rounded-sm file:px-3 file:py-1.5 file:cursor-pointer" />
            </div>
          </div>

          <Button type="submit" disabled={uploading || !title || !file} className="text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-white border-0 font-sans animate-pulse-glow">
            {uploading ? "Uploading..." : "Upload & Save"}
          </Button>
        </form>
      </div>

      {/* ── Content Table ────────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/20 mb-5 font-sans">
          All Items ({items?.length ?? 0})
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-sm bg-white/4" />)}
          </div>
        ) : items && items.length > 0 ? (
          <div className="glass rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium">Title</th>
                  <th className="text-left px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium hidden sm:table-cell">Type</th>
                  <th className="text-left px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium">Tier</th>
                  <th className="text-left px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-white/25 font-sans font-medium hidden md:table-cell">Added</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isEditing = editingId === item.id;
                  const TierIcon = TIER_ICONS[item.tier_required] ?? Film;

                  if (isEditing) {
                    return (
                      <EditRow
                        key={item.id}
                        item={item}
                        saving={savingId === item.id}
                        onSave={(data) => handleSave(item.id, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    );
                  }

                  return (
                    <tr key={item.id} className="border-b border-white/4 hover:bg-white/2 transition-colors last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt="" className="w-10 h-7 object-cover rounded-sm opacity-60 shrink-0" />
                          ) : (
                            <div className="w-10 h-7 bg-white/5 rounded-sm flex items-center justify-center shrink-0">
                              <Film className="w-3.5 h-3.5 text-white/15" />
                            </div>
                          )}
                          <div>
                            <p className="font-sans text-sm text-white/70 truncate max-w-[160px]">{item.title}</p>
                            {item.description && <p className="text-xs text-white/25 truncate max-w-[160px]">{item.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs uppercase tracking-widest text-white/30 font-sans">{item.content_type}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 text-xs uppercase tracking-widest font-sans ${TIER_COLOR[item.tier_required] ?? "text-white/30"}`}>
                          <TierIcon className="w-3 h-3" />
                          {item.tier_required}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs text-white/20 font-sans">{new Date(item.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setEditingId(item.id)}
                            disabled={!!editingId}
                            className="text-white/15 hover:text-white/50 transition-colors p-1 disabled:opacity-30"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={deletingId === item.id || !!editingId}
                            onClick={() => handleDelete(item.id)}
                            className="text-white/15 hover:text-primary transition-colors p-1 disabled:opacity-30"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass rounded-sm p-16 text-center">
            <Film className="w-8 h-8 text-white/10 mx-auto mb-4" />
            <p className="text-white/25 text-sm">No content items yet. Upload the first one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
