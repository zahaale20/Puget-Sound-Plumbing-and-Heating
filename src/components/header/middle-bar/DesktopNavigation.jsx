import { FaChevronDown } from "react-icons/fa";
import { topLinks, bottomLinks } from "./navigationLinks";

export default function DesktopNavigation() {
	return (
		<nav className="hidden lg:flex flex-col w-full gap-1">
			{/* Top Nav Links */}
			<ul className="flex flex-nowrap w-full justify-end">
				{topLinks.map((link) => (
					<li key={link.name} className="relative group">
						<a href={link.href} className="flex items-center px-3 my-2 gap-1 whitespace-nowrap hover:underline cursor-pointer">
							{link.name}
						</a>
					</li>
				))}
			</ul>

			{/* Bottom Nav Links */}
			<ul className="flex flex-nowrap w-full justify-end">
				{bottomLinks.map((link) => (
					<li key={link.name} className="relative group">
						<a href="#" className="flex items-center px-3 py-2 gap-1 font-semibold rounded-t-lg group-hover:bg-[#F5F5F5] transition-colors whitespace-nowrap cursor-pointer">
							{link.name}
							{link.submenu && <FaChevronDown className="h-3 w-3 ml-0 xl:ml-1 2xl:ml-2 transition-transform duration-300 group-hover:rotate-180" />}
						</a>
						{link.submenu && (
						<ul className="absolute left-0 top-full hidden group-hover:block bg-[#F5F5F5] shadow-lg rounded-b-xl rounded-tr-xl z-10 min-w-[250px] overflow-hidden">
							{link.submenu.map((sub, index) => (
								<li key={sub.label}>
									<a 
										href={sub.href} 
										className={`block px-3 py-2 whitespace-nowrap cursor-pointer transition-colors hover:bg-[#e0e0e0] ${
											index === 0 ? 'rounded-tr-xl' : ''
										} ${
											index === link.submenu.length - 1 ? 'rounded-b-xl' : ''
										}`}
									>
										{sub.label}
									</a>
								</li>
							))}
						</ul>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
}

