import { FaClock, FaPhone } from "react-icons/fa";
import { CompanyInfo } from "../../data/data";

export default function EmergencyBar() {
	return (
		<section className="w-full bg-[#B32020] overflow-hidden">
			<div className="w-full max-w-7xl px-4 py-2 mx-auto sm:px-6">
				<a
					href={CompanyInfo.phoneTel}
					className="flex items-center justify-center gap-2 text-white sm:gap-3"
				>
					<span className="flex items-center text-xs font-semibold tracking-[0.02em] whitespace-nowrap sm:text-base">
						<FaClock className="mr-2" />
						<span className="sm:hidden">24/7 Emergency</span>
						<span className="hidden sm:inline">24/7 Emergency Service</span>
					</span>
					<span className="flex items-center text-sm font-bold whitespace-nowrap sm:text-lg">
						<FaPhone className="mr-2" />
						{CompanyInfo.phone}
					</span>
				</a>
			</div>
		</section>
	);
}
