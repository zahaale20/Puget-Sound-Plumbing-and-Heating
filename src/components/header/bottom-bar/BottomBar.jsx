import { FaMapMarkerAlt, FaPhone, FaRegCalendarAlt } from "react-icons/fa";

export default function BottomBar() {
	return (
		<div className="hidden sm:flex justify-center items-center w-full bg-white shadow-lg">
			<div className="w-full max-w-7xl h-full px-6">
				<div className="flex justify-between items-center w-full h-[50px] border-t border-[#0C2D70] font-semibold">
					{/* Location */}
					<a
						href="https://www.google.com/maps/dir/47.5922432,-122.0182016/11803+Des+Moines+Memorial+Dr,+Burien,+WA+98168"
						className="flex flex-row gap-2 items-center text-base"
						target="_blank"
						rel="noreferrer"
					>
						<FaMapMarkerAlt className="flex text-[#B32020]" />
						<span className="flex text-[#0C2D70]">Seattle, WA</span>
					</a>

					{/* Actions */}
					<div className="flex flex-row gap-2 items-center">
						<button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]">
							<FaRegCalendarAlt />
							Schedule Online
						</button>

						<button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#0C2D70] hover:bg-[#081a46]">
							<FaPhone />
							Call (866) 582-4730
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
