import { FaArrowRight } from "react-icons/fa";

import { getImageUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { SectionTitle } from "../ui/UnderlinedHeading";

export default function FAQS() {
	return (
		<div className="flex flex-col lg:flex-row w-full max-w-7xl px-6 mx-auto lg:gap-16 items-start">
			{/* Header Container */}
			<div className="space-y-6 py-16">
				{/* Title */}
				<SectionTitle as="h4">Frequently Asked Questions</SectionTitle>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					Got questions about your plumbing or heating system? We’ve heard them all — and we’ve got
					the answers. From what to do during an emergency leak to how often you should service your
					water heater, our FAQ section covers the topics our customers ask us most. Save time, get
					peace of mind, and learn how to keep your home’s systems running smoothly.
				</p>

				{/* Read Our FAQs Link */}
				<div className="flex justify-end">
					<a
						href="/faqs"
						className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline"
					>
						Read Our FAQs <FaArrowRight />
					</a>
				</div>
			</div>

			{/* Image */}
			<div className="block self-center shrink-0 pb-16 lg:pb-0">
				<ImageWithLoader
					src={getImageUrl("site/plumbing-truck.webp")}
					alt="Plumbing Truck"
					className="w-full lg:w-auto h-auto lg:h-60 object-cover"
					loading="lazy"
				/>
			</div>
		</div>
	);
}
