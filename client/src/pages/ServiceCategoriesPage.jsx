import ServiceCategories from "../components/ServiceCategories";
import { getCloudFrontUrl } from "../api/imageService";

export default function ServiceCategoriesPage() {


	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Header Section */}
			<section
				className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16"

			>
			<img src={getCloudFrontUrl("private/pattern1.png")} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover z-0" />
			
			
			
			
				{/* Header Content Container */}
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					{/* Title */}
					<h3 className="relative inline-block pb-2 w-fit">
						Our Services
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					{/* Description */}
					<p>
						Your home deserves work done right. We deliver professional plumbing and heating services across the Puget Sound, backed by skilled technicians and decades of expertise. From small repairs to full system replacements, our team focuses on long-term reliability, safety, and comfort in every job we complete.
					</p>
				</div>
			</section>

			{/* Main Content Section */}
			<section className="relative overflow-hidden flex justify-center w-full py-16">
			<img src={getCloudFrontUrl("private/seattle-skyline.png")} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover object-bottom z-0" />
			
			
			
			
				<ServiceCategories />
			</section>
		</div>
	);
}
