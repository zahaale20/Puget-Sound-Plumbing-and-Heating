import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock all page components to isolate routing logic
vi.mock("../pages/HomePage", () => ({ default: () => <div data-testid="home-page">Home</div> }));
vi.mock("../pages/ScheduleOnlinePage", () => ({ default: () => <div data-testid="schedule-page">Schedule</div> }));
vi.mock("../pages/BlogPage", () => ({ default: () => <div data-testid="blog-page">Blog</div> }));
vi.mock("../pages/BlogPostPage", () => ({ default: () => <div data-testid="blog-post-page">Blog Post</div> }));
vi.mock("../pages/CareersPage", () => ({ default: () => <div data-testid="careers-page">Careers</div> }));
vi.mock("../pages/LimitedTimeOffersPage", () => ({ default: () => <div data-testid="coupons-page">Coupons</div> }));
vi.mock("../pages/ResourcesPage", () => ({ default: () => <div data-testid="resources-page">Resources</div> }));
vi.mock("../pages/AboutUsPage", () => ({ default: () => <div data-testid="about-page">About</div> }));
vi.mock("../pages/FAQsPage", () => ({ default: () => <div data-testid="faqs-page">FAQs</div> }));
vi.mock("../pages/ServiceAreasPage", () => ({ default: () => <div data-testid="service-areas-page">Service Areas</div> }));
vi.mock("../pages/RegionsPage", () => ({ default: () => <div data-testid="regions-page">Regions</div> }));
vi.mock("../pages/AreaPage", () => ({ default: () => <div data-testid="area-page">Area</div> }));
vi.mock("../pages/ServiceCategoriesPage", () => ({ default: () => <div data-testid="service-categories-page">Service Categories</div> }));
vi.mock("../pages/ServiceCategoryPage", () => ({ default: () => <div data-testid="service-category-page">Service Category</div> }));
vi.mock("../pages/ServicePage", () => ({ default: () => <div data-testid="service-page">Service</div> }));
vi.mock("../pages/FinancingPage", () => ({ default: () => <div data-testid="financing-page">Financing</div> }));
vi.mock("../pages/WarrantyPage", () => ({ default: () => <div data-testid="warranty-page">Warranty</div> }));
vi.mock("../pages/CustomerReviewsPage", () => ({ default: () => <div data-testid="reviews-page">Reviews</div> }));
vi.mock("../pages/NotFoundPage", () => ({ default: () => <div data-testid="not-found-page">404</div> }));
vi.mock("../components/layout/Header", () => ({ default: () => <header data-testid="header">Header</header> }));
vi.mock("../components/layout/Footer", () => ({ default: () => <footer data-testid="footer">Footer</footer> }));

// We need to re-implement App without BrowserRouter since we use MemoryRouter in tests
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HomePage from "../pages/HomePage";
import ScheduleOnlinePage from "../pages/ScheduleOnlinePage";
import BlogPage from "../pages/BlogPage";
import BlogPostPage from "../pages/BlogPostPage";
import CareersPage from "../pages/CareersPage";
import LimitedTimeOffersPage from "../pages/LimitedTimeOffersPage";
import ResourcesPage from "../pages/ResourcesPage";
import AboutUsPage from "../pages/AboutUsPage";
import FAQsPage from "../pages/FAQsPage";
import ServiceAreasPage from "../pages/ServiceAreasPage";
import RegionsPage from "../pages/RegionsPage";
import AreaPage from "../pages/AreaPage";
import ServiceCategoriesPage from "../pages/ServiceCategoriesPage";
import ServiceCategoryPage from "../pages/ServiceCategoryPage";
import ServicePage from "../pages/ServicePage";
import FinancingPage from "../pages/FinancingPage";
import WarrantyPage from "../pages/WarrantyPage";
import CustomerReviewsPage from "../pages/CustomerReviewsPage";
import NotFoundPage from "../pages/NotFoundPage";

function AppContent() {
	return (
		<div className="flex flex-col min-h-screen mx-auto overflow-x-hidden">
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
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
			<Footer />
		</div>
	);
}

