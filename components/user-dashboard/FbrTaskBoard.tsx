"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Eye,
    FilePenLine,
    FilePlus2,
    Inbox,
    Mail,
    Search,
    RotateCcw,
    SlidersHorizontal,
    Trash2,
    X,
    ArrowUpDown,
    AlertTriangle,
    Clock,
} from "lucide-react";

type BoardMode = "inbox" | "outbox" | "draft" | "completed";
type Category = "Registration" | "Declaration" | "Audit / Assessment";
type SortDir = "newest" | "oldest";
type Urgency = "overdue" | "soon" | "none";

type FbrTask = {
    id: number;
    category: Category;
    section: string;
    task: string;
    period: string;
    taxYear: string;
    dueDate: string;
    status: BoardMode;
};

const tasks: FbrTask[] = [
    { id: 1, category: "Registration", section: "181", task: "Order to grant / refuse modification to registration on application", period: "01-July-2026 - 30-June-2027", taxYear: "2027", dueDate: "10-August-2026", status: "completed" },
    { id: 2, category: "Registration", section: "181", task: "Form of Registration filed for modification (Income Tax)", period: "01-July-2026 - 30-June-2027", taxYear: "2027", dueDate: "10-August-2026", status: "completed" },
    { id: 3, category: "Registration", section: "181", task: "Order to grant / refuse modification to registration on application", period: "01-July-2024 - 30-June-2025", taxYear: "2025", dueDate: "26-September-2025", status: "completed" },
    { id: 4, category: "Registration", section: "181", task: "Form of Registration filed for modification (Income Tax)", period: "01-July-2024 - 30-June-2025", taxYear: "2025", dueDate: "26-September-2025", status: "completed" },
    { id: 5, category: "Registration", section: "181", task: "Form of Registration filed for modification (Income Tax)", period: "01-July-2026 - 30-June-2027", taxYear: "2027", dueDate: "14-August-2026", status: "draft" },
    { id: 6, category: "Audit / Assessment", section: "176", task: "Explanation on provision of information or evidence", period: "30-June-2018 - 29-June-2019", taxYear: "2019", dueDate: "01-September-2023", status: "outbox" },
    { id: 7, category: "Audit / Assessment", section: "176", task: "Explanation on provision of information or evidence", period: "30-June-2017 - 29-June-2018", taxYear: "2018", dueDate: "01-September-2023", status: "outbox" },
    { id: 8, category: "Audit / Assessment", section: "176", task: "Explanation on provision of information or evidence", period: "01-July-2017 - 30-June-2018", taxYear: "2018", dueDate: "28-August-2023", status: "outbox" },
    { id: 9, category: "Audit / Assessment", section: "176", task: "Notice to obtain information or evidence", period: "01-July-2016 - 30-June-2017", taxYear: "2017", dueDate: "31-December-2020", status: "inbox" },
];

const modeConfig: Record<BoardMode, { label: string; helper: string; color: string; Icon: typeof Inbox }> = {
    inbox: { label: "Inbox", helper: "Correspondence from FBR", color: "var(--brand-primary)", Icon: Inbox },
    draft: { label: "Draft", helper: "Unsubmitted documents", color: "var(--brand-primary)", Icon: FilePlus2 },
    outbox: { label: "Outbox", helper: "Awaiting action by FBR", color: "var(--brand-primary)", Icon: Mail },
    completed: { label: "Completed tasks", helper: "Closed and acknowledged", color: "var(--brand-secondary)", Icon: Check },
};

const categories: Category[] = ["Registration", "Declaration", "Audit / Assessment"];
const modeCategories: Record<BoardMode, Category[]> = {
    inbox: ["Audit / Assessment"],
    draft: ["Registration"],
    outbox: ["Audit / Assessment"],
    completed: categories,
};

