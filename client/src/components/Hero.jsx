import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaPhone, FaRegCalendarAlt } from "react-icons/fa";
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from "react-icons/fa6";
import { getCloudFrontUrl } from "../api/imageService";

export default function Hero() {
	const navigate = useNavigate();
	const [heroURL, setHeroURL] = useState(null);
	const [imageLoaded, setImageLoaded] = useState(false);

	useEffect(() => {
		const url = getCloudFrontUrl("private/home-page-hero2.png");
		setHeroURL(url);

		// Preload the image
		const img = new Image();
		img.onload = () => setImageLoaded(true);
		img.src = url;
	}, []);

	return (
		<section
			className="flex flex-col items-center justify-center w-full mt-[101px] h-[calc(100vh-101px)] md:mt-[106px] md:h-[calc(100vh-106px)] lg:h-[calc(100vh-167px)] lg:mt-[167px]"
			style={{
				backgroundImage: imageLoaded && heroURL ? `url(${heroURL})` : "none",
				backgroundColor: imageLoaded ? "transparent" : "#f5f5f5",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "cover",
				transition: "background-color 0.3s ease-in-out"
			}}
		>
			{/* Gradient Overlay */}
			<div className="z-0 absolute inset-0 bg-[linear-gradient(0deg,_#00000088_15%,_#ffffff22_100%)]"></div>

			{/* Content Wrapper (Centered) */}
			<div className={`z-1 flex flex-col items-center text-center w-full max-w-7xl px-6 py-16 gap-8 ${imageLoaded ? 'fade-in' : ''}`}>
				{/* Title */}
				<h1 className="uppercase leading-tight text-white">
					Seattle's Trusted
					<br />
					Plumbing Experts
				</h1>

				{/* Description */}
				<p className="text-base lg:text-lg text-white">The sound solution to your plumbing problems.</p>

				{/* Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch w-full">
					<button onClick={() => navigate("/schedule-online")} className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]">
						<FaRegCalendarAlt />
						Schedule Online
					</button>
					<a
						href="tel:206-938-3219"
						className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#0C2D70] hover:bg-[#081a46]"
					>
						<FaPhone />
						(206) 938-3219
					</a>
				</div>
			</div>

			{/* Social Media Icons */}
			<div className="absolute bottom-6 flex flex-row gap-6 items-center z-10 justify-end">
				<a
					href="https://www.facebook.com/pugetsoundplumbing/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Facebook"
				>
					<FaFacebookF className="text-xl text-white" />
				</a>
				<a
					href="https://www.instagram.com/puget_sound_plumbing_heating/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Instagram"
				>
					<FaInstagram className="text-xl text-white" />
				</a>
				<a
					href="https://www.youtube.com/user/pugetsoundplumbing"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="YouTube"
				>
					<FaYoutube className="text-xl text-white" />
				</a>
				<a
					href="https://x.com/PugetPlumbing"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Twitter"
				>
					<FaXTwitter className="text-xl text-white" />
				</a>
			</div>
		</section>
	);
}
