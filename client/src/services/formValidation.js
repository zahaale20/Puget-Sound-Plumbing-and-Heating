// ── Validation Rules ──

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const PHONE_DIGITS_REGEX = /^\d{10}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ' -]+$/;

/**
 * Format a raw phone string to (XXX) XXX-XXXX as the user types.
 * Strips all non-digit characters first.
 */
export function formatPhone(value) {
	const digits = value.replace(/\D/g, "").slice(0, 10);
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
	return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Strip formatting from phone to get raw digits.
 */
function stripPhone(value) {
	return value.replace(/\D/g, "");
}

// ── Individual field validators ──
// Each returns an error string or "" (empty = valid).

export function validateName(value, label = "Name") {
	const trimmed = value.trim();
	if (!trimmed) return `${label} is required.`;
	if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
	if (trimmed.length > 50) return `${label} must be 50 characters or fewer.`;
	if (!NAME_REGEX.test(trimmed)) return `${label} contains invalid characters.`;
	return "";
}

export function validateEmail(value) {
	const trimmed = value.trim();
	if (!trimmed) return "Email is required.";
	if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address.";
	return "";
}

export function validatePhone(value) {
	const digits = stripPhone(value);
	if (!digits) return "Phone number is required.";
	if (!PHONE_DIGITS_REGEX.test(digits)) return "Please enter a valid 10-digit phone number.";
	return "";
}

export function validateRequired(value, label = "This field") {
	if (!value.trim()) return `${label} is required.`;
	return "";
}

// ── Schema-based validation ──
// Pass a schema object mapping field names to arrays of validator functions.
// Each validator receives the field value and returns an error string or "".

/**
 * Validate all fields in formData against a schema.
 * Returns { errors: { fieldName: "error message", ... }, isValid: boolean }
 */
export function validateForm(formData, schema) {
	const errors = {};
	for (const [field, validators] of Object.entries(schema)) {
		const value = formData[field] ?? "";
		for (const validate of validators) {
			const error = validate(value);
			if (error) {
				errors[field] = error;
				break; // show first error per field
			}
		}
	}
	return { errors, isValid: Object.keys(errors).length === 0 };
}
