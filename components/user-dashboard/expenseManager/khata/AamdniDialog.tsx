// components/user-dashboard/expenseManager/khata/AamdniDialog.tsx
import QuickEntryDialog from "./QuickEntryDialog";

export default function AamdniDialog(props: Omit<React.ComponentProps<typeof QuickEntryDialog>, "kind" | "title" | "subjectLabel" | "accentClass">) {
    return <QuickEntryDialog {...props} kind="income" title="Aamdani Add Karein" subjectLabel="Kis se aamdani? (e.g. Salary, Freelance)" accentClass="bg-success" />;
}
