import { getCloudFrontUrl } from "../../services/imageService";

export default function Financing() {
	const HEARTH_URL =
		"https://app.gethearth.com/financing/29435/47842/prequalify?utm_campaign=29435&utm_content=darkblue&utm_medium=contractor-website&utm_source=contractor&utm_term=47842";

	return (
		<div className="flex flex-row w-full max-w-7xl px-6 mx-auto gap-16 items-center">
			<div className="flex flex-col">
				<div className="w-full mb-6">
					<h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
						Financing
						<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
					</h4>
					<p className="mb-4">
						At Puget Sound Plumbing, we believe you shouldn’t have to delay a necessary repair or
						major project due to budget concerns. That’s why we offer convenient financing options
						to help you get the service you need—when you need it.
					</p>
					<p>
						Our simple financing solutions allow you to get the quality service and products you
						need today and pay for them over time.
					</p>
				</div>

				<h6 className="mb-3 text-[#0C2D70]">The Benefits of Financing</h6>
				<ul className="list-disc list-inside space-y-2 mb-8 text-[#2B2B2B]">
					<li>
						<span>Convenient:</span> Get the job done now and pay later.
					</li>
					<li>
						<span>Simple Process:</span> Our team can walk you through the easy application.
					</li>
					<li>
						<span>Affordable:</span> Choose a plan that fits your budget.
					</li>
				</ul>

				<h6 className="mb-3 text-[#0C2D70]">Our Financing Partner</h6>
				<p className="mb-6 text-[#2B2B2B]">
					We are pleased to offer financing options with approved credit through{" "}
					<span>Wells Fargo</span>.
				</p>

				<a
					href={HEARTH_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-center w-full sm:w-[200px] h-[50px] text-base font-semibold text-white transition-all duration-300 transform bg-[#B32020] hover:bg-[#7a1515] no-underline"
				>
					Apply Now
				</a>
			</div>

			<div className="hidden lg:block">
				<img
					src={getCloudFrontUrl("private/easy-financing-available.png")}
					alt="Easy Financing Available"
					className="mt-4 w-150 h-auto object-cover"
					loading="lazy"
				/>
			</div>
		</div>
	);
}
