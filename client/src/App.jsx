import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import ScheduleOnlinePage from "./pages/ScheduleOnlinePage";

import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import CareersPage from "./pages/CareersPage";
import LimitedTimeOffersPage from "./pages/LimitedTimeOffersPage";
import ResourcesPage from "./pages/ResourcesPage";
import AboutUsPage from "./pages/AboutUsPage";

import FAQsPage from "./pages/FAQsPage"

import ServiceAreasPage from "./pages/ServiceAreasPage";
import RegionsPage from "./pages/RegionsPage";
import AreaPage from "./pages/AreaPage";

import ServiceCategoriesPage from "./pages/ServiceCategoriesPage";
import ServiceCategoryPage from "./pages/ServiceCategoryPage";
import ServicePage from "./pages/ServicePage";

import FinancingPage from "./pages/FinancingPage"
import WarrantyPage from "./pages/WarrantyPage"
import CustomerReviewsPage from "./pages/CustomerReviewsPage"

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<div className="flex flex-col min-h-screen mx-auto">
				<Header />
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
				</Routes>
				<Footer />
			</div>
		</BrowserRouter>
	);
}

export default App;
