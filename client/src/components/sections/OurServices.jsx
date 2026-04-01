import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { getCloudFrontUrl } from "../../services/imageService";
import { HomeServices } from "../../data/data";

export default function OurServices() {
	const navigate = useNavigate();
	const [imageUrls, setImageUrls] = useState({});

	const services = HomeServices;

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

			{/* See All Services Link */}
			<div className="flex justify-end">
				<a
					href="/services"
					className="text-white font-semibold flex items-center gap-2 hover:underline"
				>
					See All Services <FaArrowRight />
				</a>
			</div>
		</div>
	);
}
