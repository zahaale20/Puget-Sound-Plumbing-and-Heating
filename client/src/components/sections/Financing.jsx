import { getCloudFrontUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { SectionTitle } from "../ui/UnderlinedHeading";
import { CompanyInfo, FinancingContent } from "../../data/data";

export default function Financing() {
	return (
		<div className="flex flex-row w-full max-w-7xl px-6 mx-auto gap-16 items-center">
			<div className="flex flex-col">
				<div className="w-full mb-6">
					<SectionTitle as="h4" className="mb-6">Financing</SectionTitle>
					<p className="mb-4">
						{FinancingContent.description}
					</p>
					<p>
						{FinancingContent.subDescription}
					</p>
				</div>

				<h6 className="mb-3 text-[#0C2D70]">The Benefits of Financing</h6>
				<ul className="list-disc list-inside space-y-2 mb-8 text-[#2B2B2B]">
					{FinancingContent.benefits.map((benefit, idx) => (
						<li key={idx}>
							<span>{benefit.label}:</span> {benefit.text}
						</li>
					))}
				</ul>

				<h6 className="mb-3 text-[#0C2D70]">Our Financing Partner</h6>
				<p className="mb-6 text-[#2B2B2B]">
					We are pleased to offer financing options with approved credit through{" "}
					<span>{FinancingContent.partnerName}</span>.
				</p>

				<a
					href={CompanyInfo.financingUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-center w-full sm:w-[200px] h-[50px] text-base font-semibold text-white transition-all duration-300 transform bg-[#B32020] hover:bg-[#7a1515] no-underline"
				>
					Apply Now
				</a>
			</div>

			<div className="hidden lg:block">
				<ImageWithLoader
					src={getCloudFrontUrl("private/easy-financing-available.png")}
					alt="Easy Financing Available"
					className="mt-4 w-110 h-auto object-cover"
					loading="lazy"
				/>
			</div>
		</div>
	);
}
