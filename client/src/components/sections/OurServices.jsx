import { useNavigate } from "react-router-dom";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { FaArrowRight } from "react-icons/fa";
import { SectionTitle } from "../ui/UnderlinedHeading";
import { getCloudFrontUrl } from "../../services/imageService";
import { HomeServices } from "../../data/data";

const services = HomeServices;

const optimizedIconKeyMap = {
	"private/water-heaters-color.png": "private/water-heaters-color-96.webp",
	"private/faucet-repair-color.png": "private/faucet-repair-color-96.webp",
	"private/toilet-repair-color.png": "private/toilet-repair-color-96.webp",
	"private/garbage-disposal-color.png": "private/garbage-disposal-color-96.webp",
	"private/water-filtration-color.png": "private/water-filtration-color-96.webp",
	"private/plumbing-repair-color.png": "private/plumbing-repair-color-96.webp",
};

export default function OurServices() {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col w-full max-w-7xl mx-auto px-6 space-y-6 fade-in">
			{/* Header Container*/}
			<div className="flex flex-col space-y-6 text-center text-white">
				{/* Title */}
				<SectionTitle as="h2" textColorClass="text-white" centered>
					Our Services
				</SectionTitle>

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
						className="group relative overflow-hidden flex flex-col text-left p-6 h-[280px] cursor-pointer bg-white hover:bg-[#DEDEDE] border-1 border-[#DEDEDE]"
					>
						{/* Single icon variant avoids large duplicate image downloads. */}
						<div className="relative w-12 h-12 mb-6 shrink-0">
							<ImageWithLoader
								src={getCloudFrontUrl(
									optimizedIconKeyMap[service.imageColorKey] || service.imageColorKey || service.imageKey
								)}
								alt={service.title}
								className="absolute inset-0 w-full h-full object-contain"
								loading="lazy"
								decoding="async"
								width="96"
								height="96"
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
