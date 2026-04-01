import { OurHistoryContent } from "../../data/data";

export default function History() {
	return (
		<div className="flex flex-col max-w-7xl mx-auto px-6 gap-12 items-center">
			<div>
				{/* Header */}
				<h4 className="text-[#0C2D70] relative inline-block pb-2 mb-6">
					Our History
					<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
				</h4>

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
