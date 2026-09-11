import { Bell } from "lucide-react";

export default function Notices() {
	return (
		<div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-brand-8 border border-dashed border-border-clr bg-page-bg px-4 py-6 text-center">
			<Bell size={22} className="text-primary" />
			<h3 className="para-small font-semibold text-text-dark">No notices right now</h3>
			<p className="para-tiny text-text-secondary-muter">Important announcements will appear here.</p>
		</div>
	);
}
