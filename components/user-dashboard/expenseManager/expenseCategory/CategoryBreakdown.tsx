import { ICategoryBreakdownItem } from "@/types/expenseManagerTy";

interface CategoryBreakdownProps {
  data: ICategoryBreakdownItem[];
}

export default function CategoryBreakdown({ data }: { data: ICategoryBreakdownItem[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-brand-16 border border-dashed border-border-clr-dark bg-white p-5">
        <h3 className="heading-h5 mb-4 text-text-dark">Spending by Category</h3>
        <p className="para-small text-text-secondary-muted">No expenses recorded yet.</p>
      </div>
    );
  }
  const sorted = [...data].sort((a, b) => b.amount - a.amount);
  const total = sorted.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="rounded-brand-16 border border-border-clr bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="heading-h5 text-text-dark">Spending by Category</h3>
          <p className="para-tiny text-text-secondary-muter">{sorted.length} categories · PKR {total.toLocaleString("en-PK")} total</p>
        </div>
        <span className="rounded-full bg-danger-bg px-2.5 py-1 para-tiny font-semibold text-primary">Top: {sorted[0].category.label}</span>
      </div>
      <div className="flex flex-col gap-3">
        {sorted.map((item, i) => (
          <div key={item.category.id} className="rounded-brand-8 border border-border-clr p-3">
            <div className="mb-1.5 flex items-center justify-between para-small">
              <span className="flex items-center gap-2 text-text-secondary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-page-bg para-tiny font-semibold text-text-secondary-muter">{i + 1}</span>
                {item.category.label}
              </span>
              <span className="font-semibold text-text-dark">PKR {item.amount.toLocaleString("en-PK")} <span className="text-text-secondary-muter">({item.percentOfTotal}%)</span></span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-page-bg">
              <div className="h-full rounded-full bg-primary" style={{ width: `${item.percentOfTotal}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}