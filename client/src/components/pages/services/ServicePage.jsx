import { useParams } from "react-router-dom";
import { FaCheck, FaPhoneAlt, FaExclamationTriangle, FaChevronRight, FaChevronDown } from "react-icons/fa";

import ScheduleOnline from "../home/components/ScheduleOnline";

import pattern from "../../../assets/pattern1.png";
import skyline from "../../../assets/seattle-skyline.png";

import { ServiceLinks } from "../../header/navLinks";

export default function ServicePage() {
    const { categorySlug, serviceSlug } = useParams();

    const category = ServiceLinks.find(
        (item) => item.href.split("/")[2] === categorySlug
    );

    const service = category
        ? category.submenu.find(
            (item) => item.href.split("/").pop() === serviceSlug
        )
        : null;

    const serviceName = service ? service.name : "Service Not Found";
    const serviceDescription = service?.description || "";
    const serviceImage = service?.image || pattern;
    const problems = service?.problems || [];
    const phone = "(209) 938-3219";
    const preventionTips = service?.prevention || [
        "Schedule annual professional inspections to catch minor wear before it leads to system failure.",
        "Address small drips or odd noises immediately to prevent expensive emergency repairs.",
        "Keep the area around your main units clear to ensure proper ventilation and easy technician access."
    ];

    return (
        <div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">

            {/* 1. Header */}
            <section
                className="relative flex w-full py-16 bg-cover bg-bottom"
                style={{ backgroundImage: `url(${pattern})` }}
            >
                <div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white text-center md:text-left">
                    <h3 className="relative inline-block pb-2 w-fit uppercase tracking-tight">
                        {serviceName}
                        <span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
                    </h3>
                    <p className="leading-relaxed">
                        {serviceDescription || `Professional ${serviceName.toLowerCase()} solutions for homeowners throughout the Greater Seattle area. We provide rapid response and expert technical support to keep your home safe and functional.`}
                    </p>
                </div>
            </section>

            {/* 2. Warning Signs */}
            <section 
                className="flex justify-center w-full py-16 bg-cover bg-bottom relative"
                style={{ backgroundImage: `url(${skyline})` }}
            >
                <div className = "flex flex-col xl:flex-row gap-6 w-full max-w-7xl px-6">
                    <div className="relative flex flex-col gap-6 w-full z-10">
                        <h4 className="text-[#0C2D70] relative pb-2 w-fit uppercase tracking-tight">
                            Warning Signs for {serviceName}
                            <span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
                        </h4>

                        <p className="text-[#2B2B2B] leading-relaxed">
                            Identifying these red flags early helps home and business owners prevent 
                            catastrophic water damage and expensive structural repairs:
                        </p>

                        <ul className="space-y-6 text-[#2B2B2B]">
                            {problems.length > 0 ? (
                                problems.map((problem, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <FaExclamationTriangle className="text-[#B32020] mt-1 flex-shrink-0"  size={18} />
                                        <p>{problem}</p>
                                    </li>
                                ))
                            ) : (
                                <li className="italic text-gray-500">Contact us for a professional diagnostic if your system is underperforming.</li>
                            )}
                        </ul>
                    </div>

                    <div className="relative h-[400px] overflow-hidden">
                        <img
                            src={serviceImage}
                            alt={serviceName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* 3. What to Expect From Our Service */}
            <section className="w-full py-16 bg-[#F5F5F5]">
                <div className="relative flex flex-col max-w-7xl mx-auto px-6 gap-6 w-full z-10">
                    <div className="inline-block mx-auto">
						<h4 className="text-[#0C2D70] relative pb-2 uppercase tracking-tight">
							What To Expect From Our {serviceName} Service
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
						</h4>
					</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { 
                                step: "1", 
                                title: "Contact Us", 
                                desc: `Call ${phone}. Our dispatch team will immediately assess your situation and send the nearest plumber to your location.` 
                            },
                            { 
                                step: "2", 
                                title: "Rapid Response", 
                                desc: "A licensed plumber will arrive at your property, equipped with the right tools and parts to handle your emergency on the spot." 
                            },
                            { 
                                step: "3", 
                                title: "Diagnosis", 
                                desc: "The expert will assess the situation, contain any damage, explain the issue, and provide a quote before starting work." 
                            },
                            { 
                                step: "4", 
                                title: "Repair & Cleanup", 
                                desc: "The technician will perform the necessary repairs, test the system to ensure it's fully functional, and clean up the work area before leaving." 
                            }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-3 p-4 text-[#2B2B2B]">
                                <h5>{item.step}. {item.title}</h5>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Should You DIY or Call a Pro? */}
			<section className="w-full py-16 bg-white">
				<div className="relative max-w-7xl mx-auto px-6 z-10 space-y-6">
					<div className="inline-block mx-auto w-full text-center">
						<h4 className="text-[#0C2D70] relative pb-2 uppercase tracking-tight inline-block">
							Should You DIY or Call a Pro?
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
						</h4>
					</div>
					
					<div className="flex flex-col gap-6 text-[#2B2B2B] leading-relaxed pb-2">
                        <p>
                            {serviceName} situations require immediate, expert intervention. Attempting DIY repairs during a plumbing or HVAC emergency can worsen the damage, create safety hazards, and significantly increase repair costs. A licensed professional has the training to quickly identify the source of the problem, the specialized equipment to make lasting repairs under pressure, and the knowledge of local building codes to ensure all work is done safely.
                        </p>
                        <p>
                            Professional technicians also carry liability insurance, protecting you from additional costs if something goes wrong during the repair. Most importantly, they can identify secondary damage — such as water infiltration into walls or structural concerns — that untrained homeowners might miss. The cost of professional service is always less than the cost of the damage that continues while you try to figure it out yourself.
                        </p>
                    </div>
					
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse bg-white">
							<thead>
								<tr className="bg-[#0C2D70] text-white tracking-wider">
									<th className="p-5 border-b border-white/10">Factor</th>
									<th className="p-5 border-b border-white/10">DIY Approach</th>
									<th className="p-5 border-b border-white/10">Professional Service</th>
								</tr>
							</thead>
							<tbody className="text-[#2B2B2B]">
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 tracking-tighter">Response Speed</td>
									<td className="p-5">Immediate start, but often delayed by tool/part runs</td>
									<td className="p-5">Rapid dispatch with fully equipped mobile units</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 tracking-tighter">Diagnostic Depth</td>
									<td className="p-5">Symptom-based trial and error troubleshooting</td>
									<td className="p-5">Root-cause identification via advanced telemetry</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 tracking-tighter">Safety Standards</td>
									<td className="p-5">Exposure to high-pressure leaks or gas hazards</td>
									<td className="p-5">Strict adherence to OSHA & safety protocols</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 tracking-tighter">Code Integrity</td>
									<td className="p-5">Potential violations of WA building standards</td>
									<td className="p-5">100% compliant with local Seattle plumbing codes</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="p-5 bg-gray-50 tracking-tighter">Repair Durability</td>
									<td className="p-5">Temporary "stop-gap" fixes using retail parts</td>
									<td className="p-5">Permanent solutions with industrial-grade components</td>
								</tr>
								<tr>
									<td className="p-5 bg-gray-50 tracking-tighter">Liability & Coverage</td>
									<td className="p-5">Uninsured errors can lead to total loss of coverage</td>
									<td className="p-5">Full commercial insurance & workmanship warranty</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

            {/* 5. Prevention Tips */}
            <section 
                className="flex justify-center w-full py-16 bg-cover bg-bottom relative"
                style={{ backgroundImage: `url(${skyline})` }}
            >
                <div className="relative max-w-7xl mx-auto px-6 z-10 w-full">
                    <div className="flex flex-col gap-6">
						<h4 className="text-[#0C2D70] relative pb-2 w-fit uppercase tracking-tight inline-block">
							Prevention Tips for {serviceName}
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
						</h4>
                        <p className="text-[#2B2B2B]">Taking these simple steps today can save you from an emergency {serviceName.toLowerCase()} call tomorrow:</p>
                        <ul className="flex flex-col gap-6">
                            {preventionTips.map((tip, i) => (
                                <li key={i} className="flex items-start jutify-center gap-4 group">
                                    <div className="mt-1 bg-[#B32020] p-1.5 rounded-full text-white">
                                        <FaCheck size={8} />
                                    </div>
                                    <span className="text-[#2B2B2B] leading-relaxed font-medium">
                                        {tip}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 6. Schedule Online - BACKGROUND: #F5F5F5 (Repeat Cycle / End) */}
            <section className="flex justify-center w-full py-24 bg-[#F5F5F5]">
                <ScheduleOnline />
            </section>
        </div>
    );
}