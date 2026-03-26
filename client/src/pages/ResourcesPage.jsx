import { useState, useEffect } from "react";
import Financing from "../components/Financing.jsx";
import DIYPlumbingPermit from "../components/DIYPlumbingPermit.jsx";
import Warranty from "../components/Warranty.jsx";
import { getCloudFrontUrl } from "../api/imageService";

export default function ResourcesPage() {
	const [patternUrl, setPatternUrl] = useState(null);
	const [skylineUrl, setSkylineUrl] = useState(null);

	useEffect(() => {
		setPatternUrl(getCloudFrontUrl("private/pattern1.png"));
		setSkylineUrl(getCloudFrontUrl("private/seattle-skyline.png"));
	}, []);

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: patternUrl ? `url(${patternUrl})` : "none", backgroundColor: "#0C2D70" }}
			>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						Resources
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>
					<p className="relative inline-block">
						Explore essential homeowner resources, including answers to common plumbing questions, financing options, and warranty details.
					</p>
				</div>
			</section>

			<section className="relative flex justify-center w-full py-16 bg-white text-[#2B2B2B]">
				<Financing />
			</section>

			<section
				className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B]"
				style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}
			>
				<Warranty />
			</section>

			<section className="flex justify-center w-full py-16 bg-[#F5F5F5]">
				<DIYPlumbingPermit />
			</section>
		</div>
	);
}