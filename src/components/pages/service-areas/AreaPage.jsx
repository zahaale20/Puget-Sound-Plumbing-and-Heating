import { useParams } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

import ScheduleOnline from "../home/components/ScheduleOnline";

import pattern from "../../../assets/pattern1.png";
import skyline from "../../../assets/seattle-skyline.png";

import { ServiceLinks, ServiceAreaLinks } from "../../header/navLinks";

export default function CommunityPage() {
	const { regionSlug, areaSlug } = useParams();

	const area = ServiceAreaLinks.find(
		(item) => item.name.replace(/\s+/g, "-").toLowerCase() === regionSlug
	);

	const areaName = area ? area.name : "Service Area";

	const community = area
		? area.areas.find(
			(item) => item.name.replace(/\s+/g, "-").toLowerCase() === areaSlug
		)
		: null;

	const communityName = community ? community.name : areaSlug || "Community";

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
						Professional Plumbers In {communityName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>

					{/* Description */}
					<p className="relative inline-block">
						When plumbing or heating problems disrupt your home, you need a team you can count on. At Puget Sound Plumbing & Heating, we’ve been serving {communityName} in {areaName} for more than 20 years. From emergency plumbing repairs to full system installations, our licensed and experienced technicians are available 24/7 to deliver fast, reliable service with guaranteed results.
					</p>
				</div>
			</section>

			{/* Plumbing Services Container */}
			<section className="flex justify-center w-full py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 bg-white">
					{/* Title */}
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						Reliable Plumbing Services in {communityName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					{/* Description */}
					<p className="text-[#2B2B2B]">
						No matter the size of the job, our team has the tools and expertise to get it done right. We proudly offer:
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

			{/* Why Choose Section */}
			<section className="flex justify-center w-full py-16 bg-[#F5F5F5]">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6">
					{/* Title */}
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						Why {communityName} Residents Trust Puget Sound Plumbing
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>

					{/* Reasons List */}
					<ul className="pl-0 space-y-4 text-[#2B2B2B]" role="list">
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" aria-hidden="true" />
							<strong>24/7 Emergency Plumbing</strong> – Fast response for leaks, clogs, and burst pipes.
						</li>
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" aria-hidden="true" />
							<strong>Licensed Local Plumbers</strong> – Certified and trusted across Seattle and King County.
						</li>
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" aria-hidden="true" />
							<strong>Transparent Pricing</strong> – Affordable plumber Seattle services with no hidden fees.
						</li>
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" aria-hidden="true" />
							<strong>Comprehensive Services</strong> – Drain cleaning, water heater repair, sewer line work, and more.
						</li>
						<li className="flex items-start gap-2">
							<FaCheck className="text-[#B32020] mt-1" aria-hidden="true" />
							<strong>Proven Local Expertise</strong> – Serving Seattle, Bellevue, Redmond, and King County for 20+ years.
						</li>
					</ul>
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
