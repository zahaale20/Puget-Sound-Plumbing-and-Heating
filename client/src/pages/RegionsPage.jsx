import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ScheduleOnline from "../components/ScheduleOnline";
import { ServiceLinks, ServiceAreaLinks } from "../data/data";
import { getCloudFrontUrl } from "../api/imageService";

export default function RegionsPage() {
	const { regionSlug } = useParams();
	const [patternUrl, setPatternUrl] = useState(null);
	const [skylineUrl, setSkylineUrl] = useState(null);

	useEffect(() => {
		setPatternUrl(getCloudFrontUrl("private/pattern1.png"));
		setSkylineUrl(getCloudFrontUrl("private/seattle-skyline.png"));
	}, []);

	const region = ServiceAreaLinks.find(
		(item) => item.name.replace(/\s+/g, "-").toLowerCase() === regionSlug
	);

	const regionName = region ? region.name : "Service Area";
	const neighborhoods = region ? region.areas : [];

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: patternUrl ? `url(${patternUrl})` : "none", backgroundColor: "#0C2D70" }}
			>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						Professional Plumbers in {regionName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>
					<p className="relative inline-block">
						Residents and businesses across {regionName} rely on Puget Sound Plumbing & Heating for licensed, 24/7 plumbing, drain cleaning, water heater repair, and emergency services. With over 20 years of experience, our local plumbers provide fast, reliable solutions tailored to {regionName} homes and businesses.
					</p>
				</div>
			</section>

			<section className="flex justify-center w-full py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 bg-white">
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						Plumbing Services in {regionName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>
					<p className="text-[#2B2B2B]">
						We offer a complete range of plumbing and heating solutions in {regionName}, including:
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-[#2B2B2B]">
						{ServiceLinks.map((category) => (
							<div key={category.name} className="flex flex-col gap-3">
								<h6>{category.name}</h6>
								<ul className="list-disc pl-5 space-y-4 text-[#2B2B2B]">
									{category.submenu.map((item, index) => (
										<li key={index}>
											<a href={item.href} className="text-[#0C2D70] hover:underline">{item.name}</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6">
					<h4 className="text-[#0C2D70] relative pb-2 w-fit">
						{regionName} {regionName.toLowerCase() === "seattle" ? "Neighborhoods" : "Cities"} We Serve
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>
					<p className="text-[#2B2B2B]">
						We proudly serve every corner of {regionName}. Click below to explore plumbing services tailored to your neighborhood:
					</p>
					<ul className="list-disc pl-5 columns-2 md:columns-3 lg:columns-4 space-y-4 text-[#2B2B2B]">
						{neighborhoods.map((neighborhood, index) => (
							<li key={index}>
								<a href={neighborhood.href} className="text-[#0C2D70] hover:underline">{neighborhood.name}</a>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section
				className="flex justify-center w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}
			>
				<ScheduleOnline />
			</section>
		</div>
	);
}