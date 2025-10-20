import { FaPhone, FaMapMarkerAlt, FaRegCalendarAlt } from "react-icons/fa";
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from "react-icons/fa6";

import hero from "../../../../../assets/hero2.png";
import bbbAccreddited from "../../../../../assets/bbb-accredited-business.png";
import googleReviews from "../../../../../assets/google-reviews-white.png";

export default function Hero() {
	return (
		<section
			className="relative flex flex-col items-center justify-center w-full h-[calc(100vh-60px)] mt-[60px] overflow-hidden text-white"
			style={{
				backgroundImage: `url(${hero})`,
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "cover",
			}}
		>
			{/* Gradient overlay */}
			<div className="absolute inset-0 bg-[linear-gradient(0deg,_#00000088_15%,_#ffffff22_100%)] z-0"></div>

			{/* Centered Content */}
			<div className="relative z-10 flex flex-col items-center justify-between text-center w-full px-6 py-12">
				<h1 className="uppercase leading-tight mb-12">
					Seattle's Trusted
					<br />
					Plumbing Experts
				</h1>

				<p className="mb-6">
					The sound solution to your plumbing problems.
				</p>

				<div className="flex flex-row gap-3 mb-6 items-center">
					<span className="text-sm">Connect With Us</span>

					<a
						href="https://www.facebook.com/pugetsoundplumbing"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Facebook"
					>
						<FaFacebookF className="text-lg" />
					</a>

					<a
						href="https://www.instagram.com/pugetsoundplumbing"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Instagram"
					>
						<FaInstagram className="text-lg" />
					</a>

					<a
						href="https://www.youtube.com/@pugetsoundplumbing"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="YouTube"
					>
						<FaYoutube className="text-lg" />
					</a>

					<a
						href="https://twitter.com/pugetsoundplumb"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Twitter"
					>
						<FaXTwitter className="text-lg" />
					</a>
				</div>

				{/* Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center items-stretch w-full">
					<button className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]">
						<FaRegCalendarAlt />
						Schedule Online
					</button>
					<button className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#0C2D70] hover:bg-[#081a46]">
						<FaPhone />
						(866) 582-4730
					</button>
				</div>
			</div>
		</section>
	);
}
