import { useEffect, useRef, useState } from "react";
import { getCloudFrontUrl } from "../../services/imageService";

function SkeletonBlock({ className = "", toneClass = "bg-[#D9E1F0]", ...props }) {
	return <div className={`animate-pulse rounded-sm ${toneClass} ${className}`} {...props} />;
}

function isEagerImage(loading, fetchPriority) {
	return loading === "eager" || fetchPriority === "high";
}

function hasExplicitPositionClass(className = "") {
	return /(^|\s)(static|fixed|absolute|relative|sticky)(\s|$)/.test(className);
}

function useDeferredImageLoading({ src, loading, fetchPriority, rootMargin }) {
	const containerRef = useRef(null);
	const eager = isEagerImage(loading, fetchPriority);
	const [shouldRender, setShouldRender] = useState(() => Boolean(src) && eager);
	const [status, setStatus] = useState(() => (src ? "loading" : "failed"));

	useEffect(() => {
		setStatus(src ? "loading" : "failed");
		setShouldRender(Boolean(src) && eager);
	}, [eager, src]);

	useEffect(() => {
		if (!src || shouldRender) return;

		if (typeof window === "undefined" || typeof window.IntersectionObserver !== "function") {
			setShouldRender(true);
			return;
		}

		const target = containerRef.current;
		if (!target) {
			setShouldRender(true);
			return;
		}

		const observer = new window.IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setShouldRender(true);
					observer.disconnect();
				}
			},
			{ rootMargin }
		);

		observer.observe(target);

		return () => observer.disconnect();
	}, [rootMargin, shouldRender, src]);

	return {
		containerRef,
		shouldRender,
		status,
		markLoaded: () => setStatus("loaded"),
		markFailed: () => setStatus("failed"),
	};
}

function DefaultImageLoader() {
	return <div className="h-full w-full rounded-[inherit] bg-[#E3EAF4] animate-pulse" />;
}

