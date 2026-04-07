import { useState, useEffect } from "react";
import { FaRegCalendarAlt, FaArrowLeft, FaArrowRight, FaUser } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBlogPosts, incrementBlogPostViews } from "../services/blogService";
import { getImageUrl } from "../services/imageService";
import Seo from "../components/seo/Seo";
import { buildBreadcrumbJsonLd } from "../components/seo/schema";
import { BlogPostSkeleton, ImageWithLoader } from "../components/ui/LoadingComponents";
import { ServiceLinks } from "../data/data";
import NotFoundPage from "./NotFoundPage";

const KEYWORD_HINTS = {
	drain: ["drain", "sewer", "clog", "hydro jet", "hydrojet", "back up"],
	plumbing: ["pipe", "leak", "toilet", "faucet", "garbage disposal", "plumbing"],
	"water-heaters": ["water heater", "hot water", "tankless"],
	"heating-and-cooling": ["furnace", "boiler", "air conditioning", "hvac", "heating", "ac"],
};

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
		if (post) setPostImageUrl(getImageUrl(post.featuredImageKey));
	}, [post]);

	const postSlug = post?.slug;

	useEffect(() => {
		const bumpViews = async () => {
			if (!postSlug) return;
			try {
				const updatedViews = await incrementBlogPostViews(postSlug);
				if (typeof updatedViews === "number") {
					setPosts((prev) =>
						prev.map((item) =>
							item.slug === postSlug ? { ...item, views: updatedViews } : item
						)
					);
				}
			} catch (error) {
				console.error("Failed to increment blog post views", error);
			}
		};

		bumpViews();
	}, [postSlug]);

	if (isLoading) {
		return <BlogPostSkeleton />;
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

	const formatBlogDate = (dateValue) =>
		new Date(dateValue).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});

	const postPath = `/blog/${post.slug}`;
	const siteUrl = (import.meta.env.VITE_SITE_URL || "https://www.pugetsoundplumbing.com").replace(/\/$/, "");
	const blogImage = postImageUrl || getImageUrl("logo/pspah-logo.webp");
	const blogJsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.description,
		datePublished: post.date,
		author: {
			"@type": "Person",
			name: post.author || "Puget Sound Plumbing and Heating",
		},
		publisher: {
			"@type": "Organization",
			name: "Puget Sound Plumbing and Heating",
			logo: {
				"@type": "ImageObject",
				url: getImageUrl("logo/pspah-logo.webp"),
			},
		},
		image: [blogImage],
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `${siteUrl}${postPath}`,
		},
	};

	const blogContext = `${post.title} ${post.description} ${(post.keywords || []).join(" ")}`.toLowerCase();
	const allServices = ServiceLinks.flatMap((category) =>
		category.submenu.map((service) => ({
			categoryName: category.name,
			categorySlug: category.href.split("/").pop(),
			...service,
		}))
	);

	const relatedServices = allServices
		.filter((service) => {
			const categoryKey = service.categorySlug;
			const hints = KEYWORD_HINTS[categoryKey] || [];
			const serviceName = (service.name || "").toLowerCase();
			if (blogContext.includes(serviceName)) return true;
			return hints.some((hint) => blogContext.includes(hint));
		})
		.slice(0, 4);
	const breadcrumbJsonLd = buildBreadcrumbJsonLd([
		{ name: "Home", path: "/" },
		{ name: "Blog", path: "/blog" },
		{ name: post.title, path: postPath },
	]);

	return (
		<section className="relative overflow-hidden flex justify-center w-full py-16 text-[#2B2B2B] mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<Seo
				title={post.title}
				description={post.description}
				path={postPath}
				image={blogImage}
				type="article"
				jsonLd={[blogJsonLd, breadcrumbJsonLd]}
			/>
			<ImageWithLoader
				src={getImageUrl("site/seattle-skyline.webp")}
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
				<article className="overflow-hidden">
					{/* Featured Image */}
					{postImageUrl ? (
						<ImageWithLoader
							src={postImageUrl}
							alt={post.title}
							className="block w-full h-64 md:h-96 object-cover"
							loading="lazy"
							decoding="async"
						/>
					) : (
						<div className="w-full h-64 md:h-96 bg-gray-200 animate-pulse" />
					)}

					{/* Post Content */}
					<div className="py-8">
						<h1 className="text-[#0C2D70] mb-4 text-2xl md:text-3xl font-semibold">{post.title}</h1>
						<div className="text-[#949494] text-sm mb-6 flex flex-col items-start gap-2">
							<div className="flex items-center gap-2">
								<FaRegCalendarAlt /> {formatBlogDate(post.date)}
							</div>
							<span className="flex items-center gap-2"><FaUser /> {post.author}</span>
						</div>
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

				{relatedServices.length > 0 ? (
					<section className="mt-10 bg-[#F5F5F5] p-6">
						<h5 className="text-[#0C2D70] mb-3">Related Services</h5>
						<ul className="list-disc pl-6 space-y-2 text-[#2B2B2B]">
							{relatedServices.map((service) => (
								<li key={service.href}>
									<a href={service.href} className="text-[#0C2D70] hover:underline">
										{service.name}
									</a>
								</li>
							))}
						</ul>
					</section>
				) : null}

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
