import LimitedTimeOffers from "../components/forms/LimitedTimeOffers";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import { PageTitle } from "../components/ui/UnderlinedHeading";
import { getImageUrl } from "../services/imageService";

export default function LimitedTimeOffersPage() {
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
					<PageTitle>Coupons</PageTitle>
					<p className="relative inline-block">
						Save on your next service with our limited time offers!
					</p>
				</div>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<ImageWithLoader
					src={getImageUrl("site/seattle-skyline.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<LimitedTimeOffers textColor="text-[#0C2D70]" />
			</section>
		</div>
	);
}
