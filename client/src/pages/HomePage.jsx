import { useState, useEffect } from "react";
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
	const [patternUrl, setPatternUrl] = useState(null);
	const [skylineUrl, setSkylineUrl] = useState(null);

	useEffect(() => {
		setPatternUrl(getCloudFrontUrl("private/pattern1.png"));
		setSkylineUrl(getCloudFrontUrl("private/seattle-skyline.png"));
	}, []);

	return (
		<div>
			<Hero />
			<EmergencyBar />

			<section
				className="flex justify-center w-full py-16"
				style={{ backgroundImage: patternUrl ? `url(${patternUrl})` : "none", backgroundColor: "#0C2D70", backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "cover" }}
			>
				<OurServices />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<WhyChooseUs />
			</section>

			<section
				className="flex justify-center w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}
			>
				<CustomerReviews />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<FAQs />
			</section>

			<FinancingBar />

			<section
				className="flex justify-center w-full py-16"
				style={{ backgroundImage: patternUrl ? `url(${patternUrl})` : "none", backgroundColor: "#0C2D70", backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "cover" }}
			>
				<LimitedTimeOffers />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<CallNow />
			</section>

			<section
				className="flex justify-center w-full py-16 bg-cover bg-bottom"
				style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}
			>
				<ScheduleOnline />
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<RecentBlogPosts />
			</section>
		</div>
	);
}