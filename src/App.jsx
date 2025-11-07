import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import HomePage from "./components/pages/home/HomePage";
import BlogPage from "./components/pages/blog/BlogPage";
import BlogPostPage from "./components/pages/blog/BlogPostPage";
import CareersPage from "./components/pages/careers/CareersPage";
import CouponsPage from "./components/pages/coupons/CouponsPage";
import ResourcesPage from "./components/pages/resources/ResourcesPage";
import ScheduleOnlinePage from "./components/pages/schedule-online/ScheduleOnlinePage";

function App() {
	return (
		<BrowserRouter>
			<div className="flex flex-col min-h-screen mx-auto">
				<Header />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/schedule-online" element={<ScheduleOnlinePage />} />
					<Route path="/careers" element={<CareersPage />} />
					<Route path="/coupons" element={<CouponsPage />} />
					<Route path="/resources" element={<ResourcesPage />} />
					<Route path="/blog" element={<BlogPage />} />
					<Route path="/blog/:slug" element={<BlogPostPage />} />
				</Routes>
				<Footer />
			</div>
		</BrowserRouter>
	);
}

export default App;