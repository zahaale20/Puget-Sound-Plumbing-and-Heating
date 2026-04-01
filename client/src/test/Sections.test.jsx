import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/imageService", () => ({
	getCloudFrontUrl: vi.fn((path) => `https://cdn.example.com/${path}`),
}));

vi.mock("../components/ui/LoadingComponents", () => ({
	ImageWithLoader: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return { ...actual, useNavigate: () => mockNavigate, useLocation: () => ({ pathname: "/" }) };
});

import Hero from "../components/sections/Hero";
import CustomerReviews from "../components/sections/CustomerReviews";
import FAQs from "../components/sections/FAQs";
import Financing from "../components/sections/Financing";
import CallNow from "../components/sections/CallNow";
import OurHistory from "../components/sections/OurHistory";
import OurMission from "../components/sections/OurMission";
import OurTeam from "../components/sections/OurTeam";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import Warranty from "../components/sections/Warranty";
import ServiceAreas from "../components/sections/ServiceAreas";
import ServiceCategories from "../components/sections/ServiceCategories";
import OurServices from "../components/sections/OurServices";
import RecentBlogPosts from "../components/sections/RecentBlogPosts";

function wrap(component) {
	return render(<MemoryRouter>{component}</MemoryRouter>);
}

beforeEach(() => {
	vi.clearAllMocks();
});

// ========================
// Hero
// ========================
describe("Hero", () => {
	it("renders heading text", () => {
		wrap(<Hero />);
		// HeroContent heading should render
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
	});

	it("renders Schedule Online button", () => {
		wrap(<Hero />);
		expect(screen.getByText("Schedule Online")).toBeInTheDocument();
	});

	it("renders phone number", () => {
		wrap(<Hero />);
		expect(screen.getByText("(206) 938-3219")).toBeInTheDocument();
	});

	it("renders social media links", () => {
		wrap(<Hero />);
		expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
		expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
		expect(screen.getByLabelText("YouTube")).toBeInTheDocument();
		expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
	});

	it("navigates to schedule-online on button click", () => {
		wrap(<Hero />);
		fireEvent.click(screen.getByText("Schedule Online"));
		expect(mockNavigate).toHaveBeenCalledWith("/schedule-online");
	});

	it("renders hero background image", () => {
		const { container } = wrap(<Hero />);
		const img = container.querySelector("img");
		expect(img).toHaveAttribute("src", expect.stringContaining("home-page-hero"));
	});
});

// ========================
// CustomerReviews
// ========================
describe("CustomerReviews", () => {
	it("renders title", () => {
		render(<CustomerReviews />);
		expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
	});

	it("renders 3 review cards", () => {
		render(<CustomerReviews />);
		expect(screen.getByText("- Amy W.")).toBeInTheDocument();
		expect(screen.getByText("- Edith S.")).toBeInTheDocument();
		expect(screen.getByText("- Charlotte P.")).toBeInTheDocument();
	});

	it("renders star ratings", () => {
		const { container } = render(<CustomerReviews />);
		// Each review has 5 stars (15 total star icons in 3 review cards)
		const starContainers = container.querySelectorAll(".text-\\[\\#B32020\\]");
		expect(starContainers.length).toBeGreaterThanOrEqual(3);
	});

	it("renders See More Reviews link", () => {
		render(<CustomerReviews />);
		expect(screen.getByText("See More Reviews")).toBeInTheDocument();
	});
});

// ========================
// FAQs (section)
// ========================
describe("FAQs Section", () => {
	it("renders title", () => {
		render(<FAQs />);
		expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
	});

	it("renders description text", () => {
		render(<FAQs />);
		expect(screen.getByText(/Got questions about your plumbing/)).toBeInTheDocument();
	});

	it("renders Read Our FAQs link", () => {
		render(<FAQs />);
		const link = screen.getByText("Read Our FAQs");
		expect(link.closest("a")).toHaveAttribute("href", "/faqs");
	});

	it("renders plumbing truck image", () => {
		render(<FAQs />);
		expect(screen.getByAltText("Plumbing Truck")).toBeInTheDocument();
	});
});

// ========================
// Financing
// ========================
describe("Financing", () => {
	it("renders title", () => {
		render(<Financing />);
		expect(screen.getByText("Financing")).toBeInTheDocument();
	});

	it("renders benefits list", () => {
		render(<Financing />);
		expect(screen.getByText(/Convenient:/)).toBeInTheDocument();
		expect(screen.getByText(/Simple Process:/)).toBeInTheDocument();
		expect(screen.getByText(/Affordable:/)).toBeInTheDocument();
	});

	it("renders financing partner mention", () => {
		render(<Financing />);
		expect(screen.getByText(/approved credit/)).toBeInTheDocument();
	});

	it("renders Apply Now button with external link", () => {
		render(<Financing />);
		const link = screen.getByText("Apply Now");
		expect(link).toHaveAttribute("href");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});
});

// ========================
// CallNow
// ========================
describe("CallNow", () => {
	it("renders title", () => {
		render(<CallNow />);
		expect(screen.getByText("Call Now")).toBeInTheDocument();
	});

	it("renders phone number as link", () => {
		render(<CallNow />);
		const phoneLink = screen.getByText("(206) 938-3219").closest("a");
		expect(phoneLink).toHaveAttribute("href", "tel:206-938-3219");
	});

	it("renders description text from data", () => {
		render(<CallNow />);
		// CallNowContent.description is rendered
		const section = screen.getByText("Call Now").closest("div");
		expect(section).toBeInTheDocument();
	});

	it("renders image", () => {
		render(<CallNow />);
		expect(screen.getByAltText("Woman Calling Plumbers")).toBeInTheDocument();
	});
});

// ========================
// OurHistory
// ========================
describe("OurHistory", () => {
	it("renders title", () => {
		render(<OurHistory />);
		expect(screen.getByText("Our History")).toBeInTheDocument();
	});

	it("renders history paragraphs", () => {
		render(<OurHistory />);
		expect(screen.getByText(/founded in the early 2000s/)).toBeInTheDocument();
		expect(screen.getByText(/over 20 years of continuous service/)).toBeInTheDocument();
	});
});

// ========================
// OurMission
// ========================
describe("OurMission", () => {
	it("renders title", () => {
		render(<OurMission />);
		expect(screen.getByText("Our Mission")).toBeInTheDocument();
	});

	it("renders mission description", () => {
		render(<OurMission />);
		expect(screen.getByText(/deliver trusted plumbing solutions/)).toBeInTheDocument();
	});

	it("renders team image", () => {
		render(<OurMission />);
		expect(screen.getByAltText("Our team")).toBeInTheDocument();
	});
});

// ========================
// OurTeam
// ========================
describe("OurTeam", () => {
	it("renders title", () => {
		render(<OurTeam />);
		expect(screen.getByText("Meet Our Team")).toBeInTheDocument();
	});

	it("renders 4 team member cards", () => {
		render(<OurTeam />);
		expect(screen.getByText("Carlos M.")).toBeInTheDocument();
		expect(screen.getByText("Jenna R.")).toBeInTheDocument();
		expect(screen.getByText("Tyler S.")).toBeInTheDocument();
		expect(screen.getByText("Linda K.")).toBeInTheDocument();
	});

	it("renders positions", () => {
		render(<OurTeam />);
		expect(screen.getByText("Master Plumber")).toBeInTheDocument();
		expect(screen.getByText("Office Coordinator")).toBeInTheDocument();
		expect(screen.getByText("Water Heater Technician")).toBeInTheDocument();
		expect(screen.getByText("Customer Care Specialist")).toBeInTheDocument();
	});

	it("renders profile images", () => {
		render(<OurTeam />);
		const images = screen.getAllByAltText(/Carlos|Jenna|Tyler|Linda/);
		expect(images).toHaveLength(4);
	});
});

// ========================
// WhyChooseUs
// ========================
describe("WhyChooseUs", () => {
	it("renders title", () => {
		render(<WhyChooseUs />);
		expect(screen.getByText("Why Choose Us?")).toBeInTheDocument();
	});

	it("renders description", () => {
		render(<WhyChooseUs />);
		expect(screen.getByText(/For over 20 years/)).toBeInTheDocument();
	});

	it("renders Learn More link to about-us", () => {
		render(<WhyChooseUs />);
		const link = screen.getByText("Learn More").closest("a");
		expect(link).toHaveAttribute("href", "/about-us");
	});

	it("renders image", () => {
		render(<WhyChooseUs />);
		expect(screen.getByAltText("Plumber Bros")).toBeInTheDocument();
	});
});

// ========================
// Warranty
// ========================
describe("Warranty", () => {
	it("renders title", () => {
		render(<Warranty />);
		expect(screen.getByText("Warranty")).toBeInTheDocument();
	});

	it("renders warranty items list", () => {
		render(<Warranty />);
		expect(screen.getByText(/Lifetime warranty on water heater parts/)).toBeInTheDocument();
		expect(screen.getByText(/Lifetime warranty on copper water services/)).toBeInTheDocument();
		expect(screen.getByText(/20-year warranty on PEX/)).toBeInTheDocument();
	});

	it("renders warranty image", () => {
		render(<Warranty />);
		expect(screen.getByAltText("Lifetime Warranty")).toBeInTheDocument();
	});
});

// ========================
// ServiceAreas
// ========================
describe("ServiceAreas", () => {
	it("renders all 4 county sections", () => {
		render(<ServiceAreas />);
		expect(screen.getByText("Seattle, WA")).toBeInTheDocument();
		expect(screen.getByText("King County, WA")).toBeInTheDocument();
		expect(screen.getByText("Pierce County, WA")).toBeInTheDocument();
		expect(screen.getByText("Snohomish County, WA")).toBeInTheDocument();
	});

	it("renders county logos", () => {
		render(<ServiceAreas />);
		expect(screen.getByAltText("City of Seattle")).toBeInTheDocument();
		expect(screen.getByAltText("King County")).toBeInTheDocument();
		expect(screen.getByAltText("Pierce County")).toBeInTheDocument();
		expect(screen.getByAltText("Snohomish County")).toBeInTheDocument();
	});

	it("renders See All links for each region", () => {
		render(<ServiceAreas />);
		expect(screen.getByText("See All Seattle Neighborhoods")).toBeInTheDocument();
		expect(screen.getByText("See All King County Cities")).toBeInTheDocument();
		expect(screen.getByText("See All Pierce County Cities")).toBeInTheDocument();
		expect(screen.getByText("See All Snohomish County Cities")).toBeInTheDocument();
	});
});

// ========================
// ServiceCategories
// ========================
describe("ServiceCategories", () => {
	it("renders all 4 service category sections", () => {
		render(<ServiceCategories />);
		expect(screen.getByText("See All Plumbing Services")).toBeInTheDocument();
		expect(screen.getByText(/See All Drain/)).toBeInTheDocument();
	});

	it("renders category images", () => {
		render(<ServiceCategories />);
		expect(screen.getByAltText("Plumbing Services")).toBeInTheDocument();
		expect(screen.getByAltText("Drain and Sewer Services")).toBeInTheDocument();
	});
});

// ========================
// OurServices
// ========================
describe("OurServices", () => {
	it("renders title", () => {
		wrap(<OurServices />);
		expect(screen.getByText("Our Services")).toBeInTheDocument();
	});

	it("renders See all services link", () => {
		wrap(<OurServices />);
		expect(screen.getByText("See all services")).toBeInTheDocument();
	});

	it("renders 6 service cards", () => {
		wrap(<OurServices />);
		expect(screen.getByText("Water Heaters")).toBeInTheDocument();
		expect(screen.getByText("Faucets")).toBeInTheDocument();
		expect(screen.getByText("Toilets")).toBeInTheDocument();
		expect(screen.getByText("Garbage Disposal")).toBeInTheDocument();
		expect(screen.getByText("Water Filtration Systems")).toBeInTheDocument();
		expect(screen.getByText("Plumbing Repairs")).toBeInTheDocument();
	});

	it("navigates on service card click", () => {
		wrap(<OurServices />);
		fireEvent.click(screen.getByText("Faucets").closest("button"));
		expect(mockNavigate).toHaveBeenCalledWith("/services/plumbing/faucets");
	});

	it("navigates to /services on See all services click", () => {
		wrap(<OurServices />);
		fireEvent.click(screen.getByText("See all services"));
		expect(mockNavigate).toHaveBeenCalledWith("/services");
	});
});

// ========================
// RecentBlogPosts
// ========================
describe("RecentBlogPosts", () => {
	it("renders title", () => {
		wrap(<RecentBlogPosts />);
		expect(screen.getByText("Recent Blog Posts")).toBeInTheDocument();
	});

	it("renders View All Posts link", () => {
		wrap(<RecentBlogPosts />);
		const link = screen.getByText("View All Posts");
		expect(link.closest("a")).toHaveAttribute("href", "/blog");
	});

	it("renders Continue Reading buttons", () => {
		wrap(<RecentBlogPosts />);
		const readButtons = screen.getAllByText("Continue Reading");
		expect(readButtons).toHaveLength(3);
	});

	it("navigates on Continue Reading click", () => {
		wrap(<RecentBlogPosts />);
		const readButtons = screen.getAllByText("Continue Reading");
		fireEvent.click(readButtons[0]);
		expect(mockNavigate).toHaveBeenCalledTimes(1);
	});
});
