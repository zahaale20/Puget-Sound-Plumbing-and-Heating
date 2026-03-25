import financing from "../../../../assets/easy-financing-available.png";

export default function Financing() {
	return (
		<div className="flex flex-row w-full max-w-7xl px-6 mx-auto gap-16 items-center">
			<div className="flex flex-col">
				<div className="w-full mb-6">
					<h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
						Financing
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h4>
					<p className="mb-4">
						At Puget Sound Plumbing, we believe you shouldn’t have to delay a necessary repair or major project due to budget concerns. That’s why we offer convenient financing options to help you get the service you need—when you need it.
					</p>
					<p>
						Our simple financing solutions allow you to get the quality service and products you need today and pay for them over time.
					</p>
				</div>

				< h6 className="mb-3 text-[#0C2D70]">The Benefits of Financing</ h6>
				<ul className="list-disc list-inside space-y-2 mb-8 text-[#2B2B2B]">
					<li><span>Convenient:</span> Get the job done now and pay later.</li>
					<li><span>Simple Process:</span> Our team can walk you through the easy application.</li>
					<li><span>Affordable:</span> Choose a plan that fits your budget.</li>
				</ul>

				< h6 className="mb-3 text-[#0C2D70]">Our Financing Partner</ h6>
				<p className="mb-6 text-[#2B2B2B]">
					We are pleased to offer financing options with approved credit through{" "}
					<span>Wells Fargo</span>.
				</p>

				<button onClick={() => navigate("/schedule-online")} className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]">
					Apply Now
				</button>
			</div>

			<div className="hidden lg:block">
				<img
					src={financing}
					alt="Easy Financing Available"
					className="mt-4 w-150 h-auto object-cover"
				/>
			</div>
		</div>
	);
}
