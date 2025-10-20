import { useState, useRef } from "react";
import { FaChevronDown, FaBars, FaTimes, FaPhone, FaRegCalendarAlt } from "react-icons/fa";
import logo from "../../assets/pspah-logo.png";
import { navLinks } from "./middle-bar/navigationLinks";

export default function Header() {
	const [openMenu, setOpenMenu] = useState(null); // Desktop hover menu
	const [mobileOpen, setMobileOpen] = useState(false); // Mobile menu open
	const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState({}); // Track which submenu is open
	const closeTimeoutRef = useRef(null);

	// Default left shift for Services dropdown (adjust as needed)
	const defaultDropdownShift = {
		Services: "-200px", // example shift if it overflows
	};

	// Desktop hover handlers
	const handleMouseEnter = (name) => {
		clearTimeout(closeTimeoutRef.current);
		setOpenMenu(name);
	};

	const handleMouseLeave = (name) => {
		closeTimeoutRef.current = setTimeout(() => {
			setOpenMenu((prev) => (prev === name ? null : prev));
		}, 1000);
	};

	// Toggle a specific mobile submenu
	const toggleMobileSubmenu = (name) => {
		setMobileSubmenuOpen((prev) => ({
			[name]: !prev[name],
		}));
	};

	return (
		<header className="fixed top-0 left-0 z-50 w-full h-[60px] bg-white border-b border-gray-400 shadow-sm">
			<div className="flex justify-between items-center w-full max-w-7xl h-full px-6 mx-auto">
				<div className="flex items-center gap-6">
					{/* Logo */}
					<a href="/" className="flex-none h-[50px]">
						<img src={logo} alt="Puget Sound Plumbing and Heating Logo" className="h-full w-auto object-contain" />
					</a>

					{/* Desktop Navigation */}
					<div className="hidden lg:flex flex-row items-center gap-6 flex-1 justify-between">
						<ul className="flex items-center flex-1">
							{navLinks.map((link) => (
								<li
									key={link.name}
									className="relative"
									onMouseEnter={() => handleMouseEnter(link.name)}
									onMouseLeave={() => handleMouseLeave(link.name)}
								>
									<a
										href={link.href}
										className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold uppercase text-[#0C2D70] whitespace-nowrap transition-all duration-200 border-b-3 ${
											openMenu === link.name ? "border-[#B32020] bg-[#F5F5F5]" : "border-transparent hover:border-[#B32020] hover:bg-[#F5F5F5]"
										}`}
									>
										{link.name}
										{link.submenu && (
											<FaChevronDown className={`h-3 w-3 ml-1 transition-transform duration-300 ${openMenu === link.name ? "rotate-180" : ""}`} />
										)}
									</a>

									{/* Desktop Mega Dropdown */}
									{link.submenu && openMenu === link.name && (
										<div
											style={{ left: defaultDropdownShift[link.name] || 0 }}
											className="absolute left-0 top-[calc(100%+22px)] flex bg-white border border-gray-400 shadow-lg z-10 px-6 py-2"
											onMouseEnter={() => handleMouseEnter(link.name)}
											onMouseLeave={() => handleMouseLeave(link.name)}
										>
											{link.submenu.map((section) => (
												<div key={section.name} className="min-w-[150px]">
													<a
														href={section.href}
														className="block text-xs font-semibold text-[#696969] uppercase transition-all hover:underline -ml-4 px-4 py-2 whitespace-nowrap"
													>
														{section.name}
													</a>
													{section.submenu && (
														<ul>
															{section.submenu.map((item) => (
																<li key={item.name}>
																	<a
																		href={item.href}
																		className="block text-sm font-semibold text-[#2B2B2B] uppercase transition-all hover:bg-[#F5F5F5] px-4 py-2 whitespace-nowrap"
																	>
																		{item.name}
																	</a>
																</li>
															))}
														</ul>
													)}
												</div>
											))}
										</div>
									)}
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Buttons */}
				<div className="hidden lg:flex flex-row gap-2 items-center">
					<button className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold uppercase cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]">
						<FaRegCalendarAlt />
						Schedule Online
					</button>
					<button className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#0C2D70] hover:bg-[#081a46]">
						<FaPhone />
						(866) 582-4730
					</button>
				</div>

				{/* Mobile Hamburger */}
				<div className="lg:hidden flex items-center h-full">
					<button onClick={() => setMobileOpen((prev) => !prev)} className="text-[#0C2D70] text-2xl focus:outline-none cursor-pointer">
						{mobileOpen ? <FaTimes /> : <FaBars />}
					</button>
				</div>
			</div>

			{/* Mobile Dropdown */}
			{mobileOpen && (
				<div className="absolute top-[60px] left-0 w-full bg-white shadow-lg z-40 px-6">
					<ul className="flex flex-col">
						{navLinks.map((top) =>
							top.submenu?.map((second) => (
								<li key={second.name} className="w-full">
									{second.submenu ? (
										<>
											<button
												onClick={() => toggleMobileSubmenu(second.name)}
												className={`w-full flex justify-between items-center py-3 px-2 text-[#0C2D70] text-sm font-semibold uppercase cursor-pointer ${
													mobileSubmenuOpen[second.name]
														? "border-b-3 border-[#B32020]"
														: "border-b border-gray-200 hover:border-b-3 hover:border-[#B32020]"
												} hover:bg-[#F5F5F5]`}
											>
												{second.name}
												<FaChevronDown className={`transition-transform duration-300 ${mobileSubmenuOpen[second.name] ? "rotate-180" : ""}`} />
											</button>
											{mobileSubmenuOpen[second.name] && (
												<ul className="flex flex-col bg-[#f9f9f9]">
													{second.submenu.map((item) => (
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
										<a href={second.href} className="block py-3 px-6 text-[#0C2D70] font-semibold uppercase hover:bg-[#F5F5F5]">
											{second.name}
										</a>
									)}
								</li>
							))
						)}

						{/* Mobile Buttons */}
						<li className="flex flex-col gap-3 mt-4 w-full pb-4">
							<button className="flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold uppercase cursor-pointer transition-all duration-300 bg-[#B32020] hover:bg-[#7a1515]">
								<FaRegCalendarAlt />
								Schedule Online
							</button>
							<button className="flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold cursor-pointer transition-all duration-300 bg-[#0C2D70] hover:bg-[#081a46]">
								<FaPhone />
								(866) 582-4730
							</button>
						</li>
					</ul>
				</div>
			)}
		</header>
	);
}
