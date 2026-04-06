import { getCloudFrontUrl } from "../services/imageService";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import { PageTitle } from "../components/ui/UnderlinedHeading";

import ServiceAreas from "../components/sections/ServiceAreas";

export default function ServiceAreasPage() {
	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Header Section */}
			<section className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				{/* Header Content Container */}
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					{/* Title */}
					<PageTitle>Service Areas</PageTitle>

					{/* Description */}
					<p>
						At Puget Sound Plumbing & Heating, we’ve been keeping homes and businesses comfortable
						across the Puget Sound region for decades. From Seattle high-rises to Snohomish County
						neighborhoods, our licensed plumbers are ready to handle everything from emergency
						repairs to complete system installations. We’re proud to serve customers throughout
						Seattle, King County, Pierce County, and Snohomish County. Select your area below to see
						the full list of cities we cover.
					</p>
				</div>
			</section>

			{/* Main Content Section */}
			<section className="relative overflow-hidden flex flex-col py-16 text-[#2B2B2B] space-y-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<ServiceAreas />
			</section>
		</div>
	);
}
