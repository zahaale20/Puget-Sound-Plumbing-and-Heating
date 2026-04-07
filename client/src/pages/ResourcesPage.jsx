import Financing from "../components/sections/Financing.jsx";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import DIYPlumbingPermit from "../components/forms/DIYPlumbingPermit.jsx";
import Warranty from "../components/sections/Warranty.jsx";
import { PageTitle } from "../components/ui/UnderlinedHeading";
import { getImageUrl } from "../services/imageService";

export default function ResourcesPage() {
	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<section className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16">
				<ImageWithLoader
					src={getImageUrl("site/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<PageTitle>Resources</PageTitle>
					<p className="relative inline-block">
						Explore essential homeowner resources, including answers to common plumbing questions,
						financing options, and warranty details.
					</p>
				</div>
			</section>

			<section className="relative flex justify-center w-full py-16 bg-white text-[#2B2B2B]">
				<Financing />
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16 text-[#2B2B2B]">
				<ImageWithLoader
					src={getImageUrl("site/seattle-skyline.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<Warranty />
			</section>

			<section className="flex justify-center w-full py-16 bg-[#F5F5F5]">
				<DIYPlumbingPermit />
			</section>
		</div>
	);
}
