import { useParams } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

import ScheduleOnline from "../home/components/ScheduleOnline";

import pattern from "../../../assets/pattern1.png";
import skyline from "../../../assets/seattle-skyline.png";

import { ServiceLinks } from "../../header/navLinks";

export default function ServicePage() {
	const { categorySlug, serviceSlug } = useParams();

	const category = ServiceLinks.find(
		(item) => item.name.replace(/\s+/g, "-").toLowerCase() === categorySlug
	);

	const categoryName = category ? category.name : "Service";

	const service = category
		? category.submenu.find(
			(item) => item.href.split("/").pop() === serviceSlug
		)
		: null;

	const serviceName = service ? service.name : serviceSlug;
	const serviceDescription = service?.description || "";
	const serviceImage = service?.image || pattern;
	const problems = service?.problems || [];
	const guarantees = service?.guarantees || [];

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">

			{/* Header */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						{serviceName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>
					<p>
						{serviceDescription || `Puget Sound Plumbing & Heating provides professional ${serviceName.toLowerCase()} services across the Seattle region. Our licensed technicians diagnose problems quickly and deliver dependable solutions that restore safety, comfort, and efficiency to your home.`}
					</p>
				</div>
			</section>

			{/* Common Problems */}
			<section className="flex justify-center w-full py-16 bg-white">
				<div className="flex flex-col lg:flex-row w-full max-w-7xl px-6 mx-auto lg:gap-16 items-start">
					
					{/* Image Container */}
					<div className="w-full h-full min-h-[300px] overflow-hidden">
						<img
							src={serviceImage}
							alt={serviceName}
							className="w-full h-full object-cover"
						/>
					</div>

					{/* Text Content */}
					<div className="flex flex-col gap-6">
						<h4 className="text-[#0C2D70] font-bold text-3xl relative pb-2 w-fit">
							Common Problems
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
						</h4>

						<p className="text-[#2B2B2B] leading-relaxed">
							When it comes to {serviceName.toLowerCase()}, homeowners often encounter common issues that can disrupt comfort and safety. Some of the most frequently reported problems include:
						</p>

						<ul className="space-y-4 text-[#2B2B2B]">
							{problems.map((problem, index) => (
								<li key={index} className="flex items-start gap-3">
									<FaCheck className="text-[#B32020] mt-1 flex-shrink-0" />
									<span>{problem}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			{/* Why Choose Us */}
			<section className="flex justify-center w-full py-16 bg-[#F5F5F5]">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6">
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						Why Choose Puget Sound Plumbing & Heating
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					<p className="text-[#2B2B2B]">
						When it comes to {serviceName.toLowerCase()} services, you want a team you can trust to get the job done right the first time. Here's why homeowners across the Seattle region choose Puget Sound Plumbing & Heating:
					</p>

					<ul className="space-y-4 text-[#2B2B2B]">
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" />
							<strong>Licensed Professionals</strong> – Skilled technicians experienced in modern {categoryName.toLowerCase()} systems.
						</li>
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" />
							<strong>Honest Assessments</strong> – We focus on solving the root problem instead of offering temporary fixes.
						</li>
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" />
							<strong>Transparent Pricing</strong> – Clear estimates so you know exactly what to expect.
						</li>
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" />
							<strong>Local Experience</strong> – Proudly serving homeowners across the greater Seattle area.
						</li>
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