function DefaultImageError() {
	return (
		<div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-[#DEDEDE] bg-[#F5F5F5] px-4 text-center text-sm text-[#6B7280]">
			Image unavailable
		</div>
	);
}

export function ImageWithLoader({
	src,
	alt,
	className = "",
	loading = "lazy",
	decoding = "async",
	fetchPriority,
	rootMargin = "350px 0px",
	loader,
	error,
	onLoad,
	onError,
	...props
}) {
	const { containerRef, shouldRender, status, markLoaded, markFailed } = useDeferredImageLoading({
		src,
		loading,
		fetchPriority,
		rootMargin,
	});
	const imageRef = useRef(null);
	const isLoading = status === "loading";
	const hasError = status === "failed";
	const wrapperClassName = hasExplicitPositionClass(className)
		? className
		: `relative ${className}`.trim();

	useEffect(() => {
		if (!shouldRender || !isLoading) return;

		const image = imageRef.current;
		if (!image || !image.complete) return;

		if (image.naturalWidth > 0 && image.naturalHeight > 0) {
			markLoaded();
		} else {
			markFailed();
		}
	}, [isLoading, markFailed, markLoaded, shouldRender, src]);

	const handleLoad = (event) => {
		markLoaded();
		onLoad?.(event);
	};

	const handleError = (event) => {
		markFailed();
		onError?.(event);
	};

	return (
		<div ref={containerRef} className={wrapperClassName}>
			{!hasError && isLoading ? (
				<div aria-hidden="true" className="absolute inset-0 rounded-[inherit] transition-opacity duration-300">
					{loader ?? <DefaultImageLoader />}
				</div>
			) : null}
			{shouldRender && !hasError ? (
				<img
					ref={imageRef}
					src={src}
					alt={alt}
					className={`block ${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
					loading={loading}
					decoding={decoding}
					fetchPriority={fetchPriority}
					onLoad={handleLoad}
					onError={handleError}
					{...props}
				/>
			) : null}
			{hasError ? (
				<div className="absolute inset-0 rounded-[inherit] transition-opacity duration-300">
					{error ?? <DefaultImageError />}
				</div>
			) : null}
		</div>
	);
}

export function LazyBackgroundImage({
	src,
	className = "",
	children,
	loading = "lazy",
	fetchPriority,
	rootMargin = "350px 0px",
	loader,
	error,
	backgroundPosition = "center",
	backgroundRepeat = "no-repeat",
	backgroundSize = "cover",
	style,
	...props
}) {
	const { containerRef, shouldRender, status, markLoaded, markFailed } = useDeferredImageLoading({
		src,
		loading,
		fetchPriority,
		rootMargin,
	});

	useEffect(() => {
		if (!shouldRender || !src || status !== "loading") return;

		const image = new window.Image();
		image.onload = () => markLoaded();
		image.onerror = () => markFailed();
		image.src = src;

		return () => {
			image.onload = null;
			image.onerror = null;
		};
	}, [markFailed, markLoaded, shouldRender, src, status]);

	const backgroundStyle = {
		...style,
		backgroundColor: style?.backgroundColor,
		backgroundImage: status === "loaded" ? `url(${src})` : "none",
		backgroundPosition,
		backgroundRepeat,
		backgroundSize,
	};

	return (
		<div ref={containerRef} className={`relative ${className}`} style={backgroundStyle} {...props}>
			{status === "loading" ? (
				<div aria-hidden="true" className="absolute inset-0 rounded-[inherit] transition-opacity duration-300">
					{loader ?? <DefaultImageLoader />}
				</div>
			) : null}
			{status === "failed" ? (
				<div className="absolute inset-0 rounded-[inherit] transition-opacity duration-300">
					{error ?? <DefaultImageError />}
				</div>
			) : null}
			{children}
		</div>
	);
}

export function TextSkeleton({ lines = 1, className = "" }) {
	return (
		<div className={`space-y-2 ${className}`}>
			{Array.from({ length: lines }).map((_, i) => (
				<SkeletonBlock
					key={i}
					className="h-4"
					style={{ width: i === lines - 1 ? "70%" : "100%" }}
				/>
			))}
		</div>
	);
}

export function ContentSkeleton({ className = "" }) {
	return (
		<div className={`animate-pulse ${className}`}>
			<div className="space-y-4">
				<SkeletonBlock className="h-4 w-3/4" />
				<SkeletonBlock className="h-4 w-full" />
				<SkeletonBlock className="h-4 w-5/6" />
			</div>
		</div>
	);
}

export function TextImageSectionSkeleton({
	className = "",
	imageSide = "right",
	imageClassName = "h-80 w-full max-w-[20rem] rounded-lg",
	buttonClassName = "h-12 w-40",
	showButton = true,
	textToneClass = "bg-[#D9E1F0]",
	imageToneClass = "bg-[#D3DCEB]",
}) {
	const imageFirst = imageSide === "left";

	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col px-6 lg:flex-row lg:items-start lg:gap-16 ${className}`} aria-hidden="true">
			<div className={`${imageFirst ? "order-1" : "order-2 lg:order-none"} flex justify-center self-center lg:self-end shrink-0`}>
				<SkeletonBlock className={imageClassName} toneClass={imageToneClass} />
			</div>
			<div className={`${imageFirst ? "order-2" : "order-1 lg:order-none"} space-y-6 py-16 flex-1`}>
				<SkeletonBlock className="h-8 w-56" toneClass={textToneClass} />
				<div className="space-y-3">
					<SkeletonBlock className="h-4 w-full" toneClass={textToneClass} />
					<SkeletonBlock className="h-4 w-full" toneClass={textToneClass} />
					<SkeletonBlock className="h-4 w-5/6" toneClass={textToneClass} />
				</div>
				{showButton ? <SkeletonBlock className={buttonClassName} toneClass={textToneClass} /> : null}
			</div>
		</div>
	);
}

export function ReviewSectionSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col space-y-6 px-6 ${className}`} aria-hidden="true">
			<div className="space-y-6 text-center">
				<SkeletonBlock className="mx-auto h-8 w-52" />
				<div className="mx-auto max-w-3xl space-y-3">
					<SkeletonBlock className="h-4 w-full" />
					<SkeletonBlock className="h-4 w-4/5 mx-auto" />
				</div>
			</div>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} className="flex min-h-[280px] flex-col gap-6 border border-[#DEDEDE] bg-white p-6">
						<div className="flex gap-2">
							{Array.from({ length: 5 }).map((__, starIndex) => (
								<SkeletonBlock key={starIndex} className="h-5 w-5 rounded-full" toneClass="bg-[#F2C5C5]" />
							))}
						</div>
						<div className="space-y-3 flex-1">
							<SkeletonBlock className="h-4 w-full" />
							<SkeletonBlock className="h-4 w-full" />
							<SkeletonBlock className="h-4 w-4/5" />
						</div>
						<SkeletonBlock className="h-5 w-32" toneClass="bg-[#C8D7EE]" />
					</div>
				))}
			</div>
			<div className="flex justify-end">
				<SkeletonBlock className="h-6 w-40" toneClass="bg-[#C8D7EE]" />
			</div>
		</div>
	);
}

export function ServiceCategoryRowsSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 ${className}`} aria-hidden="true">
			{Array.from({ length: 4 }).map((_, index) => (
				<div key={index} className="flex flex-col gap-2">
					<div className="flex flex-col gap-12 sm:flex-row sm:items-start">
						<div className="hidden shrink-0 sm:block">
							<SkeletonBlock className="h-[90px] w-[120px]" toneClass="bg-[#D3DCEB]" />
						</div>
						<div className="flex-1 space-y-2">
							<SkeletonBlock className="h-7 w-52" />
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-11/12" toneClass="bg-[#E5EBF4]" />
						</div>
					</div>
					<div className="mt-1 flex justify-end">
						<SkeletonBlock className="h-6 w-56" toneClass="bg-[#C8D7EE]" />
					</div>
				</div>
			))}
		</div>
	);
}

export function ServiceAreaRowsSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 ${className}`} aria-hidden="true">
			{Array.from({ length: 4 }).map((_, index) => (
				<div key={index} className="flex flex-col gap-2">
					<div className="flex flex-col gap-12 sm:flex-row sm:items-start">
						<div className="hidden shrink-0 sm:block">
							<SkeletonBlock className="h-[90px] w-[120px]" toneClass="bg-[#D3DCEB]" />
						</div>
						<div className="flex-1 space-y-2">
							<SkeletonBlock className="h-7 w-52" />
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-11/12" toneClass="bg-[#E5EBF4]" />
						</div>
					</div>
					<div className="mt-1 flex justify-end">
						<SkeletonBlock className="h-6 w-60" toneClass="bg-[#C8D7EE]" />
					</div>
				</div>
			))}
		</div>
	);
}

export function CallNowSectionSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col items-start gap-16 px-6 lg:flex-row ${className}`} aria-hidden="true">
			<div className="order-2 flex shrink-0 justify-center self-center lg:order-none lg:self-end">
				<SkeletonBlock className="h-80 w-[22rem] rounded-lg" toneClass="bg-[#D3DCEB]" />
			</div>
			<div className="order-1 flex-1 space-y-6 py-16 lg:order-none">
				<SkeletonBlock className="h-8 w-36" />
				<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
				<SkeletonBlock className="h-4 w-11/12" toneClass="bg-[#E5EBF4]" />
				<SkeletonBlock className="h-[50px] w-full sm:w-[200px]" toneClass="bg-[#EAB3B3]" />
			</div>
		</div>
	);
}

