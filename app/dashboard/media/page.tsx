"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Upload, Search, ChevronDown, Trash2, FileText, Loader2, X, Copy, Check } from "lucide-react";
import { getAdminAuthHeaders } from "@/lib/auth";

// FilerNow admin — Media Library
// Drag-and-drop / browse upload → Cloudinary via backend → grid with search + type filter + delete.

type MediaItem = {
  id: string;
  url: string;
  public_id: string;
  resource_type: "image" | "video" | "raw" | string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  filename?: string;
  created_at?: string;
};

type TypeFilter = "all" | "image" | "video" | "raw";

const MAX_SIZE_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/gif"];

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function formatDims(w?: number, h?: number) {
  if (!w || !h) return "";
  return `${w}×${h}`;
}

function fileLabel(item: MediaItem) {
  if (item.filename) return item.filename;
  const parts = item.public_id?.split("/") ?? [];
  return parts[parts.length - 1] || "untitled";
}

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState<{ name: string; progress: number }[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("resource_type", typeFilter);
      const res = await fetch(`/api/proxy/admin/media?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...getAdminAuthHeaders(),
        },
      });
      if (!res.ok) throw new Error(`Failed to load media: ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      setError(error.message || "Unable to load media");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    // Load media on component mount with current typeFilter
    const loadInitialMedia = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (typeFilter !== "all") params.set("resource_type", typeFilter);
        const res = await fetch(`/api/proxy/admin/media?${params.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            ...getAdminAuthHeaders(),
          },
        });
        if (!res.ok) throw new Error(`Failed to load media: ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.items ?? []);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(error);
        setError(error.message || "Unable to load media");
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialMedia();
  }, [typeFilter]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const uploadFile = async (file: File): Promise<MediaItem | null> => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`${file.name} exceeds the ${MAX_SIZE_MB}MB limit`);
      setUploading((prev) => [...prev, { name: file.name, progress: 0 }]);
      return null;
    }

    setUploading((prev) => [...prev, { name: file.name, progress: 0 }]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/proxy/admin/media/upload", {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAdminAuthHeaders(),
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const media: MediaItem = await res.json();

      setItems((prev) => [media, ...prev]);
      return media;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      setError(`Failed to upload ${file.name}`);
      return null;
    } finally {
      setUploading((prev) => prev.filter((u) => u.name !== file.name));
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    await Promise.all(files.map((f) => uploadFile(f)));
    // Reload media from backend to ensure consistent state
    await loadMedia();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const deleteMedia = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/proxy/admin/media/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...getAdminAuthHeaders(),
        },
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      setError("Failed to delete media");
    } finally {
      setDeletingId(null);
    }
  };

  const copyLiveLink = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId((current) => (current === item.id ? null : current)), 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to copy live link");
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => fileLabel(m).toLowerCase().includes(q));
  }, [items, search]);

  const typeLabels: Record<TypeFilter, string> = {
    all: "All Types",
    image: "Images",
    video: "Videos",
    raw: "Other",
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb + header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs text-neutral-400">
            Dashboard <span className="mx-1">›</span>{" "}
            <span className="text-neutral-500">Media Library</span>
          </p>
          <h1 className="text-2xl font-semibold text-neutral-900">Media Library</h1>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[12px] font-medium text-white shadow-sm transition hover:bg-rose-800"
        >
          <Upload className="h-4 w-4" strokeWidth={2} />
          Upload Media
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition ${
          dragActive ? "border-rose-400 bg-primary" : "border-neutral-200 hover:border-neutral-300"
        }`}
      >
        <Upload className="mb-3 h-6 w-6 text-neutral-300" strokeWidth={1.6} />
        <p className="text-[12px] font-medium text-neutral-800">Drop files here to upload</p>
        <p className="mt-1 text-[12px] text-neutral-500">
          or <span className="font-medium text-rose-600">browse your computer</span>
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Supports: JPG, PNG, SVG, WebP, GIF · Max size: {MAX_SIZE_MB}MB
        </p>
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploading.map((u) => (
            <div
              key={u.name}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-[12px]"
            >
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-rose-500" />
              <span className="truncate text-neutral-700">{u.name}</span>
              <span className="ml-auto shrink-0 text-xs text-neutral-400">Uploading…</span>
            </div>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] text-rose-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search + filter row */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-[12px] text-neutral-700 outline-none transition focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            />
          </div>

          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[12px] text-neutral-700 transition hover:border-neutral-300"
            >
              {typeLabels[typeFilter]}
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>
            {filterOpen && (
              <div className="absolute left-0 z-10 mt-1 w-36 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
                {(Object.keys(typeLabels) as TypeFilter[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTypeFilter(key);
                      setFilterOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-[12px] transition hover:bg-neutral-50 ${
                      typeFilter === key ? "font-medium text-rose-600" : "text-neutral-700"
                    }`}
                  >
                    {typeLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-[12px] text-neutral-400">
          {loading ? "Loading…" : `${filteredItems.length} file${filteredItems.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Grid */}
      {!loading && filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-16 text-center">
          <FileText className="h-6 w-6 text-neutral-300" strokeWidth={1.6} />
          <p className="text-[12px] font-medium text-neutral-700">No files found</p>
          <p className="text-xs text-neutral-400">
            {search ? "Try a different search term." : "Upload your first file to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const isImage = item.resource_type === "image";
            const label = fileLabel(item);
            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={label}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : item.resource_type === "video" ? (
                    <video src={item.url} className="h-full w-full object-cover" muted />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
                      <FileText className="h-6 w-6" strokeWidth={1.5} />
                      <span className="text-xs">{item.format?.toUpperCase()}</span>
                    </div>
                  )}

                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => copyLiveLink(item)}
                      aria-label={`Copy live link for ${label}`}
                      title="Copy live link"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-neutral-500 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-800"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMedia(item.id)}
                      disabled={deletingId === item.id}
                      aria-label={`Delete ${label}`}
                      title="Delete media"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-neutral-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-100"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="px-3 py-2.5">
                  <p className="truncate text-[13px] font-medium text-neutral-800">{label}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {formatBytes(item.bytes)}
                    {item.width && item.height ? ` · ${formatDims(item.width, item.height)}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}