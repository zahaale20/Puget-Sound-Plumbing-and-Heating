import Hero from "./components/Hero2";
import EmergencyBar from "./components/EmergencyBar";
import Services from "./components/Services";
import WhyChooseUs from "./components/WhyChooseUs";
import FinancingBar from "./components/FinacingBar";
import CustomerReviews from "./components/CustomerReviews";
import ScheduleOnline from "./components/ScheduleOnline"
import Discounts from "./components/Discounts"
import RecentBlogPosts from "./components/RecentBlogPosts"
import FAQs from "./components/FAQs";
import CallNow from "./components/CallNow";

export default function Home() {
	return (
		<div id="main">
			<Hero />
			<EmergencyBar />
			<Services />
			<WhyChooseUs />
			<CustomerReviews />
			<FAQs />
			<FinancingBar />
			<Discounts />
			<CallNow />
			<ScheduleOnline />
			<RecentBlogPosts />
		</div>
	);
}
