import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaArrowRight, FaUser } from "react-icons/fa";
import { getCloudFrontUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";

export default function RecentBlogPosts() {
	const navigate = useNavigate();
	const [recentPosts, setRecentPosts] = useState([]);
	const [shouldLoadPosts, setShouldLoadPosts] = useState(false);
	const sectionRef = useRef(null);

	useEffect(() => {
		if (shouldLoadPosts) return;
		const node = sectionRef.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setShouldLoadPosts(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "400px 0px" }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [shouldLoadPosts]);

	useEffect(() => {
		if (!shouldLoadPosts) return;
		const loadRecentPosts = async () => {
			try {
				const { fetchBlogPosts } = await import("../../services/blogService");
				const allPosts = await fetchBlogPosts();
				setRecentPosts(allPosts.slice(0, 3));
			} catch (error) {
				console.error("Failed to load recent blog posts", error);
			}
		};

		loadRecentPosts();
	}, [shouldLoadPosts]);

	const truncateText = (text, maxLength) => {
		if (text.length <= maxLength) return text;
		const sliced = text.slice(0, maxLength);
		return sliced.endsWith(".") ? sliced + ".." : sliced + "...";
	};

	const formatBlogDate = (dateValue) =>
		new Date(dateValue).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});

	return (
		<div ref={sectionRef} className="flex flex-col w-full max-w-7xl mx-auto px-6 space-y-6 fade-in">
			{/* Header Container */}
			<div className="space-y-6">
				<h4 className="text-[#0C2D70] inline-block relative pb-2">
					Recent Blog Posts
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>
				<p className="text-[#2B2B2B]">
					Read the latest tips, how-tos, and the insights in the plumbing world.
				</p>
			</div>

			{/* Blog Posts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{recentPosts.map((post) => (
					<div key={post.id} className="flex flex-col text-left bg-white border-1 border-[#DEDEDE]">
						{/* Image */}
						<ImageWithLoader
							src={getCloudFrontUrl(post.featuredImageKey)}
							alt={post.title}
							className="w-full h-48 object-cover"
							loading="lazy"
						/>

						{/* Content Container */}
						<div className="p-6 flex flex-col flex-1">
						<h5 className="text-[#0C2D70] mb-2">{post.title}</h5>
						<div className="text-[#949494] text-sm mb-2 flex flex-col items-start gap-1">
							<div className="flex items-center gap-2">
								<FaRegCalendarAlt /> <span>{formatBlogDate(post.date)}</span>
							</div>
							<span className="flex items-center gap-1"><FaUser /> {post.author}</span>
						</div>
							<span className="text-[#2B2B2B] flex-1 mb-6">
								{truncateText(post.description, 152)}..
							</span>
							<button
								onClick={() => navigate(`/blog/${post.slug}`)}
								className="text-[#0C2D70] font-semibold text-sm flex items-center gap-2 hover:underline transition-colors cursor-pointer"
							>
								Continue Reading <FaArrowRight />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* View All Posts Link */}
			<div className="flex justify-end">
				<a
					href="/blog"
					className="text-[#0C2D70] font-semibold flex items-center gap-2 hover:underline transition-colors"
				>
					View All Posts <FaArrowRight />
				</a>
			</div>
		</div>
	);
}
