import OurMission from "../components/sections/OurMission";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import OurHistory from "../components/sections/OurHistory";
import OurTeam from "../components/sections/OurTeam";
import ServiceCategories from "../components/sections/ServiceCategories";
import ServiceAreas from "../components/sections/ServiceAreas";
import { getCloudFrontUrl } from "../services/imageService";

export default function AboutUsPage() {
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
					<h1 className="relative inline-block pb-2 w-fit text-2xl md:text-3xl font-semibold">
						About Us
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h1>

					{/* Description */}
					<p className="relative inline-block">
						Learn about our history, values, and commitment to delivering trusted, high-quality
						plumbing and heating services backed by over 20 years of local expertise.
					</p>
				</div>
			</section>

			<section className="flex justify-center w-full bg-white py-16">
				<OurMission />
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16 text-[#2B2B2B]">
				<ImageWithLoader
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<OurHistory />
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<OurTeam />
			</section>

			<section className="relative overflow-hidden flex flex-col justify-center w-full py-16 text-[#2B2B2B]">
				<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6 mb-12">
					<h4 className="text-[#0C2D70] pb-2">
						<span className="relative inline-block">
							Our Services
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
						</span>
					</h4>

					<p className="text-[#2B2B2B]">
						Your home deserves work done right. We deliver professional plumbing and heating
						services across the Puget Sound, backed by skilled technicians and decades of expertise.
						From small repairs to full system replacements, our team focuses on long-term
						reliability, safety, and comfort in every job we complete.
					</p>
				</div>

				<ServiceCategories />
			</section>

			<section className="relative overflow-hidden flex flex-col justify-center w-full py-16 text-[#2B2B2B]">
				<ImageWithLoader
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<div className="relative z-10 flex flex-col max-w-7xl mx-auto px-6 gap-6 mb-12">
					{/* Title */}
					<h4 className="text-[#0C2D70] pb-2">
						<span className="relative inline-block">
							Service Areas
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
						</span>
					</h4>

					{/* Description */}
					<p className="text-[#2B2B2B]">
						At Puget Sound Plumbing & Heating, we’ve been keeping homes and businesses comfortable
						across the Puget Sound region for decades. From Seattle high-rises to Snohomish County
						neighborhoods, our licensed plumbers are ready to handle everything from emergency
						repairs to complete system installations. We’re proud to serve customers throughout
						Seattle, King County, Pierce County, and Snohomish County. Select your area below to see
						the full list of cities we cover.
					</p>
				</div>

				<div className="relative z-10">
					<ServiceAreas />
				</div>
			</section>
		</div>
	);
}
