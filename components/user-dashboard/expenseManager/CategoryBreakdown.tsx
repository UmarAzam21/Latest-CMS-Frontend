import { ICategoryBreakdownItem } from "@/types/expenseManager";

interface CategoryBreakdownProps {
  data: ICategoryBreakdownItem[];
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-brand-16 border border-dashed border-border-clr-dark bg-card-bg-clrx bg-white p-5">
        <h3 className="heading-h5 mb-4 text-text-dark">Spending by Category</h3>
        <p className="para-small text-text-secondary-muted">No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-brand-16 border border-border-clr bg-card-bg-clrx bg-white p-5">
      <h3 className="heading-h5 mb-4 text-text-dark">Spending by Category</h3>
      <div className="flex flex-col gap-3.5">
        {data.map((item) => (
          <div key={item.category.id}>
            <div className="mb-1 flex items-center justify-between para-small text-text-secondary">
              <span>{item.category.label}</span>
              <span className="font-semibold text-text-dark">
                PKR {item.amount.toLocaleString("en-PK")}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-page-bg">
              <div className="h-full rounded-full bg-primary" style={{ width: `${item.percentOfTotal}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}