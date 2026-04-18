export default function FieldError({ id, error, touched }) {
	if (!touched || !error) return null;
	// role="alert" makes screen readers announce validation errors when they
	// appear. The `id` lets inputs reference us via aria-describedby.
	return (
		<p id={id} role="alert" className="text-red-600 text-sm mt-1">
			{error}
		</p>
	);
}
