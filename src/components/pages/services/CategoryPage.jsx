import { useParams } from "react-router-dom";
import ScheduleOnline from "../home/components/ScheduleOnline";

import pattern from "../../../assets/pattern1.png";
import skyline from "../../../assets/seattle-skyline.png";

import { ServiceLinks } from "../../header/navLinks";

export default function CategoryPage() {
	const { categorySlug } = useParams();

	const category = ServiceLinks.find(
		(item) => item.href.split("/").pop() === categorySlug
	);

	const categoryName = category ? category.name : "Service";
	const services = category ? category.submenu : [];

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">

			{/* Header */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">

					<h3 className="relative inline-block pb-2 w-fit">
						{categoryName} Services
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					<p>
						Our licensed technicians provide reliable {categoryName.toLowerCase()} services throughout the Puget Sound region. Whether you need repairs, installations, or emergency service, our team delivers professional solutions designed for long-term performance and safety.
					</p>

				</div>
			</section>

			{/* Services List */}
			<section className="flex justify-center w-full py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 bg-white">

					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						Our {categoryName} Services
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					<p className="text-[#2B2B2B]">
						We offer a full range of professional {categoryName.toLowerCase()} solutions, including:
					</p>

					<ul className="list-disc pl-5 columns-2 md:columns-3 lg:columns-4 space-y-4 text-[#2B2B2B]">
						{services.map((service, index) => (
							<li key={index}>
								<a
									href={service.href}
									className="text-[#0C2D70] hover:underline"
								>
									{service.name}
								</a>
							</li>
						))}
					</ul>

				</div>
			</section>

			{/* Schedule */}
			<section
				className="flex justify-center w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${skyline})` }}
			>
				<ScheduleOnline />
			</section>

		</div>
	);
}