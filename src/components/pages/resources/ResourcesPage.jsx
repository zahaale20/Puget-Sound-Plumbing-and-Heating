import skyline from "../../../assets/seattle-skyline.png";
import pattern from "../../../assets/pattern1.png";

import Financing from "./components/Financing";
import DIYPlumbingPermit from "./components/DIYPlumbingPermit";
import FAQs from "./components/FAQs.jsx";
import Warranties from "./components/Warranty.jsx";

export default function ResourcesPage() {
	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Page Header Section */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none"></div>
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

			<section className="flex justify-center w-full py-16 bg-[#F5F5F5]">
				<Warranties />
			</section>

			<section className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B]" style={{ backgroundImage: `url(${skyline})` }}>
				<FAQs />
			</section>

			<section className="flex justify-center w-full py-16 bg-[#F5F5F5]">
				<DIYPlumbingPermit />
			</section>
		</div>
	);
}
