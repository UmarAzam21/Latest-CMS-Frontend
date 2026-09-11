"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { mockPages } from "@/data/dashboard/mockContent";
import type { Page } from "@/types/content";

type StatusFilter = "All" | "Published" | "Draft";
type SortOption = "Newest" | "Oldest";

export default function ContentEditorPage() {
  const [pages, setPages] = useState<Page[]>(mockPages);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortOption, setSortOption] = useState<SortOption>("Newest");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const filteredPages = useMemo(() => {
    const next = [...pages].filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(search.toLowerCase()) ||
        page.slug.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" ? true : page.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return sortOption === "Newest" ? next : next.reverse();
  }, [pages, search, sortOption, statusFilter]);

  const handleCreatePage = () => {
    const slug = newTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!slug) return;

    const createdPage: Page = {
      id: slug,
      slug,
      title: newTitle.trim(),
      status: "Draft",
      sectionsCount: 1,
      lastEdited: "Just now",
    };

    setPages((current) => [createdPage, ...current]);
    setNewTitle("");
    setShowCreateModal(false);
  };

  const handleDelete = (page: Page) => {
    const confirmed = window.confirm(`Delete "${page.title}"?`);
    if (confirmed) {
      setPages((current) => current.filter((item) => item.id !== page.id));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-700 font-semibold">Content</span>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Content Editor</h1>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2} />
          Add Page
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative max-w-xs flex-1">
            <Search size={15} strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pages..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600">
              Status
              <ChevronDown size={14} strokeWidth={1.8} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="absolute opacity-0"
                aria-label="Status filter"
              >
                <option value="All">All</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600">
              Last Edited
              <ChevronDown size={14} strokeWidth={1.8} />
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                className="absolute opacity-0"
                aria-label="Sort pages"
              >
                <option value="Newest">Newest first</option>
                <option value="Oldest">Oldest first</option>
              </select>
            </label>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Page Name</th>
              <th className="px-5 py-3">URL Slug</th>
              <th className="px-5 py-3">Sections</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last Edited</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <tr key={page.id} className="border-b border-slate-100 text-sm last:border-0">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
                    <FileText size={16} strokeWidth={1.8} className="text-slate-400" />
                    {page.title}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600">/{page.slug}</span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-600">{page.sectionsCount} sections</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${page.status === "Published" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    {page.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[11px] text-slate-500">{page.lastEdited}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/dashboard/content/edit?slug=${page.slug}`} className="rounded-lg bg-[#F9FAFB] p-2 text-black transition-opacity hover:opacity-70" aria-label={`Edit ${page.title}`}>
                      <Pencil size={16} strokeWidth={1.8} />
                    </Link>
                    <button onClick={() => handleDelete(page)} className="rounded-lg bg-[#FEF2F2] p-2 text-primary transition-opacity hover:opacity-70" aria-label={`Delete ${page.title}`}>
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredPages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">
                  Page not found. Try adjusting your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Create a new page</h2>
            <p className="mt-1 text-sm text-slate-500">Add a title and the slug will be created automatically.</p>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Page title
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="e.g. Pricing"
              />
            </label>

            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Auto-slug: <span className="font-semibold text-slate-900">/{newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "slug"}</span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                Cancel
              </button>
              <button type="button" onClick={handleCreatePage} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                Create page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}