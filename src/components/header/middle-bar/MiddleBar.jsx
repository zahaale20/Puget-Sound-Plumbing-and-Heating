import logo from "../../../assets/pspah-logo.png";
import { FaBars, FaTimes } from "react-icons/fa";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";

export default function MiddleBar({ menuOpen, setMenuOpen }) {
	return (
		<div className="flex flex-col items-center relative w-full h-[80px] sm:h-[100px] bg-white text-sm text-[#0C2D70]">
			<div className="flex justify-between items-center w-full max-w-7xl h-full px-6">
				{/* Logo */}
				<a href="/" className="flex-none h-[60px] sm:h-[75px]">
					<img src={logo} alt="Puget Sound Plumbing and Heating Logo" className="h-full w-full object-contain" />
				</a>

				{/* Desktop Navigation */}
				<DesktopNavigation />

				{/* Hamburger (Mobile Only) */}
				<button
					type="button"
					className="block lg:hidden cursor-pointer text-[#0C2D70]"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Toggle menu"
				>
					{menuOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
				</button>
			</div>

			{/* Mobile Navigation */}
			<MobileNavigation menuOpen={menuOpen} />
		</div>
	);
}
