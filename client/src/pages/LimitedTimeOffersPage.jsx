import LimitedTimeOffers from "../components/forms/LimitedTimeOffers";
import { LazyBackgroundImage } from "../components/ui/LoadingComponents";
import { PageTitle } from "../components/ui/UnderlinedHeading";
import { getCloudFrontUrl } from "../services/imageService";

export default function LimitedTimeOffersPage() {
	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<section className="w-full bg-[#0C2D70]">
				<LazyBackgroundImage
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					className="overflow-hidden flex w-full py-16"
					loading="eager"
					fetchPriority="high"
				>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<PageTitle>Coupons</PageTitle>
					<p className="relative inline-block">
						Save on your next service with our limited time offers!
					</p>
				</div>
				</LazyBackgroundImage>
			</section>

			<section className="w-full">
				<LazyBackgroundImage
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					className="overflow-hidden flex justify-center w-full py-16"
					loading="lazy"
					backgroundPosition="center bottom"
				>
				<LimitedTimeOffers textColor="text-[#0C2D70]" />
				</LazyBackgroundImage>
			</section>
		</div>
	);
}
