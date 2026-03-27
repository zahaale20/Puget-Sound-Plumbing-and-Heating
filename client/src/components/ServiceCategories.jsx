import { FaArrowRight } from "react-icons/fa";

import { getCloudFrontUrl } from "../api/imageService";
import { ImageWithLoader } from "./ui/LoadingComponents";

import { ServiceLinks } from "../data/data";

export default function ServiceCategories() {
	return (
		<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6">
			<div className="text-[#2B2B2B] space-y-16">
				{/* Plumbing Services */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<ImageWithLoader
								src={getCloudFrontUrl("private/plumbing-repair-color.png")}
								alt="Plumbing Services"
								className="h-[90px] object-contain"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">{ServiceLinks[0].name}</h5>
							<p>
								Our plumbing team handles repairs, replacements, leak diagnostics, fixture
								installations, and remodel support. Whether you're dealing with unexpected drips or
								major water line issues, we deliver dependable, long-lasting solutions for your
								home. We also help you plan proactive upgrades and maintenance so small issues don’t
								turn into costly emergencies later on.
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
								src={getCloudFrontUrl("private/drain-and-sewer-color.png")}
								alt="Drain and Sewer Services"
								className="h-[90px] object-contain"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">{ServiceLinks[1].name}</h5>
							<p>
								From kitchen drains to main sewer lines, our specialists clear clogs, eliminate
								backups, and repair damaged piping using advanced diagnostics to protect your home
								from water damage. We identify the root cause of recurring issues and offer
								long-term solutions, not just quick fixes, so your drainage system keeps working
								smoothly.
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
								src={getCloudFrontUrl("private/water-heaters-color.png")}
								alt="Water Heater Services"
								className="h-[90px] object-contain"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">{ServiceLinks[2].name}</h5>
							<p>
								We install, repair, and maintain tank and tankless water heaters, ensuring safe
								installation, proper sizing, and reliable performance for consistent hot water
								year-round. Our technicians help you choose the right system for your household,
								focusing on efficiency, lifespan, and total cost of ownership over time.
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
								src={getCloudFrontUrl("private/heating-and-cooling-color.png")}
								alt="Heating and Cooling Services"
								className="h-[90px] object-contain"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">{ServiceLinks[3].name}</h5>
							<p>
								We maintain and repair AC units, heat pumps, and furnaces, optimizing energy
								efficiency and indoor comfort through expert diagnostics and high-quality system
								care. Whether you need seasonal tune-ups or emergency service, we focus on safe
								operation, consistent temperatures, and lower utility costs wherever possible.
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
