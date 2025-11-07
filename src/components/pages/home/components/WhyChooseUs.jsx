import { FaArrowRight } from "react-icons/fa";
import plumberBro from "../../../../assets/plumbing-bros.png";

export default function WhyChooseUs() {
	return (
		<section className="flex flex-col w-full bg-[#F5F5F5]">
			<div className="flex flex-row w-full max-w-7xl px-6 mx-auto gap-16 items-start">
				{/* Image */}
				<div className="hidden lg:block">
					<img
						src={plumberBro}
						alt="Thumbs up plumber"
						className="w-108 h-102 xl:h-90 object-cover"
					/>
				</div>

				{/* Header + Text */}
				<div className="flex-1 py-16">
					<h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
						Why Choose Us?
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h4>

					<p className="text-[#2B2B2B] mb-6">
						For over 20 years, Puget Sound Plumbing and Heating has been Seattle’s trusted, family-run choice for reliable home comfort solutions. Our licensed professionals deliver expert workmanship, honest pricing, and outstanding customer care on every job. Whether it’s a minor repair or an urgent emergency, we’re available 24/7 to keep your home safe, comfortable, and running smoothly.
					</p>
					{/* Right-aligned button */}
					<div className="flex justify-end">
						<a href="#" className="text-[#0C2D70] font-semibold flex items-center gap-1 hover:underline transition-colors whitespace-nowrap">
							Learn More
							<FaArrowRight className="ml-1"/>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}