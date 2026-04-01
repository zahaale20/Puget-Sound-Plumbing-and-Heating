export default function FieldError({ error, touched }) {
	if (!touched || !error) return null;
	return <p className="text-red-600 text-sm mt-1">{error}</p>;
}
