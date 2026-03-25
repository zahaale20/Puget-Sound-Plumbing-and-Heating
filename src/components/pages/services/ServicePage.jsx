import { useParams } from "react-router-dom";
import { FaCheck, FaPhoneAlt, FaExclamationTriangle } from "react-icons/fa";

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

    return (
        <div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">

            {/* 1. Header (Hero - Pattern remains static) */}
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
                className="flex flex-col justify-center w-full py-16 bg-cover bg-center relative gap-16"
                style={{ backgroundImage: `url(${skyline})` }}
            >
                <div className="relative flex flex-col max-w-7xl mx-auto px-6 gap-6 w-full z-10 h-[250px] overflow-hidden">
                    <img
                        src={serviceImage}
                        alt={serviceName}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative flex flex-col max-w-7xl mx-auto px-6 gap-6 w-full z-10">
                    <h4 className="text-[#0C2D70] relative pb-2 w-fit uppercase tracking-tight">
                        Warning Signs for {serviceName}
                        <span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
                    </h4>

                    <p className="text-[#2B2B2B] leading-relaxed">
                        Identifying these red flags early helps Greater Seattle homeowners prevent 
						catastrophic water damage and expensive structural repairs. Minor symptoms 
						often mask deeper mechanical failures that can lead to system-wide collapse. 
						If you observe these indicators in your Puget Sound property, immediate 
						intervention from a licensed specialist is required to ensure safety and 
						long-term code compliance.
                    </p>

                    <ul className="space-y-4 text-[#2B2B2B]">
                        {problems.length > 0 ? (
                            problems.map((problem, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <FaExclamationTriangle className="text-[#B32020] mt-1 flex-shrink-0" />
                                    <span>{problem}</span>
                                </li>
                            ))
                        ) : (
                            <li className="italic text-gray-500">Contact us for a professional diagnostic if your system is underperforming.</li>
                        )}
                    </ul>
                </div>
            </section>

            {/* 3. What to Expect */}
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
                                step: "01", 
                                title: "Priority Dispatch", 
                                desc: `Connect with our Seattle routing team at ${phone}. We immediately triage your situation and mobilize the closest available technician.` 
                            },
                            { 
                                step: "02", 
                                title: "On-Site Diagnosis", 
                                desc: "A licensed specialist arrives in a fully stocked mobile lab, equipped with the advanced telemetry and components required to stabilize your system." 
                            },
                            { 
                                step: "03", 
                                title: "Transparent Briefing", 
                                desc: "We provide an objective walkthrough of the mechanical failure along with a firm quote. No work begins until you have a complete overview." 
                            },
                            { 
                                step: "04", 
                                title: "Precision Restoration", 
                                desc: "Our team executes the repair using industrial-grade materials. We conclude with a safety test, system calibration, and a white-glove cleanup." 
                            }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-3 p-4 bg-white/10 text-[#2B2B2B]">
                                <h5 className="opacity-75">{item.step}</h5>
                                <h5>{item.title}</h5>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. DIY vs Pro Table */}
			<section className="w-full py-16 bg-white">
				<div className="relative max-w-7xl mx-auto px-6 z-10 space-y-6">
					<div className="inline-block mx-auto w-full text-center">
						<h4 className="text-[#0C2D70] relative pb-2 uppercase tracking-tight inline-block">
							Should You DIY or Call a Pro?
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
						</h4>
					</div>
					
					<div className="flex flex-col gap-6 text-[#2B2B2B] leading-relaxed">
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

            {/* 5. Prevention Tips - BACKGROUND: SKYLINE (Repeat Cycle) */}
            <section 
                className="flex justify-center w-full py-16 bg-cover bg-bottom relative"
                style={{ backgroundImage: `url(${skyline})` }}
            >
                <div className="relative max-w-7xl mx-auto px-6 z-10 w-full">
                    <div className="flex flex-col gap-8">
						<h4 className="text-[#0C2D70] relative pb-2 w-fit uppercase tracking-tight inline-block">
							Prevention Tips for {serviceName}
							<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
						</h4>
                        <p className="text-[#2B2B2B]">Taking these simple steps today can save you from an emergency {serviceName.toLowerCase()} call tomorrow:</p>
                        <ul className="flex flex-col gap-6">
                            {[
                                "Schedule annual inspections to catch small leaks or wear before they fail.",
                                "Know the location of your main shut-off valves and how to use them.",
                                "Avoid using harsh chemical cleaners that can corrode your piping.",
                                "Address minor issues immediately—small drips often turn into major bursts.",
                                "Keep the area around your main units clear for easy access and ventilation."
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="bg-[#B32020]/10 p-2 rounded-full">
                                        <FaCheck className="text-[#B32020]" />
                                    </div>
                                    <span className="text-[#2B2B2B]">{tip}</span>
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