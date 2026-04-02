import { FaClock, FaPhone } from "react-icons/fa";
import { CompanyInfo } from "../../data/data";

export default function EmergencyBar() {
	return (
		<section className="flex flex-col w-full bg-[#B32020] overflow-hidden">
			<div className="w-full max-w-7xl px-4 py-2 mx-auto sm:px-6">
				<a
					href={CompanyInfo.phoneTel}
					className="flex flex-col items-center justify-center gap-1 text-center text-white sm:flex-row sm:gap-3"
				>
					<span className="flex items-center text-sm font-semibold tracking-[0.02em] sm:text-base">
						<FaClock className="mr-2" />
						24/7 Emergency Service
					</span>
					<span className="flex items-center text-base font-bold sm:text-lg">
						<FaPhone className="mr-2" />
						{CompanyInfo.phone}
					</span>
				</a>
			</div>
		</section>
	);
}
