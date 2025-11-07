import { FaClock, FaPhone } from "react-icons/fa";

export default function EmergencyBar() {
	return (
		<section className="flex flex-col w-full bg-[#B32020] overflow-hidden">
			<div className="flex flex-row w-full max-w-7xl px-6 py-1.5 mx-auto gap-16 items-center justify-center">
				<a href="tel:206-938-3219" className="flex items-center text-white font-semibold">
					<FaClock className="mr-2"/>
					24/7 Emergency Service: 
					<FaPhone className="mx-2"/>
					(206) 938-3219
				</a>
			</div>
		</section>
	);
}