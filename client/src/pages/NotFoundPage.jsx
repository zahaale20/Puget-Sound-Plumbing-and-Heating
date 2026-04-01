import { useNavigate } from "react-router-dom";
import { CompanyInfo } from "../data/data";

export default function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-101px)] md:min-h-[calc(100vh-106px)] lg:min-h-[calc(100vh-166px)] gap-6 text-center px-6 mt-[101px] md:mt-[106px] lg:mt-[166px]">
			<p className="text-8xl font-bold text-[#0C2D70]">404</p>

			<div className="space-y-3">
				<h2 className="text-[#0C2D70]">Page Not Found</h2>
				<p className="text-[#2B2B2B] max-w-md">
					We're sorry — the page you're looking for doesn't exist or may have been moved.
				</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 mt-2">
				<button
					onClick={() => navigate("/")}
					className="flex items-center justify-center w-full sm:w-[200px] h-[50px] text-base font-semibold text-white cursor-pointer transition-all duration-300 bg-[#B32020] hover:bg-[#7a1515]"
				>
					Back to Home
				</button>
				<button
					onClick={() => navigate("/schedule-online")}
					className="flex items-center justify-center w-full sm:w-[200px] h-[50px] text-base font-semibold text-[#0C2D70] cursor-pointer transition-all duration-300 border-2 border-[#0C2D70] hover:bg-[#0C2D70] hover:text-white"
				>
					Schedule Online
				</button>
			</div>

			<p className="text-sm text-gray-500 mt-4">
				Need immediate help?{" "}
				<a href={CompanyInfo.phoneTel} className="text-[#B32020] font-semibold hover:underline">
					{CompanyInfo.phone}
				</a>
			</p>
		</div>
	);
}
