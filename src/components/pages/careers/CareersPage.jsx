import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

import skyline from "../../../assets/seattle-skyline.png";
import pattern from "../../../assets/pattern1.png";

import { openings } from "./careersData";

export default function CareersPage() {
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
			{/* Page Header Section */}
			<section
				className="relative flex w-full py-16 bg-cover bg-bottom mt-[101px] md:mt-[106px] lg:mt-[167px]"
				style={{ backgroundImage: `url(${pattern})` }}
			>
				<div className="absolute inset-0 bg-[#0C2D70]/95 pointer-events-none"></div>
				<div className="flex flex-col max-w-7xl mx-auto px-6 w-full gap-6 text-white">
					<h3 className="relative inline-block pb-2 w-fit">
						Careers
						<span className="absolute left-0 bottom-0 h-[3px] bg-[#B32020] rounded-full w-full"></span>
					</h3>
					<p className="relative inline-block">
						Ready for your next step? We're hiring experienced plumbers to join our high-performing residential team.
					</p>
				</div>
			</section>

			{/* Current Openings Section */}
			<section className="flex justify-center w-full pt-16 bg-white">
				<div className="flex flex-col w-full max-w-7xl px-6 gap-12 text-[#2B2B2B]">
					<div className="flex flex-col items-center w-full">
						<div className="w-full mb-6 text-left">
							<h4 className="text-[#0C2D70] inline-block relative pb-2">
								Current Openings
								<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
							</h4>
						</div>

						<div className="flex flex-col gap-4 w-full">
							{openings.map((job, index) => (
								<div key={index} className="bg-white border border-gray-200 overflow-hidden">
									<button
										onClick={() => toggleJob(index)}
										className="w-full flex justify-between items-center p-4 border-b-4 border-transparent hover:bg-[#F5F5F5] hover:border-[#B32020] transition-colors text-left cursor-pointer"
									>
										<div className="flex-1">
											<h5 className="text-[#0C2D70] mb-1">
												{job.name}
											</h5>
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
										<div className="px-4 pb-4 border-t border-gray-200">
											{/* Description */}
											<div className="mt-4">
												<h6 className="block mb-2">
													About This Position
												</h6>
												<span className="block leading-relaxed">
													{job.description}
												</span>
											</div>

											{/* Qualifications */}
											<div className="mt-4">
												<h6 className="block mb-2">
													Qualifications
												</h6>
												<ul className="space-y-1">
													{job.qualifications.map((qualification, i) => (
														<li key={i} className="flex items-start gap-2">
															<h6 className="text-[#B32020] font-bold">
																•
															</h6>
															<span className="leading-relaxed">
																{qualification}
															</span>
														</li>
													))}
												</ul>
											</div>

											{/* Responsibilities */}
											<div className="mt-4">
												<h6 className="block mb-2">
													Responsibilities
												</h6>
												<ul className="space-y-1">
													{job.responsibilities.map((responsibility, i) => (
														<li key={i} className="flex items-start gap-2">
															<h6 className="text-[#B32020]">
																•
															</h6>
															<span className="leading-relaxed">
																{responsibility}
															</span>
														</li>
													))}
												</ul>
											</div>

											{/* Benefits */}
											<div className="mt-4">
												<h6 className="block font-bold mb-2">
													Benefits
												</h6>
												<ul className="space-y-1">
													{job.benefits.map((benefit, i) => (
														<li key={i} className="flex items-start gap-2">
															<h6 className="text-[#B32020] font-bold mt-0.2">
																•
															</h6>
															<span className="leading-relaxed">
																{benefit}
															</span>
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
				</div>
			</section>

			{/* Application Form Section */}
			<section
                className="flex justify-center w-full py-16 bg-cover bg-bottom text-[#2B2B2B]"
                style={{ backgroundImage: `url(${skyline})` }}
            >
                <div className="flex flex-col w-full max-w-7xl px-6">
					<div className="w-full mb-6 text-left">
						<h4 className="text-[#0C2D70] inline-block relative pb-2">
							Apply Now
							<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
						</h4>
					</div>

					<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* First Name */}
							<div>
								<label className="text-[#2B2B2B]">
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
								<label className="text-[#2B2B2B]">
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
								<label className="text-[#2B2B2B]">
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
								<label className="text-[#2B2B2B]">
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

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Position Dropdown */}
							<div className="relative">
								<label className="text-[#2B2B2B]">
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
										{openings.map((job, index) => (
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
								<label className="text-[#2B2B2B]">
									Resume
								</label>
								<div className="relative">
									<input
										type="file"
										name="resume"
										required
										accept=".pdf,.doc,.docx"
										onChange={handleChange}
										className="w-full border border-gray-300 pr-4 bg-white text-[#2B2B2B] focus:outline-none file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[#0C2D70] file:text-white hover:file:bg-[#082050] file:cursor-pointer cursor-pointer transition-all duration-150"
									/>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex justify-center mt-4">
							<button
								type="submit"
								className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]"
							>
								Apply Now
							</button>
						</div>
					</form>
				</div>
			</section>
		</>
	);
}