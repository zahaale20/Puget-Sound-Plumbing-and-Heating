import { useParams } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
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

		{/* Services */}
		{services.map((service, index) => {
			const image = service.image;
			const bgIndex = index % 3;

			let sectionClass = "flex justify-center w-full py-16";
			let sectionStyle = {};

			if (bgIndex === 0) {
			sectionClass += " bg-white";
			} else if (bgIndex === 1) {
			sectionClass += " bg-cover bg-bottom";
			sectionStyle = { backgroundImage: `url(${skyline})` };
			} else if (bgIndex === 2) {
			sectionClass += " bg-[#F5F5F5]";
			}

			return (
			<section key={index} className={sectionClass} style={sectionStyle}>
				<div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-6 w-full gap-16 items-center">

				{/* Image */}
				<div className={`flex justify-center shrink-0 ${index % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}>
					<img src={image} alt={service.name} className="w-[600px] h-72 object-cover" />
				</div>

				{/* Content */}
				<div className={`flex flex-col gap-6 ${index % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}>
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
					{service.name}
					<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					<p className="text-[#2B2B2B] max-w-xl">
					{service.description}
					</p>

					<a
					href={service.href}
					className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline w-fit"
					>
					Learn More
					<FaArrowRight />
					</a>
				</div>

				</div>
			</section>
			);
		})}

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