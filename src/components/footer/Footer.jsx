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
import bbbAccreddited from "../../assets/bbb-accredited-business.png";
import year20Anniversary from "../../assets/year-20-anniversary.png";
import googleReviews from "../../assets/google-reviews.png";
import pattern from "../../assets/pattern1.png";

export default function Footer() {
	const serviceAreas = [
		"Algona","Auburn","Ballard","Bellevue","Black Diamond","Bonney Lake",
		"Bothell","Brier","Buckley","Burien","Capitol Hill","Clyde Hill",
		"Edgewood","Edmonds","Enumclaw","Everett","Federal Way","Fife",
		"Fircrest","Issaquah","Kenmore","Kent","Kirkland","Lakewood",
		"Lynnwood","Maple Valley","Marysville","Medina","Mercer Island",
		"Mill Creek","Mukilteo","Newcastle","Normandy Park","Orting",
		"Pacific","Puyallup","Queen Anne","Redmond","Renton","Sammamish",
		"Seatac","Seattle","Shoreline","Snohomish","Snoqualmie","Tacoma",
		"Tukwila","University Place",
	];

	return (
		<footer className="w-full items-center justify-center">
			{/* Top Logo Row */}
			<div className="w-full bg-white flex justify-center">
				<div className="flex flex-col md:flex-row md:justify-between md:items-center items-center w-full max-w-7xl px-6 py-2 gap-4">
					
					{/* Logo */}
					<button onClick={() => navigate("/")}  className="hidden md:flex md:flex-none h-[50px] md:h-[60px] lg:h-[65px] cursor-pointer">
						<img src={logo} alt="Puget Sound Plumbing and Heating Logo" className="h-full w-auto object-contain" />
					</button>

					{/* Right-side Badges */}
					<div className="flex flex-row items-center gap-8 justify-center md:justify-start w-full md:w-auto">
						<img src={easyFinancingAvailable} alt="Easy Financing Available" className="hidden sm:block h-[50px] object-contain" />
						<img src={googleReviews} alt="Google Reviews" className="h-[50px] object-contain" />
						<img src={bbbAccreddited} alt="BBB Accredited Business" className="h-[50px] object-contain" />
						<img src={year20Anniversary} alt="20 Year Anniversary" className="hidden sm:block h-[50px] object-contain rounded-lg" />
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
				{/* Overlay */}
				<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none z-0"></div>

				{/* Content */}
				<div className="flex flex-col lg:flex-row justify-between z-10 w-full max-w-7xl px-6 gap-12 text-white">

					{/* Left: Service Areas */}
					<div className="flex-1 min-w-[250px]">
						<h4 className="relative inline-block py-1 mb-4">
							Service Areas
							<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
						</h4>
						<div className="grid grid-cols-3 sm:grid-cols-4 gap-x-8 gap-y-2">
							{serviceAreas.map((area) => (
								<a key={area} href="#" className="hover:underline whitespace-nowrap text-base md:text-lg">
									{area}
								</a>
							))}
						</div>
					</div>

					{/* Right: Contact + Social Media + License */}
					<div className="flex flex-col sm:flex-row lg:flex-col flex-wrap gap-8 flex-shrink-0 justify-between">
						
						{/* Contact Info */}
						<div className="min-w-[180px]">
							<h4 className="relative inline-block py-2 mb-4">
								Contact Us
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h4>
							<ul className="flex flex-col space-y-2 justify-between text-base md:text-lg">
								<li className="flex items-center gap-2">
									<FaPhone />
									<a href="tel:866-582-4730" className="hover:underline">(866) 582-4730</a>
								</li>
								<li className="flex gap-2">
									<FaLocationDot className="mt-1" /> {/* optional small top margin */}
									<a href="https://www.google.com/maps?ll=47.497727,-122.309506&z=16&t=m&hl=en&gl=US&mapclient=embed&q=11803+Des+Moines+Memorial+Dr+S+Burien,+WA+98168" className="flex flex-col hover:underline">
										<span>11803 Des Moines Memorial Dr S</span>
										<span>Burien, WA 98168</span>
									</a>
								</li>
							</ul>
						</div>

						<div className="flex flex-row sm:flex-col gap-6 justify-between">
							{/* Social Media */}
							<div className="min-w-[180px]">
								<h4 className="relative inline-block py-2 mb-4">
									Connect With Us
									<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
								</h4>
								<ul className="flex sm:flex-col items-center sm:items-start space-x-4 sm:space-x-0 sm:space-y-2 ">
									<li className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 text-2xl sm:text-base">
										<FaFacebookF className="text-base md:text-lg"/>
										<a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-base md:text-lg hidden sm:inline hover:underline">
											Facebook
										</a>
									</li>
									<li className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 text-2xl sm:text-base">
										<FaInstagram className="text-base md:text-lg"/>
										<a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-base md:text-lg hidden sm:inline hover:underline">
											Instagram
										</a>
									</li>
									<li className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 text-2xl sm:text-base">
										<FaYoutube className="text-base md:text-lg"/>
										<a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-base md:text-lg hidden sm:inline hover:underline">
											YouTube
										</a>
									</li>
									<li className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 text-2xl sm:text-base">
										<FaXTwitter className="text-base md:text-lg"/>
										<a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-base md:text-lg hidden sm:inline hover:underline">
											X
										</a>
									</li>
								</ul>
							</div>

							{/* License */}
							<div className="min-w-[180px]">
								<h4 className="relative inline-block py-2 mb-4">
									WA License
									<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
								</h4>
								<ul className="space-y-2 text-base md:text-lg">
									<li className="flex items-center gap-2">
										<FaIdCard />
										<p>#PUGETSP929CF</p>
									</li>
								</ul>
							</div>
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
