import { FaRegCalendarAlt, FaUser, FaArrowRight } from "react-icons/fa";

import waterHeaters from "../../../../assets/blog1.jpg";
import faucets from "../../../../assets/blog2.jpg";
import toiletRepair from "../../../../assets/blog3.jpg";

export default function RecentBlogPosts() {
	const posts = [
		{
		id: 1,
		title: "Water Heater Repair",
		image: waterHeaters,
		author: "John Doe",
		date: "October 10, 2025",
		link: "/projects/water-heater-installation",
		description:
			"Expert repair and maintenance for tank and tankless water heaters, ensuring reliable hot water for your home.water heaters, ensuring reliable hot water for your home.water heaters, ensuring reliable hot water for your home.",
		},
		{
		id: 2,
		title: "Faucet Replacement",
		image: faucets,
		author: "Jane Smith",
		date: "October 3, 2025",
		link: "/projects/faucet-replacement",
		description:
			"Professional faucet installation and replacement, improving functionality and aesthetics in kitchens and bathrooms.",
		},
		{
		id: 3,
		title: "Toilet Maintenance",
		image: toiletRepair,
		author: "Jim Bob",
		date: "September 27, 2025",
		link: "/projects/toilet-repair",
		description:
			"Comprehensive toilet repair and maintenance services to prevent leaks, clogs, and ensure long-lasting performance.",
		},
	];

	const truncateText = (text, maxLength) =>
		text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

	return (
		<section className="w-full py-16 bg-[#F5F5F5]">
			<div className="max-w-7xl mx-auto px-6">
				<h3 className="text-[#0C2D70] text-3xl font-semibold mb-8 relative inline-block pb-2">
					Recent Blog Posts
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h3>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
					{posts.map((post) => (
						<div
						key={post.id}
						className="bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden"
						>
							<img
								src={post.image}
								alt={post.title}
								className="w-full h-48 object-cover"
							/>

							<div className="p-6 flex flex-col flex-1">
								<h4 className="text-xl font-semibold text-[#0C2D70] mb-3">
									{post.title}
								</h4>

								<p className="text-[#2B2B2B] mb-6 flex-1">
									{truncateText(post.description, 152)}
								</p>

								<div className="flex justify-between text-[#949494] mb-6 text-sm">
									<div className="flex items-center gap-2">
										<FaUser /> <span>{post.author}</span>
									</div>
									<div className="flex items-center gap-2">
										<FaRegCalendarAlt /> <span>{post.date}</span>
									</div>
								</div>

								<a href="#" className="text-[#0C2D70] font-semibold text-sm flex items-center gap-1 hover:underline transition-colors">
									Continue Reading <FaArrowRight className="ml-1"/>
								</a>
							</div>
						</div>
					))}
				</div>

				<div className="flex justify-end">
					<a href="#" className="text-[#0C2D70] font-semibold flex items-center gap-1 hover:underline transition-colors">
						View All Posts <FaArrowRight className="ml-1"/>
					</a>
				</div>
			</div>
		</section>
	);
}