const processToCategory: Record<string, Category> = {
    registration: "Registration",
    declaration: "Declaration",
    audit: "Audit / Assessment",
};

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function parseDueDate(value: string): number {
    const [d, m, y] = value.split("-");
    const month = MONTHS.indexOf(m.toLowerCase());
    if (month === -1) return NaN;
    return new Date(Number(y), month, Number(d)).getTime();
}

function urgencyOf(dueDate: string, mode: BoardMode): Urgency {
    if (mode === "completed" || mode === "draft") return "none";
    const due = parseDueDate(dueDate);
    const now = Date.now();
    const days = (due - now) / (1000 * 60 * 60 * 24);
    if (days < 0) return "overdue";
    if (days <= 14) return "soon";
    return "none";
}

const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
const ITEMS_PER_PAGE = 5;

type Filters = { taxYear: string; process: string; from: string; to: string; search: string };
const emptyFilters: Filters = { taxYear: "", process: "", from: "", to: "", search: "" };

export default function FbrTaskBoard({
    mode,
    isFilterOpen,
    onCloseFilter,
    isLoading = false,
    onEditDraft,
    onDeleteDraft,
    onViewTask,
    onReturnTask,
}: {
    mode: BoardMode;
    isFilterOpen: boolean;
    onCloseFilter: () => void;
    isLoading?: boolean;
    onEditDraft?: (task: FbrTask) => void;
    onDeleteDraft?: (task: FbrTask) => void;
    onViewTask?: (task: FbrTask) => void;
    onReturnTask?: (task: FbrTask) => void;
}) {
    const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
    const [filters, setFilters] = useState<Filters>(emptyFilters);
    const [searchInput, setSearchInput] = useState("");
    const [sortDir, setSortDir] = useState<SortDir>("newest");
    const [page, setPage] = useState(1);
    const config = modeConfig[mode];
    const availableCategories = modeCategories[mode];
    const selectedCategory = mode === "completed" ? activeCategory : availableCategories[0];

    useEffect(() => {
        const id = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput })), 250);
        return () => clearTimeout(id);
    }, [searchInput]);

    useEffect(() => { setPage(1); }, [mode, selectedCategory, filters.taxYear, filters.process, filters.from, filters.to, filters.search, sortDir]);

    const modeTasks = useMemo(() => tasks.filter((t) => t.status === mode), [mode]);
    const overdueCount = useMemo(() => modeTasks.filter((t) => urgencyOf(t.dueDate, mode) === "overdue").length, [modeTasks, mode]);
    const soonCount = useMemo(() => modeTasks.filter((t) => urgencyOf(t.dueDate, mode) === "soon").length, [modeTasks, mode]);

    const filteredTasks = useMemo(() => {
        const fromTs = filters.from ? new Date(filters.from).getTime() : null;
        const toTs = filters.to ? new Date(filters.to).getTime() : null;
        const search = filters.search.trim().toLowerCase();

        return modeTasks.filter((t) => {
            if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
            if (filters.process && processToCategory[filters.process] !== t.category) return false;
            if (filters.taxYear && t.taxYear !== filters.taxYear) return false;
            const due = parseDueDate(t.dueDate);
            if (fromTs !== null && due < fromTs) return false;
            if (toTs !== null && due > toTs) return false;
            if (search && !(t.task.toLowerCase().includes(search) || t.section.includes(search))) return false;
            return true;
        });
    }, [modeTasks, selectedCategory, filters]);

    const sortedTasks = useMemo(() => {
        const list = [...filteredTasks].sort((a, b) => parseDueDate(a.dueDate) - parseDueDate(b.dueDate));
        return sortDir === "newest" ? list.reverse() : list;
    }, [filteredTasks, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sortedTasks.length / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const pageTasks = sortedTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const counts = categories.reduce<Record<string, number>>((result, category) => {
        result[category] = modeTasks.filter((task) => task.category === category).length;
        return result;
    }, {});

    const hasActiveFilters = Boolean(filters.taxYear || filters.process || filters.from || filters.to || filters.search);
    const modeHasAnyTasks = modeTasks.length > 0;

    const clearAll = () => { setFilters(emptyFilters); setSearchInput(""); };

    return (
        <div className="overflow-hidden rounded-brand-12 border border-border-clr bg-card-bg-clr shadow-card">
            {/* Board header */}
            <div className="px-5 py-4 sm:px-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brand-8 text-white shadow-sm"
                            style={{ backgroundColor: config.color }}>
                            <config.Icon size={18} />
                        </span>
                        <div>
                            <h2 className="text-base font-bold text-text-dark">{config.label}</h2>
                            {config.helper && <p className="para-tiny text-text-secondary-muted">{config.helper}</p>}
                        </div>
                    </div>

                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        <label className="relative flex-1 sm:w-64">
                            <span className="sr-only">Search {config.label.toLowerCase()}</span>
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-muted" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by task or section"
                                className="h-10 w-full rounded-brand-8 border border-border-clr bg-page-bg pl-9 pr-3 text-sm text-text-secondary outline-none focus:border-primary" />
                        </label>
                        <button
                            type="button"
                            onClick={() => setSortDir((d) => (d === "newest" ? "oldest" : "newest"))}
                            className="flex h-10 shrink-0 items-center gap-1.5 rounded-brand-8 border border-border-clr px-3 text-sm font-semibold text-text-secondary hover:bg-page-bg"
                            title="Toggle sort order">
                            <ArrowUpDown size={14} />
                            {sortDir === "newest" ? "Newest due" : "Oldest due"}
                        </button>
                    </div>
                </div>

                {(overdueCount > 0 || soonCount > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {overdueCount > 0 && (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                                style={{ backgroundColor: tint("#DC2626", 12), color: "#DC2626" }}>
                                <AlertTriangle size={13} />
                                {overdueCount} overdue
                            </span>
                        )}
                        {soonCount > 0 && (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                                style={{ backgroundColor: tint("#D97706", 12), color: "#D97706" }}>
                                <Clock size={13} />
                                {soonCount} due within 14 days
                            </span>
                        )}
                    </div>
                )}
            </div>

            {isFilterOpen && (
                <FilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    onClear={clearAll}
                    onApply={onCloseFilter}
                    onClose={onCloseFilter} />
            )}

            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 border-b border-border-clr bg-page-bg px-5 py-3 sm:px-7">
                    <span className="text-xs font-medium text-text-secondary-muted">Filters:</span>
                    {filters.search && <Chip label={`"${filters.search}"`} onRemove={() => { setSearchInput(""); setFilters((f) => ({ ...f, search: "" })); }} />}
                    {filters.taxYear && <Chip label={`Tax year ${filters.taxYear}`} onRemove={() => setFilters((f) => ({ ...f, taxYear: "" }))} />}
                    {filters.process && <Chip label={processToCategory[filters.process]} onRemove={() => setFilters((f) => ({ ...f, process: "" }))} />}
                    {filters.from && <Chip label={`From ${filters.from}`} onRemove={() => setFilters((f) => ({ ...f, from: "" }))} />}
                    {filters.to && <Chip label={`To ${filters.to}`} onRemove={() => setFilters((f) => ({ ...f, to: "" }))} />}
                    <button type="button" onClick={clearAll} className="ml-1 text-xs font-bold text-primary hover:underline">
                        Clear all
                    </button>
                </div>
            )}

            {/* Category tabs */}
            {(mode === "completed" || availableCategories.length > 0) && (
                <div role="tablist" aria-label="Task category" className="flex gap-5 overflow-x-auto border-t border-border-clr bg-page-bg px-5 sm:px-7">
                    {mode === "completed" && (
                        <CategoryTab
                            label={`All (${modeTasks.length})`}
                            active={activeCategory === "all"}
                            onClick={() => setActiveCategory("all")} />
                    )}
                    {availableCategories.map((category) => (
                        <CategoryTab
                            key={category}
                            label={`${category} (${counts[category] || 0})`}
                            active={selectedCategory === category}
                            onClick={() => setActiveCategory(category)} />
                    ))}
                </div>
            )}
            <div aria-live="polite" className="sr-only">
                {sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"} found
            </div>

            {isLoading ? (<SkeletonRows />) : pageTasks.length > 0 ? (
                <>
                    <div role="table" aria-label={`${config.label} tasks`} className="w-full">
                        <div role="row" className="hidden grid-cols-[minmax(0,1.5fr)_minmax(200px,1fr)_88px] gap-4 border-b border-border-clr bg-page-bg px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-secondary-muted sm:grid sm:px-7">
                            <span role="columnheader">Task</span>
                            <span role="columnheader">Period</span>
                            <span role="columnheader" className="text-right">Action</span>
                        </div>
                        <div role="rowgroup" className="divide-y divide-border-clr">
                            {pageTasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    mode={mode}
                                    onEdit={onEditDraft}
                                    onDelete={onDeleteDraft}
                                    onView={onViewTask}
                                    onReturn={onReturnTask} />
                            ))}
                        </div>
                    </div>
                    <Pagination page={currentPage} totalPages={totalPages} setPage={setPage} />
                </>
            ) : modeHasAnyTasks && hasActiveFilters ? (
                <NoResultsState onClear={clearAll} />
            ) : (
                <EmptyState mode={mode} color={config.color} />
            )}
        </div>
    );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-clr bg-card-bg-clr px-2.5 py-1 text-xs font-medium text-text-secondary">
            {label}
            <button type="button" aria-label={`Remove ${label} filter`} onClick={onRemove} className="text-text-secondary-muted hover:text-text-secondary">
                <X size={12} />
            </button>
        </span>
    );
}

function CategoryTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`relative whitespace-nowrap py-3.5 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${active ? "text-primary" : "text-text-secondary-muted hover:text-text-secondary"}`}
        >
            {label}
        </button>
    );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
    if (urgency === "none") return null;
    const isOverdue = urgency === "overdue";
    const color = isOverdue ? "#DC2626" : "#D97706";
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: tint(color, 12), color }}>
            {isOverdue ? <AlertTriangle size={11} /> : <Clock size={11} />}
            {isOverdue ? "Overdue" : "Due soon"}
        </span>
    );
}

function TaskRow({
    task,
    mode,
    onEdit,
    onDelete,
    onView,
    onReturn,
}: {
    task: FbrTask;
    mode: BoardMode;
    onEdit?: (task: FbrTask) => void;
    onDelete?: (task: FbrTask) => void;
    onView?: (task: FbrTask) => void;
    onReturn?: (task: FbrTask) => void;
}) {
    const color = modeConfig[mode].color;
    const urgency = urgencyOf(task.dueDate, mode);
    const barColor = urgency === "overdue" ? "#DC2626" : urgency === "soon" ? "#D97706" : color;
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (confirmingDelete) cancelRef.current?.focus();
    }, [confirmingDelete]);

    return (
        <div role="row" className="relative grid grid-cols-1 gap-3 py-5 pl-6 pr-5 transition-colors hover:bg-page-bg sm:grid-cols-[minmax(0,1.5fr)_minmax(200px,1fr)_88px] sm:items-center sm:gap-4 sm:pl-8 sm:pr-7">
            <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: barColor }} />

            <div role="cell" className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className="rounded-brand-4 px-1.5 py-0.5 text-[11px] font-bold"
                        style={{ backgroundColor: tint(color, 12), color }}>
                        Sec. {task.section}
                    </span>
                    <UrgencyBadge urgency={urgency} />
                </div>
                <p className="mt-1.5 text-sm font-semibold leading-5 text-text-dark">{task.task}</p>
                <p className="mt-2 text-xs text-text-secondary-muted">JAWAD ALI &nbsp;·&nbsp; 6110132487667</p>
            </div>

            <div role="cell" className="text-sm text-text-secondary">
                <p>{task.period}</p>
                <p className="mt-2 text-xs text-text-secondary-muted">
                    Tax year <span className="font-medium text-text-secondary">{task.taxYear}</span>
                    &nbsp;·&nbsp; Due{" "}
                    <span className="font-medium" style={{ color: urgency === "overdue" ? "#DC2626" : undefined }}>
                        {task.dueDate}
                    </span>
                </p>
            </div>

            <div role="cell" className="flex items-center justify-start gap-2 sm:justify-end">
                {mode === "draft" ? (
                    confirmingDelete ? (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-text-secondary-muted">Delete?</span>
                            <button type="button" onClick={() => { onDelete?.(task); setConfirmingDelete(false); }} className="font-bold text-red-600 hover:underline">
                                Yes
                            </button>
                            <button ref={cancelRef} type="button" onClick={() => setConfirmingDelete(false)} className="font-bold text-text-secondary hover:underline">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <IconButton label="Edit draft" onClick={() => onEdit?.(task)}>
                                <FilePenLine size={18} />
                            </IconButton>
                            <IconButton label="Delete draft" onClick={() => setConfirmingDelete(true)}>
                                <Trash2 size={18} />
                            </IconButton>
                        </>
                    )
                ) : (
                    <IconButton label="View task" onClick={() => onView?.(task)}>
                        <Eye size={18} />
                    </IconButton>
                )}
                {mode === "inbox" && (
                    <IconButton label="Return task" onClick={() => onReturn?.(task)}>
                        <RotateCcw size={18} />
                    </IconButton>
                )}
            </div>
        </div>
    );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary-muted outline-none transition-colors hover:bg-card-bg-clr hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
            {children}
        </button>
    );
}

