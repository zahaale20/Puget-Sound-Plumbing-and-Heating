import { useState, useEffect } from "react";
import { FaRegCalendarAlt, FaArrowLeft, FaArrowRight, FaUser, FaEye } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { posts } from "../data/data";
import { getCloudFrontUrl } from "../services/imageService";
import NotFoundPage from "./NotFoundPage";

export default function BlogPostPage() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const fullLink = `/blog/${slug}`;
	const post = posts.find((p) => p.link === fullLink);

	const [postImageUrl, setPostImageUrl] = useState(null);

	useEffect(() => {
		if (post) setPostImageUrl(getCloudFrontUrl(post.imageKey));
	}, [post]);

	if (!post) return <NotFoundPage />;

	const currentIndex = posts.findIndex((p) => p.link === fullLink);
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
						<div className="flex flex-wrap items-center gap-4 text-[#949494] text-sm mb-4">
							<span className="flex items-center gap-2"><FaRegCalendarAlt /> {post.date}</span>
							<span className="flex items-center gap-2"><FaUser /> {post.author}</span>
							<span className="flex items-center gap-2"><FaEye /> {post.views.toLocaleString()} views</span>
						</div>
						<h3 className="text-[#0C2D70] mb-6">{post.title}</h3>
						<div className="text-[#2B2B2B] leading-relaxed space-y-4">
							<p>{post.description}</p>
						</div>
					</div>
				</article>

				{/* Navigation Between Posts */}
				<div className="flex justify-between items-center mt-10">
					{prevPost ? (
						<button
							onClick={() => navigate(prevPost.link)}
							className="flex items-center gap-2 text-[#0C2D70] font-semibold hover:underline transition-colors cursor-pointer"
						>
							<FaArrowLeft /> Previous Post
						</button>
					) : (
						<div></div>
					)}
					{nextPost ? (
						<button
							onClick={() => navigate(nextPost.link)}
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
