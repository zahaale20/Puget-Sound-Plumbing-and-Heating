import { useState } from "react";

import TopBar from "./top-bar/TopBar";
import MiddleBar from "./middle-bar/MiddleBar";
import BottomBar from "./bottom-bar/BottomBar";

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div className="fixed top-0 left-0 w-full z-50 w-full bg-white">
			<MiddleBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
			<BottomBar />
		</div>
	);
}