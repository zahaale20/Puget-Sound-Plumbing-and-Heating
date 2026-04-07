import { FaArrowRight } from "react-icons/fa";

import { getImageUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";

import { ServiceLinks, ServiceCategoryDescriptions } from "../../data/data";

export default function ServiceCategories() {
	return (
		<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6">
			<div className="text-[#2B2B2B] space-y-16">
				{/* Plumbing Services */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<ImageWithLoader
								src={getImageUrl("site/plumbing-repair-color.webp")}
								alt="Plumbing Services"
								className="h-[90px] object-contain"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">{ServiceLinks[0].name}</h5>
							<p>
								{ServiceCategoryDescriptions.plumbing}
							</p>
						</div>
					</div>

					<div className="flex justify-end mt-1">
						<a
							href="/services/plumbing"
							className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
						>
							See All Plumbing Services <FaArrowRight />
						</a>
					</div>
				</div>

				{/* Drain & Sewer Services */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<ImageWithLoader
								src={getImageUrl("site/drain-and-sewer-color.webp")}
								alt="Drain and Sewer Services"
								className="h-[90px] object-contain"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">{ServiceLinks[1].name}</h5>
							<p>
								{ServiceCategoryDescriptions.drainAndSewer}
							</p>
						</div>
					</div>

					<div className="flex justify-end mt-1">
						<a
							href="/services/drain-and-sewer"
							className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
						>
							See All Drain & Sewer Services <FaArrowRight />
						</a>
					</div>
				</div>

				{/* Water Heaters */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<ImageWithLoader
								src={getImageUrl("site/water-heaters-color.webp")}
								alt="Water Heater Services"
								className="h-[90px] object-contain"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">{ServiceLinks[2].name}</h5>
							<p>
								{ServiceCategoryDescriptions.waterHeaters}
							</p>
						</div>
					</div>

					<div className="flex justify-end mt-1">
						<a
							href="/services/water-heaters"
							className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
						>
							See All Water Heater Services <FaArrowRight />
						</a>
					</div>
				</div>

				{/* Heating & Cooling */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<ImageWithLoader
								src={getImageUrl("site/heating-and-cooling-color.webp")}
								alt="Heating and Cooling Services"
								className="h-[90px] object-contain"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">{ServiceLinks[3].name}</h5>
							<p>
								{ServiceCategoryDescriptions.heatingAndCooling}
							</p>
						</div>
					</div>

					<div className="flex justify-end mt-1">
						<a
							href="/services/heating-and-cooling"
							className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
						>
							See All Heating & Cooling Services <FaArrowRight />
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
