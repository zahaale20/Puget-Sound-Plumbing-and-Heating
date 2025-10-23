import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

import hero from "../../../assets/careers-page-hero.png";
import skyline from "../../../assets/seattle-skyline.png";
import { JobOpenings } from "./jobOpenings";

export default function Careers() {
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
		position: "",
		experience: "",
		message: "",
		additionalInfo: "",
	});

	const [expandedJob, setExpandedJob] = useState(null);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Application submitted:", formData);
		alert("Your application has been submitted! We'll be in touch soon.");
	};

	const toggleJob = (index) => {
		setExpandedJob(expandedJob === index ? null : index);
	};

	return (
		<>
			{/* Hero Section */}
			<section
				className="relative flex flex-col items-center justify-center w-full mt-[101px] md:mt-[106px] lg:mt-[166px] overflow-hidden text-white"
				style={{
					backgroundImage: `url(${hero})`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundSize: "cover",
				}}
			>
				<div className="absolute inset-0 bg-[linear-gradient(0deg,_#00000088_15%,_#ffffff22_100%)] z-0"></div>

				<div className="relative z-10 flex flex-col items-center text-center w-full px-6 py-12 gap-6">
					<h1 className="uppercase leading-tight">Careers</h1>
					<p className="text-white">
						To apply for a certain position use the form below.
					</p>
				</div>
			</section>

			{/* Content Section */}
			<section
				className="flex justify-center w-full py-16 bg-cover bg-center"
				style={{ backgroundImage: `url(${skyline})` }}
			>
				<div className="flex flex-col md:flex-row w-full max-w-7xl px-6 gap-12 text-[#2B2B2B]">
					{/* Current Openings */}
					<div className="flex flex-col items-center w-full">
						<div className="w-full mb-6 text-left">
							<h3 className="text-[#0C2D70] inline-block relative pb-2">
								Current Openings
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h3>
						</div>

						<div className="grid grid-cols-1 gap-6 w-full max-w-5xl">
							{JobOpenings.map((job, index) => (
								<div key={index} className="bg-white border border-gray-200 overflow-hidden">
									<button
										onClick={() => toggleJob(index)}
										className="w-full flex justify-between items-center p-6 hover:bg-[#F5F5F5] transition-colors text-left cursor-pointer"
									>
										<div className="flex-1">
											<h4 className="font-bold text-[#0C2D70] text-lg mb-2">
												{job.name}
											</h4>
											<div className="flex flex-wrap gap-1 text-sm">
												<span>{job.type}</span>
												<span>•</span>
												<span>{job.location}</span>
											</div>
										</div>
										<FaChevronDown
											className={`text-[#0C2D70] text-xl transition-transform duration-300 flex-shrink-0 ml-4 ${
												expandedJob === index ? "rotate-180" : ""
											}`}
										/>
									</button>

									{expandedJob === index && (
										<div className="px-6 pb-6 border-t border-gray-200">
											{/* Description */}
											<div className="mt-6">
												<h6 className="font-bold mb-2">About This Position</h6>
												<span className="leading-relaxed">{job.description}</span>
											</div>

											{/* Qualifications */}
											<div className="mt-6">
												<h6 className="font-bold mb-2">Qualifications</h6>
												<ul className="space-y-1">
													{job.qualifications.map((qualification, i) => (
														<li key={i} className="flex items-start gap-2">
															<span className="font-bold mt-0.5">•</span>
															<span className="leading-relaxed">{qualification}</span>
														</li>
													))}
												</ul>
											</div>

											{/* Responsibilities */}
											<div className="mt-6">
												<h6 className="font-bold mb-2">Responsibilities</h6>
												<ul className="space-y-1">
													{job.responsibilities.map((responsibility, i) => (
														<li key={i} className="flex items-start gap-2">
															<span className="text-[#B32020] font-bold mt-0.5">•</span>
															<span className="leading-relaxed">{responsibility}</span>
														</li>
													))}
												</ul>
											</div>

											{/* Benefits */}
											<div className="mt-6">
												<h6 className="font-bold mb-2">Benefits</h6>
												<ul className="space-y-1">
													{job.benefits.map((benefit, i) => (
														<li key={i} className="flex items-start gap-2">
															<span className="text-[#B32020] font-bold mt-0.5">•</span>
															<span className="leading-relaxed">{benefit}</span>
														</li>
													))}
												</ul>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Application Form */}
					<div className="flex flex-col w-full">
						<div className="w-full mb-6 text-left">
							<h3 className="text-[#0C2D70] inline-block relative pb-2">
								Apply Now
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h3>
						</div>

						<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* First Name */}
								<div>
									<label className="block font-bold">
										First Name <span className="text-[#B32020] font-normal italic">*</span>
									</label>
									<input
										className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
										type="text"
										name="firstName"
										required
										value={formData.firstName}
										onChange={handleChange}
									/>
								</div>

								{/* Last Name */}
								<div>
									<label className="block font-bold">
										Last Name <span className="text-[#B32020] font-normal italic">*</span>
									</label>
									<input
										className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
										type="text"
										name="lastName"
										required
										value={formData.lastName}
										onChange={handleChange}
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Phone */}
								<div>
									<label className="block font-bold">
										Phone <span className="text-[#B32020] italic">*</span>
									</label>
									<input
										className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
										type="tel"
										name="phone"
										required
										value={formData.phone}
										onChange={handleChange}
									/>
								</div>

								{/* Email */}
								<div>
									<label className="block font-bold">
										Email <span className="text-[#B32020] italic">*</span>
									</label>
									<input
										className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
										type="email"
										name="email"
										required
										value={formData.email}
										onChange={handleChange}
									/>
								</div>
							</div>

							{/* Position Dropdown */}
							<div className="relative">
								<label className="block font-bold">
									Position <span className="text-[#B32020] italic">*</span>
								</label>

								<div
									className="border border-gray-300 px-4 py-2 bg-white cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
									onClick={() => setDropdownOpen(!dropdownOpen)}
								>
									<span>{formData.position || "Select a position"}</span>
									<FaChevronDown
										className={`text-[#0C2D70] transition-transform duration-300 ${
											dropdownOpen ? "rotate-180" : ""
										}`}
									/>
								</div>

								{dropdownOpen && (
									<ul className="absolute z-10 w-full bg-white border-b border-x border-gray-300 shadow-lg max-h-56 overflow-y-auto animate-fadeIn">
										{JobOpenings.map((job, index) => (
											<li
												key={index}
												onClick={() => {
													setFormData({ ...formData, position: job.name });
													setDropdownOpen(false);
												}}
												className={`px-4 py-2 cursor-pointer hover:bg-[#F5F5F5] transition-colors ${
													formData.position === job.name ? "bg-[#F5F5F5]" : ""
												}`}
											>
												{job.name}
											</li>
										))}
									</ul>
								)}
							</div>

							{/* Resume Upload */}
							<div>
								<label className="block font-bold">Resume</label>
								<div className="relative">
									<input
										type="file"
										name="resume"
										required
										accept=".pdf,.doc,.docx"
										onChange={handleChange}
										className="w-full border border-gray-300 pr-4 bg-white text-[#2B2B2B] focus:outline-none file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[#0C2D70] file:text-white hover:file:bg-[#082050] file:cursor-pointer transition-all duration-150"
									/>
								</div>
							</div>

							{/* Additional Information */}
							<div>
								<label className="block font-bold">
									Additional Information
								</label>
								<textarea
									name="additionalInfo"
									value={formData.additionalInfo}
									onChange={handleChange}
									rows="4"
									placeholder="Tell us anything else you'd like us to know."
									className="w-full border border-gray-300 px-4 py-2 bg-white text-[#2B2B2B] resize-none focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
								></textarea>
							</div>

							{/* Submit Button */}
							<div className="flex justify-center mt-4">
								<button
									type="submit"
									className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]"
								>
									APPLY NOW
								</button>
							</div>
						</form>
					</div>
				</div>
			</section>
		</>
	);
}
