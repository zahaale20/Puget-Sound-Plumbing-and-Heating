import { SectionTitle } from "../ui/UnderlinedHeading";
import { OurHistoryContent } from "../../data/data";

export default function History() {
	return (
		<div className="flex flex-col max-w-7xl mx-auto px-6 gap-12 items-center">
			<div>
				{/* Header */}
				<SectionTitle as="h4" className="mb-6">Our History</SectionTitle>

				{/* Text */}
				<div className="text-[#2B2B2B] space-y-6">
					{OurHistoryContent.map((paragraph, idx) => (
						<p key={idx}>{paragraph}</p>
					))}
				</div>
			</div>
		</div>
	);
}
