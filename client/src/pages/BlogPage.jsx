import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaArrowRight, FaSearch, FaChevronDown, FaChevronLeft, FaChevronRight, FaUser } from "react-icons/fa";
import { fetchBlogPosts } from "../services/blogService";
import { getCloudFrontUrl } from "../services/imageService";
import { BlogGridSkeleton, ImageWithLoader } from "../components/ui/LoadingComponents";

const sortOptions = [
	{ name: "Most Recent", value: "dateDesc" },
	{ name: "Oldest", value: "dateAsc" },
	{ name: "Most Viewed", value: "viewsDesc" },
	{ name: "Title (A-Z)", value: "titleAsc" },
	{ name: "Title (Z-A)", value: "titleDesc" },
];

export default function BlogPage() {
	const navigate = useNavigate();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedSort, setSelectedSort] = useState("dateDesc");
	const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
	const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
	const dropdownTimeout = useRef(null);
	const [currentPage, setCurrentPage] = useState(1);
	const POSTS_PER_PAGE = 6;

	useEffect(() => {
		const loadPosts = async () => {
			try {
				setIsLoading(true);
				const data = await fetchBlogPosts();
				setPosts(data);
				setLoadError("");
			} catch (error) {
				console.error("Failed to load blog posts", error);
				setLoadError("We couldn't load blog posts right now. Please try again shortly.");
			} finally {
				setIsLoading(false);
			}
		};

		loadPosts();
	}, []);

	const categoryOptions = [
		"All",
		...Array.from(new Set(posts.flatMap((post) => post.keywords || []).filter(Boolean))).sort(),
	];

	const parseDate = (d) => new Date(d || 0);
	const normalize = (s) => (s || "").toString().toLowerCase();
	const truncateText = (text, max) => {
		const safeText = text || "";
		return safeText.length > max ? safeText.slice(0, max) + "..." : safeText;
	};

	const formatBlogDate = (dateValue) =>
		new Date(dateValue).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});

	const handleOpen = (type) => {
		clearTimeout(dropdownTimeout.current);
		if (type === "filter") {
			setFilterDropdownOpen(true);
			setSortDropdownOpen(false);
		} else {
			setSortDropdownOpen(true);
			setFilterDropdownOpen(false);
		}
	};

	const handleClose = (type) => {
		dropdownTimeout.current = setTimeout(() => {
			if (type === "filter") setFilterDropdownOpen(false);
			else setSortDropdownOpen(false);
		}, 800);
	};

	const matchesCategory = (post) => {
		if (selectedCategory === "All") return true;
		return (post.keywords || []).includes(selectedCategory);
	};

	const matchesKeywords = (post) => {
		const tokens = normalize(searchTerm).split(/\s+/).filter(Boolean);
		if (tokens.length === 0) return true;
		const haystack = normalize(
			post.title + " " + post.description + " " + post.author + " " + (post.keywords || []).join(" ")
		);
		return tokens.every((token) => haystack.includes(token));
	};

	const filtered = posts.filter((post) => matchesCategory(post) && matchesKeywords(post));

	const sorted = [...filtered].sort((a, b) => {
		switch (selectedSort) {
			case "dateDesc":
				return parseDate(b.date) - parseDate(a.date);
			case "dateAsc":
				return parseDate(a.date) - parseDate(b.date);
			case "viewsDesc":
				return b.views - a.views;
			case "titleAsc":
				return a.title.localeCompare(b.title);
			case "titleDesc":
				return b.title.localeCompare(a.title);
			default:
				return 0;
		}
	});

	const totalPages = Math.ceil(sorted.length / POSTS_PER_PAGE);
	const currentPagePosts = sorted.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

	const getPageNumbers = () => {
		if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
		if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
		if (currentPage >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
		return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleCategorySelect = (category) => {
		setSelectedCategory(category);
		setFilterDropdownOpen(false);
		setCurrentPage(1);
	};

	const handleSortSelect = (value) => {
		setSelectedSort(value);
		setSortDropdownOpen(false);
		setCurrentPage(1);
	};

	const handlePageChange = (page) => {
		const targetPage = Math.min(Math.max(page, 1), totalPages);
		setCurrentPage(targetPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const PostCard = ({ post }) => (
		<div className="bg-white shadow-lg flex flex-col overflow-hidden min-h-[450px]">
			<ImageWithLoader
				src={getCloudFrontUrl(post.featuredImageKey)}
				alt={post.title}
				className="w-full h-48 object-cover"
				loading="lazy"
			/>
			<div className="p-6 flex flex-col flex-1">
				<h5 className="text-[#0C2D70] mb-2">{post.title}</h5>
				<div className="text-sm text-[#949494] mb-2 flex flex-col items-start gap-1">
					<div className="flex items-center gap-1">
						<FaRegCalendarAlt />
						<span>{formatBlogDate(post.date)}</span>
					</div>
					<span className="flex items-center gap-1"><FaUser /> {post.author}</span>
				</div>
				<p className="text-[#2B2B2B] flex-1">{truncateText(post.description, 150)}</p>
				<button
					onClick={() => navigate(`/blog/${post.slug}`)}
					className="text-[#0C2D70] font-semibold mt-4 flex items-center gap-2 hover:underline cursor-pointer transition-colors"
				>
					Continue Reading <FaArrowRight />
				</button>
			</div>
		</div>
	);

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<section className="relative overflow-hidden bg-[#0C2D70] flex w-full py-16">
				<img
					src={getCloudFrontUrl("private/pattern1.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						Blog
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full rounded-full"></span>
					</h3>
					<p>Read the latest tips, how-tos, and insights in the plumbing world.</p>
				</div>
			</section>

			<section className="w-full bg-white pt-16 mb-6 text-[#2B2B2B]">
				<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="relative w-full">
						<input
							type="text"
							placeholder="Search posts..."
							value={searchTerm}
							onChange={handleSearchChange}
							className="w-full border border-gray-300 px-4 py-2 pr-10 text-sm focus:outline-none focus:border-[#0C2D70]"
						/>
						<FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
					</div>

					<div className="flex flex-wrap lg:col-span-2">
						<div
							className="relative inline-block text-left z-10"
							onMouseEnter={() => handleOpen("filter")}
							onMouseLeave={() => handleClose("filter")}
						>
							<button
								className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[#0C2D70] uppercase whitespace-nowrap transition-all duration-200 border-b-4 cursor-pointer ${filterDropdownOpen ? "border-[#B32020] bg-[#F5F5F5]" : "border-transparent hover:border-[#B32020] hover:bg-[#F5F5F5]"}`}
							>
								{selectedCategory}
								<FaChevronDown
									className={`h-3 w-3 ml-1 transition-transform duration-300 ${filterDropdownOpen ? "rotate-180" : ""}`}
								/>
							</button>
							{filterDropdownOpen && (
								<div
									className="absolute left-0 top-[calc(100%+0px)] bg-white border border-gray-400 shadow-lg z-20 min-w-[250px]"
									onMouseEnter={() => handleOpen("filter")}
									onMouseLeave={() => handleClose("filter")}
								>
									<ul className="py-2">
										{categoryOptions.map((cat) => (
											<li key={cat}>
												<button
													onClick={() => handleCategorySelect(cat)}
													className="block w-full text-left text-xs font-semibold text-[#2B2B2B] uppercase transition-all hover:bg-[#F5F5F5] cursor-pointer px-4 py-2 whitespace-nowrap"
												>
													{cat}
												</button>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						<div
							className="relative inline-block text-left z-10"
							onMouseEnter={() => handleOpen("sort")}
							onMouseLeave={() => handleClose("sort")}
						>
							<button
								className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[#0C2D70] uppercase whitespace-nowrap transition-all duration-200 border-b-4 cursor-pointer ${sortDropdownOpen ? "border-[#B32020] bg-[#F5F5F5]" : "border-transparent hover:border-[#B32020] hover:bg-[#F5F5F5]"}`}
							>
								{sortOptions.find((s) => s.value === selectedSort)?.name}
								<FaChevronDown
									className={`h-3 w-3 ml-1 transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`}
								/>
							</button>
							{sortDropdownOpen && (
								<div
									className="absolute left-0 top-[calc(100%+0px)] bg-white border border-gray-400 shadow-lg z-20 min-w-[250px]"
									onMouseEnter={() => handleOpen("sort")}
									onMouseLeave={() => handleClose("sort")}
								>
									<ul className="py-2">
										{sortOptions.map((opt) => (
											<li key={opt.value}>
												<button
													onClick={() => handleSortSelect(opt.value)}
													className="block w-full text-left text-xs font-semibold text-[#2B2B2B] uppercase transition-all hover:bg-[#F5F5F5] cursor-pointer px-4 py-2 whitespace-nowrap"
												>
													{opt.name}
												</button>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{isLoading && (
				<section className="bg-white w-full pb-6">
					<div className="max-w-7xl mx-auto px-6">
						<BlogGridSkeleton count={POSTS_PER_PAGE} />
					</div>
				</section>
			)}

			{loadError && !isLoading && (
				<section className="bg-white w-full pb-6">
					<div className="max-w-7xl mx-auto px-6 text-[#B32020]">{loadError}</div>
				</section>
			)}

			{!isLoading && (
			<section className="relative overflow-hidden w-full pb-16 space-y-6">
				<img
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{currentPagePosts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>

				{totalPages > 1 && (
					<div className="max-w-7xl mx-auto px-6 w-full flex justify-center items-center">
						<div className="inline-flex items-center bg-white border border-gray-300 shadow-lg">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							aria-label="Go to previous page"
							className="h-10 w-10 inline-flex items-center justify-center text-[#0C2D70] border-r border-gray-300 transition-all duration-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0C2D70]"
						>
							<FaChevronLeft />
						</button>
						{getPageNumbers().map((page, i) =>
							page === "..." ? (
								<span key={`ellipsis-${i}`} className="px-3 h-10 inline-flex items-center text-[#0C2D70]/60 font-semibold select-none border-r border-gray-300">...</span>
							) : (
								<button
									key={page}
									onClick={() => handlePageChange(page)}
									aria-label={`Go to page ${page}`}
									aria-current={currentPage === page ? "page" : undefined}
									className={`h-10 min-w-10 px-3 inline-flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer border-r border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0C2D70] ${
										currentPage === page
											? "bg-[#0C2D70] text-white"
											: "text-[#0C2D70] hover:bg-gray-100"
									}`}
								>
									{page}
								</button>
							)
						)}
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							aria-label="Go to next page"
							className="h-10 w-10 inline-flex items-center justify-center text-[#0C2D70] transition-all duration-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0C2D70]"
						>
							<FaChevronRight />
						</button>
						</div>
					</div>
				)}
			</section>
			)}
		</div>
	);
}
