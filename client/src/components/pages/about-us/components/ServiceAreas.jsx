import { FaArrowRight } from "react-icons/fa";

import cityOfSeattle from "../../../../assets/city-of-seattle.png";
import kingCounty from "../../../../assets/king-county.png";
import pierceCounty from "../../../../assets/pierce-county.png";
import snohomishCounty from "../../../../assets/snohomish-county.png";

export default function ServiceAreas() {
	return (
		<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6">

			{/* Header Content Container */}
			<div className="flex flex-col gap-6 mb-12">
				{/* Title */}
				<h4 className="text-[#0C2D70] pb-2">
					<span className="relative inline-block">
						Service Areas
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
					</span>
				</h4>

				{/* Description */}
				<p className="text-[#2B2B2B]">
					At Puget Sound Plumbing & Heating, we’ve been keeping homes and businesses comfortable across the Puget Sound region for decades. From Seattle high-rises to Snohomish County neighborhoods, our licensed plumbers are ready to handle everything from emergency repairs to complete system installations. We’re proud to serve customers throughout Seattle, King County, Pierce County, and Snohomish County. Select your area below to see the full list of cities we cover.
				</p>
			</div>

			<div className="text-[#2B2B2B] space-y-16">
				{/* Seattle Section */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<img
								src={cityOfSeattle}
								alt="City of Seattle"
								className="h-[90px] object-contain"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">Seattle, WA</h5>
							<p>
								Seattle is our home base, and we know the plumbing challenges that come
								with older homes, new construction, and everything in between. Whether
								it’s a burst pipe on Capitol Hill, a water heater replacement in
								Ballard, or a sewer line issue in West Seattle, our team has you covered.
							</p>
						</div>
					</div>

					<div className="flex justify-end mt-1">
						<a
							href="/service-areas/seattle"
							className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
						>
							See All Seattle Neighborhoods <FaArrowRight />
						</a>
					</div>
				</div>

				{/* King County Section */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<img
								src={kingCounty}
								alt="King County"
								className="h-[90px] object-contain"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">King County, WA</h5>
							<p>
								As one of the largest counties in Washington, King County has diverse
								plumbing needs—from Redmond and Bellevue to Kent and Renton. We provide
								full-service plumbing, heating, and drain cleaning throughout the county,
								ensuring fast, reliable solutions whenever you need them.
							</p>
						</div>
					</div>

					<div className="flex justify-end mt-1">
						<a
							href="/service-areas/king-county"
							className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
						>
							See All King County Cities <FaArrowRight />
						</a>
					</div>
				</div>

				{/* Pierce County Section */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<img
								src={pierceCounty}
								alt="Pierce County"
								className="h-[90px] object-contain"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">Pierce County, WA</h5>
							<p>
								From Tacoma to Puyallup, Pierce County homeowners trust Puget Sound
								Plumbing for dependable service and honest pricing. Whether it’s routine
								maintenance, fixture installation, or an urgent late-night emergency, our
								plumbers are just a call away.
							</p>
						</div>
					</div>

					<div className="flex justify-end mt-1">
						<a
							href="/service-areas/pierce-county"
							className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
						>
							See All Pierce County Cities <FaArrowRight />
						</a>
					</div>
				</div>

				{/* Snohomish County Section */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-col sm:flex-row sm:items-start gap-12">
						<div className="hidden sm:block flex-shrink-0">
							<img
								src={snohomishCounty}
								alt="Snohomish County"
								className="h-[90px] object-contain"
							/>
						</div>
						<div className="flex-1">
							<h5 className="text-[#2B2B2B] mb-2">Snohomish County, WA</h5>
							<p>
								Serving growing communities like Everett, Lynnwood, and Marysville, our
								team brings decades of plumbing expertise to Snohomish County. We
								understand local building codes, water system requirements, and the
								unique needs of homes in the area.
							</p>
						</div>
					</div>

					<div className="flex justify-end mt-1">
						<a
							href="/service-areas/snohomish-county"
							className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
						>
							See All Snohomish County Cities <FaArrowRight />
						</a>
					</div>
				</div>

			</div>
		</div>
	);
}
