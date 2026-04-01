import { FaClock, FaPhone } from "react-icons/fa";
import { CompanyInfo } from "../../data/data";

export default function EmergencyBar() {
	return (
		<section className="flex flex-col w-full bg-[#B32020] overflow-hidden">
			<div className="flex flex-row w-full max-w-7xl px-6 py-1.5 mx-auto gap-16 items-center justify-center">
				<a href={CompanyInfo.phoneTel} className="flex items-center text-white font-semibold">
					<FaClock className="mr-2" />
					24/7 Emergency Service:
					<FaPhone className="mx-2" />
					{CompanyInfo.phone}
				</a>
			</div>
		</section>
	);
}
