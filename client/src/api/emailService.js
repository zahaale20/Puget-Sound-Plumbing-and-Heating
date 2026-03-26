export const sendFollowUpEmail = async (email, firstName) => {
	try {
		const response = await fetch("/api/send-email", {
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

export const submitSchedule = async (formData) => {
	const response = await fetch("/api/schedule", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(formData),
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
