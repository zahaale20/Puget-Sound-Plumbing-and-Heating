import Hero from "./components/Hero";
import EmergencyBar from "./components/EmergencyBar";
import OurServices from "./components/OurServices";
import WhyChooseUs from "./components/WhyChooseUs";
import FinancingBar from "./components/FinancingBar";
import CustomerReviews from "./components/CustomerReviews";
import ScheduleOnline from "./components/ScheduleOnline"
import LimitedTimeOffers from "./components/LimitedTimeOffers"
import RecentBlogPosts from "./components/RecentBlogPosts"
import FAQs from "./components/FAQs";
import CallNow from "./components/CallNow";

import pattern from "../../../assets/pattern1.png";
import skyline from "../../../assets/seattle-skyline.png";

export default function Home() {
	return (
		<div>
			<Hero />

			<EmergencyBar />

			<section 
				className="flex justify-center w-full py-16"
				style={{ backgroundImage: `url(${pattern})`, backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "cover" }}
			>
				<OurServices />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<WhyChooseUs />
			</section>

			<section 
				className="flex justify-center w-full py-16 bg-cover bg-bottom" 
				style={{ backgroundImage: `url(${skyline})` }}
			>
				<CustomerReviews />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<FAQs />
			</section>

			<FinancingBar />

			<section 
				className="flex justify-center w-full py-16"
				style={{ backgroundImage: `url(${pattern})`, backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "cover" }}
			>
				<LimitedTimeOffers />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<CallNow />
			</section>

			<section 
				className="flex justify-center w-full py-16 bg-cover bg-bottom" 
				style={{ backgroundImage: `url(${skyline})` }}
			>
				<ScheduleOnline />
			</section>
			
			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<RecentBlogPosts />
			</section>
		</div>
	);
}
