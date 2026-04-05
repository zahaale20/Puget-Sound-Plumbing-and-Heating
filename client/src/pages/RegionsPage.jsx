import { useParams } from "react-router-dom";
import ScheduleOnline from "../components/forms/ScheduleOnline";
import { ServiceLinks, ServiceAreaLinks } from "../data/data";
import { getCloudFrontUrl } from "../services/imageService";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import Seo from "../components/seo/Seo";
import { buildBreadcrumbJsonLd } from "../components/seo/schema";
import NotFoundPage from "./NotFoundPage";

export default function RegionsPage() {
	const { regionSlug } = useParams();

	const region = ServiceAreaLinks.find(
		(item) => item.name.replace(/\s+/g, "-").toLowerCase() === regionSlug
	);

	if (!region) return <NotFoundPage />;

	const regionName = region.name;
	const neighborhoods = region.areas;
	const siteUrl = (import.meta.env.VITE_SITE_URL || "https://www.pugetsoundplumbing.com").replace(/\/$/, "");
	const regionPath = region.href;
	const regionJsonLd = {
		"@context": "https://schema.org",
		"@type": "Service",
		name: `Plumbing Services in ${regionName}`,
		description: `Local plumbing, drain, sewer, and water heater services in ${regionName}.`,
		provider: {
			"@type": "Plumber",
			name: "Puget Sound Plumbing and Heating",
			url: siteUrl,
		},
		areaServed: regionName,
		url: `${siteUrl}${regionPath}`,
	};
	const breadcrumbJsonLd = buildBreadcrumbJsonLd([
		{ name: "Home", path: "/" },
		{ name: "Service Areas", path: "/service-areas" },
		{ name: regionName, path: regionPath },
	]);

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<Seo
				title={`Plumbers in ${regionName}`}
				description={`Licensed local plumbers serving ${regionName} with drain, sewer, water heater, and emergency plumbing services.`}
				path={regionPath}
				jsonLd={[regionJsonLd, breadcrumbJsonLd]}
			/>
			<section className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h1 className="relative inline-block pb-2 w-fit text-2xl md:text-3xl font-semibold">
						Professional Plumbers in {regionName}
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h1>
					<p className="relative inline-block">
						Residents and businesses across {regionName} rely on Puget Sound Plumbing & Heating for
						licensed, 24/7 plumbing, drain cleaning, water heater repair, and emergency services.
						With over 20 years of experience, our local plumbers provide fast, reliable solutions
						tailored to {regionName} homes and businesses.
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
											<a href={item.href} className="text-[#0C2D70] hover:underline">
												{item.name}
											</a>
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
						{regionName} {regionName.toLowerCase() === "seattle" ? "Neighborhoods" : "Cities"} We
						Serve
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h4>
					<p className="text-[#2B2B2B]">
						We proudly serve every corner of {regionName}. Click below to explore plumbing services
						tailored to your neighborhood:
					</p>
					<ul className="list-disc pl-5 columns-2 md:columns-3 lg:columns-4 space-y-4 text-[#2B2B2B]">
						{neighborhoods.map((neighborhood, index) => (
							<li key={index}>
								<a href={neighborhood.href} className="text-[#0C2D70] hover:underline">
									{neighborhood.name}
								</a>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<ScheduleOnline />
			</section>
		</div>
	);
}
