import { useState, useMemo } from "react";
import { submitDiyPermit } from "../../services/emailService";
import { getHCaptchaToken } from "../../services/hcaptchaService";
import FormResponseMessage from "../ui/FormResponseMessage";
import FieldError from "../ui/FieldError";
import { validateName, validateEmail, validatePhone, validateRequired, formatPhone } from "../../services/formValidation";
import useFormValidation from "../../hooks/useFormValidation";

export default function DIYPlumbingPermit() {
	const validationSchema = useMemo(() => ({
		firstName: [(v) => validateName(v, "First name")],
		lastName: [(v) => validateName(v, "Last name")],
		email: [validateEmail],
		phone: [validatePhone],
		address: [(v) => validateRequired(v, "Property address")],
	}), []);

	const { errors: fieldErrors, touched, handleBlur, validateField, validateAll, resetValidation } = useFormValidation(validationSchema);

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
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitSuccessMessage, setSubmitSuccessMessage] = useState("Thank you! We'll be in touch soon.");

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
				projectDescription: "",
				inspection: "unsure",
			});
			resetValidation();
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
			<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left" noValidate>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* First Name */}
					<div>
						<label className="block font-bold text-[#2B2B2B]">
							First Name <span className="text-[#B32020] italic">*</span>
						</label>
						<input
							className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.firstName && fieldErrors.firstName ? "border-red-500" : "border-gray-300"}`}
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
						<FieldError error={fieldErrors.firstName} touched={touched.firstName} />
					</div>

					{/* Last Name */}
					<div>
						<label className="block font-bold text-[#2B2B2B]">
							Last Name <span className="text-[#B32020] italic">*</span>
						</label>
						<input
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
					{/* Email */}
					<div>
						<label className="block font-bold text-[#2B2B2B]">
							Email <span className="text-[#B32020] italic">*</span>
						</label>
						<input
							className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.email && fieldErrors.email ? "border-red-500" : "border-gray-300"}`}
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
						<FieldError error={fieldErrors.email} touched={touched.email} />
					</div>

					{/* Phone */}
					<div>
						<label className="block font-bold text-[#2B2B2B]">
							Phone <span className="text-[#B32020] italic">*</span>
						</label>
						<input
							className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.phone && fieldErrors.phone ? "border-red-500" : "border-gray-300"}`}
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							onBlur={handleBlur}
						/>
						<FieldError error={fieldErrors.phone} touched={touched.phone} />
					</div>
				</div>

				{/* Address */}
				<div>
					<label className="block font-bold text-[#2B2B2B]">
						Property Address <span className="text-[#B32020] italic">*</span>
					</label>
					<input
						className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.address && fieldErrors.address ? "border-red-500" : "border-gray-300"}`}
						type="text"
						name="address"
						value={formData.address}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
					<FieldError error={fieldErrors.address} touched={touched.address} />
				</div>

				{/* Project Description */}
				<div>
					<label className="block font-bold text-[#2B2B2B]">Project Description</label>
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
								className="flex items-center justify-center w-full sm:w-[220px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515] disabled:opacity-60 disabled:cursor-not-allowed"
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
