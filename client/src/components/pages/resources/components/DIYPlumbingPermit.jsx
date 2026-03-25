import { useState } from "react";
import skyline from "../../../../assets/seattle-skyline.png";

export default function DIYPlumbingPermit() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		projectDescription: "",
		inspection: "unsure",
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Form submitted:", formData);
		alert("Your plumbing permit request has been submitted!");
	};

	return (
		<div className="flex flex-col w-full max-w-7xl px-6">
			{/* Header */}
			<div className="w-full mb-6 text-left">
				<h4 className="text-[#0C2D70] inline-block relative pb-2 mb-6">
					DIY – Plumbing Permit
					<span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B32020] rounded-full"></span>
				</h4>
				<p className="text-[#2B2B2B]">
					If you’re a homeowner planning plumbing updates or installations,
					fill out the form below to request permit assistance. We’ll help
					ensure your project meets local code requirements.
				</p>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* First Name */}
					<div>
						<label className="block font-bold text-[#2B2B2B]">
							First Name <span className="text-[#B32020] italic">*</span>
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
						<label className="block font-bold text-[#2B2B2B]">
							Last Name <span className="text-[#B32020] italic">*</span>
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
					{/* Email */}
					<div>
						<label className="block font-bold text-[#2B2B2B]">
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

					{/* Phone */}
					<div>
						<label className="block font-bold text-[#2B2B2B]">
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
				</div>

				{/* Address */}
				<div>
					<label className="block font-bold text-[#2B2B2B]">
						Property Address <span className="text-[#B32020] italic">*</span>
					</label>
					<input
						className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
						type="text"
						name="address"
						required
						value={formData.address}
						onChange={handleChange}
					/>
				</div>

				{/* Project Description */}
				<div>
					<label className="block font-bold text-[#2B2B2B]">
						Project Description
					</label>
					<textarea
						name="projectDescription"
						rows="4"
						value={formData.projectDescription}
						onChange={handleChange}
						className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
					/>
				</div>

				{/* Submit */}
				<div className="flex justify-center mt-4">
					<button
						type="submit"
						className="flex items-center justify-center w-full sm:w-[220px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515]"
					>
						Submit Request
					</button>
				</div>
			</form>
		</div>
	);
}
