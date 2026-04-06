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

export function RoutePageSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<div className="bg-[#0C2D70] py-16 mt-[101px] md:mt-[106px] lg:mt-[167px]">
				<div className="mx-auto max-w-7xl px-6 space-y-6">
					<SkeletonBlock className="h-10 w-40" toneClass="bg-white/25" />
					<div className="space-y-3 max-w-2xl">
						<SkeletonBlock className="h-4 w-full" toneClass="bg-white/20" />
						<SkeletonBlock className="h-4 w-5/6" toneClass="bg-white/20" />
					</div>
				</div>
			</div>
			<div className="bg-[#F5F5F5] py-16">
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
			</div>
		</div>
	);
}

export function HomeRouteSkeleton() {
	return (
		<div className="flex-1" aria-hidden="true">
			<div className="mt-[101px] md:mt-[106px] lg:mt-[167px] bg-[#0C2D70] py-16">
				<div className="mx-auto max-w-7xl px-6 space-y-6">
					<SkeletonBlock className="h-10 w-64" toneClass="bg-white/25" />
					<div className="space-y-3 max-w-2xl">
						<SkeletonBlock className="h-4 w-full" toneClass="bg-white/20" />
						<SkeletonBlock className="h-4 w-5/6" toneClass="bg-white/20" />
					</div>
				</div>
			</div>
			<PromoBarSkeleton />
			<div className="bg-[#F5F5F5] py-16">
				<div className="mx-auto max-w-7xl px-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="border border-[#DEDEDE] bg-white p-6">
							<div className="space-y-4">
								<SkeletonBlock className="h-32 w-full" toneClass="bg-[#D3DCEB]" />
								<SkeletonBlock className="h-6 w-4/5" />
								<SkeletonBlock className="h-4 w-full" />
							</div>
						</div>
					))}
				</div>
			</div>
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
			<div className="mt-[101px] md:mt-[106px] lg:mt-[167px] bg-[#0C2D70] py-16">
				<div className="mx-auto max-w-7xl px-6 space-y-6">
					<SkeletonBlock className="h-10 w-56" toneClass="bg-white/25" />
					<SkeletonBlock className="h-4 w-96 max-w-full" toneClass="bg-white/20" />
				</div>
			</div>
			<div className="bg-[#F5F5F5] py-16">
				<FormSectionSkeleton />
			</div>
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
