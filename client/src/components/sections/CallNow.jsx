import { FaPhone } from "react-icons/fa";
import { getCloudFrontUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { SectionTitle } from "../ui/UnderlinedHeading";
import { CompanyInfo, CallNowContent } from "../../data/data";

export default function CallNow() {
	return (
		<div className="flex flex-col lg:flex-row w-full max-w-7xl px-6 mx-auto lg:gap-16 items-start">
			{/* Image */}
			<div className="order-2 lg:order-none block self-center lg:self-end shrink-0">
				<ImageWithLoader
					src={getCloudFrontUrl("private/woman-calling.png")}
					alt="Woman Calling Plumbers"
					className="w-auto h-80 object-cover rounded-lg"
					loading="lazy"
				/>
			</div>

			{/* Header Container */}
			<div className="order-1 lg:order-none space-y-6 py-16">
				{/* Title */}
				<SectionTitle as="h4">Call Now</SectionTitle>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					{CallNowContent.description}
				</p>

				{/* Call Now Button */}
				<a
					href={CompanyInfo.phoneTel}
					className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]"
				>
					<FaPhone />
					{CompanyInfo.phone}
				</a>
			</div>
		</div>
	);
}
