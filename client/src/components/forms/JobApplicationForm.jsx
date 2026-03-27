import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { openings } from "../../data/data";
import { submitJobApplication } from "../../services/emailService";
import { getRecaptchaToken } from "../../services/recaptchaService";
import FormResponseMessage from "../ui/FormResponseMessage";

export default function JobApplicationForm() {
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
	const [resumeFile, setResumeFile] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitSuccessMessage, setSubmitSuccessMessage] = useState("Thank you! We'll be in touch soon.");

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitError(null);
		setSubmitSuccessMessage("Thank you! We'll be in touch soon.");
		try {
			// Get reCAPTCHA token
			const recaptchaToken = await getRecaptchaToken("job_apply");
			if (!recaptchaToken) {
				setSubmitError("Security verification failed. Please refresh and try again.");
				setIsSubmitting(false);
				return;
			}

			const result = await submitJobApplication(formData, resumeFile, recaptchaToken);
			if (result?.duplicate) {
				setSubmitSuccessMessage(result.message || "This application already exists.");
			}
			setSubmitSuccess(true);
			setTimeout(() => setSubmitSuccess(false), 5000);
			setFormData({ firstName: "", lastName: "", phone: "", email: "", position: "", experience: "", message: "", additionalInfo: "" });
			setResumeFile(null);
		} catch (err) {
			setSubmitError(err.message || "An error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
							className={`text-[#0C2D70] transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
						/>
					</div>
					{dropdownOpen && (
						<ul className="absolute z-10 w-full bg-white border-b border-x border-gray-300 shadow-lg max-h-56 overflow-y-auto">
							{openings.map((job, index) => (
								<li
									key={index}
									onClick={() => {
										setFormData({ ...formData, position: job.name });
										setDropdownOpen(false);
									}}
									className={`px-4 py-2 cursor-pointer hover:bg-[#F5F5F5] transition-colors ${formData.position === job.name ? "bg-[#F5F5F5]" : ""}`}
								>
									{job.name}
								</li>
							))}
						</ul>
					)}
				</div>
				<div>
					<label className="text-[#2B2B2B]">Resume</label>
					<input
						type="file"
						name="resume"
						required
						accept=".pdf,.doc,.docx"
						onChange={(e) => setResumeFile(e.target.files[0] || null)}
						className="w-full border border-gray-300 pr-4 bg-white text-[#2B2B2B] focus:outline-none file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[#0C2D70] file:text-white hover:file:bg-[#082050] file:cursor-pointer cursor-pointer transition-all duration-150"
					/>
				</div>
			</div>

			<div className="flex justify-center mt-4">
				{submitSuccess ? (
					<FormResponseMessage
						type="success"
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
							className="flex items-center justify-center w-full sm:w-[200px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515] disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Submitting..." : "Apply Now"}
						</button>
					</>
				)}
			</div>
		</form>
	);
}
