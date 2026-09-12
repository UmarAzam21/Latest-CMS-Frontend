"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, FileText } from "lucide-react";
import { getServiceRequest, ServiceRequest } from "@/lib/serviceRequest";

const dummyRequests: ServiceRequest[] = [
	{
		serviceName: "Company Registration",
		username: "Ayesha Khan",
		email: "ayesha.khan@example.com",
		cnic: "35202-1234567-8",
		cnicPhoto: "ayesha-cnic-front.jpg",
		certificateFront: "company-certificate-front.pdf",
		certificateBack: "company-certificate-back.pdf",
		submittedAt: "2026-09-10T09:30:00.000Z",
	},
	{
		serviceName: "Business NTN Registration",
		username: "Hamza Ahmed",
		email: "hamza.ahmed@example.com",
		cnic: "42101-7654321-2",
		cnicPhoto: "hamza-cnic.jpg",
		certificateFront: "ntn-certificate-front.pdf",
		certificateBack: "ntn-certificate-back.pdf",
		submittedAt: "2026-09-08T14:15:00.000Z",
	},
];

export default function Outbox() {
	const [request, setRequest] = useState<ServiceRequest | null>(null);

	useEffect(() => {
		setRequest(getServiceRequest());
	}, []);

	const requests = request ? [request, ...dummyRequests] : dummyRequests;

	return (
		<div className="space-y-3 text-left">
			{requests.map((item, index) => (
				<RequestCard key={`${item.email}-${item.submittedAt}`} request={item} isSample={!request || index > 0} />
			))}
		</div>
	);
}

function RequestCard({ request, isSample }: { request: ServiceRequest; isSample: boolean }) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="rounded-brand-8 border border-border-clr bg-white p-4">
			<button
				type="button"
				onClick={() => setIsExpanded((expanded) => !expanded)}
				aria-expanded={isExpanded}
				className="flex w-full items-center justify-between gap-3 text-left"
			>
				<div>
					<p className="para-tiny uppercase tracking-[0.16em] text-text-secondary-muter">
						{isSample ? "Sample request" : "Submitted request"}
					</p>
					<h3 className="mt-1 para-small font-bold text-text-dark">{request.serviceName}</h3>
				</div>
				<span className="flex items-center gap-2">
					<CheckCircle2 size={20} className="text-green-600" />
					<ChevronDown size={18} className={`text-text-secondary-muter default-transition ${isExpanded ? "rotate-180" : ""}`} />
				</span>
			</button>

			{isExpanded && <div className="mt-4 grid gap-3 border-t border-border-clr pt-4 sm:grid-cols-2">
					<ReadOnlyValue label="Username" value={request.username} />
					<ReadOnlyValue label="Email" value={request.email} />
					<ReadOnlyValue label="CNIC" value={request.cnic} />
					<ReadOnlyValue label="Password" value="••••••••" />
			</div>}

			{isExpanded && <div className="mt-4 grid gap-2 border-t border-border-clr pt-4 sm:grid-cols-3">
					<ReadOnlyFile label="CNIC photo" value={request.cnicPhoto} />
					<ReadOnlyFile label="Certificate front" value={request.certificateFront} />
					<ReadOnlyFile label="Certificate back" value={request.certificateBack} />
			</div>}
		</div>
	);
}

function ReadOnlyValue({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-brand-8 bg-page-bg px-3 py-2">
			<p className="para-tiny text-text-secondary-muter">{label}</p>
			<p className="mt-0.5 para-small font-medium text-text-dark">{value || "Not provided"}</p>
		</div>
	);
}

function ReadOnlyFile({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center gap-2 bg-[#fef2f2] rounded-brand-8 border border-border-clr px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fee2e2]">

			<FileText size={16} className="shrink-0 text-primary" />
            </div>
			<div className="min-w-0 py-0.5">
				<p className="para-tiny text-slate-600">{label}</p>
				<p className="truncate para-small font-medium text-text-dark">{value || "Not uploaded"}</p>
			</div>
		</div>
	);
}
