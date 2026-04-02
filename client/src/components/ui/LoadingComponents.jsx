import { useState } from "react";

export function ImageWithLoader({
	src,
	alt,
	className = "",
	loading = "lazy",
	decoding = "async",
	fetchPriority,
	...props
}) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const handleLoad = () => {
		setIsLoading(false);
	};

	const handleError = () => {
		setIsLoading(false);
		setHasError(true);
	};

	return (
		<div className={`relative ${className}`}>
			{isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
			{hasError ? (
				<div className="flex items-center justify-center bg-gray-50 text-gray-400 text-sm h-full">
					Image unavailable
				</div>
			) : (
				<img
					src={src}
					alt={alt}
					className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
					loading={loading}
					decoding={decoding}
					fetchPriority={fetchPriority}
					onLoad={handleLoad}
					onError={handleError}
					{...props}
				/>
			)}
		</div>
	);
}

export function TextSkeleton({ lines = 1, className = "" }) {
	return (
		<div className={`space-y-2 ${className}`}>
			{Array.from({ length: lines }).map((_, i) => (
				<div
					key={i}
					className="h-4 bg-gray-50"
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
				<div className="h-4 bg-gray-200 w-3/4" />
				<div className="h-4 bg-gray-200 w-full" />
				<div className="h-4 bg-gray-200 w-5/6" />
			</div>
		</div>
	);
}

export function BlogGridSkeleton({ count = 6, className = "" }) {
	return (
		<div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="bg-white shadow-lg overflow-hidden min-h-[450px] animate-pulse">
					<div className="w-full h-48 bg-gray-200" />
					<div className="p-6 space-y-3">
						<div className="h-6 bg-gray-200 w-5/6" />
						<div className="h-4 bg-gray-100 w-1/2" />
						<div className="space-y-2 pt-2">
							<div className="h-4 bg-gray-100 w-full" />
							<div className="h-4 bg-gray-100 w-full" />
							<div className="h-4 bg-gray-100 w-2/3" />
						</div>
						<div className="h-5 bg-gray-200 w-1/3 mt-4" />
					</div>
				</div>
			))}
		</div>
	);
}

export function BlogPostSkeleton({ className = "" }) {
	return (
		<section className={`flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[167px] ${className}`}>
			<div className="max-w-7xl mx-auto px-6 w-full animate-pulse">
				<div className="h-6 bg-gray-200 w-36 mb-8" />
				<article className="bg-white overflow-hidden shadow-sm">
					<div className="w-full h-64 md:h-96 bg-gray-200" />
					<div className="p-8 md:p-12 space-y-4">
						<div className="h-10 bg-gray-200 w-3/4" />
						<div className="h-4 bg-gray-100 w-1/3" />
						<div className="space-y-3 pt-2">
							<div className="h-4 bg-gray-100 w-full" />
							<div className="h-4 bg-gray-100 w-full" />
							<div className="h-4 bg-gray-100 w-11/12" />
							<div className="h-4 bg-gray-100 w-10/12" />
							<div className="h-4 bg-gray-100 w-4/5" />
						</div>
					</div>
				</article>
				<div className="flex justify-between items-center mt-10">
					<div className="h-5 bg-gray-200 w-28" />
					<div className="h-5 bg-gray-200 w-24" />
				</div>
			</div>
		</section>
	);
}
