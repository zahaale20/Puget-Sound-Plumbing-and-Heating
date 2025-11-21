import {
	FaPhone,
	FaLocationDot,
	FaFacebookF,
	FaInstagram,
	FaYoutube,
	FaXTwitter,
	FaIdCard,
} from "react-icons/fa6";

import logo from "../../assets/pspah-logo.png";
import easyFinancingAvailable from "../../assets/easy-financing-available.png";
import lifetimeWarranty from "../../assets/warranty.png";
import bbbAccreddited from "../../assets/bbb-accredited-business.png";
import year20Anniversary from "../../assets/year-20-anniversary.png";
import googleReviews from "../../assets/google-reviews.png";
import pattern from "../../assets/pattern1.png";

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
				<div className="flex flex-col lg:flex-row justify-between z-10 w-full max-w-7xl px-6 gap-8 text-white">
					{/* Left: Navigation Columns */}
					<div className="flex-1 min-w-[250px]">
						<div className="flex flex-row gap-24">
							{/* Services Column */}
							<div>
								<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold">
									Services
									<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
								</h5>

								<ul className="space-y-2">
									<li><a href="/plumbing" className="hover:underline">Plumbing</a></li>
									<li><a href="/drain-sewer" className="hover:underline">Drain & Sewer</a></li>
									<li><a href="/water-heaters" className="hover:underline">Water Heaters</a></li>
									<li><a href="/heating-cooling" className="hover:underline">Heating & Cooling</a></li>
								</ul>
							</div>

							{/* Resources Column */}
							<div>
								<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold">
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

							{/* Company Column */}
							<div>
								<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold">
									Company
									<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
								</h5>

								<ul className="space-y-2">
									<li><a href="/about" className="hover:underline">About</a></li>
									<li><a href="/careers" className="hover:underline">Careers</a></li>
									<li><a href="/reviews" className="hover:underline">Reviews</a></li>
									<li><a href="/service-areas" className="hover:underline">Service Areas</a></li>
								</ul>
							</div>

						</div>

					</div>


					{/* Right: Contact + Social Media + License */}
					<div className="flex flex-col flex-wrap justify-start gap-8 flex-shrink-0">
						
						{/* Contact Info */}
						<div className="min-w-[180px]">
							<h5 className="relative inline-block py-2 mb-4 text-lg font-semibold">
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
									<a
										href="https://www.google.com/maps?ll=47.497727,-122.309506&z=16&t=m&hl=en&gl=US&mapclient=embed&q=11803+Des+Moines+Memorial+Dr+S+Burien,+WA+98168"
										className="flex flex-col hover:underline"
									>
										<span>11803 Des Moines Memorial Dr S</span>
										<span>Burien, WA 98168</span>
									</a>
								</li>
							</ul>
						</div>

						{/* Social Media */}
						<div className="min-w-[180px]">
							<h5 className="relative inline-block py-2 mb-4 text-lg font-semibold">
								Connect With Us
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="flex sm:flex-col items-center sm:items-start space-x-4 sm:space-x-0 sm:space-y-2 ">
								<li className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 text-2xl sm:text-base">
									<FaFacebookF />
									<a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:underline">
										Facebook
									</a>
								</li>
								<li className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 text-2xl sm:text-base">
									<FaInstagram />
									<a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:underline">
										Instagram
									</a>
								</li>
								<li className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 text-2xl sm:text-base">
									<FaYoutube />
									<a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:underline">
										YouTube
									</a>
								</li>
								<li className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 text-2xl sm:text-base">
									<FaXTwitter />
									<a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:underline">
										X
									</a>
								</li>
							</ul>
						</div>

						{/* License */}
						<div className="min-w-[180px]">
							<h5 className="relative inline-block py-2 mb-4 text-lg font-semibold">
								WA License
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<FaIdCard />
									<p>#PUGETSP929CF</p>
								</li>
							</ul>
						</div>

					</div>
				</div>

			</div>

			{/* Bottom Bar */}
			<div className="w-full h-[80px] bg-[#0C2D70] border-t border-white text-sm text-white flex items-center">
				<div className="flex flex-col sm:flex-row justify-center items-center max-w-7xl mx-auto px-6 w-full gap-2">
					<span>© {new Date().getFullYear()} Puget Sound Plumbing and Heating</span>
				</div>
			</div>
		</footer>
	);
}
