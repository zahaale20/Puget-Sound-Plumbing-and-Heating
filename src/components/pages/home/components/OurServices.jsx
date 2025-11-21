import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

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
			path: "/services/plumbing/faucet" 
		},
		{ 
			image: toiletRepair,
			title: "Toilets", 
			description: "Fast, reliable toilet repair and replacement for leaks, clogs, and running issues. We restore efficiency and install water-saving models.",
			path: "/services/plumbing/toilet" 
		},
		{ 
			image: garbageDisposal,
			title: "Garbage Disposal", 
			description: "From jams to full replacements, we install and repair garbage disposals for quiet, efficient operation and long-lasting performance.",
			path: "/services/plumbing/garbage-disposal" 
		},
		{ 
			image: waterFiltration,
			title: "Water Filtration Systems", 
			description: "Expert filtration installation and maintenance that removes contaminants, improves taste, and protects your plumbing and appliances.",
			path: "/services/water-filtration-systems" 
		},
		{ 
			image: plumbingRepair,
			title: "Plumbing Repairs", 
			description: "Comprehensive repair for leaks, burst pipes, and low water pressure. Fast, affordable service to keep your plumbing system running perfectly.",
			path: "/services/plumbing-repairs" 
		},
	];

	return (
		<div className="flex flex-col w-full max-w-7xl px-6 space-y-6">
			{/* Header Container */}
			<div className="space-y-6 text-center text-white">
				{/* Title */}
				<h4 className="inline-block relative pb-2">
					Our Services
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>
				
				{/* Description */}
				<p>
					Explore reliable plumbing and heating solutions delivered by experienced local technicians.
				</p>
			</div>

			{/* Services Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{services.map((service, idx) => {
					return (
						// Service Button
						<button
							key={idx}
							onClick={() => navigate(service.path)}
							onMouseEnter={() => setHoveredIndex(idx)}
							onMouseLeave={() => setHoveredIndex(null)}
							className={`flex flex-col text-left p-6 cursor-pointer bg-white hover:bg-[#F5F5F5] border-b-4 border-transparent hover:border-[#B32020] shadow-lg`}
						>
							{/* Image */}
							<div className="flex items-center justify-start w-full mb-6">
								<img
									src={service.image}
									alt={service.title}
									className="w-10 h-10 object-contain"
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
					);
				})}
			</div>
		</div>
	);
}
