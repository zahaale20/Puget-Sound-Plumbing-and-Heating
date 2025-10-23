import { FaCreditCard } from "react-icons/fa";

export default function EmergencyBar() {
	return (
		<div className="flex items-center justify-center w-full py-2 bg-[#B32020] shadow-sm">
			<a href="tel:8665824730" className="flex items-center text-white font-semibold">
				<FaCreditCard className="mr-2"/>
				Easy Financing Available
			</a>
		</div>
	);
}