import warranty from "../../../../assets/warranty.png";

export default function Warranties() {
	return (
		<div className="flex flex-row w-full max-w-7xl px-6 text-left text-[#2B2B2B] gap-16">
			<div className="hidden lg:block">
				<img
					src={warranty}
					alt="Lifetime Warranty"
					className="mt-4 w-280 h-auto object-cover"
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
						At Puget Sound Plumbing and Heating, we employ a team of fully licensed plumbers dedicated to expert craftsmanship. We are proud to stand behind every job, which is why we offer our comprehensive warranty program. This is our commitment to providing you with reliable, lasting solutions and complete peace of mind.
					</p>
				</div>

				{/* Warranty List */}
				<ul className="list-disc pl-6 space-y-3 text-[#2B2B2B]">
					<li>Lifetime warranty on water heater parts and labor (10 years on the tank)</li>
					<li>Lifetime warranty on copper water services</li>
					<li>Lifetime warranty on complete water & waste repipes</li>
					<li>Lifetime warranties on sewer replacements with all schedule 40 PVC pipes</li>
					<li>20-year warranty on PEX (Wirsbo) water services</li>
				</ul>
			</div>
		</div>
	);
}
