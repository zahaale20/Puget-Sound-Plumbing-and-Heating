import CustomerReviews from "../components/sections/CustomerReviews";
import { getCloudFrontUrl } from "../services/imageService";
import { ImageWithLoader } from "../components/ui/LoadingComponents";

export default function CustomerReviewsPage() {
	return (
		<section className="relative overflow-hidden flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px]">
			<h1 className="sr-only">Customer Reviews</h1>
			<ImageWithLoader
				src={getCloudFrontUrl("private/seattle-skyline.png")}
				alt=""
				aria-hidden="true"
				fetchPriority="high"
				className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
			/>

			<CustomerReviews />
		</section>
	);
}
