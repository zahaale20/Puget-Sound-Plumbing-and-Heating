import Hero from "../components/sections/Hero";
import EmergencyBar from "../components/layout/EmergencyBar";
import OurServices from "../components/sections/OurServices";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import FinancingBar from "../components/layout/FinancingBar";
import CustomerReviews from "../components/sections/CustomerReviews";
import ScheduleOnline from "../components/forms/ScheduleOnline";
import LimitedTimeOffers from "../components/forms/LimitedTimeOffers";
import RecentBlogPosts from "../components/sections/RecentBlogPosts";
import FAQs from "../components/sections/FAQs";
import CallNow from "../components/sections/CallNow";
import { getImageUrl } from "../services/imageService";

export default function Home() {
	return (
		<div>
			<Hero />
			<EmergencyBar />

			<section className="relative overflow-hidden bg-[#0C2D70] flex justify-center w-full py-16">
				<img
					src={getImageUrl("site/pattern1.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<OurServices />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<WhyChooseUs />
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<img
					src={getImageUrl("site/seattle-skyline.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>

				<CustomerReviews />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<FAQs />
			</section>

			<FinancingBar />

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<img
					src={getImageUrl("site/pattern1.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<LimitedTimeOffers />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<CallNow />
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<img
					src={getImageUrl("site/seattle-skyline.webp")}
					alt=""
					aria-hidden="true"
					fetchPriority="high"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<ScheduleOnline />
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<RecentBlogPosts />
			</section>
		</div>
	);
}
