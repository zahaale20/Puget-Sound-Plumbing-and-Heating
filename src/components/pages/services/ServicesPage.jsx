import skyline from "../../../assets/seattle-skyline.png";
import pattern from "../../../assets/pattern1.png";

import ScheduleOnline from "../home/components/ScheduleOnline";

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
						We offer a complete range of plumbing and heating solutions in the Puget Sound, including:
					</p>
				</div>
			</section>

			{/* Plumbing Services Container */}
			<section className="flex flex-col justify-center w-full py-16 bg-white text-[#2B2B2B]">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6">
					{/* Title */}
					<h3 className="relative inline-block pb-2 w-fit text-[#0C2D70]">
						Plumbing Services in the Puget Sound
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					{/* Description */}
					<p>
						We offer a complete range of plumbing and heating solutions in the Puget Sound, including:
					</p>

					{/* Services */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-[#2B2B2B]">
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

			{/* Schedule Online Section */}
			<section 
				className="flex justify-center w-full py-16 bg-cover bg-bottom" 
				style={{ backgroundImage: `url(${skyline})` }}
			>
				<ScheduleOnline />
			</section>
		</div>
	);
}
