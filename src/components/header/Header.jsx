import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { FaMapMarkerAlt, FaCreditCard, FaChevronDown, FaBars, FaTimes, FaPhone, FaRegCalendarAlt } from "react-icons/fa";
import logo from "../../assets/pspah-logo.png";
import { TopLinks, BottomLinks } from "./navLinks";

export default function Header() {
	const navigate = useNavigate();
	const [openMenu, setOpenMenu] = useState(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState({});
	const closeTimeoutRef = useRef(null);

	const handleMouseEnter = (name) => {
		clearTimeout(closeTimeoutRef.current);
		setOpenMenu(name);
	};

	const handleMouseLeave = (name) => {
		closeTimeoutRef.current = setTimeout(() => {
		setOpenMenu((prev) => (prev === name ? null : prev));
		}, 1000);
	};

	const toggleMobileSubmenu = (name) => {
		setMobileSubmenuOpen((prev) => ({
		...prev,
		[name]: !prev[name],
		}));
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024 && mobileOpen) { // 1024px is Tailwind's 'lg' breakpoint
				setMobileOpen(false);
				setMobileSubmenuOpen({});
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [mobileOpen]);

	return (
		<header className="fixed top-0 left-0 z-50 flex flex-col w-full shadow-lg justify-center items-center">
			{/* Announcement Bar */}
			<section className="flex w-full bg-[#0C2D70] items-center justify-center">
				<div className="flex flex-row w-full max-w-7xl px-6 py-1.5 mx-auto items-center justify-center">
					<a href="https://app.gethearth.com/financing/29435/47842/prequalify?utm_campaign=29435&utm_content=darkblue&utm_medium=contractor-website&utm_source=contractor&utm_term=47842" className="flex items-center text-white font-semibold">
						<FaCreditCard className="mr-2"/>
						Easy Financing Available
					</a>
				</div>
			</section>

			{/* Middle Bar */}
			<section className="flex w-full bg-white items-center justify-center">
				<div className="flex flex-row w-full max-w-7xl px-6 py-2 lg:py-0 mx-auto justify-between items-center">
					{/* Logo */}
					<button onClick={() => navigate("/")}  className="flex-none h-[50px] md:h-[60px] lg:h-[65px] cursor-pointer">
						<img src={logo} alt="Puget Sound Plumbing and Heating Logo" className="h-full w-auto object-contain" />
					</button>

					{/* Navigation Links */}
					<div className="hidden lg:flex items-center justify-center">	
						<div className="flex flex-col">
							{/* Top Nav Links */}
							<ul className="flex flex-nowrap w-full justify-end gap-6 pr-3">
								{TopLinks.map((link) => (
									<li key={link.name} className="relative group">
										<button 
											onClick={() => navigate(link.href)} 
											className="flex items-center my-2 gap-1 text-[#0C2D70] whitespace-nowrap hover:underline cursor-pointer"
										>
											{link.name}
										</button>
									</li>
								))}
							</ul>

							{/* Bottom Nav Links */}
							<ul className="flex items-center flex-1">
								{BottomLinks.map((link) => (
									<li key={link.name} className="relative" onMouseEnter={() => handleMouseEnter(link.name)} onMouseLeave={() => handleMouseLeave(link.name)}>
										<a href={link.href} className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[#0C2D70] uppercase whitespace-nowrap transition-all duration-200 border-b-4 ${openMenu === link.name ? "border-[#B32020] bg-[#F5F5F5]" : "border-transparent hover:border-[#B32020] hover:bg-[#F5F5F5]"}`}>
											{link.name}
											{link.submenu && (
												<FaChevronDown
													className={`h-3 w-3 ml-1 transition-transform duration-300 ${
													openMenu === link.name ? "rotate-180" : ""
													}`}
												/>
											)}
										</a>

										{/* Dropdown Menu */}
										{link.submenu && openMenu === link.name && (
											<div className="absolute left-0 top-[calc(100%+0px)] bg-white border border-gray-400 shadow-lg z-10 min-w-[250px]" onMouseEnter={() => handleMouseEnter(link.name)} onMouseLeave={() => handleMouseLeave(link.name)}>
												<ul className="py-2">
													{link.submenu.map((item) => (
														<li key={item.name}>
															<a href={item.href} className="block text-xs font-semibold text-[#2B2B2B] uppercase transition-all hover:bg-[#F5F5F5] px-4 py-2 whitespace-nowrap">
																{item.name}
															</a>
														</li>
													))}
												</ul>
											</div>
										)}
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Mobile Hamburger */}
					<div className="lg:hidden flex items-center h-full">
						<button
							onClick={() => setMobileOpen((prev) => !prev)}
							className="text-[#0C2D70] text-2xl focus:outline-none cursor-pointer"
						>
							{mobileOpen ? <FaTimes /> : <FaBars />}
						</button>
					</div>
				</div>
			</section>
			
			{/* Section Divider */}
			<section className="hidden lg:flex w-full bg-white items-center justify-center">
				<div className="w-full max-w-7xl px-6">
					<div className="border-t border-gray-400"></div>
				</div>
			</section>

			{/* Location + Action Buttons */}
			<section className="flex w-full bg-white items-center justify-center">
				<div className="hidden lg:flex justify-between items-center w-full max-w-7xl px-6 h-[50px] font-semibold">
					{/* Location */}
					<a
						href="https://www.google.com/maps/dir/47.5922432,-122.0182016/11803+Des+Moines+Memorial+Dr,+Burien,+WA+98168"
						className="flex flex-row gap-2 items-center text-base text-[#0C2D70] hover:underline"
						target="_blank"
						rel="noreferrer"
					>
						<FaMapMarkerAlt className="flex text-[#B32020]" />
						<span className="flex text-[#0C2D70]">Seattle, WA</span>
					</a>
					
					{/* Action Buttons */}
					<div className="flex flex-row gap-2 items-center">
						<button onClick={() => navigate("/schedule-online")} className="flex items-center gap-2 px-3 py-2 text-white text-sm font-semibold uppercase cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]">
							<FaRegCalendarAlt />
							Schedule Online
						</button>
						<a
							href="tel:206-938-3219"
							className="flex items-center gap-2 px-3 py-2 text-white text-sm font-semibold cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#0C2D70] hover:bg-[#081a46]"
						>
							<FaPhone />
							(206) 938-3219
						</a>
					</div>
				</div>
			</section>

			{/* Mobile Dropdown */}
			{mobileOpen && (
				<section className="absolute top-[101px] sm:top-[106px] left-0 w-full bg-white shadow-lg z-40 px-6 max-h-[calc(100vh-106px)] sm:max-h-[calc(100vh-116px)] overflow-y-auto">
					<ul className="flex flex-col">
						{BottomLinks.map((link) => (
							<li key={link.name} className="w-full">
								{link.submenu ? (
								<>
									<button
									onClick={() => toggleMobileSubmenu(link.name)}
									className={`w-full flex justify-between items-center py-3 px-2 text-[#0C2D70] text-sm font-semibold uppercase cursor-pointer ${
										mobileSubmenuOpen[link.name]
										? "border-b-3 border-[#B32020]"
										: "border-b border-gray-200 hover:border-b-3 hover:border-[#B32020]"
									} hover:bg-[#F5F5F5]`}
									>
									{link.name}
									<FaChevronDown
										className={`transition-transform duration-300 ${
										mobileSubmenuOpen[link.name] ? "rotate-180" : ""
										}`}
									/>
									</button>
									{mobileSubmenuOpen[link.name] && (
									<ul className="flex flex-col bg-[#f9f9f9]">
										{link.submenu.map((item) => (
										<li key={item.name}>
											<a
											href={item.href}
											className="block py-3 px-8 text-xs text-[#2B2B2B] font-semibold uppercase hover:bg-[#EAEAEA]"
											>
											{item.name}
											</a>
										</li>
										))}
									</ul>
									)}
								</>
								) : (
								<a
									href={link.href}
									className="block py-3 px-6 text-[#0C2D70] font-semibold uppercase hover:bg-[#F5F5F5]"
								>
									{link.name}
								</a>
								)}
							</li>
						))}

						{TopLinks.map((link) => (
                            <li key={link.name} className="w-full">
                                <button
                                    onClick={() => {
                                        navigate(link.href);
                                        setMobileOpen(false); // Close menu after navigation
                                    }}
                                    className="w-full flex justify-between items-center py-3 px-2 text-[#0C2D70] text-sm font-semibold uppercase cursor-pointer border-b border-gray-200 hover:bg-[#F5F5F5]"
                                >
                                    {link.name}
                                </button>
                            </li>
                        ))}

						{/* Mobile Buttons */}
						<li className="flex flex-col gap-3 mt-4 w-full pb-4">
							<button onClick={() => navigate("/schedule-online")} className="flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold uppercase cursor-pointer transition-all duration-300 bg-[#B32020] hover:bg-[#7a1515]">
								<FaRegCalendarAlt />
								Schedule Online
							</button>
							<a
								href="tel:206-938-3219"
								className="flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold cursor-pointer transition-all duration-300 bg-[#0C2D70] hover:bg-[#081a46]"
							>
								<FaPhone />
								(206) 938-3219
							</a>
						</li>
					</ul>
				</section>
			)}
		</header>
	);
}