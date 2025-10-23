import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header3";
import Home from "./components/pages/home/Home";
import Footer from "./components/footer/Footer";
import ScheduleOnlinePage from "./components/pages/schedule-online/ScheduleOnlinePage";

function App() {
	return (
		<BrowserRouter>
			<div className="flex flex-col min-h-screen mx-auto">
				<Header />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/schedule-online" element={<ScheduleOnlinePage />} />
				</Routes>
				<Footer />
			</div>
		</BrowserRouter>
	);
}

export default App;
