import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../services/imageService", () => ({
	getCloudFrontUrl: vi.fn((path) => `https://cdn.example.com/${path}`),
}));

vi.mock("../components/ui/LoadingComponents", () => ({
	ImageWithLoader: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

vi.mock("../services/emailService", () => ({
	sendScheduleEmail: vi.fn(),
	sendJobApplicationEmail: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return { ...actual, useNavigate: () => mockNavigate };
});

import NotFoundPage from "../pages/NotFoundPage";
import BlogPage from "../pages/BlogPage";
import BlogPostPage from "../pages/BlogPostPage";
import CareersPage from "../pages/CareersPage";
import FAQsPage from "../pages/FAQsPage";
import HomePage from "../pages/HomePage";
import AboutUsPage from "../pages/AboutUsPage";
import ServicePage from "../pages/ServicePage";
import RegionsPage from "../pages/RegionsPage";
import ServiceCategoryPage from "../pages/ServiceCategoryPage";
import ServiceCategoriesPage from "../pages/ServiceCategoriesPage";
import ScheduleOnlinePage from "../pages/ScheduleOnlinePage";
import FinancingPage from "../pages/FinancingPage";
import WarrantyPage from "../pages/WarrantyPage";
import CustomerReviewsPage from "../pages/CustomerReviewsPage";
import LimitedTimeOffersPage from "../pages/LimitedTimeOffersPage";
import ServiceAreasPage from "../pages/ServiceAreasPage";
import ResourcesPage from "../pages/ResourcesPage";

function wrap(component, initialEntries = ["/"]) {
	return render(<MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>);
}

function wrapWithRoute(path, element, initialEntry) {
	return render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<Routes>
				<Route path={path} element={element} />
			</Routes>
		</MemoryRouter>
	);
}

beforeEach(() => {
	vi.clearAllMocks();
});

// ========================
// NotFoundPage
// ========================
describe("NotFoundPage", () => {
	it("renders 404 text", () => {
		wrap(<NotFoundPage />);
		expect(screen.getByText("404")).toBeInTheDocument();
		expect(screen.getByText("Page Not Found")).toBeInTheDocument();
	});

	it("renders Return Home button", () => {
		wrap(<NotFoundPage />);
		expect(screen.getByText("Return Home")).toBeInTheDocument();
	});

	it("navigates home on Return Home click", () => {
		wrap(<NotFoundPage />);
		fireEvent.click(screen.getByText("Return Home"));
		expect(mockNavigate).toHaveBeenCalledWith("/");
	});
});

// ========================
// BlogPage
// ========================
describe("BlogPage", () => {
	it("renders page header", () => {
		wrap(<BlogPage />);
		expect(screen.getByText("Blog")).toBeInTheDocument();
	});

	it("renders blog posts", () => {
		wrap(<BlogPage />);
		const readButtons = screen.getAllByText("Continue Reading");
		expect(readButtons.length).toBeGreaterThanOrEqual(1);
	});

	it("renders search input", () => {
		const { container } = wrap(<BlogPage />);
		const searchInput = container.querySelector('input[type="text"]');
		expect(searchInput).toBeInTheDocument();
	});

	it("filters posts by search term", () => {
		const { container } = wrap(<BlogPage />);
		const searchInput = container.querySelector('input[type="text"]');
		fireEvent.change(searchInput, { target: { value: "zzzznonexistent" } });
		const readButtons = screen.queryAllByText("Continue Reading");
		expect(readButtons).toHaveLength(0);
	});
});

// ========================
// BlogPostPage
// ========================
describe("BlogPostPage", () => {
	it("renders 404 page for invalid slug", () => {
		wrapWithRoute("/blog/:slug", <BlogPostPage />, "/blog/nonexistent-post-slug");
		expect(screen.getByText("404")).toBeInTheDocument();
		expect(screen.getByText("Page Not Found")).toBeInTheDocument();
	});
});

// ========================
// CareersPage
// ========================
describe("CareersPage", () => {
	it("renders Careers heading", () => {
		wrap(<CareersPage />);
		expect(screen.getByText("Careers")).toBeInTheDocument();
	});

	it("renders Current Openings section", () => {
		wrap(<CareersPage />);
		expect(screen.getByText("Current Openings")).toBeInTheDocument();
	});

	it("renders job listings", () => {
		wrap(<CareersPage />);
		expect(screen.getByText("Licensed Residential Plumber")).toBeInTheDocument();
	});

	it("expands job listing on click", () => {
		wrap(<CareersPage />);
		const jobButton = screen.getByText("Licensed Residential Plumber").closest("button");
		fireEvent.click(jobButton);
		expect(screen.getByText("About This Position")).toBeInTheDocument();
		expect(screen.getByText("Qualifications")).toBeInTheDocument();
		expect(screen.getByText("Responsibilities")).toBeInTheDocument();
	});

	it("collapses job listing on second click", () => {
		wrap(<CareersPage />);
		const jobButton = screen.getByText("Licensed Residential Plumber").closest("button");
		fireEvent.click(jobButton);
		expect(screen.getByText("About This Position")).toBeInTheDocument();
		fireEvent.click(jobButton);
		expect(screen.queryByText("About This Position")).not.toBeInTheDocument();
	});
});

// ========================
// FAQsPage
// ========================
describe("FAQsPage", () => {
	it("renders title", () => {
		wrap(<FAQsPage />);
		expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
	});

	it("renders FAQ items as buttons", () => {
		wrap(<FAQsPage />);
		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThanOrEqual(10);
	});

	it("toggles FAQ answer on click", () => {
		const { container } = wrap(<FAQsPage />);
		const firstQuestion = screen.getAllByRole("button")[0];
		fireEvent.click(firstQuestion);
		// After click, the answer div should have max-h-96 class
		const answerDivs = container.querySelectorAll(".max-h-96");
		expect(answerDivs.length).toBeGreaterThanOrEqual(1);
	});
});

// ========================
// HomePage (integration - renders section components)
// ========================
describe("HomePage", () => {
	it("renders without crashing", () => {
		wrap(<HomePage />);
		const scheduleButtons = screen.getAllByText("Schedule Online");
		expect(scheduleButtons.length).toBeGreaterThanOrEqual(1);
	});

	it("renders Our Services section", () => {
		wrap(<HomePage />);
		expect(screen.getByText("Our Services")).toBeInTheDocument();
	});

	it("renders Customer Reviews section", () => {
		wrap(<HomePage />);
		expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
	});
});

// ========================
// AboutUsPage
// ========================
describe("AboutUsPage", () => {
	it("renders About Us header", () => {
		wrap(<AboutUsPage />);
		expect(screen.getByText("About Us")).toBeInTheDocument();
	});

	it("renders Our Mission section", () => {
		wrap(<AboutUsPage />);
		expect(screen.getByText("Our Mission")).toBeInTheDocument();
	});

	it("renders Our History section", () => {
		wrap(<AboutUsPage />);
		expect(screen.getByText("Our History")).toBeInTheDocument();
	});

	it("renders Meet Our Team section", () => {
		wrap(<AboutUsPage />);
		expect(screen.getByText("Meet Our Team")).toBeInTheDocument();
	});
});

// ========================
// ServicePage (dynamic route)
// ========================
describe("ServicePage", () => {
	it("renders service name from route params", () => {
		wrapWithRoute(
			"/services/:categorySlug/:serviceSlug",
			<ServicePage />,
			"/services/plumbing/faucets"
		);
		expect(screen.getByText("Faucets")).toBeInTheDocument();
	});

	it("renders 404 page for invalid slug", () => {
		wrapWithRoute(
			"/services/:categorySlug/:serviceSlug",
			<ServicePage />,
			"/services/plumbing/nonexistent-service"
		);
		expect(screen.getByText("404")).toBeInTheDocument();
		expect(screen.getByText("Page Not Found")).toBeInTheDocument();
	});
});

// ========================
// RegionsPage (dynamic route)
// ========================
describe("RegionsPage", () => {
	it("renders region from route params", () => {
		wrapWithRoute("/service-areas/:regionSlug", <RegionsPage />, "/service-areas/seattle");
		expect(screen.getByText(/Professional Plumbers in Seattle/)).toBeInTheDocument();
	});

	it("renders 404 page for unknown region", () => {
		wrapWithRoute("/service-areas/:regionSlug", <RegionsPage />, "/service-areas/nonexistent");
		expect(screen.getByText("404")).toBeInTheDocument();
		expect(screen.getByText("Page Not Found")).toBeInTheDocument();
	});
});

// ========================
// Wrapper Pages (render section components)
// ========================
describe("ServiceCategoriesPage", () => {
	it("renders without crashing", () => {
		wrap(<ServiceCategoriesPage />);
		expect(screen.getByText(/Our Services/i)).toBeInTheDocument();
	});
});

describe("ScheduleOnlinePage", () => {
	it("renders Schedule Online header", () => {
		wrap(<ScheduleOnlinePage />);
		const elements = screen.getAllByText("Schedule Online");
		expect(elements.length).toBeGreaterThanOrEqual(1);
	});
});

describe("FinancingPage", () => {
	it("renders Financing header", () => {
		wrap(<FinancingPage />);
		expect(screen.getByText("Financing")).toBeInTheDocument();
	});
});

describe("WarrantyPage", () => {
	it("renders Warranty header", () => {
		wrap(<WarrantyPage />);
		expect(screen.getByText("Warranty")).toBeInTheDocument();
	});
});

describe("CustomerReviewsPage", () => {
	it("renders Customer Reviews header", () => {
		wrap(<CustomerReviewsPage />);
		expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
	});
});

describe("LimitedTimeOffersPage", () => {
	it("renders Coupons header", () => {
		wrap(<LimitedTimeOffersPage />);
		expect(screen.getByText("Coupons")).toBeInTheDocument();
	});
});

describe("ServiceAreasPage", () => {
	it("renders Service Areas header", () => {
		wrap(<ServiceAreasPage />);
		expect(screen.getByText("Service Areas")).toBeInTheDocument();
	});
});

describe("ResourcesPage", () => {
	it("renders Resources header", () => {
		wrap(<ResourcesPage />);
		expect(screen.getByText("Resources")).toBeInTheDocument();
	});
});
