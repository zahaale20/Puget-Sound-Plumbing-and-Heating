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
			description: "Expert installation, maintenance, and repair for tank and tankless water heaters. We ensure reliable, energy-efficient hot water tailored to your home.",
			path: "/services/water-heaters" 
		},
		{ 
			image: faucetRepair,
			title: "Faucets", 
			description: "Professional faucet repair and replacement for kitchens, bathrooms, and utility sinks. We stop leaks, upgrade fixtures, and improve water efficiency.",
			path: "/services/faucet-repair" 
		},
		{ 
			image: toiletRepair,
			title: "Toilets", 
			description: "Fast, reliable toilet repair and replacement for leaks, clogs, and running issues. We restore efficiency and install water-saving models.",
			path: "/services/toilet-repair" 
		},
		{ 
			image: garbageDisposal,
			title: "Garbage Disposal", 
			description: "From jams to full replacements, we install and repair garbage disposals for quiet, efficient operation and long-lasting performance.",
			path: "/services/garbage-disposal" 
		},
		{ 
			image: waterFiltration,
			title: "Water Filtration Systems", 
			description: "Expert filtration installation and maintenance that removes contaminants, improves taste, and protects your plumbing and appliances.",
			path: "/services/water-filtration" 
		},
		{ 
			image: plumbingRepair,
			title: "Plumbing Repairs", 
			description: "Comprehensive repair for leaks, burst pipes, and low water pressure. Fast, affordable service to keep your plumbing system running perfectly.",
			path: "/services/plumbing-repairs" 
		},
	];

	return (
		<section className="relative flex flex-col items-center w-full py-16"
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
				<h4 className="inline-block relative pb-2">
					Our Services
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>
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
								className={`flex flex-col items-start text-left px-6 py-4 shadow-lg cursor-pointer transition-all bg-white hover:bg-[#F5F5F5] border-b-4 border-transparent hover:border-[#B32020]`}
							>
								{/* Image */}
								<div className="flex items-center justify-start w-full mb-4">
									<img
										src={service.image}
										alt={service.title}
										className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105"
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
