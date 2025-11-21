import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

import HomePage from "./components/pages/home/HomePage";
import ScheduleOnlinePage from "./components/pages/schedule-online/ScheduleOnlinePage";

import BlogPage from "./components/pages/blog/BlogPage";
import BlogPostPage from "./components/pages/blog/BlogPostPage";
import CareersPage from "./components/pages/careers/CareersPage";
import CouponsPage from "./components/pages/coupons/CouponsPage";
import ResourcesPage from "./components/pages/resources/ResourcesPage";
import AboutUsPage from "./components/pages/about-us/AboutUsPage";

import FAQsPage from "./components/pages/faqs/FAQsPage"

import ServiceAreasPage from "./components/pages/service-areas/ServiceAreasPage";
import RegionPage from "./components/pages/service-areas/RegionPage";
import AreaPage from "./components/pages/service-areas/AreaPage";

import ServicesPage from "./components/pages/services/ServicesPage";

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
					<Route path="/coupons" element={<CouponsPage />} />
					<Route path="/resources" element={<ResourcesPage />} />
					<Route path="/about-us" element={<AboutUsPage />} />

					<Route path="/faqs" element={<FAQsPage />} />

					<Route path="/service-areas" element={<ServiceAreasPage />} />
					<Route path="/service-areas/:regionSlug" element={<RegionPage />} />
					<Route path="/service-areas/:regionSlug/:areaSlug" element={<AreaPage />} />

					<Route path="/services" element={<ServicesPage />} />
				</Routes>
				<Footer />
			</div>
		</BrowserRouter>
	);
}

export default App;
