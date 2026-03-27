import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCloudFrontUrl } from "../services/imageService";

export default function OurServices() {
	const navigate = useNavigate();
	const [imageUrls, setImageUrls] = useState({});

	const services = [
		{
			imageKey: "private/water-heaters.png",
			imageColorKey: "private/water-heaters-color.png",
			title: "Water Heaters",
			description:
				"Expert installation, maintenance, and repair for tank and tankless water heaters. We ensure reliable, energy-efficient hot water tailored to your home.",
			path: "/services/water-heaters",
		},
		{
			imageKey: "private/faucet-repair.png",
			imageColorKey: "private/faucet-repair-color.png",
			title: "Faucets",
			description:
				"Professional faucet repair and replacement for kitchens, bathrooms, and utility sinks. We stop leaks, upgrade fixtures, and improve water efficiency.",
			path: "/services/plumbing/faucets",
		},
		{
			imageKey: "private/toilet-repair.png",
			imageColorKey: "private/toilet-repair-color.png",
			title: "Toilets",
			description:
				"Fast, reliable toilet repair and replacement for leaks, clogs, and running issues. We restore efficiency and install water-saving models.",
			path: "/services/plumbing/toilets",
		},
		{
			imageKey: "private/garbage-disposal.png",
			imageColorKey: "private/garbage-disposal-color.png",
			title: "Garbage Disposal",
			description:
				"From jams to full replacements, we install and repair garbage disposals for quiet, efficient operation and long-lasting performance.",
			path: "/services/plumbing/garbage-disposal",
		},
		{
			imageKey: "private/water-filtration.png",
			imageColorKey: "private/water-filtration-color.png",
			title: "Water Filtration Systems",
			description:
				"Expert filtration installation and maintenance that removes contaminants, improves taste, and protects your plumbing and appliances.",
			path: "/services/plumbing/water-filtration-systems",
		},
		{
			imageKey: "private/plumbing-repair.png",
			imageColorKey: "private/plumbing-repair-color.png",
			title: "Plumbing Repairs",
			description:
				"Comprehensive repair for leaks, burst pipes, and low water pressure. Fast, affordable service to keep your plumbing system running perfectly.",
			path: "/services/plumbing/plumbing-repairs",
		},
	];

	useEffect(() => {
		const loadImages = async () => {
			const entries = await Promise.all(
				services.flatMap((s) => [
					[s.imageKey, getCloudFrontUrl(s.imageKey)],
					[s.imageColorKey, getCloudFrontUrl(s.imageColorKey)],
				])
			);
			const urls = Object.fromEntries(entries);
			setImageUrls(urls);

			// Preload all images into the browser cache so hover is instant
			Object.values(urls).forEach((url) => {
				const img = new Image();
				img.src = url;
			});
		};
		loadImages();
	}, []);

	return (
		<div className="flex flex-col w-full max-w-7xl px-6 space-y-6 fade-in">
			{/* Header Container*/}
			<div className="flex flex-col space-y-6 text-center text-white">
				{/* Title */}
				<h4 className="inline-flex relative pb-2 mx-auto">
					Our Services
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>

				{/* Description */}
				<p className="inline-block relative leading-normal">
					Explore reliable plumbing and heating solutions delivered by experienced local
					technicians.
				</p>
			</div>

			{/* Services Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{services.map((service, idx) => (
					<button
						key={idx}
						onClick={() => navigate(service.path)}
						className="group relative overflow-hidden flex flex-col text-left p-6 cursor-pointer bg-white hover:bg-[#DEDEDE] border-1 border-[#DEDEDE]"
					>
						{/* Image — both variants stacked; color fades in on hover */}
						<div className="relative w-12 h-12 mb-6 shrink-0">
							<img
								src={imageUrls[service.imageKey]}
								alt={service.title}
								className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-100 group-hover:opacity-0"
							/>
							<img
								src={imageUrls[service.imageColorKey]}
								alt=""
								aria-hidden="true"
								className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100"
							/>
						</div>

						{/* Title */}
						<h5 className="text-[#2B2B2B] mb-2">{service.title}</h5>

						{/* Description */}
						<p className="text-[#2B2B2B]">{service.description}</p>
					</button>
				))}
			</div>
		</div>
	);
}
