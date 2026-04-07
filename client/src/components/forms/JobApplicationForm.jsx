import { useState, useMemo } from "react";
import { FaChevronDown } from "react-icons/fa";
import { openings } from "../../data/data";
import { submitJobApplication } from "../../services/emailService";
import { getHCaptchaToken } from "../../services/hcaptchaService";
import FormResponseMessage from "../ui/FormResponseMessage";
import FieldError from "../ui/FieldError";
import { LoadingButtonContent } from "../ui/LoadingComponents";
import { validateName, validateEmail, validatePhone, validateRequired, formatPhone } from "../../services/formValidation";
import useFormValidation from "../../hooks/useFormValidation";

export default function JobApplicationForm() {
	const validationSchema = useMemo(() => ({
		firstName: [(v) => validateName(v, "First name")],
		lastName: [(v) => validateName(v, "Last name")],
		phone: [validatePhone],
		email: [validateEmail],
		position: [(v) => validateRequired(v, "Position")],
	}), []);

	const { errors: fieldErrors, touched, handleBlur, validateField, validateAll, resetValidation, setFieldTouched } = useFormValidation(validationSchema);

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
	const [submitResponseType, setSubmitResponseType] = useState("success");

	const handleChange = (e) => {
		const { name, value } = e.target;
		const newValue = name === "phone" ? formatPhone(value) : value;
		setFormData({ ...formData, [name]: newValue });
		if (touched[name]) validateField(name, newValue);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const { isValid } = validateAll(formData);
		if (!isValid) return;

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

			const result = await submitJobApplication(formData, resumeFile, captchaToken);
			if (result?.duplicate) {
				setSubmitSuccessMessage(result.message || "This application already exists.");
				setSubmitResponseType("warning");
			}
			setSubmitSuccess(true);
			setTimeout(() => setSubmitSuccess(false), 5000);
			setFormData({ firstName: "", lastName: "", phone: "", email: "", position: "", experience: "", message: "", additionalInfo: "" });
			setResumeFile(null);
			resetValidation();
		} catch (err) {
			setSubmitError(err.message || "An error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left" noValidate>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label htmlFor="job-firstName" className="text-[#2B2B2B]">
						First Name <span className="text-[#B32020] font-normal italic">*</span>
					</label>
					<input
						id="job-firstName"
						className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.firstName && fieldErrors.firstName ? "border-red-500" : "border-gray-300"}`}
						type="text"
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
					<FieldError error={fieldErrors.firstName} touched={touched.firstName} />
				</div>
				<div>
					<label htmlFor="job-lastName" className="text-[#2B2B2B]">
						Last Name <span className="text-[#B32020] font-normal italic">*</span>
					</label>
					<input
						id="job-lastName"
						className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.lastName && fieldErrors.lastName ? "border-red-500" : "border-gray-300"}`}
						type="text"
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
					<FieldError error={fieldErrors.lastName} touched={touched.lastName} />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label htmlFor="job-phone" className="text-[#2B2B2B]">
						Phone <span className="text-[#B32020] italic">*</span>
					</label>
					<input
						id="job-phone"
						className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.phone && fieldErrors.phone ? "border-red-500" : "border-gray-300"}`}
						type="tel"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
					<FieldError error={fieldErrors.phone} touched={touched.phone} />
				</div>
				<div>
					<label htmlFor="job-email" className="text-[#2B2B2B]">
						Email <span className="text-[#B32020] italic">*</span>
					</label>
					<input
						id="job-email"
						className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.email && fieldErrors.email ? "border-red-500" : "border-gray-300"}`}
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
					<FieldError error={fieldErrors.email} touched={touched.email} />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="relative">
					<label htmlFor="job-position" className="text-[#2B2B2B]">
						Position <span className="text-[#B32020] italic">*</span>
					</label>
					<div
						className={`border px-4 py-2 bg-white cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.position && fieldErrors.position ? "border-red-500" : "border-gray-300"}`}
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
										setFieldTouched("position");
										validateField("position", job.name);
									}}
									className={`px-4 py-2 cursor-pointer hover:bg-[#F5F5F5] transition-colors ${formData.position === job.name ? "bg-[#F5F5F5]" : ""}`}
								>
									{job.name}
								</li>
							))}
						</ul>
					)}
					<FieldError error={fieldErrors.position} touched={touched.position} />
				</div>
				<div>
					<label htmlFor="job-resume" className="text-[#2B2B2B]">Resume</label>
					<input
						id="job-resume"
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
							className="flex items-center justify-center w-full sm:w-[200px] h-[50px] px-8 gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515] disabled:opacity-60 disabled:cursor-not-allowed"
						>
							<LoadingButtonContent
								isLoading={isSubmitting}
								idleLabel="Apply Now"
								loadingLabel="Submitting application..."
							/>
						</button>
					</>
				)}
			</div>
		</form>
	);
}
