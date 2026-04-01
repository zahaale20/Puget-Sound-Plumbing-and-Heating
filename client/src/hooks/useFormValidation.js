import { useState, useCallback } from "react";
import { validateForm } from "../services/formValidation";

/**
 * Hook for field-level form validation with on-blur / on-submit behaviour.
 *
 * @param {object} schema – { fieldName: [validatorFn, ...] }
 * @returns {{ errors, touched, handleBlur, validateAll, resetValidation, setFieldTouched }}
 */
export default function useFormValidation(schema) {
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});

	/** Validate a single field, updating errors state. */
	const validateField = useCallback(
		(name, value) => {
			const fieldValidators = schema[name];
			if (!fieldValidators) return "";
			for (const validate of fieldValidators) {
				const error = validate(value);
				if (error) {
					setErrors((prev) => ({ ...prev, [name]: error }));
					return error;
				}
			}
			setErrors((prev) => {
				const next = { ...prev };
				delete next[name];
				return next;
			});
			return "";
		},
		[schema]
	);

	/** onBlur handler – marks field as touched and validates it. */
	const handleBlur = useCallback(
		(e) => {
			const { name, value } = e.target;
			setTouched((prev) => ({ ...prev, [name]: true }));
			validateField(name, value);
		},
		[validateField]
	);

	/** Validate every field (for submit). Returns { errors, isValid }. */
	const validateAll = useCallback(
		(formData) => {
			const result = validateForm(formData, schema);
			setErrors(result.errors);
			// Mark all schema fields as touched
			const allTouched = {};
			for (const key of Object.keys(schema)) allTouched[key] = true;
			setTouched(allTouched);
			return result;
		},
		[schema]
	);

	/** Reset all validation state. */
	const resetValidation = useCallback(() => {
		setErrors({});
		setTouched({});
	}, []);

	/** Manually mark a field as touched (e.g. dropdowns). */
	const setFieldTouched = useCallback((name) => {
		setTouched((prev) => ({ ...prev, [name]: true }));
	}, []);

	return { errors, touched, handleBlur, validateField, validateAll, resetValidation, setFieldTouched };
}
