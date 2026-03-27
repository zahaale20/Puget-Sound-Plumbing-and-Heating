import { FaRegCalendarAlt, FaArrowRight, FaSearch, FaChevronDown } from "react-icons/fa";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCloudFrontUrl } from "../api/imageService";

import { categoryOptions, sortOptions, posts } from "../data/data";
import { ImageWithLoader } from "../components/ui/LoadingComponents";

export default function BlogPage() {
	const navigate = useNavigate();
	const [imageUrls, setImageUrls] = useState({});

	useEffect(() => {
		const uniqueKeys = [...new Set(posts.map((p) => p.imageKey))];
		const loadImages = async () => {
			const entries = await Promise.all(uniqueKeys.map((key) => [key, getCloudFrontUrl(key)]));
			setImageUrls(Object.fromEntries(entries));
		};
		loadImages();
	}, []);

	// State
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedSort, setSelectedSort] = useState("dateDesc");
	const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
	const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
	const dropdownTimeout = useRef(null);
	const [currentPage, setCurrentPage] = useState(1);
	const POSTS_PER_PAGE = 6;

	// Utils
	const parseDate = (d) => new Date(d);
	const normalize = (s) => (s || "").toString().toLowerCase();
	const truncateText = (text, max) => (text.length > max ? text.slice(0, max) + "..." : text);

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
		return post.keywords.includes(selectedCategory);
	};

	const matchesKeywords = (post) => {
		const tokens = normalize(searchTerm).split(/\s+/).filter(Boolean);
		if (tokens.length === 0) return true;
		const haystack = normalize(
			post.title + " " + post.description + " " + post.author + " " + post.keywords.join(" ")
		);
		return tokens.every((token) => haystack.includes(token));
	};

	let filtered = posts.filter((post) => matchesCategory(post) && matchesKeywords(post));

	let sorted = [...filtered].sort((a, b) => {
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
	const slicedPosts = sorted.slice(0, currentPage * POSTS_PER_PAGE);
	const topPosts = slicedPosts.length > 6 ? slicedPosts.slice(0, slicedPosts.length - 6) : [];
	const bottomPosts = slicedPosts.slice(-6);

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
	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};
	const handleReadPost = (link) => navigate(link);

	const PostCard = ({ post }) => (
		<div className="bg-white shadow-lg flex flex-col overflow-hidden min-h-[450px]">
			<ImageWithLoader
				src={imageUrls[post.imageKey]}
				alt={post.title}
				className="w-full h-48 object-cover"
				loading="lazy"
			/>
			<div className="p-6 flex flex-col flex-1">
				<div className="flex items-center gap-2 text-sm text-[#949494] mb-2">
					<FaRegCalendarAlt /> {post.date}
				</div>
				<h5 className="text-[#0C2D70] font-semibold mb-2">{post.title}</h5>
				<p className="text-[#2B2B2B] flex-1">{truncateText(post.description, 150)}</p>
				<button
					onClick={() => handleReadPost(post.link)}
					className="text-[#0C2D70] font-semibold mt-4 flex items-center gap-2 hover:underline cursor-pointer transition-colors"
				>
					Continue Reading <FaArrowRight />
				</button>
			</div>
		</div>
	);

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			{/* Header */}
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

			{/* Search + Filter + Sort */}
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
						{/* Filter Dropdown */}
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

						{/* Sort Dropdown */}
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

			{/* Blog Cards (Top - White) */}
			{topPosts.length > 0 && (
				<section className="bg-white w-full pb-6">
					<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{topPosts.map((post) => (
							<PostCard key={post.id} post={post} />
						))}
					</div>
				</section>
			)}

			{/* Blog Cards (Bottom - Skyline) */}
			<section className="relative overflow-hidden w-full pb-16 space-y-6">
				<img
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{bottomPosts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>

				<div className="flex justify-center">
					{currentPage < totalPages && (
						<button
							onClick={handleNextPage}
							className="px-6 py-3 bg-[#B32020] text-white font-semibold cursor-pointer hover:bg-[#7a1515]"
						>
							Load More
						</button>
					)}
				</div>
			</section>
		</div>
	);
}
