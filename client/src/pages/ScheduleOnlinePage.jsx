import ScheduleOnline from "../components/forms/ScheduleOnline";
import { ImageWithLoader } from "../components/ui/LoadingComponents";
import { getCloudFrontUrl } from "../services/imageService";

export default function ScheduleOnlinePage() {
	return (
		<>
			<section className="relative overflow-hidden bg-[#0C2D70] flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px]">
				<ImageWithLoader
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="relative z-10 flex flex-col max-w-7xl mx-auto px-6 w-full gap-4 text-white text-center md:text-left">
					<h1 className="relative inline-block pb-2 w-fit text-2xl md:text-3xl font-semibold">
						Schedule Online
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h1>
					<p className="max-w-3xl text-white/90">
						Send us your details and our team will contact you to confirm your appointment.
					</p>
				</div>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<div className="relative z-10 w-full flex justify-center">
					<ScheduleOnline />
				</div>
			</section>
		</>
	);
}
