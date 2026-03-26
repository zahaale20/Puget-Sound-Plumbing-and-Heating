import ScheduleOnline from "../components/ScheduleOnline";
import { getCloudFrontUrl } from "../api/imageService";
import { useEffect, useState } from "react";

export default function ScheduleOnlinePage() {
	const [skylineUrl, setSkylineUrl] = useState(null);

	useEffect(() => {
		setSkylineUrl(getCloudFrontUrl("private/seattle-skyline.png"));
	}, []);

	return (
		<section className="flex justify-center w-full py-16 mt-[101px] md:mt-[106px] lg:mt-[166px] bg-cover bg-bottom" style={{ backgroundImage: skylineUrl ? `url(${skylineUrl})` : "none" }}>
			<ScheduleOnline />
		</section>
	);
}
