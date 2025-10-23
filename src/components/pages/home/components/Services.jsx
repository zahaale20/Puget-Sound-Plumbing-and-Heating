import { useState } from "react";
import { useNavigate } from "react-router-dom";

import pattern from "../../../../assets/pattern1.png";
import waterHeaters from "../../../../assets/water-heaters.png";
import faucetRepair from "../../../../assets/faucet-repair.png";
import toiletRepair from "../../../../assets/toilet-repair.png";
import garbageDisposal from "../../../../assets/garbage-disposal.png";
import waterFiltration from "../../../../assets/water-filtration.png";
import plumbingRepair from "../../../../assets/plumbing-repair.png";

export default function Services() {
	const navigate = useNavigate();
	const [hoveredIndex, setHoveredIndex] = useState(null);

	const services = [
		{ 
			image: waterHeaters,
			title: "Water Heaters", 
			description: "Expert installation, maintenance, and repair for both tank and tankless water heaters. Our licensed plumbers ensure reliable, energy-efficient hot water tailored to your home’s needs.",
			path: "/services/water-heaters" 
		},
		{ 
			image: faucetRepair,
			title: "Faucets", 
			description: "Professional faucet repair and replacement for kitchens, bathrooms, and utility sinks. We stop leaks, upgrade fixtures, and improve water efficiency with precision workmanship.",
			path: "/services/faucet-repair" 
		},
		{ 
			image: toiletRepair,
			title: "Toilets", 
			description: "Fast, reliable toilet repair and replacement for leaks, clogs, and running issues. Our certified plumbers restore efficiency and install water-saving models to reduce costs.",
			path: "/services/toilet-repair" 
		},
		{ 
			image: garbageDisposal,
			title: "Garbage Disposal", 
			description: "From jams to full replacements, we install and repair garbage disposals for quiet, efficient operation. Count on us for a cleaner kitchen and long-lasting plumbing performance.",
			path: "/services/garbage-disposal" 
		},
		{ 
			image: waterFiltration,
			title: "Water Filtration Systems", 
			description: "Cleaner, safer water starts with expert filtration. We install and maintain systems that remove contaminants, improve taste, and protect your plumbing and appliances.",
			path: "/services/water-filtration" 
		},
		{ 
			image: plumbingRepair,
			title: "Plumbing Repairs", 
			description: "Comprehensive plumbing repair for leaks, burst pipes, and low water pressure. Our team delivers fast, affordable service to keep your home’s plumbing system running perfectly.",
			path: "/services/plumbing-repairs" 
		},
	];

	return (
		<section
			className="relative flex flex-col items-center w-full py-16 overflow-hidden"
			style={{
				backgroundImage: `url(${pattern})`,
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "cover",
			}}
		>
			{/* Overlay */}
			<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none"></div>

			{/* Header */}
			<div className="relative z-10 w-full max-w-7xl px-6 mx-auto text-center text-white mb-8">
				<h3 className="inline-block relative pb-2">
					Our Services
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h3>
			</div>

			{/* Services Grid */}
			<div className="relative z-10 w-full max-w-7xl px-6 mx-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{services.map((service, idx) => {
						const isHovered = hoveredIndex === idx;
						const shouldDim = hoveredIndex !== null && !isHovered;

						return (
							<button
								key={idx}
								onClick={() => navigate(service.path)}
								onMouseEnter={() => setHoveredIndex(idx)}
								onMouseLeave={() => setHoveredIndex(null)}
								className={`flex flex-col items-start text-left px-6 py-4 shadow-lg cursor-pointer transition-all border-b-4 ${
									isHovered 
										? "border-[#B32020] bg-white"
										: shouldDim 
										? "border-transparent !bg-[#E2E2E2]"
										: "border-transparent bg-white"
								}`}
							>
								{/* Image */}
								<div className="flex items-center justify-start w-full mb-4">
									<img
										src={service.image}
										alt={service.title}
										className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105"
									/>
								</div>

								{/* Title */}
								<h5 className="text-[#2B2B2B] mb-2">
									{service.title}
								</h5>

								{/* Description */}
								<p className="text-[#2B2B2B] leading-snug">
									{service.description}
								</p>
							</button>
						);
					})}
				</div>
			</div>
		</section>
	);
}