function FilterPanel({ filters, setFilters, onClear, onApply, onClose }: { filters: Filters; setFilters: (updater: (f: Filters) => Filters) => void; onClear: () => void; onApply: () => void; onClose: () => void }) {
    const firstFieldRef = useRef<HTMLInputElement>(null);
    useEffect(() => { firstFieldRef.current?.focus(); }, []);
    const update = (key: keyof Filters, value: string) => setFilters((f) => ({ ...f, [key]: value }));

    return (
        <div className="border-b border-border-clr bg-page-bg px-5 py-5 sm:px-7">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-text-dark">
                    <SlidersHorizontal size={16} />
                    Filters
                </div>
                <button type="button" aria-label="Close filters" onClick={onClose} className="text-text-secondary-muted hover:text-text-secondary">
                    <X size={16} />
                </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field inputRef={firstFieldRef} label="Tax year" value={filters.taxYear} placeholder="e.g. 2027" onChange={(value) => update("taxYear", value)} />
                <Field label="Submission date from" type="date" value={filters.from} onChange={(value) => update("from", value)} />
                <Field label="Submission date to" type="date" value={filters.to} onChange={(value) => update("to", value)} />
                <label className="grid gap-1.5 text-sm font-medium text-text-dark">
                    Process
                    <select
                        value={filters.process}
                        onChange={(event) => update("process", event.target.value)}
                        className="h-10 rounded-brand-8 border border-border-clr bg-card-bg-clr px-3 text-sm text-text-secondary outline-none focus:border-primary">
                        <option value="">Select process</option>
                        <option value="registration">Registration</option>
                        <option value="declaration">Declaration</option>
                        <option value="audit">Audit / Assessment</option>
                    </select>
                </label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={onClear} className="rounded-brand-8 border border-border-clr px-4 py-2 text-sm font-bold text-text-secondary hover:bg-card-bg-clr">
                    Clear
                </button>
                <button type="button" onClick={onApply} className="flex items-center gap-2 rounded-brand-8 bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90">
                    <Check size={16} /> Apply
                </button>
            </div>
        </div>
    );
}

