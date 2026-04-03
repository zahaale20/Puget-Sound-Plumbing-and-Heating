import { useParams } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import ScheduleOnline from "../components/forms/ScheduleOnline";

import { getCloudFrontUrl } from "../services/imageService";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import Seo from "../components/seo/Seo";
import { buildBreadcrumbJsonLd } from "../components/seo/schema";

import { ServiceLinks } from "../data/data";
import NotFoundPage from "./NotFoundPage";

export default function ServiceCategoryPage() {
	const { categorySlug } = useParams();
	const category = ServiceLinks.find((item) => item.href.split("/").pop() === categorySlug);

	if (!category) return <NotFoundPage />;

 	const skylineUrl = getCloudFrontUrl("private/seattle-skyline.png");

	const categoryName = category.name;
	const services = category ? category.submenu : [];
	const siteUrl = (import.meta.env.VITE_SITE_URL || "https://www.pugetsoundplumbing.com").replace(/\/$/, "");
	const categoryPath = category.href;
	const categoryDescription = `Explore ${categoryName.toLowerCase()} services from Puget Sound Plumbing and Heating, including repairs, installations, and emergency support across the Seattle area.`;
	const itemListJsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `${categoryName} Services`,
		itemListElement: services.map((service, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: service.name,
			url: `${siteUrl}${service.href}`,
		})),
	};
	const breadcrumbJsonLd = buildBreadcrumbJsonLd([
		{ name: "Home", path: "/" },
		{ name: "Services", path: "/services" },
		{ name: categoryName, path: categoryPath },
	]);

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<Seo
				title={`${categoryName} Plumbing Services`}
				description={categoryDescription}
				path={categoryPath}
				jsonLd={[itemListJsonLd, breadcrumbJsonLd]}
			/>
			<section className="relative overflow-hidden bg-[#0C2D70] relative flex w-full py-16">
				<img
					src={getCloudFrontUrl("private/pattern1.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h1 className="relative inline-block pb-2 w-fit">
						{categoryName} Services
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h1>
					<p>
						Our licensed technicians provide reliable {categoryName.toLowerCase()} services
						throughout the Puget Sound region. Whether you need repairs, installations, or emergency
						service, our team delivers professional solutions designed for long-term performance and
						safety.
					</p>
				</div>
			</section>

			{services.map((service, index) => {
				const bgIndex = index % 3;

				let sectionClass = "flex justify-center w-full py-16";
				let sectionStyle = {};

				if (bgIndex === 0) {
					sectionClass += " bg-white";
				} else if (bgIndex === 1) {
					sectionClass += " bg-cover bg-bottom";
					sectionStyle = { backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" };
				} else if (bgIndex === 2) {
					sectionClass += " bg-[#F5F5F5]";
				}

				return (
					<section key={index} className={sectionClass} style={sectionStyle}>
						<div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-6 w-full gap-16 items-center">
							<div
								className={`order-2 flex justify-center shrink-0 ${index % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}
							>
								<ImageWithLoader
									src={getCloudFrontUrl("private/" + service.image)}
									alt={service.name}
									className="w-[600px] h-72 object-cover"
									loading="lazy"
								/>
							</div>

							<div
								className={`order-1 flex flex-col gap-6 ${index % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}
							>
								<h4 className="text-[#0C2D70] relative pb-2 w-fit">
									{service.name}
									<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
								</h4>

								<p className="text-[#2B2B2B] max-w-xl">{service.description}</p>

								<a
									href={service.href}
									className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline w-fit"
								>
									Learn More
									<FaArrowRight />
								</a>
							</div>
						</div>
					</section>
				);
			})}

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<img
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
