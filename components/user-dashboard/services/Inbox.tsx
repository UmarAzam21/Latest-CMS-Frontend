import { Inbox as InboxIcon } from "lucide-react";
import Form from "@/components/user-dashboard/Form";

type InboxProps = {
	serviceName?: string;
	onSubmitted?: () => void;
};

export default function Inbox({ serviceName, onSubmitted }: InboxProps) {
	if (serviceName) {
		return <Form serviceName={serviceName} onSubmitted={onSubmitted} />;
	}

	return (
		<div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-brand-8 border border-dashed border-border-clr bg-page-bg px-4 py-6 text-center">
			<InboxIcon size={22} className="text-primary" />
			<h3 className="para-small font-semibold text-text-dark">Your inbox is clear</h3>
			<p className="para-tiny text-text-secondary-muter">New messages and service updates will appear here.</p>
		</div>
	);
}
