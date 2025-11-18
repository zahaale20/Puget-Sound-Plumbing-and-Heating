import { FaStar, FaArrowRight } from "react-icons/fa";

import skyline from "../../../../assets/seattle-skyline.png";

export default function CustomerReviews() {
	const reviews = [
		{
		name: "- Amy W.",
		rating: 5,
		text: "Puget Sound Plumbing was quick, prompt, and professional. Their customer service is amazing, and they made the whole process easy and stress-free. Michael & Sean came out quickly to fix the sub pump issue. Highly recommend!",
		},
		{
		name: "- Edith S.",
		rating: 5,
		text: "I have used Puget Sound Plumbing and Heating several times now. Each time I have been impressed with how efficient and fast they are. Every person they have sent has listened carefully to the problem. They talk me through all my options and the prices. They answer all my questions. They are polite and respectful.",
		},
		{
		name: "- Charlotte P.",
		rating: 5,
		text: "Michael L saved the day, truly took my breath away! Friendly and knowledgeable to a T, I’m very thankful for how he helped me. His service was a 10/10, I will definitely call Puget Sound Plumbing again. Michael fixed my plumbing with ease, I would love to work with him again please.",
		},
	];

	return (
		<section className="flex justify-center w-full py-16 bg-cover bg-bottom" style={{ backgroundImage: `url(${skyline})` }}>
			<div className="flex flex-col text-center w-full max-w-7xl px-6">
				{/* Header */}
				<div className="mb-6">
					<h4 className="text-[#0C2D70] inline-block relative pb-2">
						Customer Reviews
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h4>
					<p className="text-[#2B2B2B] mt-6 mx-auto">
						See what our customers are saying about our plumbing services. Your satisfaction is our top priority.
					</p>
				</div>

				{/* Reviews */}
				<div className="grid gap-6 lg:grid-cols-3 mb-6">
					{reviews.map((review, idx) => (
						<div key={idx} className="bg-white p-6 shadow-lg flex flex-col gap-4 text-start">
							{/* Rating */}
							<div className="flex gap-1 text-[#B32020] text-lg">
								{Array.from({ length: review.rating }, (_, i) => (
								<FaStar key={i} />
								))}
							</div>

							{/* Review Text */}
							<p className="flex-1 text-[#2B2B2B]">
								{review.text}
							</p>

							{/* Reviewer */}
							<h6 className="text-[#0C2D70] font-semibold mt-2">
								{review.name}
							</h6>
						</div>
					))}
				</div>

				{/* See More Reviews Link */}
				<div className="flex justify-end">
					<a href="#" className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors">
						See More Reviews <FaArrowRight/>
					</a>
				</div>
			</div>
		</section>
	);
}
