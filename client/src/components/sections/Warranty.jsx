import { getCloudFrontUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { WarrantyContent } from "../../data/data";

export default function Warranty() {
	return (
		<div className="flex flex-row w-full max-w-7xl px-6 text-left text-[#2B2B2B] gap-16">
			<div className="hidden lg:block">
				<ImageWithLoader
					src={getCloudFrontUrl("private/warranty.png")}
					alt="Lifetime Warranty"
					className="mt-4 w-150 h-auto object-cover"
					loading="lazy"
				/>
			</div>

			<div className="flex flex-col">
				{/* Header */}
				<div className="w-full mb-6">
					<h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
						Warranty
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h4>
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
