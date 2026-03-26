
import { useState, useEffect } from "react";
import OurMission from "../components/OurMission";
import OurHistory from "../components/OurHistory";
import OurTeam from "../components/OurTeam";
import ServiceCategories from "../components/ServiceCategories";
import ServiceAreas from "../components/ServiceAreas";
import { getCloudFrontUrl } from "../api/imageService";

export default function AboutUsPage() {
	const [patternUrl, setPatternUrl] = useState(null);
	const [skylineUrl, setSkylineUrl] = useState(null);

	useEffect(() => {
		setPatternUrl(getCloudFrontUrl("private/pattern1.png"));
		setSkylineUrl(getCloudFrontUrl("private/seattle-skyline.png"));
	}, []);

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Header Section */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: patternUrl ? `url(${patternUrl})` : "none", backgroundColor: "#0C2D70" }}
			>
				{/* Header Content Container */}
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					{/* Title */}
					<h3 className="relative inline-block pb-2 w-fit">
						About Us
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					{/* Description */}
					<p className="relative inline-block">
						Learn about our history, values, and commitment to delivering trusted, high-quality plumbing and heating services backed by over 20 years of local expertise.
					</p>
				</div>
			</section>

			<section className="flex justify-center w-full bg-white py-16">
				<OurMission />
			</section>

			<section className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B]" style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}>
				<OurHistory />
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<OurTeam />
			</section>

			<section className="flex flex-col justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B]" style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}>
				<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6 mb-12">
					<h4 className="text-[#0C2D70] pb-2">
						<span className="relative inline-block">
							Our Services
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
						</span>
					</h4>

					<p className="text-[#2B2B2B]">
						Your home deserves work done right. We deliver professional plumbing and heating services across the Puget Sound, backed by skilled technicians and decades of expertise. From small repairs to full system replacements, our team focuses on long-term reliability, safety, and comfort in every job we complete.
					</p>
				</div>

				<ServiceCategories />
			</section>

			<section className="flex flex-col justify-center w-full bg-[#F5F5F5] py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 gap-6 mb-12">
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

				<ServiceAreas />
			</section>
		</div>
	);
}
