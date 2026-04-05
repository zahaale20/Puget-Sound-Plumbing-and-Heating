import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Hero from "../components/sections/Hero";
import EmergencyBar from "../components/layout/EmergencyBar";
import OurServices from "../components/sections/OurServices";
import { getCloudFrontUrl } from "../services/imageService";
import { ImageWithLoader } from "../components/ui/LoadingComponents";

const WhyChooseUs = lazy(() => import("../components/sections/WhyChooseUs"));
const FinancingBar = lazy(() => import("../components/layout/FinancingBar"));
const RecentBlogPosts = lazy(() => import("../components/sections/RecentBlogPosts"));
const FAQs = lazy(() => import("../components/sections/FAQs"));
const CallNow = lazy(() => import("../components/sections/CallNow"));
const CustomerReviews = lazy(() => import("../components/sections/CustomerReviews"));
const LimitedTimeOffers = lazy(() => import("../components/forms/LimitedTimeOffers"));
const ScheduleOnline = lazy(() => import("../components/forms/ScheduleOnline"));

function DeferredSection({ children, fallbackHeightClass = "min-h-[520px]" }) {
	const [shouldRender, setShouldRender] = useState(false);
	const sectionRef = useRef(null);

	useEffect(() => {
		if (shouldRender) return;
		const node = sectionRef.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setShouldRender(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "350px 0px" }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [shouldRender]);

	return (
		<div ref={sectionRef}>
			{shouldRender ? (
				<Suspense fallback={<div className={fallbackHeightClass} aria-hidden="true" />}>
					{children}
				</Suspense>
			) : (
				<div className={fallbackHeightClass} aria-hidden="true" />
			)}
		</div>
	);
}

export default function Home() {
	return (
		<div>
			<Hero />
			<EmergencyBar />

			<section className="relative overflow-hidden bg-[#0C2D70] flex justify-center w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<OurServices />
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<DeferredSection fallbackHeightClass="min-h-[540px] w-full">
					<WhyChooseUs />
				</DeferredSection>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<DeferredSection fallbackHeightClass="min-h-[560px] w-full">
					<CustomerReviews />
				</DeferredSection>
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<DeferredSection fallbackHeightClass="min-h-[600px] w-full">
					<FAQs />
				</DeferredSection>
			</section>

			<DeferredSection fallbackHeightClass="min-h-[180px] w-full">
				<FinancingBar />
			</DeferredSection>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<DeferredSection fallbackHeightClass="min-h-[620px] w-full">
					<LimitedTimeOffers />
				</DeferredSection>
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<DeferredSection fallbackHeightClass="min-h-[260px] w-full">
					<CallNow />
				</DeferredSection>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<ImageWithLoader
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<DeferredSection fallbackHeightClass="min-h-[760px] w-full">
					<ScheduleOnline />
				</DeferredSection>
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<DeferredSection fallbackHeightClass="min-h-[520px] w-full">
					<RecentBlogPosts />
				</DeferredSection>
			</section>
		</div>
	);
}
