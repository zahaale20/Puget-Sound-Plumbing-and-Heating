import { useState, useEffect } from "react";
import { getCloudFrontUrl } from "../api/imageService";
import { ImageWithLoader } from "./LoadingComponents";

export default function TeamMembers() {
	const [defaultProfilePic, setDefaultProfilePic] = useState(null);

	useEffect(() => {
		setDefaultProfilePic(getCloudFrontUrl("private/default-profile-pic.png"));
	}, []);

	const team = [
		{
			name: "Carlos M.",
			position: "Master Plumber",
			description:
				"Carlos brings 15 years of hands-on plumbing experience, specializing in whole-home repipes and advanced diagnostic work. Customers value his calm presence and problem-solving mindset.",
		},
		{
			name: "Jenna R.",
			position: "Office Coordinator",
			description:
				"Jenna ensures every service call runs smoothly from start to finish. She keeps communication clear, schedules efficient appointments, and supports the entire field team.",
		},
		{
			name: "Tyler S.",
			position: "Water Heater Technician",
			description:
				"Tyler focuses on water heater repairs, installations, and safety checks. His attention to detail and clear explanations make homeowners feel confident in every service he provides.",
		},
		{
			name: "Linda K.",
			position: "Customer Care Specialist",
			description:
				"Linda is known for her friendly demeanor and exceptional customer service. She helps clients understand their options and ensures every experience is stress-free and well-coordinated.",
		},
	];

	return (
		<div className="flex flex-col w-full max-w-7xl px-6 space-y-6">
			{/* Header Container */}
			<div className="space-y-6 text-left">
				<h4 className="text-[#0C2D70] inline-block relative pb-2">
					Meet Our Team
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>

				<p className="text-[#2B2B2B]">
					Get to know the experienced professionals who keep your plumbing running smoothly.
				</p>
			</div>

			{/* Team Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{team.map((member, idx) => (
					<div
						key={idx}
						className="flex flex-col gap-6 text-start bg-white p-6 border-1 border-[#DEDEDE]"
					>
						{/* Profile Image */}
						<ImageWithLoader
							src={defaultProfilePic}
							alt={member.name}
							className="w-full h-60 object-cover rounded"
							loading="lazy"
						/>

						{/* Name & Position */}
						<div className="flex flex-col gap-1">
							<h6 className="text-[#0C2D70]">{member.name}</h6>
							<p className="text-[#2B2B2B]">{member.position}</p>
						</div>

						{/* Description */}
						<p className="text-[#2B2B2B]">{member.description}</p>
					</div>
				))}
			</div>
		</div>
	);
}
