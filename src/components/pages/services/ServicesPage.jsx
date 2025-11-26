import { FaArrowRight } from "react-icons/fa";

import plumbingService from "../../../assets/plumbing-repair-color.png";
import drainAndSewerService from "../../../assets/drain-and-sewer-color.png";
import waterHeaterService from "../../../assets/water-heaters-color.png";
import heatingAndCoolingService from "../../../assets/heating-and-cooling-color.png";

import skyline from "../../../assets/seattle-skyline.png"; // Added from ServiceAreasPage reference
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
                        Your home deserves work done right. We deliver professional plumbing and heating services across the Puget Sound, backed by skilled technicians and decades of expertise. From small repairs to full system replacements, our team focuses on long-term reliability, safety, and comfort in every job we complete.
                    </p>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="flex flex-col py-16 bg-cover bg-bottom text-[#2B2B2B] space-y-16" style={{ backgroundImage: `url(${skyline})` }}>
                {/* Plumbing Services */}
                <div className="w-full max-w-7xl mx-auto px-6 text-[#2B2B2B] space-y-2">
                    {/* Top Row: Image + Text */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-12">
                        <div className="hidden sm:block flex-shrink-0">
                            <img
                                src={plumbingService}
                                alt="Plumbing Services"
                                className="h-[90px] object-contain"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h5 className="text-[#2B2B2B]">
								{ServiceLinks[0].name}
							</h5>
                            <p>
                                Our plumbing team handles repairs, replacements, leak diagnostics, fixture installations, and remodel support. Whether you're dealing with unexpected drips or major water line issues, we deliver dependable, long-lasting solutions for your home. We also help you plan proactive upgrades and maintenance so small issues don’t turn into costly emergencies later on.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Row: Button */}
                    <div className="flex justify-end">
                        <a
                            href="/services/plumbing"
                            className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
                        >
                            See All Plumbing Services <FaArrowRight />
                        </a>
                    </div>
                </div>

                {/* Drain & Sewer Services */}
                <div className="w-full max-w-7xl mx-auto px-6 text-[#2B2B2B] space-y-2">
                    {/* Top Row: Image + Text */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-12">
                        <div className="hidden sm:block flex-shrink-0">
                            <img
                                src={drainAndSewerService}
                                alt="Drain and Sewer Services"
                                className="h-[90px] object-contain"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h5 className="text-[#2B2B2B]">
								{ServiceLinks[1].name}
							</h5>
                            <p>
                                From kitchen drains to main sewer lines, our specialists clear clogs, eliminate backups, and repair damaged piping using advanced diagnostics to protect your home from water damage. We identify the root cause of recurring issues and offer long-term solutions, not just quick fixes, so your drainage system keeps working smoothly.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Row: Button */}
                    <div className="flex justify-end">
                        <a
                            href="/services/drain-and-sewer"
                            className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
                        >
                            See All Drain & Sewer Services <FaArrowRight />
                        </a>
                    </div>
                </div>

                {/* Water Heaters */}
                <div className="w-full max-w-7xl mx-auto px-6 text-[#2B2B2B] space-y-2">
                    {/* Top Row: Image + Text */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-12">
                        <div className="hidden sm:block flex-shrink-0">
                            <img
                                src={waterHeaterService}
                                alt="Water Heater Services"
                                className="h-[90px] object-contain"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h5 className="text-[#2B2B2B]">
								{ServiceLinks[2].name}
							</h5>
                            <p>
                                We install, repair, and maintain tank and tankless water heaters, ensuring safe installation, proper sizing, and reliable performance for consistent hot water year-round. Our technicians help you choose the right system for your household, focusing on efficiency, lifespan, and total cost of ownership over time.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Row: Button */}
                    <div className="flex justify-end">
                        <a
                            href="/services/water-heaters"
                            className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
                        >
                            See All Water Heater Services <FaArrowRight />
                        </a>
                    </div>
                </div>

                {/* Heating & Cooling */}
                <div className="w-full max-w-7xl mx-auto px-6 text-[#2B2B2B] space-y-2">
                    {/* Top Row: Image + Text */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-12">
                        <div className="hidden sm:block flex-shrink-0">
                            <img
                                src={heatingAndCoolingService}
                                alt="Heating and Cooling Services"
                                className="h-[90px] object-contain"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h5 className="text-[#2B2B2B]">
								{ServiceLinks[3].name}
							</h5>
                            <p>
                                We maintain and repair AC units, heat pumps, and furnaces, optimizing energy efficiency and indoor comfort through expert diagnostics and high-quality system care. Whether you need seasonal tune-ups or emergency service, we focus on safe operation, consistent temperatures, and lower utility costs wherever possible.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Row: Button */}
                    <div className="flex justify-end">
                        <a
                            href="/services/heating-and-cooling"
                            className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors whitespace-nowrap cursor-pointer"
                        >
                            See All Heating & Cooling Services <FaArrowRight />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
