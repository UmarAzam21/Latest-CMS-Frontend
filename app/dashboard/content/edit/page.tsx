"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageSections from "@/components/dashboard/content/SecondarySidebar";
import { sectionFormRegistry } from "@/components/dashboard/content/sectionRegistry";
import { mockSectionsByPage } from "@/data/dashboard/mockContent";
import { fetchPageSections, updateContentBlock, deleteContentBlock } from "@/lib/sectionsApi";
import type { Section } from "@/types/content";

function ContentEditPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "home";
  const selectedSectionParam = searchParams.get("section") ?? "";

  const [sections, setSections] = useState<Section[]>(() => mockSectionsByPage[slug] ?? []);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const nextSections = mockSectionsByPage[slug] ?? [];
    setSections(nextSections);
    const fallbackId = nextSections[0]?.id ?? "";
    setSelectedSectionId(selectedSectionParam || fallbackId);
  }, [slug, selectedSectionParam]);

  useEffect(() => {
    async function loadApiSections() {
      if (slug !== "home") {
        return;
      }

      try {
        const fetchedSections = await fetchPageSections(1);
        if (fetchedSections.length > 0) {
          setSections(fetchedSections);
          const fallbackId = fetchedSections[0]?.id ?? "";
          setSelectedSectionId(selectedSectionParam || fallbackId);
        }
      } catch (error) {
        console.error("Failed to fetch page sections:", error);
      }
    }

    loadApiSections();
  }, [slug, selectedSectionParam]);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? sections[0],
    [sections, selectedSectionId]
  );

  const handleSectionSelect = (section: { id: string | number; title: string; type: string }) => {
    const nextId = String(section.id);
    setSelectedSectionId(nextId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", nextId);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  const handleSectionChange = (updatedSection: Section) => {
    setSections((current) => current.map((section) => (section.id === updatedSection.id ? updatedSection : section)));
  };

  const handleSaveSection = async (sectionToSave: Section) => {
    if (!sectionToSave._blockId || !sectionToSave._pageId || !sectionToSave._blockKey || !sectionToSave._blockType) {
      setError("This section cannot be saved. Make sure it is loaded from the server before saving.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateContentBlock(
        sectionToSave._blockId,
        sectionToSave._pageId,
        sectionToSave._blockKey,
        sectionToSave._blockType,
        sectionToSave.content,
        sectionToSave.order,
        sectionToSave.visible
      );
      setSuccess("Section saved successfully.");
      setSections((current) => current.map((section) => (section.id === sectionToSave.id ? sectionToSave : section)));
    } catch (err: any) {
      setError(err?.message ?? "Failed to save section.");
      console.error("Failed to save section:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionToDelete: Section) => {
    const confirmed = window.confirm(`Delete the "${sectionToDelete.title}" section?`);
    if (!confirmed) return;

    if (!sectionToDelete._blockId) {
      setSections((current) => current.filter((section) => section.id !== sectionToDelete.id));
      setSelectedSectionId((current) => {
        const remaining = sections.filter((section) => section.id !== sectionToDelete.id);
        return remaining[0]?.id ?? "";
      });
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteContentBlock(sectionToDelete._blockId);
      setSections((current) => current.filter((section) => section.id !== sectionToDelete.id));
      setSelectedSectionId((current) => {
        const remaining = sections.filter((section) => section.id !== sectionToDelete.id);
        return remaining[0]?.id ?? "";
      });
      setSuccess("Section deleted successfully.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete section.");
      console.error("Failed to delete section:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSectionSave = async (updatedSection?: Section) => {
    const sectionToSave = updatedSection ?? selectedSection;
    if (!sectionToSave) return;
    await handleSaveSection(sectionToSave);
  };

  const FormComponent = selectedSection ? sectionFormRegistry[selectedSection.type] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        {/* Left */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <span>Content</span>
            <span>›</span>
            <span className="font-semibold text-slate-700">
              {slug.charAt(0).toUpperCase() + slug.slice(1)}
            </span>
          </div>

          <h1 className="mt-1 text-lg font-bold text-slate-900">
            Editing: {slug.charAt(0).toUpperCase() + slug.slice(1)}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => selectedSection && handleSectionSave(selectedSection)}
            disabled={saving || !selectedSection}
            className={`rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 ${saving ? "bg-slate-400 cursor-not-allowed" : "bg-primary hover:opacity-90"
              }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => selectedSection && handleDeleteSection(selectedSection)}
            disabled={saving || !selectedSection}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50"
          >
            Delete Section
          </button>
        </div>
      </div>
      {(error || success) && (
        <div className="space-y-1">
          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-emerald-600">{success}</div>}
        </div>
      )}



      <div className="flex w-full gap-4">
        {/* Left Sidebar */}
        <div className="w-48 shrink-0">
          <PageSections
            sections={sections.map((section) => ({
              id: section.id,
              title: section.title,
              type: section.type,
            }))}
            selectedId={selectedSection?.id}
            onSelect={handleSectionSelect}
            addLabel="Add Section"
          />
        </div>

        {/* Section Editor */}
        <div className="flex-1 ">
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200  p-6 h-[80px]">
            <div>
              <h2 className="text-sm font-medium text-slate-900">
                Show on Home Page
              </h2>
              <div className="text-[12px] text-[#4B5563]">
                Display this section on the home page.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">

                <button
                  type="button"
                  role="switch"
                  aria-checked={selectedSection?.visible ?? true}
                  onClick={() => {
                    if (!selectedSection) return;
                    handleSectionChange({
                      ...selectedSection,
                      visible: !(selectedSection.visible ?? true),
                    });
                  }}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${selectedSection?.visible ?? true ? "bg-[#C8102E]" : "bg-slate-300"}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${selectedSection?.visible ?? true ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </label>
            </div>


          </div>

          <div className=" pt-6">
            {FormComponent && selectedSection ? (
              <FormComponent
                section={selectedSection}
                onChange={handleSectionChange}
                onSave={handleSectionSave}
                onDelete={handleDeleteSection}
                saving={saving}
              />
            ) : (
              <div className="text-sm text-slate-500">
                Select a section to edit its fields.
              </div>
            )}
          </div>

          {/* <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-500">
            <div>
              Last edited: {selectedSection?.content.lastEdited ?? "Just now"}
            </div>

            <button
              type="button"
              className="text-left font-semibold text-[11px] text-[#E0475C]"
            >
              Revert to previous version
            </button>
          </div> */}
        </div>

        {/* Preview */}
        {/* <div className="w-[500px] shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-500">
            Section Preview — updates as you type
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {selectedSection ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E0475C]">
                    {selectedSection.type}
                  </div>

                  <div className="mt-2 text-lg font-bold text-slate-900">
                    {selectedSection.content.headline ??
                      selectedSection.content.heading ??
                      selectedSection.title}
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    {selectedSection.content.subtitle ??
                      selectedSection.content.body ??
                      selectedSection.content.description ??
                      selectedSection.content.subtext ??
                      selectedSection.content.intro ??
                      "Your section content will appear here."}
                  </div>
                </div>

                {selectedSection.content.stats && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSection.content.stats.map(
                      (
                        item: { label?: string; value?: string },
                        index: number
                      ) => (
                        <div
                          key={`${item.label ?? "stat"}-${index}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <div className="font-semibold text-slate-800">
                            {item.value ?? ""}
                          </div>

                          <div className="text-xs text-slate-500">
                            {item.label ?? ""}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Nothing selected yet.
              </div>
            )}
          </div>
        </div> */}
      </div>



    </div>
  );
}

export default function ContentEditPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading editor...</div>}>
      <ContentEditPageContent />
    </Suspense>
  );
}

