import { useState, useEffect, useMemo } from "react";
import { FaStar, FaArrowRight } from "react-icons/fa";
import { SectionTitle } from "../ui/UnderlinedHeading";
import { CustomerReviewsData, CompanyInfo } from "../../data/data";

const MAX_REVIEW_CHARACTERS = 280;

function truncateReviewText(text, maxChars = MAX_REVIEW_CHARACTERS) {
	if (!text || text.length <= maxChars) return text;

	const clipped = text.slice(0, maxChars);
	const lastSpaceIndex = clipped.lastIndexOf(" ");
	const truncated = lastSpaceIndex > 0 ? clipped.slice(0, lastSpaceIndex) : clipped;

	return `${truncated}...`;
}

function RotatingReviewCard({ reviews, intervalMs, delayMs }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const timeout = setTimeout(() => {
			const interval = setInterval(() => {
				setVisible(false);
				setTimeout(() => {
					setCurrentIndex((prev) => (prev + 1) % reviews.length);
					setVisible(true);
				}, 600);
			}, intervalMs);
			return () => clearInterval(interval);
		}, delayMs);
		return () => clearTimeout(timeout);
	}, [reviews.length, intervalMs, delayMs]);

	const review = reviews[currentIndex];
	const reviewText = truncateReviewText(review.text);

	return (
		<div
			className="flex flex-col gap-6 text-start bg-white p-6 border-1 border-[#DEDEDE] min-h-[280px]"
			style={{
				opacity: visible ? 1 : 0,
				transition: "opacity 0.6s ease-in-out",
			}}
		>
			{/* Star Rating */}
			<div className="flex gap-1.5 text-[#B32020] text-lg">
				{Array.from({ length: review.rating }, (_, i) => (
					<FaStar key={i} />
				))}
			</div>

			{/* Review Text */}
			<p className="flex-1 text-[#2B2B2B]">{reviewText}</p>

			{/* Reviewer */}
			<h6 className="text-[#0C2D70]">— {review.name}</h6>
		</div>
	);
}

export default function CustomerReviews() {
	const reviews = CustomerReviewsData.filter((r) => r.rating >= 4);

	const groups = useMemo(() => {
		const third = Math.ceil(reviews.length / 3);
		return [
			reviews.slice(0, third),
			reviews.slice(third, third * 2),
			reviews.slice(third * 2),
		];
	}, [reviews]);

	return (
		<div className="flex flex-col w-full max-w-7xl mx-auto px-6 space-y-6 fade-in">
			{/* Header Container*/}
			<div className="space-y-6 text-center">
				{/* Title */}
				<SectionTitle as="h4" centered>Customer Reviews</SectionTitle>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					See what our customers are saying about our plumbing services. Your satisfaction is our
					top priority.
				</p>
			</div>

			{/* Customer Reviews Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{groups.map((group, idx) => (
					<RotatingReviewCard
						key={idx}
						reviews={group}
						intervalMs={9000}
						delayMs={idx * 2000}
					/>
				))}
			</div>

			{/* See More Reviews Link */}
			<div className="flex justify-end">
				<a
					href={CompanyInfo.googleReviewsUrl}
					className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline"
				>
					See More Reviews <FaArrowRight />
				</a>
			</div>
		</div>
	);
}
