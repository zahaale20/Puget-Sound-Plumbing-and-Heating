import { FaArrowRight } from "react-icons/fa";

import { getCloudFrontUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { SectionTitle } from "../ui/UnderlinedHeading";
import { WhyChooseUsContent } from "../../data/data";

export default function WhyChooseUs() {
	return (
		<div className="flex flex-col lg:flex-row w-full max-w-7xl px-6 mx-auto lg:gap-16 items-start">
			{/* Image */}
			<div className="order-2 lg:order-none block self-center lg:self-end shrink-0">
				<ImageWithLoader
					src={getCloudFrontUrl("private/plumbing-bros.png")}
					alt="Plumber Bros"
					className="w-auto h-84 object-cover"
					loading="lazy"
				/>
			</div>

			{/* Header Container */}
			<div className="order-1 lg:order-none space-y-6 py-16">
				{/* Title */}
				<SectionTitle as="h4">Why Choose Us?</SectionTitle>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					{WhyChooseUsContent.description}
				</p>

				{/* Learn More Link */}
				<div className="flex justify-end">
					<a
						href="/about-us"
						className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline"
					>
						Learn More
						<FaArrowRight />
					</a>
				</div>
			</div>
		</div>
	);
}
