import { getCloudFrontUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { SectionTitle } from "../ui/UnderlinedHeading";
import { WarrantyContent } from "../../data/data";

export default function Warranty() {
	return (
		<div className="flex flex-row w-full max-w-7xl mx-auto px-6 text-left text-[#2B2B2B] gap-16">
			<div className="hidden lg:block">
				<ImageWithLoader
					src={getCloudFrontUrl("private/warranty.png")}
					alt="Lifetime Warranty"
					className="mt-4 w-120 h-auto object-cover"
					loading="lazy"
				/>
			</div>

			<div className="flex flex-col">
				{/* Header */}
				<div className="w-full mb-6">
					<SectionTitle as="h4" className="mb-6">Warranty</SectionTitle>
					<p>
						{WarrantyContent.description}
					</p>
				</div>

				{/* Warranty List */}
				<ul className="list-disc pl-6 space-y-3 text-[#2B2B2B]">
					{WarrantyContent.items.map((item, idx) => (
						<li key={idx}>{item}</li>
					))}
				</ul>
			</div>
		</div>
	);
}
