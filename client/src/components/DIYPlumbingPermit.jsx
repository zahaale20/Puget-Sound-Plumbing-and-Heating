import { useState } from "react";
import { submitDiyPermit } from "../services/emailService";
import { getHCaptchaToken } from "../services/hcaptchaService";
import FormResponseMessage from "./ui/FormResponseMessage";

export default function DIYPlumbingPermit() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		projectDescription: "",
		inspection: "unsure",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitSuccessMessage, setSubmitSuccessMessage] = useState("Thank you! We'll be in touch soon.");
	const [submitResponseType, setSubmitResponseType] = useState("success");

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitError(null);
		setSubmitSuccessMessage("Thank you! We'll be in touch soon.");
		setSubmitResponseType("success");
		try {
			// Get hCaptcha token
			const captchaToken = await getHCaptchaToken();
			if (!captchaToken) {
				setSubmitError("Security verification failed. Please refresh and try again.");
				setIsSubmitting(false);
				return;
			}

			const result = await submitDiyPermit(formData, captchaToken);
			if (result?.duplicate) {
				setSubmitSuccessMessage(result.message || "This request already exists.");
				setSubmitResponseType("warning");
			}
			setSubmitSuccess(true);
			setTimeout(() => setSubmitSuccess(false), 5000);
			setFormData({
				firstName: "",
				lastName: "",
				email: "",
				phone: "",
				address: "",
				city: "",
				state: "",
				zipCode: "",
				projectDescription: "",
				inspection: "unsure",
			});
		} catch (err) {
			setSubmitError(err.message || "An error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
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
					If you’re a homeowner planning plumbing updates or installations, fill out the form below
					to request permit assistance. We’ll help ensure your project meets local code
					requirements.
				</p>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* First Name */}
					<div>
						<label className="text-[#2B2B2B]">
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
						<label className="text-[#2B2B2B]">
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
				</div>

				{/* Address */}
				<div>
					<label className="text-[#2B2B2B]">
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

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* City */}
					<div>
						<label className="text-[#2B2B2B]">City</label>
						<input
							className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
							type="text"
							name="city"
							value={formData.city}
							onChange={handleChange}
						/>
					</div>

					{/* State */}
					<div>
						<label className="text-[#2B2B2B]">State</label>
						<input
							className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
							type="text"
							name="state"
							value={formData.state}
							onChange={handleChange}
						/>
					</div>

					{/* Zip Code */}
					<div>
						<label className="text-[#2B2B2B]">Zip Code</label>
						<input
							className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
							type="text"
							name="zipCode"
							value={formData.zipCode}
							onChange={handleChange}
						/>
					</div>
				</div>

				{/* Project Description */}
				<div>
					<label className="text-[#2B2B2B]">Project Description</label>
					<textarea
						name="projectDescription"
						rows="4"
						value={formData.projectDescription}
						onChange={handleChange}
						className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
					/>
				</div>

				{/* Inspection */}
				<div>
					<label className="text-[#2B2B2B]">Do you need an inspection?</label>
					<select
						name="inspection"
						value={formData.inspection}
						onChange={handleChange}
						className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
					>
						<option value="unsure">Not sure</option>
						<option value="yes">Yes</option>
						<option value="no">No</option>
					</select>
				</div>

				{/* Submit */}
				<div className="flex justify-center mt-4">
					{submitSuccess ? (
						<FormResponseMessage
							type={submitResponseType}
							message={submitSuccessMessage}
							className="w-full text-center"
						/>
					) : (
						<>
							<FormResponseMessage
								type="error"
								message={submitError}
								className="w-full text-center mb-2"
							/>
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex items-center justify-center w-full sm:w-[220px] h-[50px] px-8 gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515] disabled:opacity-60 disabled:cursor-not-allowed"
							>
								{isSubmitting ? "Submitting..." : "Submit Request"}
							</button>
						</>
					)}
				</div>
			</form>
		</div>
	);
}
