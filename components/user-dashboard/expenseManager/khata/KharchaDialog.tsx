// components/user-dashboard/expenseManager/khata/KharchaDialog.tsx
import QuickEntryDialog from "./QuickEntryDialog";

export default function KharchaDialog(props: Omit<React.ComponentProps<typeof QuickEntryDialog>, "kind" | "title" | "subjectLabel" | "accentClass">) {
    return <QuickEntryDialog {...props} kind="expense" title="Kharcha Add Karein" subjectLabel="Kis cheez ka kharcha? (e.g. Bijli, Grocery)" accentClass="bg-primary" />;
}
