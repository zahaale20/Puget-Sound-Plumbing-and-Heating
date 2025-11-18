import team from "../../../../assets/team.png";

export default function History() {
	return (
		<div className="flex flex-col max-w-7xl mx-auto px-6 gap-12">

			{/* Image */}
			<div className="flex justify-center w-full">
				<img
					src={team}
					alt="Our history team"
					className="w-full w-full h-auto object-cover"
				/>
			</div>

			<div>
				{/* Header */}
				<h4 className="text-[#0C2D70] relative inline-block pb-2 mb-6">
					Our History
					<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
				</h4>

				{/* Text */}
				<div className="text-[#2B2B2B] space-y-6">
					<p>
						Puget Sound Plumbing & Heating was founded in the early 2000s by a local Seattle family with decades of combined experience in plumbing and mechanical systems. After working for larger companies throughout the Northwest, the founders set out to build a service business grounded in honesty, craftsmanship, and genuine customer care.
					</p>

					<p>
						Early growth came largely through word-of-mouth—neighbors recommending the company to neighbors, contractors sending difficult jobs their way, and families calling back year after year as their trusted plumbing provider.
					</p>

					<p>
						As demand increased, the company expanded from basic plumbing repairs into sewer services, water heater installations, heating solutions, and full-service residential plumbing. Even as the team grew, Puget Sound Plumbing & Heating stayed rooted in its founding values of treating every customer like part of the community.
					</p>

					<p>
						By the 2010s, the company had become known throughout Seattle and the wider Puget Sound region, serving thousands of homeowners from North Seattle to Renton. Investments in training, equipment, and 24/7 service solidified their reputation for reliability and expertise.
					</p>

					<p>
						Now with over 20 years of continuous service, Puget Sound Plumbing & Heating remains proudly family-owned and operated. Many long-time team members still serve the community, and many customers have relied on the company for more than a decade.
					</p>

					<p>
						Today, the company continues to uphold its original principles—quality workmanship, honest communication, and dependable solutions that keep Seattle homes safe, warm, and comfortable.
					</p>
				</div>
			</div>
		</div>
	);
}