export function FaqTeaserSectionSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col items-start gap-16 px-6 lg:flex-row ${className}`} aria-hidden="true">
			<div className="flex-1 space-y-6 py-16">
				<SkeletonBlock className="h-8 w-80" />
				<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
				<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
				<SkeletonBlock className="h-4 w-11/12" toneClass="bg-[#E5EBF4]" />
				<div className="flex justify-end">
					<SkeletonBlock className="h-6 w-36" toneClass="bg-[#C8D7EE]" />
				</div>
			</div>
			<div className="block shrink-0 self-center pb-16 lg:pb-0">
				<SkeletonBlock className="h-60 w-[26rem] max-w-full" toneClass="bg-[#D3DCEB]" />
			</div>
		</div>
	);
}

export function FinancingSectionSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-row items-center gap-16 px-6 ${className}`} aria-hidden="true">
			<div className="flex-1 space-y-6">
				<SkeletonBlock className="h-8 w-36" />
				<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
				<SkeletonBlock className="h-4 w-11/12" toneClass="bg-[#E5EBF4]" />
				<SkeletonBlock className="h-6 w-56" />
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, index) => (
						<SkeletonBlock key={index} className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
					))}
				</div>
				<SkeletonBlock className="h-6 w-52" />
				<SkeletonBlock className="h-4 w-3/4" toneClass="bg-[#E5EBF4]" />
				<SkeletonBlock className="h-[50px] w-full sm:w-[200px]" toneClass="bg-[#EAB3B3]" />
			</div>
			<div className="hidden shrink-0 lg:block">
				<SkeletonBlock className="mt-4 h-[340px] w-[440px]" toneClass="bg-[#D3DCEB]" />
			</div>
		</div>
	);
}

export function WarrantySectionSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-row gap-16 px-6 text-left ${className}`} aria-hidden="true">
			<div className="hidden shrink-0 lg:block">
				<SkeletonBlock className="mt-4 h-[340px] w-[480px]" toneClass="bg-[#D3DCEB]" />
			</div>
			<div className="flex-1 space-y-6">
				<SkeletonBlock className="h-8 w-40" />
				<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
				<SkeletonBlock className="h-4 w-11/12" toneClass="bg-[#E5EBF4]" />
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, index) => (
						<SkeletonBlock key={index} className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
					))}
				</div>
			</div>
		</div>
	);
}

export function PromoBarSkeleton({ className = "" }) {
	return (
		<div className={`w-full bg-[#B32020] ${className}`} aria-hidden="true">
			<div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-2">
				<SkeletonBlock className="h-5 w-56" toneClass="bg-white/35" />
			</div>
		</div>
	);
}

