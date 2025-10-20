import Header from "./components/header/Header2";
import Home from "./components/pages/home/Home";
import Footer from "./components/footer/Footer";

function App() {
	return (
		<div className="flex flex-col min-h-screen mx-auto">
		<Header />
		<Home />
		<Footer />
		</div>
	);
}

export default App;
