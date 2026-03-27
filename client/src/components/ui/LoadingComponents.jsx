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
			{isLoading && <div className="absolute inset-0 bg-gray-50" />}
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
