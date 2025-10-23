import { FaChevronDown } from "react-icons/fa";
import { topLinks, bottomLinks } from "../navLinks";

export default function MobileNavigation({ menuOpen }) {
	if (!menuOpen) return null;

	return (
		<nav className="flex flex-col absolute top-full left-0 w-full min-h-screen bg-white text-[#0C2D70] border-t border-[#0C2D70] lg:hidden z-50">
			{bottomLinks.map((link) => (
				<div key={link.name} className="border-b border-[#0C2D70]/20">
					<details className="group">
						<summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold hover:bg-[#F5F5F5]">
							{link.name}
							{link.submenu && <FaChevronDown className="h-3 w-3 ml-0 xl:ml-1 2xl:ml-2 transition-transform duration-300 group-hover:rotate-180" />}
						</summary>
						{link.submenu && (
							<div className="flex flex-col bg-[#F5F5F5]">
								{link.submenu.map((sub) => (
								<a
									key={sub.label}
									href={sub.href}
									className="px-6 py-4 border-t border-[#0C2D70]/20 hover:bg-[#e0e0e0]"
								>
									{sub.label}
								</a>
								))}
							</div>
						)}
					</details>
				</div>
			))}

			{topLinks.map((link) => (
				<a key={link.name} href={link.href} className="px-6 py-4 border-b border-[#0C2D70]/20 font-semibold hover:bg-[#F5F5F5]">
					{link.name}
				</a>
			))}
		</nav>
	);
}
