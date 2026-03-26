import LimitedTimeOffers from "../components/LimitedTimeOffers";
import { getCloudFrontUrl } from "../api/imageService";

export default function LimitedTimeOffersPage() {
	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<section className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16">
				<img
					src={getCloudFrontUrl("private/pattern1.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						Coupons
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>
					<p className="relative inline-block">
						Save on your next service with our limited time offers!
					</p>
				</div>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<img
					src={getCloudFrontUrl("private/seattle-skyline.png")}
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
