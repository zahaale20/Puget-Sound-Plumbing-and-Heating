import {
	FaPhone,
	FaLocationDot,
	FaIdCard,
	FaFacebookF,
	FaInstagram,
	FaYoutube,
	FaXTwitter,
} from "react-icons/fa6";

import logo from "../assets/pspah-logo.png";
import bbbAccreddited from "../assets/bbb-accredited-business.png";
import year20Anniversary from "../assets/year-20-anniversary.png";
import googleReviews from "../assets/google-reviews.png";
import pattern from "../assets/pattern1.png";

import { useNavigate } from "react-router-dom";

export default function Footer() {
	const navigate = useNavigate();

	return (
		<footer className="w-full items-center justify-center">
			<div className="w-full bg-white flex justify-center">
				<div className="flex flex-col md:flex-row md:justify-between md:items-center items-center w-full max-w-7xl px-6 py-2 gap-4">
					
					{/* Logo */}
					<button onClick={() => navigate("/")} className="hidden md:flex md:flex-none h-[50px] md:h-[60px] lg:h-[65px] cursor-pointer">
						<img src={logo} alt="Puget Sound Plumbing and Heating Logo" className="h-full w-auto object-contain" />
					</button>

					{/* Right-side Badges */}
					<div className="flex flex-row items-center gap-8 justify-center md:justify-start w-full md:w-auto">
						<img src={googleReviews} alt="Google Reviews" className="h-[55px] object-contain" />
						<img src={bbbAccreddited} alt="BBB Accredited Business" className="h-[55px] object-contain" />
						<img src={year20Anniversary} alt="20 Year Anniversary" className="hidden sm:block h-[55px] object-contain" />
					</div>
				</div>
			</div>

			{/* Main Footer */}
			<div
				className="relative flex flex-col items-center w-full py-16"
				style={{
					backgroundImage: `url(${pattern})`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundSize: "cover",
				}}
			>
				{/* Content */}
				<div className="flex flex-col lg:flex-row justify-between z-10 w-full max-w-7xl px-6 gap-12 lg:gap-24 text-white">
					
					{/* LEFT COLUMN: Brand + Contact (1/4 space) */}
					<div className="flex flex-col lg:basis-2/5 gap-8">
						<div className="flex flex-col gap-4">
							<h5 className="relative inline-block py-1 w-fit">
								Puget Sound Plumbing and Heating
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<p className="relative inline-block w-fit italic">
								"The sound solution to your plumbing problems."
							</p>
							<p className="leading-relaxed">
								Trusted plumbing solutions for homes and businesses in the Puget Sound. Fully licensed, insured, and satisfaction guaranteed.
							</p>
							<li className="flex items-center gap-2">
								<FaIdCard />
								<p>#PUGETSP929CF</p>
							</li>
						</div>

						<div className="min-w-[180px]">
							<h5 className="relative inline-block py-2 mb-4 text-lg font-semibold w-fit">
								Contact Us
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="flex flex-col space-y-2">
								<li className="flex items-center gap-2">
									<FaPhone />
									<a href="tel:206-938-3219" className="hover:underline">(206) 938-3219</a>
								</li>
								<li className="flex gap-2">
									<FaLocationDot className="mt-1" />
									<a href="https://www.google.com/maps?ll=47.497727,-122.309506&z=16&t=m&hl=en&gl=US&mapclient=embed&q=11803+Des+Moines+Memorial+Dr+S+Burien,+WA+98168" className="flex flex-col hover:underline">
										<span>11803 Des Moines Memorial Dr S</span>
										<span>Burien, WA 98168</span>
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* RIGHT COLUMN: Nav Links + Socials (3/4 space) */}
					<div className="lg:basis-3/5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-8 lg:gap-12">
						{/* Services */}
						<div>
							<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold w-fit">
								Services
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="space-y-2">
								<li><a href="/services/plumbing" className="hover:underline">Plumbing</a></li>
								<li><a href="/services/drain-and-sewer" className="hover:underline">Drain & Sewer</a></li>
								<li><a href="/services/water-heaters" className="hover:underline">Water Heaters</a></li>
								<li><a href="/services/heating-and-cooling" className="hover:underline">Heating & Cooling</a></li>
							</ul>
						</div>

						{/* Resources */}
						<div>
							<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold w-fit">
								Resources
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="space-y-2">
								<li><a href="/blog" className="hover:underline">Blog</a></li>
								<li><a href="/coupons" className="hover:underline">Coupons</a></li>
								<li><a href="/faqs" className="hover:underline">FAQs</a></li>
								<li><a href="/financing" className="hover:underline">Financing</a></li>
								<li><a href="/warranty" className="hover:underline">Warranty</a></li>
							</ul>
						</div>

						{/* Company */}
						<div>
							<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold w-fit">
								Company
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="space-y-2">
								<li><a href="/about-us" className="hover:underline">About Us</a></li>
								<li><a href="/careers" className="hover:underline">Careers</a></li>
								<li><a href="/reviews" className="hover:underline">Reviews</a></li>
								<li><a href="/service-areas" className="hover:underline">Service Areas</a></li>
							</ul>
						</div>

						{/* Socials */}
						<div>
							<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold w-fit">
								Connect
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="flex flex-col space-y-2">
								<li className="flex items-center gap-2">
									<FaFacebookF /> <a href="https://www.facebook.com/pugetsoundplumbing/" className="hover:underline">Facebook</a>
								</li>
								<li className="flex items-center gap-2">
									<FaInstagram /> <a href="https://www.instagram.com/puget_sound_plumbing_heating/" className="hover:underline">Instagram</a>
								</li>
								<li className="flex items-center gap-2">
									<FaYoutube /> <a href="https://www.youtube.com/user/pugetsoundplumbing" className="hover:underline">YouTube</a>
								</li>
								<li className="flex items-center gap-2">
									<FaXTwitter /> <a href="https://x.com/PugetPlumbing" className="hover:underline">X</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="w-full h-[80px] bg-[#0C2D70] border-t border-white text-sm text-white flex items-center">
				<div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto px-6 w-full gap-4">
					{/* Left Side */}
					<span>© {new Date().getFullYear()} Puget Sound Plumbing and Heating</span>

					{/* Right Side */}
					<span>Made by Cavo Studio</span>
				</div>
			</div>
		</footer>
	);
}