function Field({ label, type = "text", value, placeholder, onChange, inputRef }: { label: string; type?: string; value: string; placeholder?: string; onChange: (value: string) => void; inputRef?: React.RefObject<HTMLInputElement> }) {
    return (
        <label className="grid gap-1.5 text-sm font-medium text-text-dark">
            {label}
            <input
                ref={inputRef}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 rounded-brand-8 border border-border-clr bg-card-bg-clr px-3 text-sm text-text-secondary outline-none focus:border-primary" />
        </label>
    );
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (page: number) => void }) {
    const pageItems = getPageItems(totalPages, page);

    return (
        <div className="flex items-center justify-center border-t border-border-clr px-5 py-2 sm:justify-end sm:px-7">
            <div className="flex items-center gap-0.5">
                <PageButton label="Previous page" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                    <ChevronLeft size={15} />
                </PageButton>
                {pageItems.map((item, index) => item === "ellipsis" ? (
                    <span key={`ellipsis-${index}`} className="flex h-5 w-2 items-center justify-center text-[10px] font-semibold text-text-secondary-muted">...</span>
                ) : (
                    <PageButton key={item} label={`Go to page ${item}`} onClick={() => setPage(item)} active={page === item}>
                        {item}
                    </PageButton>
                ))}
                <PageButton label="Next page" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                    <ChevronRight size={12} />
                </PageButton>
            </div>
        </div>
    );
}

