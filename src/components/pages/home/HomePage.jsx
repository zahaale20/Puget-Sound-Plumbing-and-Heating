import Hero from "./components/Hero";
import EmergencyBar from "./components/EmergencyBar";
import OurServices from "./components/OurServices";
import WhyChooseUs from "./components/WhyChooseUs";
import FinancingBar from "./components/FinancingBar";
import CustomerReviews from "./components/CustomerReviews";
import ScheduleOnline from "./components/ScheduleOnline"
import CurrentCoupons from "./components/CurrentCoupons"
import RecentBlogPosts from "./components/RecentBlogPosts"
import FAQs from "./components/FAQs";
import CallNow from "./components/CallNow";

export default function Home() {
	return (
		<div>
			<Hero />
			<EmergencyBar />
			<OurServices />
			<WhyChooseUs />
			<CustomerReviews />
			<FAQs />
			<FinancingBar />
			<CurrentCoupons />
			<CallNow />
			<ScheduleOnline />
			<RecentBlogPosts />
		</div>
	);
}
