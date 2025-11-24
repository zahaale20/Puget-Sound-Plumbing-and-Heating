import {
	FaRegCalendarAlt,
	FaArrowRight,
	FaSearch,
	FaChevronDown,
} from "react-icons/fa";

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import skyline from "../../../assets/seattle-skyline.png";
import pattern from "../../../assets/pattern1.png";

import { categoryOptions, sortOptions, posts } from "./blogData";

export default function BlogPage() {
	const navigate = useNavigate();

	// STATES
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedSort, setSelectedSort] = useState("dateDesc");

	const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
	const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
	const dropdownTimeout = useRef(null);

	const [currentPage, setCurrentPage] = useState(1);
	const POSTS_PER_PAGE = 6;

	// UTILS
	const parseDate = (d) => new Date(d);
	const normalize = (s) => (s || "").toString().toLowerCase();
	const truncateText = (text, max) =>
		text.length > max ? text.slice(0, max) + "..." : text;

	// DROPDOWN HANDLERS
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

	// FILTERING
	const matchesCategory = (post) => {
		if (selectedCategory === "All") return true;
		return post.keywords.includes(selectedCategory);
	};

	const matchesKeywords = (post) => {
		const tokens = normalize(searchTerm).split(/\s+/).filter(Boolean);
		if (tokens.length === 0) return true;

		const haystack = normalize(
			post.title +
				" " +
				post.description +
				" " +
				post.author +
				" " +
				post.keywords.join(" ")
		);

		return tokens.every((token) => haystack.includes(token));
	};

	let filtered = posts.filter(
		(post) => matchesCategory(post) && matchesKeywords(post)
	);

	// SORTING
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

	// PAGINATION
	const totalPages = Math.ceil(sorted.length / POSTS_PER_PAGE);
	const slicedPosts = sorted.slice(0, currentPage * POSTS_PER_PAGE);

	// ACTION HANDLERS
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

	// UI
	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">

			{/* HEADER */}
			<section
				className="flex w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						Blog
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full rounded-full"></span>
					</h3>
					<p>Read the latest tips, how-tos, and insights in the plumbing world.</p>
				</div>
			</section>

			{/* SEARCH + FILTER + SORT */}
			<section className="w-full bg-white py-8 text-[#2B2B2B]">
				<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

					{/* SEARCH INPUT */}
					<div className="relative w-full">
						<input
							type="text"
							placeholder="Search posts..."
							value={searchTerm}
							onChange={handleSearchChange}
							className="w-full border border-gray-300 px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-[#0C2D70]"
						/>
						<FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
					</div>

					{/* FILTER + SORT AREA */}
					<div className="flex flex-wrap gap-2 lg:col-span-2">

						{/* FILTER DROPDOWN */}
						<div
							className="relative"
							onMouseEnter={() => handleOpen("filter")}
							onMouseLeave={() => handleClose("filter")}
						>
							<button
								className={`px-3 py-2 flex items-center gap-1 text-sm font-semibold uppercase border-b-4 ${
									filterDropdownOpen ? "border-[#B32020]" : "border-transparent"
								}`}
							>
								{selectedCategory}
								<FaChevronDown className={`transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`} />
							</button>

							{filterDropdownOpen && (
								<div className="absolute bg-white border shadow-lg min-w-[180px] z-20">
									<ul className="py-1">
										{categoryOptions.map((cat) => (
											<li key={cat}>
												<button
													onClick={() => handleCategorySelect(cat)}
													className="block px-4 py-2 text-left text-sm w-full hover:bg-gray-100"
												>
													{cat}
												</button>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* SORT DROPDOWN */}
						<div
							className="relative"
							onMouseEnter={() => handleOpen("sort")}
							onMouseLeave={() => handleClose("sort")}
						>
							<button
								className={`px-3 py-2 flex items-center gap-1 text-sm font-semibold uppercase border-b-4 ${
									sortDropdownOpen ? "border-[#B32020]" : "border-transparent"
								}`}
							>
								{sortOptions.find((s) => s.value === selectedSort)?.name}
								<FaChevronDown className={`transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
							</button>

							{sortDropdownOpen && (
								<div className="absolute bg-white border shadow-lg min-w-[180px] z-20">
									<ul className="py-1">
										{sortOptions.map((opt) => (
											<li key={opt.value}>
												<button
													onClick={() => handleSortSelect(opt.value)}
													className="block px-4 py-2 text-left text-sm w-full hover:bg-gray-100"
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

			{/* BLOG CARDS */}
			<section className="bg-white w-full">
				<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

					{slicedPosts.map((post) => (
						<div
							key={post.id}
							className="bg-white shadow-lg flex flex-col overflow-hidden min-h-[450px]"
						>
							<img src={post.image} alt={post.title} className="w-full h-48 object-cover" />

							<div className="p-6 flex flex-col flex-1">
								<div className="flex items-center gap-2 text-sm text-[#949494] mb-2">
									<FaRegCalendarAlt /> {post.date}
								</div>

								<h5 className="text-[#0C2D70] font-semibold mb-2">
									{post.title}
								</h5>

								<p className="text-[#2B2B2B] flex-1">
									{truncateText(post.description, 150)}
								</p>

								<p className="mt-3 text-sm text-gray-500">Views: {post.views}</p>

								<button
									onClick={() => handleReadPost(post.link)}
									className="text-[#0C2D70] font-semibold mt-4 flex items-center gap-2 hover:underline"
								>
									Continue Reading <FaArrowRight />
								</button>
							</div>
						</div>
					))}

				</div>
			</section>

			{/* LOAD MORE */}
			<section className="bg-[#F5F5F5] py-12 flex justify-center">
				{currentPage < totalPages && (
					<button
						onClick={handleNextPage}
						className="px-6 py-3 bg-[#B32020] text-white font-semibold hover:bg-[#7a1515]"
					>
						Load More
					</button>
				)}
			</section>

		</div>
	);
}
