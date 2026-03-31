import {
	FaPhone,
	FaLocationDot,
	FaIdCard,
	FaFacebookF,
	FaInstagram,
	FaYoutube,
	FaXTwitter,
} from "react-icons/fa6";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { getCloudFrontUrl } from "../../services/imageService";
import { getHCaptchaToken } from "../../services/hcaptchaService";
import { ImageWithLoader } from "../ui/LoadingComponents";
import { subscribeNewsletter } from "../../services/emailService";
import FormResponseMessage from "../ui/FormResponseMessage";

export default function Footer() {
	const navigate = useNavigate();
	const [patternUrl, setPatternUrl] = useState(null);
	const [newsletterEmail, setNewsletterEmail] = useState("");
	const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
	const [newsletterSuccess, setNewsletterSuccess] = useState(false);
	const [newsletterSuccessMessage, setNewsletterSuccessMessage] = useState("Thank you! We'll be in touch soon.");
	const [newsletterError, setNewsletterError] = useState(null);

	useEffect(() => {
		setPatternUrl(getCloudFrontUrl("private/pattern1.png"));
	}, []);

	return (
		<footer className="w-full items-center justify-center">
			<div className="w-full bg-white flex justify-center">
				<div className="flex flex-col md:flex-row md:justify-between md:items-center items-center w-full max-w-7xl px-6 py-2 gap-4">
					{/* Logo */}
					<button
						onClick={() => navigate("/")}
						className="hidden md:flex md:flex-none h-[50px] md:h-[60px] lg:h-[65px] cursor-pointer"
					>
						<ImageWithLoader
							src={getCloudFrontUrl("public/pspah-logo.png")}
							alt="Puget Sound Plumbing and Heating Logo"
							className="h-full w-auto object-contain"
							fetchPriority="high"
						/>
					</button>

					{/* Right-side Badges */}
					<div className="flex flex-row items-center gap-8 justify-center md:justify-start w-full md:w-auto">
						<ImageWithLoader
							src={getCloudFrontUrl("private/google-reviews.png")}
							alt="Google Reviews"
							className="h-[55px] object-contain"
							loading="lazy"
						/>
						<ImageWithLoader
							src={getCloudFrontUrl("private/bbb-accredited-business.png")}
							alt="BBB Accredited Business"
							className="h-[55px] object-contain"
							loading="lazy"
						/>
						<ImageWithLoader
							src={getCloudFrontUrl("private/year-20-anniversary.png")}
							alt="20 Year Anniversary"
							className="hidden sm:block h-[55px] object-contain"
							loading="lazy"
						/>
					</div>
				</div>
			</div>

			{/* Main Footer */}
			<div
				className="relative flex flex-col items-center w-full py-16"
				style={{
					backgroundImage: patternUrl ? `url(${patternUrl})` : "none",
					backgroundColor: "#0C2D70",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundSize: "cover",
				}}
			>
				{/* Content */}
				<div className="flex flex-col justify-between z-10 w-full max-w-7xl px-6 gap-12 lg:gap-24 text-white">
					<div className="grid grid-cols-1 lg:grid-cols-2 lg:basis-2/5 gap-8">
						<div className="flex flex-col gap-4">
							<h5 className="relative inline-block py-1 w-fit">
								Puget Sound Plumbing and Heating
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<p className="relative inline-block w-fit">
								"The sound solution to your plumbing problems."
							</p>
							<ul className="flex flex-col space-y-2">
								<li className="flex items-center gap-2">
									<FaPhone />
									<a href="tel:206-938-3219" className="hover:underline">
										(206) 938-3219
									</a>
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
								<li className="flex items-center gap-2">
									<FaIdCard />
									<p>#PUGETSP929CF</p>
								</li>
							</ul>
						</div>
						<div className="flex flex-col justify-center">
							<div className="space-y-2 mb-6">
								<h5 className="relative inline-block py-1 uppercase tracking-tight w-fit">
									Stay Updated
									<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
								</h5>
								<p className="text-white/90 leading-relaxed">
									Join our mailing list for seasonal maintenance tips, exclusive promotions, and
									Puget Sound news.
								</p>
							</div>

							{newsletterSuccess ? (
								<FormResponseMessage
									type="success"
									message={newsletterSuccessMessage}
									className="mb-4"
								/>
							) : (
								<>
									<form
										onSubmit={async (e) => {
											e.preventDefault();
											setNewsletterSubmitting(true);
											setNewsletterError(null);
											setNewsletterSuccessMessage("Thank you! We'll be in touch soon.");
											try {
												// Get hCaptcha token
												const captchaToken = await getHCaptchaToken();
												if (!captchaToken) {
													setNewsletterError("Security verification failed. Please refresh and try again.");
													setNewsletterSubmitting(false);
													return;
												}

												const result = await subscribeNewsletter(newsletterEmail, captchaToken);
												if (result?.duplicate) {
													setNewsletterSuccessMessage(
														"This email is already subscribed to our mailing list."
													);
												}
												setNewsletterSuccess(true);
												setNewsletterEmail("");
												setTimeout(() => setNewsletterSuccess(false), 5000);
											} catch (err) {
												setNewsletterError(err.message || "An error occurred. Please try again.");
											} finally {
												setNewsletterSubmitting(false);
											}
										}}
										className="relative flex w-full max-w-md shadow-lg overflow-hidden mb-4"
									>
										<input
											required
											type="email"
											placeholder="Email Address"
											value={newsletterEmail}
											onChange={(e) => setNewsletterEmail(e.target.value)}
											className="flex-[2] p-2.5 text-black focus:outline-none bg-white placeholder:text-gray-400 border-gray-200"
										/>
										<button
											type="submit"
											disabled={newsletterSubmitting}
											className="flex-[1] flex items-center justify-center gap-2 py-2.5 bg-[#B32020] hover:bg-[#7a1515] text-white text-sm font-semibold uppercase cursor-pointer transition-all duration-300 disabled:opacity-60"
										>
											{newsletterSubmitting ? "..." : "Join Now"}
										</button>
									</form>
									<FormResponseMessage type="error" message={newsletterError} className="mt-3 mb-3" />
								</>
							)}
							<p className="text-[10px] text-white/70 uppercase tracking-widest">
								* We respect your privacy and never spam.
							</p>
						</div>
					</div>

					{/* RIGHT COLUMN */}
					<div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
						{/* Services */}
						<div>
							<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold w-fit">
								Our Services
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="space-y-2">
								<li>
									<a href="/services/plumbing" className="hover:underline">
										Plumbing
									</a>
								</li>
								<li>
									<a href="/services/drain-and-sewer" className="hover:underline">
										Drain & Sewer
									</a>
								</li>
								<li>
									<a href="/services/water-heaters" className="hover:underline">
										Water Heaters
									</a>
								</li>
								<li>
									<a href="/services/heating-and-cooling" className="hover:underline">
										Heating & Cooling
									</a>
								</li>
							</ul>
						</div>

						{/* Resources */}
						<div>
							<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold w-fit">
								Resources For You
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="space-y-2">
								<li>
									<a href="/blog" className="hover:underline">
										Blog
									</a>
								</li>
								<li>
									<a href="/coupons" className="hover:underline">
										Coupons
									</a>
								</li>
								<li>
									<a href="/faqs" className="hover:underline">
										FAQs
									</a>
								</li>
								<li>
									<a href="/financing" className="hover:underline">
										Financing
									</a>
								</li>
								<li>
									<a href="/warranty" className="hover:underline">
										Warranty
									</a>
								</li>
							</ul>
						</div>

						{/* Company */}
						<div>
							<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold w-fit">
								Our Company
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="space-y-2">
								<li>
									<a href="/about-us" className="hover:underline">
										About Us
									</a>
								</li>
								<li>
									<a href="/careers" className="hover:underline">
										Careers
									</a>
								</li>
								<li>
									<a href="/reviews" className="hover:underline">
										Reviews
									</a>
								</li>
								<li>
									<a href="/service-areas" className="hover:underline">
										Service Areas
									</a>
								</li>
							</ul>
						</div>

						{/* Socials */}
						<div>
							<h5 className="relative inline-block py-1 mb-4 text-lg font-semibold w-fit">
								Connect With Us
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h5>
							<ul className="flex flex-col space-y-2">
								<li className="flex items-center gap-2">
									<FaFacebookF />{" "}
									<a
										href="https://www.facebook.com/pugetsoundplumbing/"
										className="hover:underline"
									>
										Facebook
									</a>
								</li>
								<li className="flex items-center gap-2">
									<FaInstagram />{" "}
									<a
										href="https://www.instagram.com/puget_sound_plumbing_heating/"
										className="hover:underline"
									>
										Instagram
									</a>
								</li>
								<li className="flex items-center gap-2">
									<FaYoutube />{" "}
									<a
										href="https://www.youtube.com/user/pugetsoundplumbing"
										className="hover:underline"
									>
										YouTube
									</a>
								</li>
								<li className="flex items-center gap-2">
									<FaXTwitter />{" "}
									<a href="https://x.com/PugetPlumbing" className="hover:underline">
										X
									</a>
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
