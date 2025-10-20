import Hero from "./components/hero/Hero2";
import EmergencyBar from "./components/alert-bars/EmergencyBar";
import Services from "./components/services/Services";
import WhyChooseUs from "./components/why-choose-us/WhyChooseUs";
import FinancingBar from "./components/alert-bars/FinacingBar";
import CustomerReviews from "./components/customer-reviews/CustomerReviews";
import ScheduleOnline from "./components/schedule-online/ScheduleOnline"
import Discounts from "./components/current-discounts/Discounts"
import RecentBlogPosts from "./components/recent-blog-posts/RecentBlogPosts"
import FAQs from "./components/faqs/FAQs";
import CallNow from "./components/call-now/CallNow";

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
