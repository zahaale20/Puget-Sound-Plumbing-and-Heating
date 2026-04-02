import { supabase } from "./supabaseClient";

const BLOG_TABLE = "Blog Posts";

function mapBlogPost(row) {
	const content = row.content_json || {};
	return {
		id: row.id,
		title: row.title || "",
		slug: row.slug || "",
		link: content.link || `/blog/${row.slug}`,
		date: row.published_date || "",
		author: row.author || "Puget Sound Plumbing",
		views: Number(row.views || 0),
		description: content.description || "",
		keywords: Array.isArray(content.categories) ? content.categories : [],
		sections: Array.isArray(content.sections) ? content.sections : [],
		featuredImageKey: row.featured_image_s3_key || "",
		contentImageKeys: Array.isArray(row.content_image_s3_keys) ? row.content_image_s3_keys : [],
		sourceUrl: row.source_url || "",
	};
}

export async function fetchBlogPosts() {
	const { data, error } = await supabase
		.from(BLOG_TABLE)
		.select("id,title,slug,source_url,published_date,author,views,content_json,featured_image_s3_key,content_image_s3_keys")
		.order("published_date", { ascending: false, nullsFirst: false });

	if (error) throw error;
	return (data || []).map(mapBlogPost);
}
