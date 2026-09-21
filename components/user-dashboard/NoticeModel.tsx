"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type NoticeModelProps = {
	isOpen: boolean;
	onClose: () => void;
	bannerSrc?: string;
	title?: string;
	message?: string;
	ctaLabel?: string;
	ctaHref?: string;
	dismissLabel?: string;
};

const overlayBase =
	"fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4 backdrop-blur-md transition-opacity duration-200";

const dialogBase =
	"w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-black/5 transition-all duration-300 ease-out";

const closeBtnClass =
	"flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition bg-slate-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40";

const dismissBtnClass =
	"rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20";

const ctaBtnClass =
	"rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export default function NoticeModel({
	isOpen,
	onClose,
	bannerSrc = "/Reputed Lawyers Consultency Banner.png",
	title = "Talk to a reputed lawyer",
	message = "Book a one-to-one legal consultation with our experts.",
	ctaLabel = "Get in touch",
	ctaHref = "https://wa.me/923041110555",
	dismissLabel = "Maybe later",
}: NoticeModelProps) {
	const [visible, setVisible] = useState(false);
	const closeRef = useRef<HTMLButtonElement>(null);

	// Enter animation
	useEffect(() => {
		if (!isOpen) {
			setVisible(false);
			return;
		}
		const id = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(id);
	}, [isOpen]);

	// Escape key, scroll lock, initial focus
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleKeyDown);
		closeRef.current?.focus();

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className={`${overlayBase} ${visible ? "opacity-100" : "opacity-110"}`}
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="notice-modal-title"
				aria-describedby="notice-modal-desc"
				className={`${dialogBase} ${
					visible
						? "translate-y-0 scale-100 opacity-100"
						: "translate-y-3 scale-95 opacity-100"
				}`}
			>
				{bannerSrc && (
					<div className="overflow-hidden rounded-2xl bg-page-bg">
						<Image
							src={bannerSrc}
							alt={title}
							width={1673}
							height={940}
							priority
							className="h-auto w-full"
							sizes="(max-width: 640px) 100vw, 576px"
						/>
					</div>
				)}

				<div className="flex flex-col gap-4 px-4 pb-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
					<div className="min-w-0">
						<h2
							id="notice-modal-title"
							className="text-base font-semibold tracking-tight text-text-dark"
						>
							{title}
						</h2>
						<p
							id="notice-modal-desc"
							className="mt-0.5 text-sm text-text-secondary"
						>
							{message}
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-2">
						<button
							type="button"
							onClick={onClose}
							className={dismissBtnClass}
						>
							{dismissLabel}
						</button>
						<a
							href={ctaHref}
							target="_blank"
							rel="noopener noreferrer"
							onClick={onClose}
							className={ctaBtnClass}
						>
							{ctaLabel}
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}