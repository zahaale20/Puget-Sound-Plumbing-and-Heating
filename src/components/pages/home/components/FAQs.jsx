import { FaArrowRight } from "react-icons/fa";
import plumbingTruck from "../../../../assets/plumbing-truck.png";

export default function FAQS() {
	return (
		<div className="flex flex-col lg:flex-row w-full max-w-7xl px-6 mx-auto lg:gap-16 items-start">
			{/* Header Container */}
			<div className="space-y-6 py-16">
				{/* Title */}
				<h4 className="text-[#0C2D70] inline-block relative pb-2">
					Frequently Asked Questions
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					Got questions about your plumbing or heating system? We’ve heard them all — and we’ve got the answers. From what to do during an emergency leak to how often you should service your water heater, our FAQ section covers the topics our customers ask us most. Save time, get peace of mind, and learn how to keep your home’s systems running smoothly.
				</p>

				{/* Read Our FAQs Link */}
				<div className="flex justify-end">
					<a href="/faqs" className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline">
						Read Our FAQs <FaArrowRight />
					</a>
				</div>
			</div>
			
			{/* Image */}
			<div className="block self-center shrink-0 pb-16 lg:pb-0">
				<img
					src={plumbingTruck}
					alt="Plumbing Truck"
					className="w-full lg:w-auto h-auto lg:h-60 object-cover"
				/>
			</div>
		</div>
	);
}