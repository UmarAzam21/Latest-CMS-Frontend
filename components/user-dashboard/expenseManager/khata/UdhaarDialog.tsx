// components/user-dashboard/expenseManager/khata/UdhaarDialog.tsx
import QuickEntryDialog from "./QuickEntryDialog";

export default function UdhaarDialog(props: Omit<React.ComponentProps<typeof QuickEntryDialog>, "kind" | "title" | "subjectLabel" | "accentClass">) {
    return <QuickEntryDialog {...props} kind="debt" title="Udhaar Add Karein" subjectLabel="Kis ka udhaar? (e.g. Ali Bhai, Bank Loan)" accentClass="bg-warning" />;
}
