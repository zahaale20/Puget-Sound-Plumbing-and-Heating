import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaArrowRight, FaUser } from "react-icons/fa";
import { getCloudFrontUrl } from "../../services/imageService";
import { ImageWithLoader } from "../ui/LoadingComponents";

export default function RecentBlogPosts() {
	const navigate = useNavigate();
	const [recentPosts, setRecentPosts] = useState([]);
	const [shouldLoadPosts, setShouldLoadPosts] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState("");
	const sectionRef = useRef(null);

	useEffect(() => {
		if (shouldLoadPosts) return;

		if (typeof window === "undefined" || typeof window.IntersectionObserver !== "function") {
			setShouldLoadPosts(true);
			return;
		}

		const node = sectionRef.current;
		if (!node) {
			setShouldLoadPosts(true);
			return;
		}

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
			setIsLoading(true);
			try {
				const { fetchBlogPosts } = await import("../../services/blogService");
				const allPosts = await fetchBlogPosts();
				setRecentPosts(Array.isArray(allPosts) ? allPosts.slice(0, 3) : []);
				setLoadError("");
			} catch (error) {
				console.error("Failed to load recent blog posts", error);
				setLoadError("We couldn't load recent blog posts right now. Please try again shortly.");
				setRecentPosts([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadRecentPosts();
	}, [shouldLoadPosts]);

	const truncateText = (text, maxLength) => {
		const safeText = text || "";
		if (safeText.length <= maxLength) return safeText;
		const sliced = safeText.slice(0, maxLength);
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
				{isLoading
					? Array.from({ length: 3 }).map((_, index) => (
						<div key={`loading-card-${index}`} className="animate-pulse bg-white border border-[#DEDEDE]">
							<div className="w-full h-48 bg-[#E5E7EB]" />
							<div className="p-6 space-y-3">
								<div className="h-5 bg-[#E5E7EB] w-4/5" />
								<div className="h-4 bg-[#E5E7EB] w-2/3" />
								<div className="h-4 bg-[#E5E7EB] w-full" />
								<div className="h-4 bg-[#E5E7EB] w-5/6" />
							</div>
						</div>
					))
					: recentPosts.map((post) => (
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
									{truncateText(post.description, 152)}
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

			{!isLoading && recentPosts.length === 0 ? (
				<div className={`text-sm ${loadError ? "text-[#B32020]" : "text-[#2B2B2B]"}`}>
					{loadError || "No recent posts are available yet."}
				</div>
			) : null}

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
