import pattern from "../../../assets/pattern1.png";

import { ServiceLinks } from "../../header/navLinks";

export default function ServicesPage() {
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
						Our Services
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					{/* Description */}
					<p>
						At Puget Sound Plumbing & Heating, we’ve been keeping homes and businesses comfortable across the Puget Sound region for decades. From Seattle high-rises to Snohomish County neighborhoods, our licensed plumbers are ready to handle everything from emergency repairs to complete system installations.
					</p>

					<p>
						We’re proud to serve customers throughout Seattle, King County, Pierce County, and Snohomish County. Select your area below to see the full list of cities we cover.
					</p>
				</div>
			</section>

			{/* Plumbing Services Container */}
			<section className="flex justify-center w-full py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 bg-white">
					{/* Title */}
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						Local Plumbing Services in the Puget Sound
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					{/* Description */}
					<p className="text-[#2B2B2B]">
						Serving the entire Puget Sound region, Puget Sound Plumbing & Heating provides residential and commercial plumbing, 24/7 emergency repairs, water heater installation and repair, drain cleaning, pipe repair, and sewer line services. Our licensed plumbers deliver fast, dependable, and affordable solutions for every plumbing need.
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
		</div>
	);
}
