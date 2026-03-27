const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export const sendFollowUpEmail = async (email, firstName) => {
	try {
		const response = await fetch(buildApiUrl("/api/send-email"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email,
				firstName,
			}),
		});

		if (!response.ok) {
			let errorMessage = "Failed to send email";
			try {
				const errorData = await response.json();
				errorMessage = errorData?.detail || errorData?.message || errorMessage;
			} catch {
				// ignore JSON parse errors and fallback to default message
			}
			throw new Error(errorMessage);
		}

		return await response.json();
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
};

export const submitSchedule = async (formData, recaptchaToken) => {
	const response = await fetch(buildApiUrl("/api/schedule"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ ...formData, recaptchaToken }),
	});

	if (!response.ok) {
		let errorMessage = "An error occurred. Please try again.";
		try {
			const errorData = await response.json();
			errorMessage = errorData?.detail || errorData?.message || errorMessage;
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(errorMessage);
	}

	return await response.json();
};

export const subscribeNewsletter = async (email, recaptchaToken) => {
	const response = await fetch(buildApiUrl("/api/newsletter"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, recaptchaToken }),
	});

	if (!response.ok) {
		let errorMessage = "Failed to subscribe. Please try again.";
		try {
			const errorData = await response.json();
			errorMessage = errorData?.detail || errorData?.message || errorMessage;
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(errorMessage);
	}

	return await response.json();
};

export const submitDiyPermit = async (formData, recaptchaToken) => {
	const response = await fetch(buildApiUrl("/api/diy-permit"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...formData, recaptchaToken }),
	});

	if (!response.ok) {
		let errorMessage = "Failed to submit request. Please try again.";
		try {
			const errorData = await response.json();
			errorMessage = errorData?.detail || errorData?.message || errorMessage;
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(errorMessage);
	}

	return await response.json();
};

export const submitJobApplication = async (formData, resumeFile, recaptchaToken) => {
	const data = new FormData();
	data.append("firstName", formData.firstName);
	data.append("lastName", formData.lastName);
	data.append("phone", formData.phone);
	data.append("email", formData.email);
	data.append("position", formData.position);
	data.append("experience", formData.experience || "");
	data.append("message", formData.message || "");
	data.append("additionalInfo", formData.additionalInfo || "");
	if (resumeFile) {
		data.append("resume", resumeFile);
	}
	if (recaptchaToken) {
		data.append("recaptchaToken", recaptchaToken);
	}

	const response = await fetch(buildApiUrl("/api/job-application"), {
		method: "POST",
		body: data,
	});

	if (!response.ok) {
		let errorMessage = "Failed to submit application. Please try again.";
		try {
			const errorData = await response.json();
			errorMessage = errorData?.detail || errorData?.message || errorMessage;
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(errorMessage);
	}

	return await response.json();
};

export const redeemOffer = async (formData, recaptchaToken) => {
	const response = await fetch(buildApiUrl("/api/redeem-offer"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...formData, recaptchaToken }),
	});

	if (!response.ok) {
		let errorMessage = "Failed to redeem offer. Please try again.";
		try {
			const errorData = await response.json();
			errorMessage = errorData?.detail || errorData?.message || errorMessage;
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(errorMessage);
	}

	return await response.json();
};
