import { FaArrowRight } from "react-icons/fa";
import plumberBro from "../../../../assets/plumbing-bros.png";

export default function WhyChooseUs() {
	return (
		<div className="flex flex-col lg:flex-row w-full max-w-7xl px-6 mx-auto lg:gap-16 items-start">
			{/* Image */}
			<div className="block self-center lg:self-end shrink-0">
				<img
					src={plumberBro}
					alt="Plumber Bros"
					className="w-auto h-84 object-cover"
				/>
			</div>

			{/* Header Container */}
			<div className="space-y-6 py-16">
				{/* Title */}
				<h4 className="text-[#0C2D70] inline-block relative pb-2">
					Why Choose Us?
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					For over 20 years, Puget Sound Plumbing and Heating has been Seattle’s trusted, family-run choice for reliable home comfort solutions. Our licensed professionals deliver expert workmanship, honest pricing, and outstanding customer care on every job. Whether it’s a minor repair or an urgent emergency, we’re available 24/7 to keep your home safe, comfortable, and running smoothly.
				</p>

				{/* Learn More Link */}
				<div className="flex justify-end">
					<a href="/about-us" className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline">
						Learn More
						<FaArrowRight />
					</a>
				</div>
			</div>
		</div>
	);
}