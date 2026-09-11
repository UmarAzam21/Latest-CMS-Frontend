"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, FileText, Pencil, Trash2, ChevronDown } from "lucide-react";
import { pagesData, PageRow } from "@/data/dashboard/data";
import Dropdown from "@/components/ui/Dropdown";
import DropdownItem from "@/components/ui/DropdownItem";

type StatusFilter = "All" | "Published" | "Draft";

export default function ContentForm() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const filteredPages = useMemo(() => {
    return pagesData.filter((page) => {
      const matchesSearch =
        page.name.toLowerCase().includes(search.toLowerCase()) ||
        page.slug.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : page.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  function handleDelete(page: PageRow) {
    // TODO: DELETE /api/admin/pages/{id} (ya jo bhi endpoint bane) call karein
    const confirmed = window.confirm(`Delete "${page.name}"? You wanna delete this page.`);
    if (confirmed) {
      console.log("Deleting page:", page.id);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Search + filters */}
      <div className="flex items-center gap-3 border-b border-slate-200 p-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none "
          />
        </div>

        <Dropdown
          align="left"
          trigger={
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50">
              Status
              <ChevronDown size={14} strokeWidth={1.8} />
            </div>
          }
        >
          <DropdownItem label="All" onClick={() => setStatusFilter("All")} />
          <DropdownItem label="Published" onClick={() => setStatusFilter("Published")} />
          <DropdownItem label="Draft" onClick={() => setStatusFilter("Draft")} />
        </Dropdown>

        <Dropdown
          align="left"
          trigger={
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50">
              Last Edited
              <ChevronDown size={14} strokeWidth={1.8} />
            </div>
          }
        >
          <DropdownItem label="Newest first" onClick={() => { }} />
          <DropdownItem label="Oldest first" onClick={() => { }} />
        </Dropdown>
      </div>

      {/* Table */}
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
                <div className="flex items-center text-xs gap-2 font-medium text-slate-900">
                  <FileText size={16} strokeWidth={1.8} className="text-slate-400" />
                  {page.name}
                </div>
              </td>

              <td className="px-5 py-3.5">
                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600">
                  {page.slug}
                </span>
              </td>

              <td className="px-5 py-3.5 text-slate-600 text-xs">{page.sections} sections</td>

              <td className="px-5 py-3.5">
                <span
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold ${page.status === "Published"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                    }`}
                >
                  {page.status.toUpperCase()}
                </span>
              </td>

              <td className="px-5 py-3.5 text-slate-500 text-[11px]">{page.lastEdited}</td>

              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/dashboard/pages/${page.id}`}
                    className="text-black p-2 rounded-lg transition-opacity bg-[#F9FAFB] hover:opacity-70"
                    aria-label={`Edit ${page.name}`}
                  >
                    <Pencil size={16} strokeWidth={1.8} />
                  </Link>
                  <button
                    onClick={() => handleDelete(page)}
                    className="text-primary transition-opacity hover:opacity-70 bg-[#FEF2F2] p-2 rounded-lg"
                    aria-label={`Delete ${page.name}`}
                  >
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
  );
}