export function OfferCardsSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col space-y-6 px-6 ${className}`} aria-hidden="true">
			<div className="space-y-6 text-center text-white">
				<SkeletonBlock className="mx-auto h-8 w-56" toneClass="bg-white/35" />
				<SkeletonBlock className="mx-auto h-4 w-80 max-w-full" toneClass="bg-white/25" />
			</div>
			<div className="flex flex-wrap justify-center gap-6">
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="min-w-[250px] flex-1 border-4 border-dashed border-[#B32020] bg-white p-6 shadow-lg">
						<div className="flex flex-col items-center gap-4">
							<SkeletonBlock className="h-12 w-12 rounded-full" toneClass="bg-[#F2C5C5]" />
							<SkeletonBlock className="h-9 w-40" toneClass="bg-[#C8D7EE]" />
							<SkeletonBlock className="h-4 w-44" />
							<SkeletonBlock className="h-4 w-40" />
							<SkeletonBlock className="h-12 w-36" toneClass="bg-[#EAB3B3]" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function BlogPostGridSkeleton({
	className = "",
	cardCount = 3,
	cardMinHeightClass = "min-h-[420px]",
	gridClassName = "grid-cols-1 lg:grid-cols-3",
}) {
	return (
		<div className={`grid w-full gap-6 ${gridClassName} ${className}`} aria-hidden="true">
			{Array.from({ length: cardCount }).map((_, index) => (
				<div key={index} className={`flex w-full ${cardMinHeightClass} flex-col border border-[#DEDEDE] bg-white`}>
					<SkeletonBlock className="h-48 w-full rounded-none" toneClass="bg-[#D3DCEB]" />
					<div className="flex flex-1 flex-col p-6">
						<SkeletonBlock className="h-6 w-11/12" />
						<div className="mt-3 space-y-2">
							<SkeletonBlock className="h-4 w-1/2" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-1/3" toneClass="bg-[#E5EBF4]" />
						</div>
						<div className="mt-4 flex-1 space-y-2">
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-4/5" toneClass="bg-[#E5EBF4]" />
						</div>
						<SkeletonBlock className="mt-6 h-5 w-32" toneClass="bg-[#C8D7EE]" />
					</div>
				</div>
			))}
		</div>
	);
}

