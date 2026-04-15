import { describe, expect, it } from "vitest";

import {
	formatPhone,
	validateEmail,
	validateForm,
	validateName,
	validatePhone,
	validateRequired,
} from "./formValidation";

// ── formatPhone ──

describe("formatPhone", () => {
	it("returns digits only when 3 or fewer", () => {
		expect(formatPhone("12")).toBe("12");
		expect(formatPhone("123")).toBe("123");
	});

	it("formats 4-6 digits as (XXX) XXX", () => {
		expect(formatPhone("1234")).toBe("(123) 4");
		expect(formatPhone("123456")).toBe("(123) 456");
	});

	it("formats 7-10 digits as (XXX) XXX-XXXX", () => {
		expect(formatPhone("1234567")).toBe("(123) 456-7");
		expect(formatPhone("1234567890")).toBe("(123) 456-7890");
	});

	it("strips non-digit characters before formatting", () => {
		expect(formatPhone("(123) 456-7890")).toBe("(123) 456-7890");
		expect(formatPhone("123-456-7890")).toBe("(123) 456-7890");
	});

	it("truncates to 10 digits", () => {
		expect(formatPhone("12345678901234")).toBe("(123) 456-7890");
	});

	it("handles empty input", () => {
		expect(formatPhone("")).toBe("");
	});
});

// ── validateName ──

describe("validateName", () => {
	it("returns empty string for valid names", () => {
		expect(validateName("Alice")).toBe("");
		expect(validateName("Jean-Luc")).toBe("");
		expect(validateName("O'Brien")).toBe("");
		expect(validateName("José")).toBe("");
	});

	it("requires a value", () => {
		expect(validateName("")).toBe("Name is required.");
		expect(validateName("   ")).toBe("Name is required.");
	});

	it("requires at least 2 characters", () => {
		expect(validateName("A")).toBe("Name must be at least 2 characters.");
	});

	it("rejects names longer than 50 characters", () => {
		expect(validateName("A".repeat(51))).toBe("Name must be 50 characters or fewer.");
	});

	it("rejects invalid characters", () => {
		expect(validateName("Al1ce")).toBe("Name contains invalid characters.");
		expect(validateName("Bob@")).toBe("Name contains invalid characters.");
	});

	it("uses a custom label", () => {
		expect(validateName("", "First name")).toBe("First name is required.");
		expect(validateName("A", "Last name")).toBe("Last name must be at least 2 characters.");
	});
});

// ── validateEmail ──

describe("validateEmail", () => {
	it("returns empty string for valid emails", () => {
		expect(validateEmail("user@example.com")).toBe("");
		expect(validateEmail("first.last@sub.domain.co")).toBe("");
	});

	it("requires a value", () => {
		expect(validateEmail("")).toBe("Email is required.");
		expect(validateEmail("   ")).toBe("Email is required.");
	});

	it("rejects malformed emails", () => {
		expect(validateEmail("notanemail")).toBe("Please enter a valid email address.");
		expect(validateEmail("@domain.com")).toBe("Please enter a valid email address.");
		expect(validateEmail("user@")).toBe("Please enter a valid email address.");
	});
});

// ── validatePhone ──

describe("validatePhone", () => {
	it("returns empty string for valid 10-digit phones", () => {
		expect(validatePhone("1234567890")).toBe("");
		expect(validatePhone("(123) 456-7890")).toBe("");
	});

	it("requires a value", () => {
		expect(validatePhone("")).toBe("Phone number is required.");
	});

	it("rejects non-10-digit numbers", () => {
		expect(validatePhone("12345")).toBe("Please enter a valid 10-digit phone number.");
		expect(validatePhone("12345678901")).toBe("Please enter a valid 10-digit phone number.");
	});
});

// ── validateRequired ──

describe("validateRequired", () => {
	it("returns empty string for non-empty values", () => {
		expect(validateRequired("hello")).toBe("");
	});

	it("returns error for empty or whitespace values", () => {
		expect(validateRequired("")).toBe("This field is required.");
		expect(validateRequired("   ")).toBe("This field is required.");
	});

	it("uses a custom label", () => {
		expect(validateRequired("", "Message")).toBe("Message is required.");
	});
});

// ── validateForm ──

describe("validateForm", () => {
	const schema = {
		name: [validateName],
		email: [validateEmail],
	};

	it("returns isValid true when all fields pass", () => {
		const result = validateForm({ name: "Alice", email: "a@b.com" }, schema);
		expect(result.isValid).toBe(true);
		expect(result.errors).toEqual({});
	});

	it("collects the first error per field", () => {
		const result = validateForm({ name: "", email: "bad" }, schema);
		expect(result.isValid).toBe(false);
		expect(result.errors.name).toBe("Name is required.");
		expect(result.errors.email).toBe("Please enter a valid email address.");
	});

	it("treats missing fields as empty strings", () => {
		const result = validateForm({}, schema);
		expect(result.isValid).toBe(false);
		expect(result.errors.name).toBe("Name is required.");
		expect(result.errors.email).toBe("Email is required.");
	});

	it("stops at the first failing validator per field", () => {
		const twoValidators = {
			name: [(v) => (!v ? "required" : ""), () => "should not reach"],
		};
		const result = validateForm({ name: "" }, twoValidators);
		expect(result.errors.name).toBe("required");
	});
});
