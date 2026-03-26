import { useState, useEffect } from "react";
import { FaRegCalendarAlt, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { posts } from "../data/data";
import { getCloudFrontUrl } from "../api/imageService";

export default function BlogPostPage() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const fullLink = `/blog/${slug}`;
	const post = posts.find((p) => p.link === fullLink);

	const [skylineUrl, setSkylineUrl] = useState(null);
	const [postImageUrl, setPostImageUrl] = useState(null);

	useEffect(() => {
		setSkylineUrl(getCloudFrontUrl("private/seattle-skyline.png"));
		if (post) setPostImageUrl(getCloudFrontUrl(post.imageKey));
	}, [post]);

	if (!post) {
		return (
			<section
				className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B] mt-[101px] md:mt-[106px] lg:mt-[172px]"
				style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}
			>
				<div className="max-w-7xl mx-auto px-6 w-full">
					<h3 className="text-[#0C2D70] mb-4">Post Not Found</h3>
					<p className="text-[#2B2B2B] mb-6">
						The blog post you're looking for doesn't exist.
					</p>
					<button
						onClick={() => navigate("/blog")}
						className="flex items-center gap-4 text-[#0C2D70] font-semibold hover:underline"
					>
						<FaArrowLeft /> Back to Blog
					</button>
				</div>
			</section>
		);
	}

	const currentIndex = posts.findIndex((p) => p.link === fullLink);
	const prevPost = posts[currentIndex - 1];
	const nextPost = posts[currentIndex + 1];

	return (
		<section
			className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B] mt-[101px] md:mt-[106px] lg:mt-[167px]"
			style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}
		>
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
						<div className="flex items-center gap-2 text-[#949494] text-sm mb-4">
							<FaRegCalendarAlt />
							<span>{post.date}</span>
						</div>
						<h3 className="text-[#0C2D70] text-3xl md:text-4xl font-bold mb-6">
							{post.title}
						</h3>
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