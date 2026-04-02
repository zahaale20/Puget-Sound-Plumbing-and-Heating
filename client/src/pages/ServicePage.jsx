import { useParams } from "react-router-dom";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";

import ScheduleOnline from "../components/forms/ScheduleOnline";
import { getCloudFrontUrl } from "../services/imageService";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import { ServiceLinks } from "../data/data";
import NotFoundPage from "./NotFoundPage";

export default function ServicePage() {
	const { categorySlug, serviceSlug } = useParams();

	const category = ServiceLinks.find((item) => item.href.split("/")[2] === categorySlug);

	const service = category
		? category.submenu.find((item) => item.href.split("/").pop() === serviceSlug)
		: null;

	if (!category || !service) return <NotFoundPage />;

	const serviceName = service.name;
	const serviceDescription = service?.description || "";
	const serviceImageKey = service?.image ? `private/${service.image}` : null;

	const problems = service?.problems || [];
	const phone = "(209) 938-3219";
	const preventionTips = service?.prevention || [
		"Schedule annual professional inspections to catch minor wear before it leads to system failure.",
		"Address small drips or odd noises immediately to prevent expensive emergency repairs.",
		"Keep the area around your main units clear to ensure proper ventilation and easy technician access.",
	];

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* 1. Header (Pattern Background) */}
			<section className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16">
				<img
					src={getCloudFrontUrl("private/pattern1.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white text-center md:text-left">
					<h3 className="relative inline-block pb-2 w-fit tracking-tight">
						{serviceName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
					</h3>
					<p className="leading-relaxed">
						{serviceDescription ||
							`Professional ${serviceName.toLowerCase()} solutions for homeowners throughout the Greater Seattle area.`}
					</p>
				</div>
			</section>

			{/* 2. Warning Signs (White Background) */}
			<section className="flex justify-center w-full py-16 bg-white">
				<div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl px-6">
					<div className="relative flex flex-col gap-6 w-full z-10">
						<h4 className="text-[#0C2D70] relative pb-2 w-fit tracking-tight">
							Warning Signs for {serviceName}
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
						</h4>

						<p className="text-[#2B2B2B] leading-relaxed">
							Identifying these red flags early helps homeowners prevent catastrophic damage:
						</p>

						<ul className="space-y-6 text-[#2B2B2B]">
							{problems.length > 0 ? (
								problems.map((problem, index) => (
									<li key={index} className="flex items-start gap-4">
										<FaExclamationTriangle
											className="text-[#B32020] mt-1 flex-shrink-0"
											size={18}
										/>
										<p>{problem}</p>
									</li>
								))
							) : (
								<li className="italic text-gray-400">
									Contact us for a professional diagnostic if your system is underperforming.
								</li>
							)}
						</ul>
					</div>

					<div className="relative h-[400px] w-full xl:w-1/2 overflow-hidden">
						{serviceImageKey && (
							<ImageWithLoader
								src={getCloudFrontUrl(serviceImageKey)}
								alt={serviceName}
								className="w-full h-full object-cover"
								loading="lazy"
							/>
						)}
					</div>
				</div>
			</section>

			{/* 3. What to Expect (Skyline Background) */}
			<section className="relative overflow-hidden w-full py-16">
				<img
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<div className="relative flex flex-col max-w-7xl mx-auto px-6 gap-6 w-full z-10">
					<h4 className="text-[#0C2D70] relative pb-2 w-fit tracking-tight">
						What To Expect From Our {serviceName} Service
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{[
							{
								step: "1",
								title: "Contact Us",
								desc: `Call ${phone}. Our dispatch team will assess your situation.`,
							},
							{
								step: "2",
								title: "Rapid Response",
								desc: "A licensed professional will arrive equipped with the right tools.",
							},
							{
								step: "3",
								title: "Diagnosis",
								desc: "The expert will explain the issue and provide a quote before work starts.",
							},
							{
								step: "4",
								title: "Repair & Cleanup",
								desc: "The technician will perform the repairs and clean up the work area.",
							},
						].map((item, i) => (
							<div key={i} className="flex flex-col gap-6 p-6 bg-white border-1 border-[#DEDEDE]">
								<div className="flex items-center gap-3">
									<span className="text-2xl font-bold text-[#0C2D70]">{item.step}.</span>
									<h5 className="text-[#0C2D70]">{item.title}</h5>
								</div>
								<p className="text-[#2B2B2B]">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 4. DIY vs Pro (#F5F5F5 Background) */}
			<section className="w-full py-16 bg-[#F5F5F5]">
				<div className="relative max-w-7xl mx-auto px-6 z-10 space-y-6">
					<div className="inline-block mx-auto w-full text-center">
						<h4 className="text-[#0C2D70] relative pb-2 tracking-tight inline-block">
							Should You DIY or Call a Pro?
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
						</h4>
					</div>

					<div className="flex flex-col gap-6 text-[#2B2B2B] leading-relaxed pb-2">
						<p>
							{serviceName} situations require immediate, expert intervention. Attempting DIY
							repairs can worsen the damage and lead to code violations.
						</p>
					</div>

					<div className="overflow-x-auto border border-gray-200">
						<table className="w-full text-left border-collapse bg-white min-w-[800px] table-fixed">
							<thead>
								<tr className="bg-[#0C2D70] text-white">
									<th className="p-5 w-1/4">Factor</th>
									<th className="p-5 w-[37.5%]">DIY Approach</th>
									<th className="p-5 w-[37.5%]">Professional Service</th>
								</tr>
							</thead>
							<tbody className="text-[#2B2B2B]">
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 font-medium">Response Speed</td>
									<td className="p-5">Immediate start, but often delayed by tool/part runs</td>
									<td className="p-5 font-medium">
										Rapid dispatch with fully equipped mobile units
									</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 font-medium">Diagnostic Depth</td>
									<td className="p-5">Symptom-based trial and error troubleshooting</td>
									<td className="p-5 font-medium">
										Root-cause identification via advanced telemetry
									</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 font-medium">Safety Standards</td>
									<td className="p-5">Exposure to high-pressure leaks or gas hazards</td>
									<td className="p-5 font-medium">Strict adherence to OSHA & safety protocols</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 font-medium">Code Integrity</td>
									<td className="p-5">Potential violations of WA building standards</td>
									<td className="p-5 font-medium">
										100% compliant with local Seattle plumbing codes
									</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 font-medium">Repair Durability</td>
									<td className="p-5">Temporary "stop-gap" fixes using retail parts</td>
									<td className="p-5 font-medium">
										Permanent solutions with industrial-grade components
									</td>
								</tr>
								<tr>
									<td className="p-5 bg-gray-50 font-medium">Liability & Coverage</td>
									<td className="p-5">Uninsured errors can lead to total loss of coverage</td>
									<td className="p-5 font-medium">
										Full commercial insurance & workmanship warranty
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* 5. Prevention Tips (White Background) */}
			<section className="flex justify-center w-full py-16 bg-white">
				<div className="relative max-w-7xl mx-auto px-6 z-10 w-full">
					<div className="flex flex-col gap-6">
						<h4 className="text-[#0C2D70] relative pb-2 w-fit tracking-tight inline-block">
							Prevention Tips for {serviceName}
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
						</h4>
						<ul className="flex flex-col gap-6">
							{preventionTips.map((tip, i) => (
								<li key={i} className="flex items-start gap-4">
									<div className="mt-1 bg-[#B32020] p-1.5 text-white flex-shrink-0">
										<FaCheck size={8} />
									</div>
									<span className="text-[#2B2B2B] leading-relaxed font-medium">{tip}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			{/* 6. Schedule Online (Skyline Background) */}
			<section className="relative overflow-hidden flex justify-center w-full py-24">
				<img
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<div className="relative z-10 w-full flex justify-center">
					<ScheduleOnline />
				</div>
			</section>
		</div>
	);
}
