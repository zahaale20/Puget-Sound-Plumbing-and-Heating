import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSignedUrl } from "../api/imageService";

export default function OurServices() {
	const navigate = useNavigate();
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const [imageUrls, setImageUrls] = useState({});

	const services = [
		{ 
			imageKey: "private/water-heaters.png",
			imageColorKey: "private/water-heaters-color.png",
			title: "Water Heaters", 
			description: "Expert installation, maintenance, and repair for tank and tankless water heaters. We ensure reliable, energy-efficient hot water tailored to your home.",
			path: "/services/water-heaters" 
		},
		{ 
			imageKey: "private/faucet-repair.png",
			imageColorKey: "private/faucet-repair-color.png",
			title: "Faucets", 
			description: "Professional faucet repair and replacement for kitchens, bathrooms, and utility sinks. We stop leaks, upgrade fixtures, and improve water efficiency.",
			path: "/services/plumbing/faucets" 
		},
		{ 
			imageKey: "private/toilet-repair.png",
			imageColorKey: "private/toilet-repair-color.png",
			title: "Toilets", 
			description: "Fast, reliable toilet repair and replacement for leaks, clogs, and running issues. We restore efficiency and install water-saving models.",
			path: "/services/plumbing/toilets" 
		},
		{ 
			imageKey: "private/garbage-disposal.png",
			imageColorKey: "private/garbage-disposal-color.png",
			title: "Garbage Disposal", 
			description: "From jams to full replacements, we install and repair garbage disposals for quiet, efficient operation and long-lasting performance.",
			path: "/services/plumbing/garbage-disposal" 
		},
		{ 
			imageKey: "private/water-filtration.png",
			imageColorKey: "private/water-filtration-color.png",
			title: "Water Filtration Systems", 
			description: "Expert filtration installation and maintenance that removes contaminants, improves taste, and protects your plumbing and appliances.",
			path: "/services/plumbing/water-filtration-systems" 
		},
		{ 
			imageKey: "private/plumbing-repair.png",
			imageColorKey: "private/plumbing-repair-color.png",
			title: "Plumbing Repairs", 
			description: "Comprehensive repair for leaks, burst pipes, and low water pressure. Fast, affordable service to keep your plumbing system running perfectly.",
			path: "/services/plumbing/plumbing-repairs" 
		},
	];

	useEffect(() => {
		const loadImages = async () => {
			const entries = await Promise.all(
				services.flatMap((s) => [
					getSignedUrl(s.imageKey).then((url) => [s.imageKey, url]),
					getSignedUrl(s.imageColorKey).then((url) => [s.imageColorKey, url]),
				])
			);
			setImageUrls(Object.fromEntries(entries));
		};
		loadImages();
	}, []);

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
				{services.map((service, idx) => {
					const isHovered = hoveredIndex === idx;
					const src = isHovered
						? imageUrls[service.imageColorKey]
						: imageUrls[service.imageKey];

					return (
						<button
							key={idx}
							onClick={() => navigate(service.path)}
							onMouseEnter={() => setHoveredIndex(idx)}
							onMouseLeave={() => setHoveredIndex(null)}
							className="relative overflow-hidden flex flex-col text-left p-6 cursor-pointer bg-white hover:bg-[#DEDEDE] border-1 border-[#DEDEDE]"
						>
							{/* Image */}
							<div className="flex items-center justify-start w-full mb-6">
								{src ? (
									<img
										src={src}
										alt={service.title}
										className="w-12 h-12 object-contain transition-all duration-300"
									/>
								) : (
									<div className="w-12 h-12 bg-gray-200 animate-pulse" />
								)}
							</div>

							{/* Title */}
							<h5 className="text-[#2B2B2B] mb-2">{service.title}</h5>

							{/* Description */}
							<p className="text-[#2B2B2B]">{service.description}</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}