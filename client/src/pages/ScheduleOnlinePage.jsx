import ScheduleOnline from "../components/ScheduleOnline";
import { getSignedUrl } from "../api/imageService";
import { useEffect, useState } from "react";

export default function ScheduleOnlinePage() {
	const [skylineUrl, setSkylineUrl] = useState(null);

	useEffect(() => {
		getSignedUrl("private/seattle-skyline.png").then(setSkylineUrl);
	}, []);

	return (
		<section className="flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px] bg-cover bg-bottom" style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}>
			<ScheduleOnline />
		</section>
	);
}
