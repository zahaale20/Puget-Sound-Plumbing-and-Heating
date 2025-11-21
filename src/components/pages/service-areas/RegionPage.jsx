import { useParams } from "react-router-dom";
import ScheduleOnline from "../home/components/ScheduleOnline";

import pattern from "../../../assets/pattern1.png";
import skyline from "../../../assets/seattle-skyline.png";

import { ServiceLinks, ServiceAreaLinks } from "../../header/navLinks";

export default function CommunitiesPage() {
	const { regionSlug } = useParams();

	// Find correct area from navLinks
	const area = ServiceAreaLinks.find(
		item => item.name.replace(/\s+/g, "-").toLowerCase() === regionSlug
	);

	const regionName = area ? area.name : "Service Area"; 

	const neighborhoods = area ? area.areas : [];

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Header Section */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				{/* Header Content Container */}
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					{/* Title */}
					<h3 className="relative inline-block pb-2 w-fit">
						Professional Plumbers in {regionName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					{/* Description */}
					<p className="relative inline-block">
						Residents and businesses across {regionName} rely on Puget Sound Plumbing & Heating for licensed, 24/7 plumbing, drain cleaning, water heater repair, and emergency services. With over 20 years of experience, our local plumbers provide fast, reliable solutions tailored to {regionName} homes and businesses.
					</p>
				</div>
			</section>

			{/* Plumbing Services Container */}
			<section className="flex justify-center w-full py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 bg-white">
					{/* Title */}
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						Plumbing Services in {regionName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					{/* Description */}
					<p className="text-[#2B2B2B]">
						We offer a complete range of plumbing and heating solutions in {regionName}, including:
					</p>

					{/* Services */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-[#2B2B2B]">
					{ServiceLinks.map((category) => (
						<div key={category.name} className="flex flex-col gap-3">
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

			{/* Neighborhoods Container */}
			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 bg-[#F5F5F5]">
					{/* Title */}
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						{regionName} {regionName.toLowerCase() === "seattle" ? "Neighborhoods" : "Cities"} We Serve
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					{/* Description */}
					<p className="text-[#2B2B2B]">
						We proudly serve every corner of {regionName}. Click below to explore plumbing services tailored to your neighborhood:
					</p>

					{/* Neighborhoods */}
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

			<section 
				className="flex justify-center w-full py-16 bg-cover bg-bottom" 
				style={{ backgroundImage: `url(${skyline})` }}
			>
				<ScheduleOnline />
			</section>
		</div>
	);
}
