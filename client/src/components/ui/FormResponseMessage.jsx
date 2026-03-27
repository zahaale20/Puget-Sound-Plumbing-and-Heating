export default function FormResponseMessage({ type = "success", message, className = "" }) {
	if (!message) return null;

	const styles =
		type === "error"
			? "bg-red-100 border border-red-400 text-red-700"
			: "bg-green-100 border border-green-400 text-green-700";

	return <div className={`${styles} px-4 py-3 rounded ${className}`}>{message}</div>;
}