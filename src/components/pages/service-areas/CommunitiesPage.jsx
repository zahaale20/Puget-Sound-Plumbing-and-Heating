import { useParams } from "react-router-dom";
import ScheduleOnline from "../home/components/ScheduleOnline";

import pattern from "../../../assets/pattern1.png";

import { ServiceLinks, ServiceAreaLinks } from "../../header/navLinks";

export default function CommunitiesPage() {
	const { slug } = useParams();

	// Find correct area from navLinks
	const area = ServiceAreaLinks.find(
		item => item.name.replace(/\s+/g, "-").toLowerCase() === slug
	);

	const areaName = area ? area.name : "Service Area"; 
	let titleName = areaName;

	// Only change the MAIN TITLE → NOT the rest of the page
	if (slug === "seattle") {
		titleName = "Seattle, WA";
	}

	const neighborhoods = area ? area.areas : [];

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">

			{/* HERO */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none"></div>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">

					<h3 className="relative inline-block pb-2 w-fit">
						Professional Plumbers in {titleName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					<p className="relative inline-block">
						Puget Sound Plumbing & Heating is proud to serve the {areaName} area
						with reliable plumbing, heating, and drain services. With over 20 years
						of experience, our licensed plumbers understand the unique needs of your local homes.
					</p>

				</div>
			</section>

			{/* SERVICES */}
			<section className="flex justify-center w-full py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 bg-white">
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						Plumbing Services
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					<p className="text-[#2B2B2B]">
						We offer a complete range of plumbing and heating solutions in {areaName}, including:
					</p>

					<div className="flex flex-col md:flex-row w-full gap-8 md:justify-between text-[#2B2B2B]">
						{ServiceLinks.map((category) => (
							<div key={category.name} className="flex flex-col gap-3 w-full md:w-1/4">
								<h6>{category.name}</h6>

								<ul className="list-disc pl-5 space-y-4 text-[#2B2B2B]">
									{category.submenu.map((item, index) => (
										<li key={index}>
											<a 
												href={item.href}
												className="text-[#0C2D70] hover:underline"
											>
												{item.name}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* NEIGHBORHOODS */}
			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 bg-[#F5F5F5]">
					
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						{areaName} Neighborhoods We Serve
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					<p className="text-[#2B2B2B]">
						We provide professional and reliable service throughout the entire {areaName} area.
					</p>

					<ul className="list-disc pl-5 columns-2 md:columns-3 lg:columns-4 space-y-4 text-[#2B2B2B]">
						{neighborhoods.map((neighborhood, index) => (
							<li key={index}>
								<a 
									href={neighborhood.href}
									className="text-[#0C2D70] hover:underline"
								>
									{neighborhood.name}
								</a>
							</li>
						))}
					</ul>

				</div>
			</section>

			<ScheduleOnline />
		</div>
	);
}