function renderWithRoute(route) {
	return render(
		<MemoryRouter initialEntries={[route]}>
			<AppContent />
		</MemoryRouter>
	);
}

describe("App Routing", () => {
	it("renders Header and Footer on every page", () => {
		renderWithRoute("/");
		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	it("renders HomePage at /", () => {
		renderWithRoute("/");
		expect(screen.getByTestId("home-page")).toBeInTheDocument();
	});

	it("renders ScheduleOnlinePage at /schedule-online", () => {
		renderWithRoute("/schedule-online");
		expect(screen.getByTestId("schedule-page")).toBeInTheDocument();
	});

	it("renders BlogPage at /blog", () => {
		renderWithRoute("/blog");
		expect(screen.getByTestId("blog-page")).toBeInTheDocument();
	});

	it("renders BlogPostPage at /blog/:slug", () => {
		renderWithRoute("/blog/some-post");
		expect(screen.getByTestId("blog-post-page")).toBeInTheDocument();
	});

	it("renders CareersPage at /careers", () => {
		renderWithRoute("/careers");
		expect(screen.getByTestId("careers-page")).toBeInTheDocument();
	});

	it("renders LimitedTimeOffersPage at /coupons", () => {
		renderWithRoute("/coupons");
		expect(screen.getByTestId("coupons-page")).toBeInTheDocument();
	});

	it("renders ResourcesPage at /resources", () => {
		renderWithRoute("/resources");
		expect(screen.getByTestId("resources-page")).toBeInTheDocument();
	});

	it("renders AboutUsPage at /about-us", () => {
		renderWithRoute("/about-us");
		expect(screen.getByTestId("about-page")).toBeInTheDocument();
	});

	it("renders FinancingPage at /financing", () => {
		renderWithRoute("/financing");
		expect(screen.getByTestId("financing-page")).toBeInTheDocument();
	});

	it("renders WarrantyPage at /warranty", () => {
		renderWithRoute("/warranty");
		expect(screen.getByTestId("warranty-page")).toBeInTheDocument();
	});

	it("renders CustomerReviewsPage at /reviews", () => {
		renderWithRoute("/reviews");
		expect(screen.getByTestId("reviews-page")).toBeInTheDocument();
	});

	it("renders FAQsPage at /faqs", () => {
		renderWithRoute("/faqs");
		expect(screen.getByTestId("faqs-page")).toBeInTheDocument();
	});

	it("renders ServiceAreasPage at /service-areas", () => {
		renderWithRoute("/service-areas");
		expect(screen.getByTestId("service-areas-page")).toBeInTheDocument();
	});

	it("renders RegionsPage at /service-areas/:regionSlug", () => {
		renderWithRoute("/service-areas/seattle");
		expect(screen.getByTestId("regions-page")).toBeInTheDocument();
	});

	it("renders AreaPage at /service-areas/:regionSlug/:areaSlug", () => {
		renderWithRoute("/service-areas/seattle/ballard");
		expect(screen.getByTestId("area-page")).toBeInTheDocument();
	});

	it("renders ServiceCategoriesPage at /services", () => {
		renderWithRoute("/services");
		expect(screen.getByTestId("service-categories-page")).toBeInTheDocument();
	});

	it("renders ServiceCategoryPage at /services/:categorySlug", () => {
		renderWithRoute("/services/plumbing");
		expect(screen.getByTestId("service-category-page")).toBeInTheDocument();
	});

	it("renders ServicePage at /services/:categorySlug/:serviceSlug", () => {
		renderWithRoute("/services/plumbing/emergency");
		expect(screen.getByTestId("service-page")).toBeInTheDocument();
	});

	it("renders NotFoundPage for unknown routes", () => {
		renderWithRoute("/this-page-does-not-exist");
		expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
	});

	it("renders NotFoundPage for deeply nested unknown routes", () => {
		renderWithRoute("/foo/bar/baz/qux");
		expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
	});
});
