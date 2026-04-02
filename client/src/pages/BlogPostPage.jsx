import { useState, useEffect } from "react";
import { FaRegCalendarAlt, FaArrowLeft, FaArrowRight, FaUser, FaEye } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBlogPosts, incrementBlogPostViews } from "../services/blogService";
import { getCloudFrontUrl } from "../services/imageService";
import NotFoundPage from "./NotFoundPage";

export default function BlogPostPage() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadPosts = async () => {
			try {
				setIsLoading(true);
				const data = await fetchBlogPosts();
				setPosts(data);
			} catch (error) {
				console.error("Failed to load blog post", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPosts();
	}, []);

	const post = posts.find((item) => item.slug === slug);

	const [postImageUrl, setPostImageUrl] = useState(null);

	useEffect(() => {
		if (post) setPostImageUrl(getCloudFrontUrl(post.featuredImageKey));
	}, [post]);

	useEffect(() => {
		const bumpViews = async () => {
			if (!post) return;
			try {
				const updatedViews = await incrementBlogPostViews(post.slug);
				if (typeof updatedViews === "number") {
					setPosts((prev) =>
						prev.map((item) =>
							item.slug === post.slug ? { ...item, views: updatedViews } : item
						)
					);
				}
			} catch (error) {
				console.error("Failed to increment blog post views", error);
			}
		};

		bumpViews();
	}, [post?.slug]);

	if (isLoading) {
		return (
			<section className="flex justify-center w-full py-16 text-[#2B2B2B] mt-[101px] md:mt-[106px] lg:mt-[167px]">
				<div className="max-w-7xl mx-auto px-6 w-full">Loading post...</div>
			</section>
		);
	}

	if (!post) return <NotFoundPage />;

	const renderContentItem = (item, key) => {
		if (typeof item === "string") {
			return <p key={key}>{item}</p>;
		}

		if (Array.isArray(item)) {
			return (
				<ul key={key} className="list-disc pl-6 space-y-1">
					{item.map((entry, entryIndex) => (
						<li key={`${key}-li-${entryIndex}`}>{entry}</li>
					))}
				</ul>
			);
		}

		if (item && typeof item === "object" && Array.isArray(item.table)) {
			return (
				<div key={key} className="overflow-x-auto">
					<table className="w-full border-collapse">
						<tbody>
							{item.table.map((row, rowIndex) => (
								<tr key={`${key}-row-${rowIndex}`}>
									{row.map((cell, cellIndex) => (
										<td key={`${key}-cell-${rowIndex}-${cellIndex}`} className="border border-[#DEDEDE] px-3 py-2 align-top">
											{cell}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		return null;
	};

	const currentIndex = posts.findIndex((p) => p.slug === slug);
	const prevPost = posts[currentIndex - 1];
	const nextPost = posts[currentIndex + 1];

	return (
		<section className="relative overflow-hidden flex justify-center w-full py-16 text-[#2B2B2B] mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<img
				src={getCloudFrontUrl("private/seattle-skyline.png")}
				alt=""
				aria-hidden="true"
				fetchPriority="high"
				className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
			/>

			<div className="max-w-7xl mx-auto px-6 w-full">
				{/* Back Button */}
				<button
					onClick={() => navigate("/blog")}
					className="flex items-center gap-2 text-[#0C2D70] font-semibold hover:underline mb-8 transition-colors cursor-pointer"
				>
					<FaArrowLeft /> Back to Blog
				</button>

				{/* Blog Post Content */}
				<article className="bg-white overflow-hidden">
					{/* Featured Image */}
					{postImageUrl ? (
						<img
							src={postImageUrl}
							alt={post.title}
							className="w-full h-64 md:h-96 object-cover"
							decoding="async"
						/>
					) : (
						<div className="w-full h-64 md:h-96 bg-gray-200 animate-pulse" />
					)}

					{/* Post Content */}
					<div className="p-8 md:p-12">
						<div className="text-[#949494] text-sm mb-4 flex flex-col items-start gap-2">
							<div className="flex items-center gap-2">
								<FaRegCalendarAlt /> {new Date(post.date).toLocaleDateString()}
							</div>
							<span className="flex items-center gap-2"><FaUser /> {post.author}</span>
							<span className="flex items-center gap-2"><FaEye /> {post.views.toLocaleString()} views</span>
						</div>
						<h3 className="text-[#0C2D70] mb-6">{post.title}</h3>
						<div className="text-[#2B2B2B] leading-relaxed space-y-4">
							<p>{post.description}</p>
							{post.sections.map((section, index) => (
								<div key={`${section.heading}-${index}`} className="space-y-2">
									{section.heading ? <h5 className="text-[#0C2D70]">{section.heading}</h5> : null}
									{(section.content || []).map((item, itemIndex) =>
										renderContentItem(item, `${index}-content-${itemIndex}`)
									)}
								</div>
							))}
						</div>
					</div>
				</article>

				{/* Navigation Between Posts */}
				<div className="flex justify-between items-center mt-10">
					{prevPost ? (
						<button
							onClick={() => navigate(`/blog/${prevPost.slug}`)}
							className="flex items-center gap-2 text-[#0C2D70] font-semibold hover:underline transition-colors cursor-pointer"
						>
							<FaArrowLeft /> Previous Post
						</button>
					) : (
						<div></div>
					)}
					{nextPost ? (
						<button
							onClick={() => navigate(`/blog/${nextPost.slug}`)}
							className="flex items-center gap-2 text-[#0C2D70] font-semibold hover:underline transition-colors cursor-pointer"
						>
							Next Post <FaArrowRight />
						</button>
					) : (
						<div></div>
					)}
				</div>
			</div>
		</section>
	);
}
