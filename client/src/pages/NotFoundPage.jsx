import { useNavigate } from "react-router-dom";
import { getCloudFrontUrl } from "../services/imageService";
import Seo from "../components/seo/Seo";

export default function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<div className="mt-[101px] md:mt-[106px] lg:mt-[167px]">
			<Seo
				title="Page Not Found"
				description="The requested page could not be found on Puget Sound Plumbing and Heating."
				path="/404"
				noIndex
			/>
			<section className="relative overflow-hidden bg-[#0C2D70] flex justify-center w-full py-24">
				<img
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-6 gap-6">
					<p className="text-8xl font-bold text-white">404</p>

					<h1 className="text-white relative inline-block pb-2 text-2xl md:text-3xl font-semibold">
						Page Not Found
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] w-full"></span>
					</h1>

					<p className="text-white/80">
						The page you're looking for doesn't exist or may have been moved.
					</p>

					<button
						onClick={() => navigate("/")}
						className="flex items-center justify-center w-full sm:w-[200px] h-[50px] text-base font-semibold text-white cursor-pointer transition-all duration-300 bg-[#B32020] hover:bg-[#7a1515] mt-2"
					>
						Return Home
					</button>
				</div>
			</section>
		</div>
	);
}
