import { getCloudFrontUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { OurMissionContent } from "../../data/data";

export default function OurMission() {
	return (
		<div className="flex flex-col max-w-7xl mx-auto px-6 space-y-12">
			{/* Text Section */}
			<div className="flex-1 space-y-6">
				<h4 className="text-[#0C2D70] inline-block relative pb-2">
					Our Mission
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>

				<p className="text-[#2B2B2B]">
					{OurMissionContent.description}
				</p>
			</div>

			{/* Image Section */}
			<div className="flex justify-center w-full">
				<ImageWithLoader
					src={getCloudFrontUrl("private/team2.jpeg")}
					alt="Our team"
					className="w-full h-auto object-cover"
					loading="lazy"
				/>
			</div>
		</div>
	);
}
