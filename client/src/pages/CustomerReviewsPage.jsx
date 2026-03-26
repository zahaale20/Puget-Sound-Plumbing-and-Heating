import CustomerReviews from "../components/CustomerReviews";
import { getCloudFrontUrl } from "../api/imageService";

export default function CustomerReviewsPage() {
	return (
		<section className="relative overflow-hidden flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px]">
			<img
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
