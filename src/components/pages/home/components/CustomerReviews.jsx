import { FaStar, FaArrowRight } from "react-icons/fa";

import skyline from "../../../../assets/seattle-skyline.png";

export default function CustomerReviews() {
	const reviews = [
		{
		name: "- Amy W.",
		rating: 5,
		text: "\"Puget Sound Plumbing was quick, prompt, and professional. Their customer service is amazing, and they made the whole process easy and stress-free. Michael & Sean came out quickly to fix the sub pump issue. Highly recommend!\"",
		},
		{
		name: "- Edith S.",
		rating: 5,
		text: "\"I have used Puget Sound Plumbing and Heating several times now. Each time I have been impressed with how efficient and fast they are. Every person they have sent has listened carefully to the problem. They talk me through all my options and the prices. They answer all my questions. They are polite and respectful.\"",
		},
		{
		name: "- Charlotte P.",
		rating: 5,
		text: "\"Michael L saved the day, truly took my breath away! Friendly and knowledgeable to a T, I’m very thankful for how he helped me. His service was a 10/10, I will definitely call Puget Sound Plumbing again. Michael fixed my plumbing with ease, I would love to work with him again please.\"",
		},
	];

	return (
		<div className="flex flex-col w-full max-w-7xl px-6 space-y-6">
			{/* Header Container*/}
			<div className="space-y-6 text-center">
				{/* Title */}
				<h4 className="text-[#0C2D70] inline-block relative pb-2">
					Customer Reviews
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					See what our customers are saying about our plumbing services. Your satisfaction is our top priority.
				</p>
			</div>

			{/* Customer Reviews Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{reviews.map((review, idx) => (
					<div key={idx} className="flex flex-col gap-6 text-start bg-white p-6 shadow-lg">
						{/* Star Rating */}
						<div className="flex gap-1.5 text-[#B32020] text-lg">
							{Array.from({ length: review.rating }, (_, i) => (
								<FaStar key={i} />
							))}
						</div>

						{/* Review Text */}
						<p className="flex-1 text-[#2B2B2B]">
							{review.text}
						</p>

						{/* Reviewer */}
						<h6 className="text-[#0C2D70]">
							{review.name}
						</h6>
					</div>
				))}
			</div>

			{/* See More Reviews Link */}
			<div className="flex justify-end">
				<a 
					href="https://www.google.com/search?q=puget+sound+plumbing+reviews&sca_esv=d8140a1b87a5a1ad&rlz=1C5CHFA_enUS1041US1041&sxsrf=AE3TifN7dQPUHVuLtMIr3K6x_wZWzGFzJg%3A1763500132860&ei=ZOAcafGhNIWC0PEPitT70AM&ved=0ahUKEwjx4-v3zfyQAxUFATQIHQrqHjoQ4dUDCBE&uact=5&oq=puget+sound+plumbing+reviews&gs_lp=Egxnd3Mtd2l6LXNlcnAiHHB1Z2V0IHNvdW5kIHBsdW1iaW5nIHJldmlld3MyDhAuGIAEGMcBGI4FGK8BMgYQABgIGB4yCxAAGIAEGIYDGIoFMgsQABiABBiGAxiKBTILEAAYgAQYhgMYigUyBRAAGO8FMggQABiABBiiBDIIEAAYgAQYogQyHRAuGIAEGMcBGI4FGK8BGJcFGNwEGN4EGOAE2AEBSMACUABYAHAAeAGQAQCYAWigAWiqAQMwLjG4AQPIAQD4AQGYAgGgAm-YAwC6BgYIARABGBSSBwMwLjGgB7MIsgcDMC4xuAdvwgcDMi0xyAcE&sclient=gws-wiz-serp#lrd=0x549043aef46f30f9:0x8357f4ac9a2ff339,1,,,," 
					className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline"
				>
					See More Reviews <FaArrowRight/>
				</a>
			</div>
		</div>
	);
}
