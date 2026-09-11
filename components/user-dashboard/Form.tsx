"use client";

import { FormEvent, useState } from "react";
import { Check, FileUp, LockKeyhole, UploadCloud } from "lucide-react";

type RegistrationFormProps = {
	serviceName: string;
};

export default function Form({ serviceName }: RegistrationFormProps) {
	const [submitted, setSubmitted] = useState(false);
	const [files, setFiles] = useState<Record<string, string>>({});

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitted(true);
	}

	const inputClass = "mt-1.5 w-full rounded-brand-8 border border-border-clr bg-white px-3 py-2.5 para-small text-text-dark outline-none transition placeholder:text-text-secondary-muter focus:border-primary focus:ring-4 focus:ring-primary/10";

	function handleFileChange(name: string, file?: File) {
		setFiles((current) => ({ ...current, [name]: file?.name ?? "" }));
	}

	return (
		<form onSubmit={handleSubmit} className="overflow-hidden rounded-brand-12 border border-border-clr bg-white shadow-card">
			<div className="border-b border-primary/10 bg-gradient-primary-rl px-5 py-5 text-white sm:px-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="para-tiny font-semibold uppercase tracking-[0.18em] text-white/75">Service request</p>
						<h2 className="mt-1 text-[18px] font-bold">{serviceName}</h2>
						<p className="mt-1 para-tiny text-white/80">Complete your details and upload the required documents.</p>
					</div>
					<div className="hidden h-11 w-11 items-center justify-center rounded-brand-12 bg-white/15 sm:flex">
						<FileUp size={21} />
					</div>
				</div>
			</div>

			<div className="space-y-6 p-5 sm:p-6">
				<section>
					<div className="mb-3 flex items-center gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-lighter para-tiny font-bold text-primary">1</span>
						<h3 className="para-small font-bold text-text-dark">Account details</h3>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<label><span className="para-small font-medium text-text-dark">Username</span><input required name="username" type="text" className={inputClass} placeholder="Enter your username" /></label>
						<label><span className="para-small font-medium text-text-dark">Email address</span><input required name="email" type="email" className={inputClass} placeholder="you@example.com" /></label>
						<label><span className="para-small font-medium text-text-dark">Password</span><div className="relative"><input required name="password" type="password" minLength={8} className={`${inputClass} pr-10`} placeholder="At least 8 characters" /><LockKeyhole size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-muter" /></div></label>
						<label><span className="para-small font-medium text-text-dark">CNIC number</span><input required name="cnic" type="text" placeholder="XXXXX-XXXXXXX-X" className={inputClass} /></label>
					</div>
				</section>

				<section className="border-t border-border-clr pt-5">
					<div className="mb-3 flex items-center gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-lighter para-tiny font-bold text-primary">2</span>
						<div><h3 className="para-small font-bold text-text-dark">Required documents</h3><p className="para-tiny text-text-secondary-muter">Upload clear images or PDF files.</p></div>
					</div>
					<div className="grid gap-3 sm:grid-cols-3">
						<FileUpload name="cnicPhoto" label="CNIC photo" accept="image/*" fileName={files.cnicPhoto} onChange={handleFileChange} />
						<FileUpload name="certificateFront" label="Certificate front" accept="image/*,.pdf" fileName={files.certificateFront} onChange={handleFileChange} />
						<FileUpload name="certificateBack" label="Certificate back" accept="image/*,.pdf" fileName={files.certificateBack} onChange={handleFileChange} />
					</div>
				</section>

				<div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border-clr pt-5 sm:flex-row sm:items-center">
					{submitted ? <p className="flex items-center gap-1.5 para-small font-medium text-green-600"><Check size={16} />Your request is ready to be submitted.</p> : <p className="para-tiny text-text-secondary-muter">Your information is kept secure.</p>}
					<button type="submit" className="inline-flex items-center justify-center gap-2 rounded-brand-8 bg-primary px-5 py-3 para-small font-semibold text-white shadow-primary-btn default-transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-primary/20">Submit request <UploadCloud size={16} /></button>
				</div>
			</div>
		</form>
	);
}

type FileUploadProps = {
	name: string;
	label: string;
	accept: string;
	fileName?: string;
	onChange: (name: string, file?: File) => void;
};

function FileUpload({ name, label, accept, fileName, onChange }: FileUploadProps) {
	return (
		<label className="group flex cursor-pointer flex-col gap-2 rounded-brand-8 border border-dashed border-border-clr bg-page-bg p-3 transition hover:border-primary hover:bg-primary-lighter/30">
			<span className="flex items-center gap-2 para-small font-medium text-text-dark"><UploadCloud size={17} className="text-primary" />{label}</span>
			<span className="truncate para-tiny text-text-secondary-muter">{fileName || "Choose a file"}</span>
			<input required name={name} type="file" accept={accept} className="sr-only" onChange={(event) => onChange(name, event.target.files?.[0])} />
		</label>
	);
}
