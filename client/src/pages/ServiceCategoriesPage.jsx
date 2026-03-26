import { useEffect, useState } from "react";
import ServiceCategories from "../components/ServiceCategories";
import { getSignedUrl } from "../api/imageService";

export default function ServiceCategoriesPage() {
	const [patternUrl, setPatternUrl] = useState(null);
	const [skylineUrl, setSkylineUrl] = useState(null);

	useEffect(() => {
		getSignedUrl("private/pattern1.png").then(setPatternUrl);
		getSignedUrl("private/seattle-skyline.png").then(setSkylineUrl);
	}, []);

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Header Section */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: patternUrl ? `url(${patternUrl})` : "none" }}
			>
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
			<section className="flex justify-center w-full py-16 bg-cover bg-bottom" style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}>
				<ServiceCategories />
			</section>
		</div>
	);
}
