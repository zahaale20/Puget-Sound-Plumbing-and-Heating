import Hero from "../components/Hero";
import EmergencyBar from "../components/EmergencyBar";
import OurServices from "../components/OurServices";
import WhyChooseUs from "../components/WhyChooseUs";
import FinancingBar from "../components/FinancingBar";
import CustomerReviews from "../components/CustomerReviews";
import ScheduleOnline from "../components/ScheduleOnline";
import LimitedTimeOffers from "../components/LimitedTimeOffers";
import RecentBlogPosts from "../components/RecentBlogPosts";
import FAQs from "../components/FAQs";
import CallNow from "../components/CallNow";
import { getCloudFrontUrl } from "../api/imageService";

export default function Home() {


	return (
		<div>
			<Hero />
			<EmergencyBar />

			<section
				className="relative overflow-hidden bg-[#0C2D70] flex justify-center w-full py-16"

			>
			<img src={getCloudFrontUrl("private/pattern1.png")} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover z-0" />
			
			
			
			
				<OurServices />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<WhyChooseUs />
			</section>

			<section
				className="relative overflow-hidden flex justify-center w-full py-16"

			>
			<img src={getCloudFrontUrl("private/seattle-skyline.png")} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover object-bottom z-0" />
			
			
			
			
				<CustomerReviews />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<FAQs />
			</section>

			<FinancingBar />

			<section
				className="relative overflow-hidden bg-[#0C2D70] flex justify-center w-full py-16"

			>
			
			
			
			
			
				<LimitedTimeOffers />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<CallNow />
			</section>

			<section
				className="relative overflow-hidden flex justify-center w-full py-16"

			>
			
			
			
			
			
				<ScheduleOnline />
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<RecentBlogPosts />
			</section>
		</div>
	);
}