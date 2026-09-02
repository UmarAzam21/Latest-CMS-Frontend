"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Upload, Search, FileSpreadsheet, Loader2, X, ShieldCheck, ShieldAlert } from "lucide-react";
import { canUpdateModule, getAdminAuthHeaders } from "@/lib/auth";

type FBREntry = {
  id: string | number;
  sr_no: string;
  ntn: string;
  name: string;
  business_name: string;
  rank?: number;
};

type SearchResponse = {
  query: string;
  count: number;
  results: FBREntry[];
};

const MAX_SIZE_MB = 15;
const ACCEPTED = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const DEFAULT_PAGE_SIZE = 20;

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function FBRChecklist() {
  // Use the Next.js proxy route for all API calls
  const apiUrl = (path: string) => {
    // Normalize path: remove leading /api/ if present, then prepend /api/proxy/
    let normalized = path.startsWith("/api/") ? path.slice(4) : path;
    if (!normalized.startsWith("/")) normalized = "/" + normalized;
    return `/api/proxy${normalized}`;
  };
  const [entries, setEntries] = useState<FBREntry[]>([]);
  const [defaultEntries, setDefaultEntries] = useState<FBREntry[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState<{ name: string; size?: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canUploadChecklist = canUpdateModule("xlsx_import");

  // Load a default page of checklist entries on mount
  const loadDefaultEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use exact datasets endpoint to list available datasets
      const res = await fetch(apiUrl(`/xlsx/datasets`), {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to list datasets: ${res.status}`);
      const data = await res.json();
      // Expecting an array of dataset objects (rows from dataset_versions)
      const list: any[] = Array.isArray(data) ? data : data.datasets ?? [];
      setDatasets(list);
      // defaultEntries remain empty until user searches or selects a dataset
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to list datasets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDefaultEntries();
  }, [loadDefaultEntries]);

  // Debounced search against the backend
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setEntries([]);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q, limit: String(DEFAULT_PAGE_SIZE), offset: "0" });
      const res = await fetch(apiUrl(`/xlsx/search?${params.toString()}`), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data: SearchResponse = await res.json();
      setEntries(data.results ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const uploadFile = async (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`${file.name} exceeds the ${MAX_SIZE_MB}MB limit`);
      return;
    }

    setUploading((prev) => [...prev, { name: file.name, size: file.size }]);

    try {
      const formData = new FormData();
      // API accepts one or more files under `files`
      formData.append("files", file);

      const res = await fetch(apiUrl("/api/xlsx/import"), {
        method: "POST",
        body: formData,
        // no credentials here unless required by your API
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Import failed: ${res.status} ${text}`);
      }

      const body = await res.json().catch(() => ({} as any));
      const tableName = body.table_name ?? body.tableName ?? body.table ?? null;
      if (!tableName) {
        // If API doesn't return a table name, fallback to refreshing after a short delay
        await new Promise((r) => setTimeout(r, 1500));
        await loadDefaultEntries();
        return;
      }

      // Poll import status until active or failed
      const statusUrl = (name: string) => apiUrl(`/api/xlsx/status/${encodeURIComponent(name)}`);
      let attempts = 0;
      const maxAttempts = 60; // ~60s timeout
      while (attempts < maxAttempts) {
        attempts += 1;
        const sres = await fetch(statusUrl(tableName), { method: "GET" });
        if (!sres.ok) {
          // wait and retry
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        const sbody = await sres.json().catch(() => ({} as any));
        const status = (sbody.status ?? sbody.state ?? "").toLowerCase();
        if (status === "active") {
          await loadDefaultEntries();
          break;
        }
        if (status === "failed" || status === "error") {
          setError(`Import failed for ${file.name}`);
          break;
        }
        // otherwise still importing/indexing
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err: any) {
      console.error(err);
      setError(`Failed to upload ${file.name}`);
    } finally {
      setUploading((prev) => prev.filter((u) => u.name !== file.name));
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || !canUploadChecklist) return;
    const files = Array.from(fileList);
    await Promise.all(files.map((f) => uploadFile(f)));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUploadChecklist) return;
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const isSearchMode = query.trim().length > 0;
  const rows = isSearchMode ? entries : defaultEntries;
  const busy = isSearchMode ? searching : loading;

  const resultLabel = useMemo(() => {
    if (busy) return "Loading…";
    if (isSearchMode) return `${rows.length} match${rows.length === 1 ? "" : "es"} for "${query}"`;
    return `${rows.length} entr${rows.length === 1 ? "y" : "ies"}`;
  }, [busy, isSearchMode, rows.length, query]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb + header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="mb-1 text-[12px] text-neutral-400">
            Dashboard <span className="mx-1">›</span>{" "}
            <span className="text-neutral-500">FBR Checklist</span>
          </p>
          <h1 className="text-xl font-semibold text-neutral-900">FBR Checklist</h1>
        </div>
        <button
          onClick={() => {
            if (!canUploadChecklist) return;
            fileInputRef.current?.click();
          }}
          disabled={!canUploadChecklist}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-medium shadow-sm transition ${
            canUploadChecklist
              ? "bg-primary text-white hover:bg-primary"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          <Upload className="h-4 w-4" strokeWidth={2} />
          {canUploadChecklist ? "Upload Checklist" : "View Only"}
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
          if (!canUploadChecklist) return;
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!canUploadChecklist) return;
          fileInputRef.current?.click();
        }}
        className={`mb-6 flex ${canUploadChecklist ? "cursor-pointer" : "cursor-not-allowed opacity-70"} flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition ${
          dragActive ? "border-rose-400 bg-primary" : "border-neutral-200 hover:border-neutral-300"
        }`}
      >
        <FileSpreadsheet className="mb-3 h-6 w-6 text-neutral-300" strokeWidth={1.6} />
        <p className="text-[12px] font-medium text-neutral-800">
          {canUploadChecklist ? "Drop your FBR checklist file here" : "View-only access: upload is disabled"}
        </p>
        <p className="mt-1 text-[12px] text-neutral-500">
          {canUploadChecklist ? (
            <>
              or <span className="font-medium text-primary">browse your computer</span>
            </>
          ) : (
            "You can view the checklist but cannot upload new files."
          )}
        </p>
        <p className="mt-2 text-[12px] text-neutral-400">
          Supports: CSV, XLS, XLSX · Max size: {MAX_SIZE_MB}MB
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
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              <span className="truncate text-neutral-700">{u.name}</span>
              {u.size ? (
                <span className="shrink-0 text-[12px] text-neutral-400">{formatBytes(u.size)}</span>
              ) : null}
              <span className="ml-auto shrink-0 text-[12px] text-neutral-400">Uploading…</span>
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

      {/* Search row */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="relative w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by NTN, name, or business name..."
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-8 text-[12px] text-neutral-700 outline-none transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="text-[12px] text-neutral-400">{resultLabel}</p>
      </div>

      {/* Datasets list (from /api/xlsx/datasets) */}
      {datasets.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[12px] text-neutral-500">Available datasets</p>
          <div className="flex flex-wrap gap-2">
            {datasets.map((d, i) => {
              const name = d?.table_name ?? d?.tableName ?? d?.table ?? String(d);
              return (
                <span
                  key={name ?? i}
                  className="rounded-lg bg-rose-100 px-3 py-1 text-[12px] text-rose-700"
                >
                  {name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/60 text-[11px] uppercase tracking-wide text-neutral-400">
              <th className="px-4 py-3 font-medium">Sr No</th>
              <th className="px-4 py-3 font-medium">NTN</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Business Name</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {busy && rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[12px] text-neutral-400">
                  <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin text-rose-400" />
                  Loading entries…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <FileSpreadsheet className="mx-auto mb-2 h-6 w-6 text-neutral-300" strokeWidth={1.6} />
                  <p className="text-[12px] font-medium text-neutral-700">
                    {isSearchMode ? "No matching entries" : "Search for entries..."}
                  </p>
                  <p className="mt-1 text-[12px] text-neutral-400">
                    {isSearchMode
                      ? "Try a different NTN or name."
                      : "You can search by NTN, name, or business name."}
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-neutral-100 text-[12px] text-neutral-700 last:border-0 hover:bg-neutral-50/60"
                >
                  <td className="px-4 py-3 text-neutral-400">{entry.sr_no}</td>
                  <td className="px-4 py-3 font-mono text-neutral-800">{entry.ntn}</td>
                  <td className="px-4 py-3">{entry.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{entry.business_name}</td>
                  <td className="px-4 py-3">
                    <span className="ml-auto flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                      Filer
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}