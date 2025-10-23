import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./components/pages/home/HomePage";
import ScheduleOnlinePage from "./components/pages/schedule-online/ScheduleOnlinePage";
import Careers from "./components/pages/careers/CareersPage";

function App() {
	return (
		<BrowserRouter>
			<div className="flex flex-col min-h-screen mx-auto">
				<Header />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/schedule-online" element={<ScheduleOnlinePage />} />
					<Route path="/careers" element={<Careers />} />
				</Routes>
				<Footer />
			</div>
		</BrowserRouter>
	);
}

export default App;
