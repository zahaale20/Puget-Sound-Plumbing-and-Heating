import { useState, useMemo } from "react";
import { submitDiyPermit } from "../../services/emailService";
import { getHCaptchaToken } from "../../services/hcaptchaService";
import FormResponseMessage from "../ui/FormResponseMessage";
import FieldError from "../ui/FieldError";
import { LoadingButtonContent } from "../ui/LoadingComponents";
import { SectionTitle } from "../ui/UnderlinedHeading";
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
			resetValidation();
		} catch (err) {
			setSubmitError(err.message || "An error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col w-full max-w-7xl mx-auto px-6">
			{/* Header */}
			<div className="w-full mb-6 text-left">
				<SectionTitle as="h4" className="mb-6">DIY – Plumbing Permit</SectionTitle>
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
						<label htmlFor="diy-firstName" className="text-[#2B2B2B]">
							First Name <span className="text-[#B32020] italic">*</span>
						</label>
						<input
							id="diy-firstName"
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
						<label htmlFor="diy-lastName" className="text-[#2B2B2B]">
							Last Name <span className="text-[#B32020] italic">*</span>
						</label>
						<input
							id="diy-lastName"
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
						<label htmlFor="diy-email" className="text-[#2B2B2B]">
							Email <span className="text-[#B32020] italic">*</span>
						</label>
						<input
							id="diy-email"
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
						<label htmlFor="diy-phone" className="text-[#2B2B2B]">
							Phone <span className="text-[#B32020] italic">*</span>
						</label>
						<input
							id="diy-phone"
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
					<label htmlFor="diy-address" className="text-[#2B2B2B]">
						Property Address <span className="text-[#B32020] italic">*</span>
					</label>
					<input
						id="diy-address"
						className={`w-full border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70] ${touched.address && fieldErrors.address ? "border-red-500" : "border-gray-300"}`}
						type="text"
						name="address"
						value={formData.address}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
					<FieldError error={fieldErrors.address} touched={touched.address} />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* City */}
					<div>
						<label htmlFor="diy-city" className="text-[#2B2B2B]">City</label>
						<input
							id="diy-city"
							className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
							type="text"
							name="city"
							value={formData.city}
							onChange={handleChange}
						/>
					</div>

					{/* State */}
					<div>
						<label htmlFor="diy-state" className="text-[#2B2B2B]">State</label>
						<input
							id="diy-state"
							className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
							type="text"
							name="state"
							value={formData.state}
							onChange={handleChange}
						/>
					</div>

					{/* Zip Code */}
					<div>
						<label htmlFor="diy-zipCode" className="text-[#2B2B2B]">Zip Code</label>
						<input
							id="diy-zipCode"
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
					<label htmlFor="diy-projectDescription" className="text-[#2B2B2B]">Project Description</label>
					<textarea
						id="diy-projectDescription"
						name="projectDescription"
						rows="4"
						value={formData.projectDescription}
						onChange={handleChange}
						className="w-full border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D70]"
					/>
				</div>

				{/* Inspection */}
				<div>
					<label htmlFor="diy-inspection" className="text-[#2B2B2B]">Do you need an inspection?</label>
					<select
						id="diy-inspection"
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
								className="flex items-center justify-center w-full sm:w-[220px] h-[50px] gap-2 text-base font-semibold text-white cursor-pointer transition-all duration-300 transform whitespace-nowrap bg-[#B32020] hover:bg-[#7a1515] disabled:opacity-60 disabled:cursor-not-allowed"
							>
								<LoadingButtonContent
									isLoading={isSubmitting}
									idleLabel="Submit Request"
									loadingLabel="Submitting request..."
								/>
							</button>
						</>
					)}
				</div>
			</form>
		</div>
	);
}
