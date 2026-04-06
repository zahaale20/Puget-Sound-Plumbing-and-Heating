import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "./components/layout/Header";
import RouteSeo from "./components/seo/RouteSeo";
import { getRouteFallbackPolicy } from "./routeFallback";
import { FooterSkeleton } from "./components/ui/LoadingComponents";
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
	const fallbackPolicy = getRouteFallbackPolicy(pathname);

	return (
		<div
			className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-6 text-[#0C2D70]"
			data-testid="route-shell-loading"
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			<span className="sr-only">{fallbackPolicy.announcement}</span>
			<span className="relative h-2 w-2 shrink-0" aria-hidden="true">
				<span className="absolute inset-0 animate-ping rounded-full bg-[#B32020]/45" />
				<span className="relative block h-2 w-2 rounded-full bg-[#B32020]" />
			</span>
			<div className="h-1 flex-1 overflow-hidden rounded-full bg-[#D9E1F0]" aria-hidden="true">
				<div className="h-full w-1/3 animate-pulse rounded-full bg-[#0C2D70]" />
			</div>
			<span className="shrink-0 text-sm font-medium">{fallbackPolicy.loadingLabel}</span>
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<RouteSeo />
			<div className="flex flex-col min-h-screen mx-auto overflow-x-hidden">
				<Header />
				<main className="flex-1">
					<Suspense fallback={<RouteSuspenseFallback />}>
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
					</Suspense>
				</main>
				<DeferredFooter />
			</div>
		</BrowserRouter>
	);
}

export default App;
