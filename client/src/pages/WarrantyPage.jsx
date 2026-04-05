import Warranty from "../components/sections/Warranty";
import { getCloudFrontUrl } from "../services/imageService";
import { ImageWithLoader } from "../components/ui/LoadingComponents";

export default function WarrantyPage() {
	return (
		<section className="relative overflow-hidden flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px]">
			<h1 className="sr-only">Warranty Information</h1>
			<ImageWithLoader
				src={getCloudFrontUrl("private/seattle-skyline.png")}
				alt=""
				aria-hidden="true"
				fetchPriority="high"
				className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
			/>

			<Warranty />
		</section>
	);
}