export function RecentPostsSectionSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col space-y-6 px-6 ${className}`} aria-hidden="true">
			<div className="space-y-6">
				<SkeletonBlock className="h-8 w-48" />
				<SkeletonBlock className="h-4 w-80 max-w-full" toneClass="bg-[#E5EBF4]" />
			</div>
			<BlogPostGridSkeleton cardCount={3} />
			<div className="flex justify-end">
				<SkeletonBlock className="h-6 w-36" toneClass="bg-[#C8D7EE]" />
			</div>
		</div>
	);
}

export function FormSectionSkeleton({ className = "" }) {
	return (
		<div className={`mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 lg:flex-row ${className}`} aria-hidden="true">
			<div className="w-full space-y-6 lg:w-1/2">
				<div className="space-y-6">
					<SkeletonBlock className="h-8 w-52" />
					<SkeletonBlock className="h-4 w-72 max-w-full" />
				</div>
				<div className="grid grid-cols-1 gap-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<SkeletonBlock className="h-12 w-full" toneClass="bg-white/85" />
						<SkeletonBlock className="h-12 w-full" toneClass="bg-white/85" />
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<SkeletonBlock className="h-12 w-full" toneClass="bg-white/85" />
						<SkeletonBlock className="h-12 w-full" toneClass="bg-white/85" />
					</div>
					<SkeletonBlock className="h-28 w-full" toneClass="bg-white/85" />
					<div className="flex justify-center pt-4">
						<SkeletonBlock className="h-12 w-full sm:w-[200px]" toneClass="bg-[#EAB3B3]" />
					</div>
				</div>
			</div>
			<SkeletonBlock className="h-100 w-full lg:h-auto lg:min-h-[34rem] lg:w-1/2" toneClass="bg-white/70" />
		</div>
	);
}

export function LoadingButtonContent({
	isLoading,
	idleLabel,
	loadingLabel = "Submitting...",
	className = "",
}) {
	return (
		<span className={`inline-flex items-center justify-center gap-2 ${className}`} aria-live="polite">
			{isLoading ? (
				<>
					<span
						className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
						aria-hidden="true"
					/>
					<span>{loadingLabel}</span>
				</>
			) : (
				<span>{idleLabel}</span>
			)}
		</span>
	);
}

export function FooterSkeleton() {
	return (
		<footer className="w-full" aria-hidden="true">
			<div className="w-full bg-white">
				<div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-6 py-2 md:flex-row md:justify-between">
					<SkeletonBlock className="hidden h-[60px] w-52 md:block" toneClass="bg-[#D9E1F0]" />
					<div className="flex items-center gap-8">
						<SkeletonBlock className="h-[55px] w-24" toneClass="bg-[#D9E1F0]" />
						<SkeletonBlock className="h-[55px] w-36" toneClass="bg-[#D9E1F0]" />
						<SkeletonBlock className="hidden h-[55px] w-24 sm:block" toneClass="bg-[#D9E1F0]" />
					</div>
				</div>
			</div>
			<div className="w-full bg-[#0C2D70] py-16">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 text-white lg:gap-24">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						<div className="space-y-4">
							<SkeletonBlock className="h-7 w-72" toneClass="bg-white/25" />
							<SkeletonBlock className="h-4 w-52" toneClass="bg-white/20" />
							<div className="space-y-3 pt-2">
								<SkeletonBlock className="h-4 w-44" toneClass="bg-white/20" />
								<SkeletonBlock className="h-4 w-60" toneClass="bg-white/20" />
								<SkeletonBlock className="h-4 w-40" toneClass="bg-white/20" />
							</div>
						</div>
						<div className="space-y-4">
							<SkeletonBlock className="h-7 w-40" toneClass="bg-white/25" />
							<SkeletonBlock className="h-4 w-full" toneClass="bg-white/20" />
							<SkeletonBlock className="h-4 w-4/5" toneClass="bg-white/20" />
							<div className="flex overflow-hidden shadow-lg">
								<SkeletonBlock className="h-11 flex-[2] rounded-none" toneClass="bg-white/80" />
								<SkeletonBlock className="h-11 flex-1 rounded-none" toneClass="bg-[#EAB3B3]" />
							</div>
							<SkeletonBlock className="h-3 w-48" toneClass="bg-white/15" />
						</div>
					</div>
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="space-y-4">
								<SkeletonBlock className="h-6 w-28" toneClass="bg-white/25" />
								<div className="space-y-3">
									<SkeletonBlock className="h-4 w-full" toneClass="bg-white/20" />
									<SkeletonBlock className="h-4 w-5/6" toneClass="bg-white/20" />
									<SkeletonBlock className="h-4 w-2/3" toneClass="bg-white/20" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}

function PatternHeaderSkeleton({ titleWidth = "w-56", descriptionWidth = "w-full" }) {
	return (
		<section className="mt-[101px] md:mt-[106px] lg:mt-[167px] bg-[#0C2D70] py-16">
			<div className="mx-auto max-w-7xl px-6 space-y-6 text-white">
				<SkeletonBlock className={`h-10 ${titleWidth}`} toneClass="bg-white/25" />
				<div className="max-w-4xl space-y-3">
					<SkeletonBlock className={`h-4 ${descriptionWidth}`} toneClass="bg-white/20" />
					<SkeletonBlock className="h-4 w-11/12" toneClass="bg-white/20" />
				</div>
			</div>
		</section>
	);
}

export function RoutePageSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-40" descriptionWidth="w-4/5" />
			<section className="bg-[#F5F5F5] py-16">
				<div className="mx-auto max-w-7xl px-6 space-y-6">
					<SkeletonBlock className="h-8 w-56" />
					<SkeletonBlock className="h-4 w-full max-w-3xl" />
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className="border border-[#DEDEDE] bg-white p-6 shadow-lg">
								<div className="space-y-4">
									<SkeletonBlock className="h-48 w-full" toneClass="bg-[#D3DCEB]" />
									<SkeletonBlock className="h-6 w-4/5" />
									<SkeletonBlock className="h-4 w-full" />
									<SkeletonBlock className="h-4 w-5/6" />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}

export function HomeRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<section className="relative mt-[101px] h-[calc(100vh-101px)] bg-[#0C2D70] md:mt-[106px] md:h-[calc(100vh-106px)] lg:mt-[167px] lg:h-[calc(100vh-167px)]">
				<SkeletonBlock className="absolute inset-0 h-full w-full rounded-none" toneClass="bg-[#183D87]" />
				<div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-8 px-6 text-center">
					<div className="space-y-4">
						<SkeletonBlock className="mx-auto h-12 w-[28rem] max-w-full" toneClass="bg-white/25" />
						<SkeletonBlock className="mx-auto h-12 w-[28rem] max-w-full" toneClass="bg-white/25" />
					</div>
					<SkeletonBlock className="h-4 w-[20rem] max-w-full" toneClass="bg-white/20" />
					<div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
						<SkeletonBlock className="h-[50px] w-full sm:w-[200px]" toneClass="bg-[#EAB3B3]" />
						<SkeletonBlock className="h-[50px] w-full sm:w-[200px]" toneClass="bg-[#C8D7EE]" />
					</div>
				</div>
				<div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-6">
					{Array.from({ length: 4 }).map((_, index) => (
						<SkeletonBlock key={index} className="h-6 w-6 rounded-full" toneClass="bg-white/30" />
					))}
				</div>
			</section>
			<PromoBarSkeleton />
			<section className="bg-[#0C2D70] py-16">
				<div className="mx-auto max-w-7xl px-6">
					<div className="space-y-6 text-center text-white">
						<SkeletonBlock className="mx-auto h-10 w-56" toneClass="bg-white/25" />
						<SkeletonBlock className="mx-auto h-4 w-4/5" toneClass="bg-white/20" />
					</div>
					<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<div key={index} className="flex h-[280px] flex-col border border-[#DEDEDE] bg-white p-6 text-left">
								<SkeletonBlock className="h-12 w-12" toneClass="bg-[#D3DCEB]" />
								<div className="mt-6 space-y-2">
									<SkeletonBlock className="h-6 w-3/4" />
									<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
									<SkeletonBlock className="h-4 w-11/12" toneClass="bg-[#E5EBF4]" />
								</div>
							</div>
						))}
					</div>
					<div className="mt-6 flex justify-end">
						<SkeletonBlock className="h-6 w-36" toneClass="bg-white/30" />
					</div>
				</div>
			</section>
			<section className="bg-[#F5F5F5] py-16">
				<TextImageSectionSkeleton imageSide="right" imageClassName="h-[340px] w-full max-w-[38rem] rounded-none" />
			</section>
			<section className="py-16">
				<ReviewSectionSkeleton />
			</section>
			<section className="bg-[#F5F5F5] py-16">
				<FaqTeaserSectionSkeleton />
			</section>
			<PromoBarSkeleton className="bg-[#0C2D70]" />
			<section className="bg-[#0C2D70] py-16">
				<OfferCardsSkeleton />
			</section>
			<section className="bg-[#F5F5F5] py-16">
				<CallNowSectionSkeleton />
			</section>
			<section className="py-16">
				<FormSectionSkeleton />
			</section>
			<section className="bg-[#F5F5F5] py-16">
				<RecentPostsSectionSkeleton />
			</section>
		</div>
	);
}

export function AboutRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-44" descriptionWidth="w-11/12" />
			<section className="bg-white py-16">
				<TextImageSectionSkeleton imageSide="right" imageClassName="h-[320px] w-full max-w-[30rem] rounded-none" />
			</section>
			<section className="py-16">
				<TextImageSectionSkeleton imageSide="left" imageClassName="h-[320px] w-full max-w-[30rem] rounded-none" />
			</section>
			<section className="bg-[#F5F5F5] py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					<SkeletonBlock className="h-8 w-44" />
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className="border border-[#DEDEDE] bg-white p-6">
								<SkeletonBlock className="h-56 w-full" toneClass="bg-[#D3DCEB]" />
								<div className="mt-4 space-y-2">
									<SkeletonBlock className="h-5 w-2/3" />
									<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="bg-white py-16">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6">
					<div className="space-y-6">
						<SkeletonBlock className="h-8 w-44" />
						<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
					</div>
					<SkeletonBlock className="h-[320px] w-full rounded-none" toneClass="bg-[#D3DCEB]" />
				</div>
			</section>
			<section className="py-16">
				<ServiceAreaRowsSkeleton />
			</section>
		</div>
	);
}

export function BlogRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<div className="mt-[101px] md:mt-[106px] lg:mt-[167px] bg-[#0C2D70] py-16">
				<div className="mx-auto max-w-7xl px-6 space-y-6">
					<SkeletonBlock className="h-10 w-40" toneClass="bg-white/25" />
					<SkeletonBlock className="h-4 w-80 max-w-full" toneClass="bg-white/20" />
				</div>
			</div>
			<div className="bg-white pt-16 pb-6">
				<div className="mx-auto max-w-7xl px-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
					<SkeletonBlock className="h-10 w-full lg:col-span-1" />
					<SkeletonBlock className="h-10 w-full lg:col-span-2" />
				</div>
			</div>
			<div className="bg-[#F5F5F5] py-16">
				<div className="mx-auto max-w-7xl px-6">
					<BlogGridSkeleton count={6} />
				</div>
			</div>
		</div>
	);
}

export function BlogPostRouteSkeleton() {
	return <BlogPostSkeleton className="mt-[101px] md:mt-[106px] lg:mt-[167px]" />;
}

export function CareersRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-44" descriptionWidth="w-3/4" />
			<section className="bg-white py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					<SkeletonBlock className="h-8 w-52" />
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} className="border border-[#DEDEDE] bg-white p-4">
							<SkeletonBlock className="h-7 w-full" />
						</div>
					))}
				</div>
			</section>
			<section className="py-16">
				<div className="mx-auto max-w-7xl px-6">
					<FormSectionSkeleton />
				</div>
			</section>
		</div>
	);
}

export function CouponsRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<div className="mt-[101px] md:mt-[106px] lg:mt-[167px] bg-[#0C2D70] py-16">
				<div className="mx-auto max-w-7xl px-6 space-y-6">
					<SkeletonBlock className="h-10 w-56" toneClass="bg-white/25" />
					<SkeletonBlock className="h-4 w-96 max-w-full" toneClass="bg-white/20" />
				</div>
			</div>
			<div className="relative overflow-hidden bg-[#0C2D70] py-16">
				<OfferCardsSkeleton />
			</div>
		</div>
	);
}

export function ScheduleRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-56" descriptionWidth="w-3/4" />
			<section className="py-16">
				<FormSectionSkeleton />
			</section>
		</div>
	);
}

export function ReviewsRouteSkeleton() {
	return (
		<section className="py-16 mt-[101px] md:mt-[106px] lg:mt-[166px]" aria-hidden="true">
			<ReviewSectionSkeleton />
		</section>
	);
}

export function FAQsRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-80" descriptionWidth="w-2/3" />
			<section className="bg-white py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className="border border-[#DEDEDE] bg-white p-4">
							<SkeletonBlock className="h-6 w-full" />
						</div>
					))}
				</div>
			</section>
			<section className="py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="border border-[#DEDEDE] bg-white p-4">
							<SkeletonBlock className="h-6 w-full" />
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

export function ResourcesRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-52" descriptionWidth="w-11/12" />
			<section className="bg-white py-16">
				<FinancingSectionSkeleton />
			</section>
			<section className="py-16">
				<WarrantySectionSkeleton />
			</section>
			<section className="bg-[#F5F5F5] py-16">
				<div className="mx-auto max-w-7xl px-6">
					<FormSectionSkeleton />
				</div>
			</section>
		</div>
	);
}

export function FinancingRouteSkeleton() {
	return (
		<section className="py-16 mt-[101px] md:mt-[106px] lg:mt-[166px]" aria-hidden="true">
			<FinancingSectionSkeleton />
		</section>
	);
}

export function WarrantyRouteSkeleton() {
	return (
		<section className="py-16 mt-[101px] md:mt-[106px] lg:mt-[166px]" aria-hidden="true">
			<WarrantySectionSkeleton />
		</section>
	);
}

export function ServiceAreasRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-56" descriptionWidth="w-full" />
			<section className="py-16">
				<ServiceAreaRowsSkeleton />
			</section>
		</div>
	);
}

export function RegionsRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-80" descriptionWidth="w-full" />
			<section className="bg-white py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					<SkeletonBlock className="h-8 w-72" />
					<SkeletonBlock className="h-4 w-3/4" />
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="space-y-3">
								<SkeletonBlock className="h-5 w-2/3" />
								<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
								<SkeletonBlock className="h-4 w-5/6" toneClass="bg-[#E5EBF4]" />
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="bg-[#F5F5F5] py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					<SkeletonBlock className="h-8 w-72" />
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
						{Array.from({ length: 12 }).map((_, index) => (
							<SkeletonBlock key={index} className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
						))}
					</div>
				</div>
			</section>
			<section className="py-16">
				<FormSectionSkeleton />
			</section>
		</div>
	);
}

export function AreaRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-[24rem] max-w-full" descriptionWidth="w-full" />
			<section className="bg-white py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					<SkeletonBlock className="h-8 w-72" />
					<SkeletonBlock className="h-4 w-3/4" />
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="space-y-3">
								<SkeletonBlock className="h-5 w-2/3" />
								<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
								<SkeletonBlock className="h-4 w-5/6" toneClass="bg-[#E5EBF4]" />
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					<SkeletonBlock className="h-8 w-[24rem] max-w-full" />
					<div className="space-y-3">
						{Array.from({ length: 4 }).map((_, index) => (
							<SkeletonBlock key={index} className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
						))}
					</div>
				</div>
			</section>
			<section className="bg-[#F5F5F5] py-16">
				<div className="mx-auto max-w-7xl space-y-6 px-6">
					<SkeletonBlock className="h-8 w-64" />
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
						{Array.from({ length: 12 }).map((_, index) => (
							<SkeletonBlock key={index} className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
						))}
					</div>
				</div>
			</section>
			<section className="py-16">
				<FormSectionSkeleton />
			</section>
		</div>
	);
}

export function ServiceCategoriesRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-56" descriptionWidth="w-full" />
			<section className="py-16">
				<ServiceCategoryRowsSkeleton />
			</section>
		</div>
	);
}

export function ServiceCategoryRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<PatternHeaderSkeleton titleWidth="w-72" descriptionWidth="w-full" />
			<section className="bg-white py-16">
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} className="mx-auto max-w-7xl px-6 pb-12 last:pb-0">
						<TextImageSectionSkeleton
							imageSide={index % 2 === 0 ? "left" : "right"}
							imageClassName="h-72 w-full max-w-[34rem] rounded-none"
						/>
					</div>
				))}
			</section>
			<section className="py-16">
				<FormSectionSkeleton />
			</section>
		</div>
	);
}

export function NotFoundRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<section className="mt-[101px] md:mt-[106px] lg:mt-[167px] bg-[#0C2D70] py-24">
				<div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 text-center">
					<SkeletonBlock className="h-20 w-32" toneClass="bg-white/25" />
					<SkeletonBlock className="h-10 w-56" toneClass="bg-white/25" />
					<SkeletonBlock className="h-4 w-3/4" toneClass="bg-white/20" />
					<SkeletonBlock className="h-[50px] w-[200px]" toneClass="bg-[#EAB3B3]" />
				</div>
			</section>
		</div>
	);
}

export function ServiceRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<div className="mt-[101px] md:mt-[106px] lg:mt-[167px] relative overflow-hidden bg-[#0C2D70] py-16">
				<div className="mx-auto max-w-7xl px-6 space-y-6 text-white">
					<SkeletonBlock className="h-10 w-56" toneClass="bg-white/25" />
					<div className="max-w-3xl space-y-3">
						<SkeletonBlock className="h-4 w-full" toneClass="bg-white/20" />
						<SkeletonBlock className="h-4 w-11/12" toneClass="bg-white/20" />
					</div>
				</div>
			</div>
			<div className="bg-white py-16">
				<div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:flex-row lg:items-center lg:gap-16">
					<div className="flex-1 space-y-6">
						<SkeletonBlock className="h-8 w-64" />
						<div className="space-y-3">
							<SkeletonBlock className="h-4 w-full" />
							<SkeletonBlock className="h-4 w-full" />
							<SkeletonBlock className="h-4 w-5/6" />
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{Array.from({ length: 4 }).map((_, index) => (
								<div key={index} className="flex items-start gap-3 border border-[#DEDEDE] bg-[#F5F5F5] p-4">
									<SkeletonBlock className="mt-1 h-5 w-5 rounded-full" toneClass="bg-[#EAB3B3]" />
									<div className="flex-1 space-y-2">
										<SkeletonBlock className="h-4 w-3/4" />
										<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
									</div>
								</div>
							))}
						</div>
					</div>
					<SkeletonBlock className="h-[320px] w-full rounded-none lg:h-[380px] lg:max-w-[38rem]" toneClass="bg-[#D3DCEB]" />
				</div>
			</div>
			<div className="relative overflow-hidden bg-[#F5F5F5] py-16">
				<div className="mx-auto max-w-7xl px-6 space-y-6">
					<SkeletonBlock className="h-8 w-72" />
					<SkeletonBlock className="h-4 w-full max-w-3xl" />
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="border border-[#DEDEDE] bg-white p-6">
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<SkeletonBlock className="h-8 w-8 rounded-full" toneClass="bg-[#C8D7EE]" />
										<SkeletonBlock className="h-5 w-32" />
									</div>
									<SkeletonBlock className="h-4 w-full" />
									<SkeletonBlock className="h-4 w-5/6" toneClass="bg-[#E5EBF4]" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="relative overflow-hidden bg-white py-16">
				<div className="mx-auto max-w-7xl px-6">
					<FormSectionSkeleton />
				</div>
			</div>
		</div>
	);
}

export function BlogGridSkeleton({ count = 6, className = "" }) {
	return (
		<div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="min-h-[450px] overflow-hidden bg-white shadow-lg">
					<SkeletonBlock className="h-48 w-full rounded-none" toneClass="bg-[#D3DCEB]" />
					<div className="flex flex-1 flex-col p-6">
						<SkeletonBlock className="h-7 w-5/6" />
						<div className="mb-3 mt-3 space-y-2">
							<SkeletonBlock className="h-4 w-1/2" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-1/3" toneClass="bg-[#E5EBF4]" />
						</div>
						<div className="flex-1 space-y-2 pt-1">
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-4/5" toneClass="bg-[#E5EBF4]" />
						</div>
						<SkeletonBlock className="mt-6 h-5 w-32" toneClass="bg-[#C8D7EE]" />
					</div>
				</div>
			))}
		</div>
	);
}

export function BlogPostSkeleton({ className = "" }) {
	return (
		<section className={`relative overflow-hidden flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[167px] ${className}`}>
			<ImageWithLoader
				src={getCloudFrontUrl("private/seattle-skyline.png")}
				alt=""
				aria-hidden="true"
				fetchPriority="high"
				className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
			/>
			<div className="max-w-7xl mx-auto px-6 w-full">
				<SkeletonBlock className="mb-8 h-6 w-36" toneClass="bg-[#C8D7EE]" />
				<article className="overflow-hidden">
					<SkeletonBlock className="h-64 w-full rounded-none md:h-96" toneClass="bg-[#D3DCEB]" />
					<div className="space-y-6 py-8">
						<SkeletonBlock className="h-10 w-3/4" />
						<div className="space-y-2">
							<SkeletonBlock className="h-4 w-1/3" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-1/4" toneClass="bg-[#E5EBF4]" />
						</div>
						<div className="space-y-4 pt-2">
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-11/12" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-6 w-52" />
							<SkeletonBlock className="h-4 w-full" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-10/12" toneClass="bg-[#E5EBF4]" />
							<SkeletonBlock className="h-4 w-4/5" toneClass="bg-[#E5EBF4]" />
						</div>
					</div>
				</article>
				<div className="mt-10 bg-[#F5F5F5] p-6">
					<SkeletonBlock className="mb-3 h-6 w-40" />
					<div className="space-y-3">
						<SkeletonBlock className="h-4 w-44" toneClass="bg-[#E5EBF4]" />
						<SkeletonBlock className="h-4 w-52" toneClass="bg-[#E5EBF4]" />
						<SkeletonBlock className="h-4 w-40" toneClass="bg-[#E5EBF4]" />
					</div>
				</div>
				<div className="flex justify-between items-center mt-10">
					<SkeletonBlock className="h-5 w-28" toneClass="bg-[#C8D7EE]" />
					<SkeletonBlock className="h-5 w-24" toneClass="bg-[#C8D7EE]" />
				</div>
			</div>
		</section>
	);
}
