import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { FaPhone, FaRegCalendarAlt } from "react-icons/fa";
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from "react-icons/fa6";
import { getCloudFrontUrl } from "../../services/imageService";
import { CompanyInfo, SocialLinks, HeroContent } from "../../data/data";

export default function Hero() {
	const navigate = useNavigate();
	const location = useLocation();
	const shouldPrioritizeHeroImage = location.pathname === "/";

	return (
		<section
			className="relative flex flex-col items-center justify-center w-full mt-[101px] h-[calc(100vh-101px)] md:mt-[106px] md:h-[calc(100vh-106px)] lg:h-[calc(100vh-167px)] lg:mt-[167px]"
			style={{ backgroundColor: "#0C2D70" }}
		>
			{/* Hero image — real <img> so fetchPriority="high" is respected */}
			<img
				src={getCloudFrontUrl("private/home-page-hero2-1920.webp")}
				alt=""
				aria-hidden="true"
				width="1920"
				height="1080"
				decoding="async"
				srcSet={[
					`${getCloudFrontUrl("private/home-page-hero2-1280.webp")} 1280w`,
					`${getCloudFrontUrl("private/home-page-hero2-1920.webp")} 1920w`,
				].join(", ")}
				sizes="100vw"
				fetchPriority={shouldPrioritizeHeroImage ? "high" : "auto"}
				className="absolute inset-0 w-full h-full object-cover"
			/>

			{/* Gradient Overlay */}
			<div className="z-0 absolute inset-0 bg-[linear-gradient(0deg,_#00000088_15%,_#ffffff22_100%)]"></div>

			{/* Content Wrapper (Centered) */}
			<div className="z-1 flex flex-col items-center text-center w-full max-w-7xl px-6 py-16 gap-8">
				{/* Title */}
				<h1 className="uppercase leading-tight text-white text-4xl md:text-5xl lg:text-6xl font-extrabold">
					{HeroContent.heading.split("\n").map((line, i) => (
						<span key={i}>
							{i > 0 && <br />}
							{line}
						</span>
					))}
				</h1>

				{/* Description */}
				<p className="text-base lg:text-lg text-white">
					{HeroContent.description}
				</p>

				{/* Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch w-full">
					<button
						onClick={() => navigate("/schedule-online")}
						className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]"
					>
						<FaRegCalendarAlt />
						Schedule Online
					</button>
					<a
						href={CompanyInfo.phoneTel}
						className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#0C2D70] hover:bg-[#081a46]"
					>
						<FaPhone />
						{CompanyInfo.phone}
					</a>
				</div>
			</div>

			{/* Social Media Icons */}
			<div className="absolute bottom-6 flex flex-row gap-6 items-center z-10 justify-end">
				<a
					href={SocialLinks.facebook}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Facebook"
				>
					<FaFacebookF className="text-xl text-white" />
				</a>
				<a
					href={SocialLinks.instagram}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Instagram"
				>
					<FaInstagram className="text-xl text-white" />
				</a>
				<a
					href={SocialLinks.youtube}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="YouTube"
				>
					<FaYoutube className="text-xl text-white" />
				</a>
				<a
					href={SocialLinks.twitter}
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
