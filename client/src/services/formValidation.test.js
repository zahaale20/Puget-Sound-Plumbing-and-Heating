import {
	formatPhone,
	stripPhone,
	validateName,
	validateEmail,
	validatePhone,
	validateRequired,
	validateMinLength,
	validateForm,
} from "./formValidation";

describe("formatPhone", () => {
	it("formats progressively while typing", () => {
		expect(formatPhone("2")).toBe("2");
		expect(formatPhone("2065")).toBe("(206) 5");
		expect(formatPhone("2065550100")).toBe("(206) 555-0100");
	});

	it("strips non-digits and truncates to 10 digits", () => {
		expect(formatPhone("(206) 555-010099")).toBe("(206) 555-0100");
	});
});

describe("stripPhone", () => {
	it("removes all non-digit characters", () => {
		expect(stripPhone("(206) 555-0100")).toBe("2065550100");
	});
});

describe("field validators", () => {
	it("validates names with boundaries and characters", () => {
		expect(validateName("")).toContain("required");
		expect(validateName("A")).toContain("at least 2");
		expect(validateName("A".repeat(51))).toContain("50 characters or fewer");
		expect(validateName("Jane123")).toContain("invalid characters");
		expect(validateName("Ana-Marie O'Neil")).toBe("");
	});

	it("validates emails", () => {
		expect(validateEmail("")).toContain("required");
		expect(validateEmail("invalid@domain")).toContain("valid email");
		expect(validateEmail("person@example.com")).toBe("");
	});

	it("validates 10-digit phone numbers", () => {
		expect(validatePhone("")).toContain("required");
		expect(validatePhone("206-555-010")).toContain("valid 10-digit");
		expect(validatePhone("(206) 555-0100")).toBe("");
	});

	it("validates required and minimum length helpers", () => {
		expect(validateRequired("", "Message")).toBe("Message is required.");
		expect(validateRequired(" value ", "Message")).toBe("");
		expect(validateMinLength("abc", 5, "Details")).toContain("at least 5");
		expect(validateMinLength("abcdef", 5, "Details")).toBe("");
	});
});

describe("validateForm", () => {
	it("returns first error per field and invalid status", () => {
		const schema = {
			firstName: [
				(value) => validateRequired(value, "First name"),
				(value) => validateName(value, "First name"),
			],
			email: [validateEmail],
			message: [
				(value) => validateRequired(value, "Message"),
				(value) => validateMinLength(value, 10, "Message"),
			],
		};

		const result = validateForm(
			{
				firstName: "",
				email: "bad-email",
				message: "short",
			},
			schema
		);

		expect(result.isValid).toBe(false);
		expect(result.errors.firstName).toBe("First name is required.");
		expect(result.errors.email).toContain("valid email");
		expect(result.errors.message).toContain("at least 10");
	});

	it("returns valid status when all fields pass", () => {
		const schema = {
			firstName: [(value) => validateName(value, "First name")],
			email: [validateEmail],
		};

		const result = validateForm(
			{
				firstName: "Jordan",
				email: "jordan@example.com",
			},
			schema
		);

		expect(result).toEqual({ errors: {}, isValid: true });
	});
});
