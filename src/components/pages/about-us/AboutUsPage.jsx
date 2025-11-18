import skyline from "../../../assets/seattle-skyline.png";
import pattern from "../../../assets/pattern1.png";

import CoreValues from "./components/CoreValues";
import History from "./components/History";
import MissionStatement from "./components/MissionStatement";
import ServiceAreas from "./components/ServiceAreas";

export default function AboutUsPage() {
	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Page Header Section */}
			<section
				className="relative flex w-full py-12 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none"></div>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						About Us
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					<p className="relative inline-block">
						Puget Sound Plumbing and Heating is a family-owned company with more than 20 years of experience serving the Seattle area. We’re committed to quality work, fair pricing, and unmatched customer care. From clogged drains to furnace issues, our expert team diagnoses and fixes problems efficiently and accurately.
					</p>
				</div>
			</section>

			<section className="flex justify-center w-full bg-white py-16">
				<History />
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<MissionStatement />
			</section>

			<section className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B]" style={{ backgroundImage: `url(${skyline})` }}>
				<CoreValues />
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<ServiceAreas />
			</section>
		</div>
	);
}
