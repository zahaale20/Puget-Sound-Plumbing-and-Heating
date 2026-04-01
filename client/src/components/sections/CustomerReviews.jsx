import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowRight, FaGoogle } from "react-icons/fa";
import { CustomerReviewsData, GoogleReviewsSummary, CompanyInfo } from "../../data/data";

export default function CustomerReviews() {
	const reviews = CustomerReviewsData.filter((r) => r.rating >= 4);

	const renderStars = (rating) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
		const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
		for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`f${i}`} />);
		if (hasHalf) stars.push(<FaStarHalfAlt key="h" />);
		for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={`e${i}`} />);
		return stars;
	};

	return (
		<div className="flex flex-col w-full max-w-7xl px-6 space-y-6 fade-in">
			{/* Header Container*/}
			<div className="space-y-6 text-center">
				{/* Title */}
				<h4 className="text-[#0C2D70] inline-block relative pb-2">
					Customer Reviews
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>

				{/* Google Rating Summary */}
				<div className="flex items-center justify-center gap-3">
					<FaGoogle className="text-2xl text-[#4285F4]" />
					<div className="flex items-center gap-2 text-[#B32020] text-xl">
						{renderStars(GoogleReviewsSummary.rating)}
					</div>
					<span className="text-[#2B2B2B] font-semibold text-lg">
						{GoogleReviewsSummary.rating}
					</span>
					<span className="text-[#666]">
						Based on {GoogleReviewsSummary.totalReviews} reviews
					</span>
				</div>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					See what our customers are saying about our plumbing services. Your satisfaction is our
					top priority.
				</p>
			</div>

			{/* Customer Reviews Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{reviews.map((review, idx) => (
					<div
						key={idx}
						className="flex flex-col gap-6 text-start bg-white p-6 border-1 border-[#DEDEDE]"
					>
						{/* Star Rating */}
						<div className="flex gap-1.5 text-[#B32020] text-lg">
							{Array.from({ length: review.rating }, (_, i) => (
								<FaStar key={i} />
							))}
						</div>

						{/* Review Text */}
						<p className="flex-1 text-[#2B2B2B]">{review.text}</p>

						{/* Reviewer */}
						<h6 className="text-[#0C2D70]">— {review.name}</h6>
					</div>
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
