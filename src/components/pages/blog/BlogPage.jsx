import { FaRegCalendarAlt, FaArrowLeft, FaArrowRight, FaSearch, FaChevronDown } from "react-icons/fa"; 
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import skyline from "../../../assets/seattle-skyline.png";
import { categoryOptions, sortOptions, posts } from "./blogData";

export default function BlogPage() {
    const navigate = useNavigate();
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const closeTimeoutRef = useRef(null);

    const truncateText = (text, maxLength) =>
        text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

    const handleMouseEnter = (dropdownName) => {
        clearTimeout(closeTimeoutRef.current);
        if (dropdownName === 'sort') {
            setSortDropdownOpen(true);
            setFilterDropdownOpen(false);
        } else if (dropdownName === 'filter') {
            setFilterDropdownOpen(true);
            setSortDropdownOpen(false);
        }
    };

    const handleMouseLeave = (dropdownName) => {
        closeTimeoutRef.current = setTimeout(() => {
            if (dropdownName === 'sort') {
                setSortDropdownOpen(false);
            } else if (dropdownName === 'filter') {
                setFilterDropdownOpen(false);
            }
        }, 1000);
    };

    const POSTS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

    const paginatedPosts = posts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleReadPost = (postLink) => {
        navigate(postLink);
    };

    return (
        <>
            {/* Page Header Section */}
            <section
                className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B] mt-[101px] md:mt-[106px] lg:mt-[167px]"
                style={{ backgroundImage: `url(${skyline})` }}
            >
                <div className="max-w-7xl mx-auto px-6 w-full">
                    {/* Title */}
                    <h4 className="text-[#0C2D70] text-3xl font-semibold mb-8 relative inline-block pb-2">
                        Blog
                        <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
                    </h4>

                    {/* Filters and Search Bar */}
                    <div id="filter-controls" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        
                        {/* Search Input (non-functional) */}
                        <div className="relative w-full order-1 lg:order-none col-span-1 lg:justify-self-end">
                            <input
                                id="search"
                                type="text"
                                placeholder="Search posts..."
                                className="w-full border border-gray-300 px-4 py-2 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] text-[#2B2B2B] text-sm"
                            />
                            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        </div>
                        
                        {/* Dropdown Containers */}
                        <div className="flex flex-wrap gap-1 w-full order-2 lg:order-none lg:col-span-2">
                            
                            {/* Filter Dropdown (visual only) */}
                            <div 
                                className="relative inline-block text-left z-10"
                                onMouseEnter={() => handleMouseEnter('filter')}
                                onMouseLeave={() => handleMouseLeave('filter')}
                            >
                                <button
                                    className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[#0C2D70] uppercase whitespace-nowrap transition-all duration-200 border-b-4 cursor-pointer ${filterDropdownOpen ? "border-[#B32020] bg-[#F5F5F5]" : "border-transparent hover:border-[#B32020] hover:bg-[#F5F5F5]"}`}
                                >
                                    ALL
                                    <FaChevronDown className={`h-3 w-3 ml-1 transition-transform duration-300 ${filterDropdownOpen ? "rotate-180" : ""}`}/>
                                </button>
                                {filterDropdownOpen && ( 
                                    <div 
                                        className="absolute left-0 top-[calc(100%+0px)] bg-white border border-gray-400 shadow-lg z-20 min-w-[250px]"
                                        onMouseEnter={() => handleMouseEnter('filter')}
                                        onMouseLeave={() => handleMouseLeave('filter')}
                                    >
                                        <ul className="py-2">
                                            {categoryOptions.map((keyword) => ( 
                                                <li key={keyword}>
                                                    <button
                                                        className="block w-full text-left text-xs font-semibold text-[#2B2B2B] uppercase transition-all hover:bg-[#F5F5F5] cursor-pointer px-4 py-2 whitespace-nowrap"
                                                    >
                                                        {keyword}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Sort Dropdown (visual only) */}
                            <div 
                                className="relative inline-block text-left z-10"
                                onMouseEnter={() => handleMouseEnter('sort')}
                                onMouseLeave={() => handleMouseLeave('sort')}
                            >
                                <button
                                    className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[#0C2D70] uppercase whitespace-nowrap transition-all duration-200 border-b-4 cursor-pointer ${sortDropdownOpen ? "border-[#B32020] bg-[#F5F5F5]" : "border-transparent hover:border-[#B32020] hover:bg-[#F5F5F5]"}`}
                                >
                                    NEWEST FIRST
                                    <FaChevronDown className={`h-3 w-3 ml-1 transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`}/>
                                </button>
                                {sortDropdownOpen && ( 
                                    <div 
                                        className="absolute left-0 top-[calc(100%+0px)] bg-white border border-gray-400 shadow-lg z-20 min-w-[250px]"
                                        onMouseEnter={() => handleMouseEnter('sort')}
                                        onMouseLeave={() => handleMouseLeave('sort')}
                                    >
                                        <ul className="py-2">
                                            {sortOptions.map((option) => ( 
                                                <li key={option.value}>
                                                    <button
                                                        className="block w-full text-left text-xs font-semibold text-[#2B2B2B] uppercase transition-all hover:bg-[#F5F5F5] cursor-pointer px-4 py-2 whitespace-nowrap"
                                                    >
                                                        {option.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
    
                    {/* Blog Grid Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 auto-rows-fr">
                        {paginatedPosts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white shadow-lg flex flex-col overflow-hidden min-h-[450px]"
                            >
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-48 object-cover"
                                />
    
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-[#949494] text-sm mb-2">
                                        <FaRegCalendarAlt /> <span>{post.date}</span>
                                    </div>
    
                                    <h5 className="text-xl font-semibold text-[#0C2D70] mb-1">
                                        {post.title}
                                    </h5>
    
                                    <span className="text-[#2B2B2B] flex-1">
                                        {truncateText(post.description, 152)}
                                    </span>
    
                                    <button
                                        onClick={() => handleReadPost(post.link)}
                                        className="text-[#0C2D70] font-semibold text-sm flex items-center gap-1 hover:underline transition-colors mt-6 cursor-pointer"
                                    >
                                        Continue Reading <FaArrowRight className="ml-1"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`p-2 transition ${
                                    currentPage === 1 ? "opacity-0" : "cursor-pointer"
                                }`}
                            >
                                <FaArrowLeft className="text-[#0C2D70]"/>
                            </button>

                            <span className="text-[#0C2D70] font-semibold">
                                {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`p-2 transition ${
                                    currentPage === totalPages ? "opacity-0" : "cursor-pointer"
                                }`}
                            >
                                <FaArrowRight className="text-[#0C2D70]"/>
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}