import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Hero from "../components/sections/Hero";
import EmergencyBar from "../components/layout/EmergencyBar";
import OurServices from "../components/sections/OurServices";
import { getCloudFrontUrl } from "../services/imageService";
import {
	FormSectionSkeleton,
	OfferCardsSkeleton,
	PromoBarSkeleton,
	RecentPostsSectionSkeleton,
	ReviewSectionSkeleton,
	TextImageSectionSkeleton,
} from "../components/ui/LoadingComponents";

const WhyChooseUs = lazy(() => import("../components/sections/WhyChooseUs"));
const FinancingBar = lazy(() => import("../components/layout/FinancingBar"));
const RecentBlogPosts = lazy(() => import("../components/sections/RecentBlogPosts"));
const FAQs = lazy(() => import("../components/sections/FAQs"));
const CallNow = lazy(() => import("../components/sections/CallNow"));
const CustomerReviews = lazy(() => import("../components/sections/CustomerReviews"));
const LimitedTimeOffers = lazy(() => import("../components/forms/LimitedTimeOffers"));
const ScheduleOnline = lazy(() => import("../components/forms/ScheduleOnline"));

function DeferredSection({ children, fallback }) {
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
				<Suspense fallback={fallback}>
					{children}
				</Suspense>
			) : (
				fallback
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
				<img
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
				<DeferredSection
					fallback={
						<TextImageSectionSkeleton
							className="w-full"
							imageSide="left"
							imageClassName="h-84 w-full max-w-[18rem]"
							buttonClassName="h-6 w-28 ml-auto"
						/>
					}
				>
					<WhyChooseUs />
				</DeferredSection>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<img
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<DeferredSection fallback={<ReviewSectionSkeleton className="w-full py-16" />}>
					<CustomerReviews />
				</DeferredSection>
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<DeferredSection
					fallback={
						<TextImageSectionSkeleton
							className="w-full"
							imageSide="right"
							imageClassName="h-60 w-full max-w-[20rem]"
							buttonClassName="h-6 w-32 ml-auto"
							showButton
						/>
					}
				>
					<FAQs />
				</DeferredSection>
			</section>

			<DeferredSection fallback={<PromoBarSkeleton />}>
				<FinancingBar />
			</DeferredSection>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<img
					src={getCloudFrontUrl("private/pattern1-1920.webp")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<DeferredSection fallback={<OfferCardsSkeleton className="w-full py-16" />}>
					<LimitedTimeOffers />
				</DeferredSection>
			</section>

			<section className="flex flex-col w-full bg-[#F5F5F5]">
				<DeferredSection
					fallback={
						<TextImageSectionSkeleton
							className="w-full"
							imageSide="left"
							imageClassName="h-80 w-full max-w-[18rem] rounded-lg"
							buttonClassName="h-[50px] w-full sm:w-[200px]"
						/>
					}
				>
					<CallNow />
				</DeferredSection>
			</section>

			<section className="relative overflow-hidden flex justify-center w-full py-16">
				<img
					src={getCloudFrontUrl("private/seattle-skyline.png")}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
				/>
				<DeferredSection fallback={<FormSectionSkeleton className="w-full py-16" />}>
					<ScheduleOnline />
				</DeferredSection>
			</section>

			<section className="flex justify-center w-full bg-[#F5F5F5] py-16">
				<DeferredSection fallback={<RecentPostsSectionSkeleton className="w-full" />}>
					<RecentBlogPosts />
				</DeferredSection>
			</section>
		</div>
	);
}
