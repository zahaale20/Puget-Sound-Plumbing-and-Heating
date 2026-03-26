import { getSignedUrl } from "../api/imageService";
import { useState, useEffect } from "react";

import ServiceAreas from "../components/ServiceAreas";

export default function ServiceAreasPage() {
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
						Service Areas
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					{/* Description */}
					<p>
						At Puget Sound Plumbing & Heating, we’ve been keeping homes and businesses comfortable across the Puget Sound region for decades. From Seattle high-rises to Snohomish County neighborhoods, our licensed plumbers are ready to handle everything from emergency repairs to complete system installations. We’re proud to serve customers throughout Seattle, King County, Pierce County, and Snohomish County. Select your area below to see the full list of cities we cover.
					</p>
				</div>
			</section>

			{/* Main Content Section */}
			<section className="flex flex-col py-16 bg-cover bg-bottom text-[#2B2B2B] space-y-16" style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}>
				<ServiceAreas />
			</section>
		</div>
	);
}
