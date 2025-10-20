import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

export default function TopBar() {
	return (
		<div className="flex justify-center items-center w-full py-2 bg-[#0C2D70]">
			<div className="flex justify-end items-center w-full max-w-7xl h-full px-6 lg:pr-3 gap-3 text-base text-white">
				<a href="https://www.facebook.com/pugetsoundplumbing/" target="_blank" rel="noreferrer">
					<FaFacebookF />
				</a>
				<a href="https://x.com/PugetPlumbing" target="_blank" rel="noreferrer">
					<FaTwitter />
				</a>
				<a href="https://www.instagram.com/puget_sound_plumbing_heating/" target="_blank" rel="noreferrer">
					<FaInstagram />
				</a>
				<a href="https://www.youtube.com/user/pugetsoundplumbing" target="_blank" rel="noreferrer">
					<FaYoutube />
				</a>
			</div>
		</div>
	);
}
