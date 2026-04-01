import { FaCreditCard } from "react-icons/fa";
import { CompanyInfo } from "../../data/data";

export default function EmergencyBar() {
	return (
		<section className="flex flex-col w-full bg-[#B32020] overflow-hidden">
			<div className="flex flex-row w-full max-w-7xl px-6 py-1.5 mx-auto gap-16 items-center justify-center">
				<a
					href={CompanyInfo.financingUrl}
					className="flex items-center text-white font-semibold"
				>
					<FaCreditCard className="mr-2" />
					Easy Financing Available
				</a>
			</div>
		</section>
	);
}
