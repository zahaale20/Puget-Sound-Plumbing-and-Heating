import { FaCreditCard } from "react-icons/fa";

export default function EmergencyBar() {
	return (
		<div className="flex items-center justify-center w-full py-2 bg-[#B32020] shadow-sm">
			<a href="https://app.gethearth.com/financing/29435/47842/prequalify?utm_campaign=29435&utm_content=darkblue&utm_medium=contractor-website&utm_source=contractor&utm_term=47842" className="flex items-center text-white font-semibold">
				<FaCreditCard className="mr-2"/>
				Easy Financing Available
			</a>
		</div>
	);
}