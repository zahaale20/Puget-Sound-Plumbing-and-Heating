import { getImageUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { SectionTitle } from "../ui/UnderlinedHeading";
import { OurMissionContent } from "../../data/data";

export default function OurMission() {
	return (
		<div className="flex flex-col max-w-7xl mx-auto px-6 space-y-12">
			{/* Text Section */}
			<div className="flex-1 space-y-6">
				<SectionTitle as="h4">Our Mission</SectionTitle>

				<p className="text-[#2B2B2B]">
					{OurMissionContent.description}
				</p>
			</div>

			{/* Image Section */}
			<div className="flex justify-center w-full">
				<ImageWithLoader
					src={getImageUrl("site/team2.webp")}
					alt="Our team"
					className="w-full h-auto object-cover"
					loading="lazy"
				/>
			</div>
		</div>
	);
}
