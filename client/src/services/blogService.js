const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchBlogPosts() {
	const res = await fetch(`${API_BASE}/api/blog`);
	if (!res.ok) {
		throw new Error(`Failed to fetch blog posts: ${res.status}`);
	}
	return res.json();
}

export async function incrementBlogPostViews(slug) {
	if (!slug) return null;

	try {
		const res = await fetch(`${API_BASE}/api/blog/${encodeURIComponent(slug)}/views`, {
			method: "POST",
		});
		if (!res.ok) return null;
		const data = await res.json();
		return typeof data.views === "number" ? data.views : null;
	} catch {
		return null;
	}
}
