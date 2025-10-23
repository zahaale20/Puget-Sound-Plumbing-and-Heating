import { FaRegCalendarAlt, FaPhone } from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";

import hero from "../../../../../assets/hero.png";

export default function Hero() {
    return (
		<section
			className="relative flex flex-col items-center w-full h-[calc(100vh-100px)] sm:h-[calc(100vh-160px)] overflow-hidden mt-[100px] sm:mt-[160px]"
			style={{
				backgroundImage: `url(${hero})`,
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center right",
				backgroundSize: "cover",
			}}
		>

            {/* Overlay for contrast */}
            <div className="absolute inset-0 bg-white/80 lg:bg-white/0 lg:bg-[linear-gradient(to_right,white_0%,white_40%,transparent_65%)]"></div>

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col justify-between w-full h-full max-w-7xl px-8 gap-12">
                <div className="flex flex-col justify-center w-full h-full lg:w-3/5">
                    <h6 className="text-[#0C2D70] uppercase mb-8">
                        The sound solution to your plumbing problems
                    </h6>

                    <h1 className="text-[#0C2D70] mb-8">
                        Seattle's Trusted Plumbing and Heating Professionals
                    </h1>

                    <div className="space-y-3 mb-12">
                        {[
                            "Fully Insured & Licensed",
                            "Dependable & Experienced",
                            "100% Satisfaction Guarantee",
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <i className="fa-solid fa-check text-xl text-[#B32020]"></i>
                                <span className="text-lg text-[#2B2B2B]">{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center rounded-lg px-6 py-3 text-base md:px-8 md:py-4 md:text-lg font-bold cursor-pointer transition-all duration-300 transform whitespace-nowrap h-[60px] text-white bg-[#B32020] hover:bg-[#7a1515] gap-2">
                            <FaRegCalendarAlt />
                            <span>Schedule Online</span>
                        </button>

                        <button className="flex items-center rounded-lg px-6 py-3 text-base md:px-8 md:py-4 md:text-lg font-bold cursor-pointer transition-all duration-300 transform whitespace-nowrap h-[60px] text-white bg-[#0C2D70] hover:bg-[#081a46] gap-2">
                            <FaPhone />
                            <span>Call (866) 582-4730</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
