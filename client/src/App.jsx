import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "./components/layout/Header";
import RouteSeo from "./components/seo/RouteSeo";
import { getRouteFallbackType, ROUTE_FALLBACK_TYPES } from "./routeFallback";
import {
	AboutRouteSkeleton,
	AreaRouteSkeleton,
	BlogPostRouteSkeleton,
	BlogRouteSkeleton,
	CareersRouteSkeleton,
	CouponsRouteSkeleton,
	FAQsRouteSkeleton,
	FinancingRouteSkeleton,
	FooterSkeleton,
	HomeRouteSkeleton,
	NotFoundRouteSkeleton,
	RegionsRouteSkeleton,
	ResourcesRouteSkeleton,
	RoutePageSkeleton,
	ReviewsRouteSkeleton,
	ScheduleRouteSkeleton,
	ServiceAreasRouteSkeleton,
	ServiceCategoriesRouteSkeleton,
	ServiceCategoryRouteSkeleton,
	ServiceRouteSkeleton,
	WarrantyRouteSkeleton,
} from "./components/ui/LoadingComponents";
const Footer = lazy(() => import("./components/layout/Footer"));

const HomePage = lazy(() => import("./pages/HomePage"));
const ScheduleOnlinePage = lazy(() => import("./pages/ScheduleOnlinePage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const LimitedTimeOffersPage = lazy(() => import("./pages/LimitedTimeOffersPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const FAQsPage = lazy(() => import("./pages/FAQsPage"));
const ServiceAreasPage = lazy(() => import("./pages/ServiceAreasPage"));
const RegionsPage = lazy(() => import("./pages/RegionsPage"));
const AreaPage = lazy(() => import("./pages/AreaPage"));
const ServiceCategoriesPage = lazy(() => import("./pages/ServiceCategoriesPage"));
const ServiceCategoryPage = lazy(() => import("./pages/ServiceCategoryPage"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const FinancingPage = lazy(() => import("./pages/FinancingPage"));
const WarrantyPage = lazy(() => import("./pages/WarrantyPage"));
const CustomerReviewsPage = lazy(() => import("./pages/CustomerReviewsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

function DeferredFooter() {
	const [shouldRender, setShouldRender] = useState(false);
	const footerRef = useRef(null);

	useEffect(() => {
		if (shouldRender) return;
		const node = footerRef.current;
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
		<div ref={footerRef}>
			{shouldRender ? (
				<Suspense fallback={<FooterSkeleton />}>
					<Footer />
				</Suspense>
			) : null}
		</div>
	);
}

function RouteSuspenseFallback() {
	const { pathname } = useLocation();
	const fallbackType = getRouteFallbackType(pathname);

	switch (fallbackType) {
		case ROUTE_FALLBACK_TYPES.HOME:
			return <HomeRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.ABOUT:
			return <AboutRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.BLOG_INDEX:
			return <BlogRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.BLOG_POST:
			return <BlogPostRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.SCHEDULE:
			return <ScheduleRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.COUPONS:
			return <CouponsRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.CAREERS:
			return <CareersRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.RESOURCES:
			return <ResourcesRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.FAQS:
			return <FAQsRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.FINANCING:
			return <FinancingRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.WARRANTY:
			return <WarrantyRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.REVIEWS:
			return <ReviewsRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.SERVICE_AREAS:
			return <ServiceAreasRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.REGION:
			return <RegionsRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.AREA:
			return <AreaRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.SERVICE_CATEGORIES:
			return <ServiceCategoriesRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.SERVICE_CATEGORY:
			return <ServiceCategoryRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.SERVICE:
			return <ServiceRouteSkeleton />;
		case ROUTE_FALLBACK_TYPES.NOT_FOUND:
			return <NotFoundRouteSkeleton />;
		default:
			return <RoutePageSkeleton />;
	}
}

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<RouteSeo />
			<div className="flex flex-col min-h-screen mx-auto overflow-x-hidden">
				<Header />
				<Suspense fallback={<RouteSuspenseFallback />}>
					<main className="flex-1">
						<Routes>
							<Route path="/" element={<HomePage />} />

							<Route path="/schedule-online" element={<ScheduleOnlinePage />} />

							<Route path="/blog" element={<BlogPage />} />
							<Route path="/blog/:slug" element={<BlogPostPage />} />
							<Route path="/careers" element={<CareersPage />} />
							<Route path="/coupons" element={<LimitedTimeOffersPage />} />
							<Route path="/resources" element={<ResourcesPage />} />
							<Route path="/about-us" element={<AboutUsPage />} />
							<Route path="/financing" element={<FinancingPage />} />
							<Route path="/warranty" element={<WarrantyPage />} />
							<Route path="/reviews" element={<CustomerReviewsPage />} />

							<Route path="/faqs" element={<FAQsPage />} />

							<Route path="/service-areas" element={<ServiceAreasPage />} />
							<Route path="/service-areas/:regionSlug" element={<RegionsPage />} />
							<Route path="/service-areas/:regionSlug/:areaSlug" element={<AreaPage />} />

							<Route path="/services" element={<ServiceCategoriesPage />} />
							<Route path="/services/:categorySlug" element={<ServiceCategoryPage />} />
							<Route path="/services/:categorySlug/:serviceSlug" element={<ServicePage />} />

							<Route path="*" element={<NotFoundPage />} />
						</Routes>
					</main>
				</Suspense>
				<DeferredFooter />
			</div>
		</BrowserRouter>
	);
}

export default App;
