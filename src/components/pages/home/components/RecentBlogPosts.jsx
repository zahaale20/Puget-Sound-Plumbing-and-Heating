import { useNavigate } from "react-router-dom";

import { FaRegCalendarAlt, FaArrowRight } from "react-icons/fa";

import waterHeaters from "../../../../assets/blog1.jpg";
import faucets from "../../../../assets/blog2.jpg";
import toiletRepair from "../../../../assets/blog3.jpg";

import { posts } from "../../blog/blogData";

export default function RecentBlogPosts() {
	const navigate = useNavigate();

	const truncateText = (text, maxLength) =>
		text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

	const handleReadPost = (postLink) => {
		navigate(postLink);
	};

	return (
		<div className="flex flex-col w-full max-w-7xl px-6 space-y-6">
			{/* Header Container */}
			<div className="space-y-6">
				{/* Title */}
				<h4 className="text-[#0C2D70] inline-block relative pb-2">
					Recent Blog Posts
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>
				
				{/* Description */}
				<p className="text-[#2B2B2B]">
					Read the latest tips, how-tos, and the insights in the plumbing world.
				</p>
			</div>

			{/* Blog Posts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{posts.slice(0, 3).map((post) => (
					// Blog Post Container
					<div
						key={post.id}
						className="flex flex-col text-left bg-white border-1 border-[#DEDEDE]"
					>
						{/* Image */}
						<img
							src={post.image}
							alt={post.title}
							className="w-full h-48 object-cover"
						/>

						{/* Content Container */}
						<div className="p-6 flex flex-col flex-1">
							{/* Date Posted */}
							<div className="flex items-center gap-2 text-[#949494] text-sm mb-2">
								<FaRegCalendarAlt /> <span>{post.date}</span>
							</div>

							{/* Post Title */}
							<h5 className="text-[#0C2D70] mb-2">
								{post.title}
							</h5>

							{/* Truncated Text */}
							<span className="text-[#2B2B2B] flex-1 mb-6">
								{truncateText(post.description, 152)}
							</span>

							{/* Continue Reading Link */}
							<button
								onClick={() => handleReadPost(post.link)}
								className="text-[#0C2D70] font-semibold text-sm flex items-center gap-2 hover:underline transition-colors mt-6 cursor-pointer"
							>
								Continue Reading <FaArrowRight/>
							</button>
						</div>
					</div>
				))}
			</div>

			{/* View All Posts Link */}
			<div className="flex justify-end">
				<a href="/blog" className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors">
					View All Posts <FaArrowRight/>
				</a>
			</div>
		</div>
	);
}
