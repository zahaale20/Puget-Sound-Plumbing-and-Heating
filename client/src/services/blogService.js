import { supabase } from "./supabaseClient";

const BLOG_TABLE_NAME = "Blog Posts";
const BLOG_SELECT_COLUMNS =
	"id,title,slug,source_url,published_date,author,views,content_json,featured_image_s3_key,content_image_s3_keys";

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

async function selectPosts() {
	return supabase
		.from(BLOG_TABLE_NAME)
		.select(BLOG_SELECT_COLUMNS)
		.order("published_date", { ascending: false, nullsFirst: false });
}

async function getPostBySlug(slug) {
	const { data, error } = await supabase
		.from(BLOG_TABLE_NAME)
		.select("id,views")
		.eq("slug", slug)
		.single();

	if (error) throw error;
	if (!data) throw new Error("Post not found for view increment.");
	return data;
}

export async function fetchBlogPosts() {
	const { data, error } = await selectPosts();
	if (error) throw error;
	return (data || []).map(mapBlogPost);
}

export async function incrementBlogPostViews(slug) {
	if (!slug) return null;

	const { data: rpcData, error: rpcError } = await supabase.rpc("increment_blog_post_views", {
		post_slug: slug,
	});

	if (!rpcError) {
		return Number(rpcData || 0);
	}

	const post = await getPostBySlug(slug);
	const nextViews = Number(post.views || 0) + 1;
	const { error: updateError } = await supabase
		.from(BLOG_TABLE_NAME)
		.update({ views: nextViews })
		.eq("id", post.id);

	if (updateError) throw updateError;
	return nextViews;
}
