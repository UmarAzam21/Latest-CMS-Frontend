"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X } from "lucide-react";

type NoticeModelProps = {
	isOpen: boolean;
	onClose: () => void;
	bannerSrc?: string;
	title?: string;
	message?: string;
};

export default function NoticeModel({
	isOpen,
	onClose,
	bannerSrc = "/Legal_consultancy_banner.png",
	title = "Important notice",
	message = "Please review this announcement before continuing.",
}: NoticeModelProps) {
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="notice-modal-title"
				className="relative w-full max-w-2xl overflow-hidden rounded-brand-16 bg-white shadow-card-hover"
			>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close notice"
					className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75 focus:outline-none focus:ring-4 focus:ring-white/60"
				>
					<X size={19} strokeWidth={2.2} />
				</button>

				{bannerSrc ? (
					<div className="relative w-full bg-page-bg">
						<Image
							src={bannerSrc}
							alt={title}
							width={1673}
							height={940}
							className="h-auto w-full"
							sizes="(max-width: 640px) 100vw, 1024px"
						/>
					</div>
				) : (
					<div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-primary-rl px-6 text-center text-white">
						<p className="text-2xl font-bold">{title}</p>
					</div>
				)}

				<div className="space-y-2 px-5 py-5 sm:px-6">
					<h2 id="notice-modal-title" className="text-lg font-bold text-text-dark">{title}</h2>
					<p className="para-small text-text-secondary">{message}</p>
				</div>
			</div>
		</div>
	);
}