function getPageItems(totalPages: number, page: number): Array<number | "ellipsis"> {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (page <= 4) return [1, 2, 3, 4, "ellipsis", totalPages];
    if (page >= totalPages - 3) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}

function PageButton({ label, onClick, disabled, active, children }: { label: string; onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className={`flex h-6 w-6 items-center justify-center rounded-brand-8 border border-border-clr text-[11px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 ${active ? "border-primary bg-primary text-white" : "bg-card-bg-clr text-text-secondary hover:bg-primary-lighter hover:text-primary"}`}>
            {children}
        </button>
    );
}

function SkeletonRows() {
    return (
        <div className="divide-y divide-border-clr">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1.5fr)_minmax(200px,1fr)_88px] sm:items-center sm:gap-4 sm:px-7">
                    <div className="flex items-start gap-3">
                        <div className="w-full space-y-2">
                            <div className="h-3.5 w-3/4 animate-pulse rounded bg-border-clr" />
                            <div className="h-3 w-1/3 animate-pulse rounded bg-border-clr" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3.5 w-2/3 animate-pulse rounded bg-border-clr" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-border-clr" />
                    </div>
                    <div className="h-9 w-9 animate-pulse rounded-full bg-border-clr sm:ml-auto" />
                </div>
            ))}
        </div>
    );
}

function NoResultsState({ onClear }: { onClear: () => void }) {
    return (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-page-bg text-text-secondary-muted">
                <Search size={24} />
            </span>
            <div>
                <h3 className="text-base font-bold text-text-dark">No tasks match your filters</h3>
                <p className="mt-1 text-sm text-text-secondary-muted">Try widening the date range or clearing a filter.</p>
            </div>
            <button type="button" onClick={onClear} className="mt-1 rounded-brand-4 border border-border-clr px-3 py-1.5 text-sm font-bold text-text-secondary hover:bg-page-bg">
                Clear filters
            </button>
        </div>
    );
}

function EmptyState({ mode, color }: { mode: BoardMode; color: string }) {
    const config = modeConfig[mode];
    return (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: tint(color, 12), color }}>
                <config.Icon size={26} />
            </span>
            <div>
                <h3 className="text-base font-bold text-text-dark">Your {config.label.toLowerCase()} is clear</h3>
                <p className="mt-1 text-sm text-text-secondary-muted">New FBR tasks and service updates will appear here.</p>
            </div>
        </div>
    );
}