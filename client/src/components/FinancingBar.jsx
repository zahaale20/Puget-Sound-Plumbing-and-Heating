import { FaCreditCard } from "react-icons/fa";

export default function EmergencyBar() {
	return (
		<section className="flex flex-col w-full bg-[#B32020] overflow-hidden">
			<div className="flex flex-row w-full max-w-7xl px-6 py-1.5 mx-auto gap-16 items-center justify-center">
				<a href="https://app.gethearth.com/financing/29435/47842/prequalify?utm_campaign=29435&utm_content=darkblue&utm_medium=contractor-website&utm_source=contractor&utm_term=47842" className="flex items-center text-white font-semibold">
					<FaCreditCard className="mr-2"/>
					Easy Financing Available
				</a>
			</div>
		</section>
	);
}