import { useState } from "react";
import { useNavigate } from "react-router-dom";

import waterHeaters from "../../../../assets/water-heaters.png";
import faucetRepair from "../../../../assets/faucet-repair.png";
import toiletRepair from "../../../../assets/toilet-repair.png";
import garbageDisposal from "../../../../assets/garbage-disposal.png";
import waterFiltration from "../../../../assets/water-filtration.png";
import plumbingRepair from "../../../../assets/plumbing-repair.png";

import waterHeatersColor from "../../../../assets/water-heaters-color.png";
import faucetRepairColor from "../../../../assets/faucet-repair-color.png";
import toiletRepairColor from "../../../../assets/toilet-repair-color.png";
import garbageDisposalColor from "../../../../assets/garbage-disposal-color.png";
import waterFiltrationColor from "../../../../assets/water-filtration-color.png";
import plumbingRepairColor from "../../../../assets/plumbing-repair-color.png";

export default function Services() {
	const navigate = useNavigate();
	const [hoveredIndex, setHoveredIndex] = useState(null);

	const services = [
		{ 
			image: waterHeaters,
			imageColor: waterHeatersColor,
			title: "Water Heaters", 
			description: "Expert installation, maintenance, and repair for tank and tankless water heaters. We ensure reliable, energy-efficient hot water tailored to your home.",
			path: "/services/water-heaters" 
		},
		{ 
			image: faucetRepair,
			imageColor: faucetRepairColor,
			title: "Faucets", 
			description: "Professional faucet repair and replacement for kitchens, bathrooms, and utility sinks. We stop leaks, upgrade fixtures, and improve water efficiency.",
			path: "/services/plumbing/faucet" 
		},
		{ 
			image: toiletRepair,
			imageColor: toiletRepairColor,
			title: "Toilets", 
			description: "Fast, reliable toilet repair and replacement for leaks, clogs, and running issues. We restore efficiency and install water-saving models.",
			path: "/services/plumbing/toilet" 
		},
		{ 
			image: garbageDisposal,
			imageColor: garbageDisposalColor,
			title: "Garbage Disposal", 
			description: "From jams to full replacements, we install and repair garbage disposals for quiet, efficient operation and long-lasting performance.",
			path: "/services/plumbing/garbage-disposal" 
		},
		{ 
			image: waterFiltration,
			imageColor: waterFiltrationColor,
			title: "Water Filtration Systems", 
			description: "Expert filtration installation and maintenance that removes contaminants, improves taste, and protects your plumbing and appliances.",
			path: "/services/water-filtration-systems" 
		},
		{ 
			image: plumbingRepair,
			imageColor: plumbingRepairColor,
			title: "Plumbing Repairs", 
			description: "Comprehensive repair for leaks, burst pipes, and low water pressure. Fast, affordable service to keep your plumbing system running perfectly.",
			path: "/services/plumbing-repairs" 
		},
	];

	return (
		<div className="flex flex-col w-full max-w-7xl px-6 space-y-6">
			
			{/* Header Container */}
			<div className="space-y-6 text-center text-white">
				<h4 className="inline-block relative pb-2">
					Our Services
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>

				<p>
					Explore reliable plumbing and heating solutions delivered by experienced local technicians.
				</p>
			</div>

			{/* Services Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{services.map((service, idx) => (
					<button
						key={idx}
						onClick={() => navigate(service.path)}
						onMouseEnter={() => setHoveredIndex(idx)}
						onMouseLeave={() => setHoveredIndex(null)}
						className="relative overflow-hidden flex flex-col text-left p-6 cursor-pointer bg-white hover:bg-[#DEDEDE] border-1 border-[#DEDEDE]"
					>

						{/* Image */}
						<div className="flex items-center justify-start w-full mb-6">
							<img
								src={hoveredIndex === idx ? service.imageColor : service.image}
								alt={service.title}
								className="w-12 h-12 object-contain transition-all duration-300"
							/>
						</div>

						{/* Title */}
						<h5 className="text-[#2B2B2B] mb-2">
							{service.title}
						</h5>

						{/* Description */}
						<p className="text-[#2B2B2B]">
							{service.description}
						</p>
					</button>
				))}
			</div>
		</div>
	);
}
