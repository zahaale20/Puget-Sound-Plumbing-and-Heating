import { supabase } from "./supabaseClient";

const BLOG_TABLE_CANDIDATES = ["Blog Posts", "blog_posts"];
const BLOG_SELECT_COLUMNS =
	"id,title,slug,source_url,published_date,author,views,content_json,featured_image_s3_key,content_image_s3_keys";

let resolvedBlogTable = null;

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

function isMissingRelationError(error) {
	if (!error) return false;
	const code = (error.code || "").toString().toUpperCase();
	const message = (error.message || "").toString();
	const status = Number(error.status || 0);
	return (
		code === "42P01" ||
		code === "PGRST205" ||
		status === 404 ||
		/relation.+does not exist|could not find the table|not found/i.test(message)
	);
}

function getTableCandidates() {
	if (!resolvedBlogTable) return BLOG_TABLE_CANDIDATES;
	return [resolvedBlogTable, ...BLOG_TABLE_CANDIDATES.filter((tableName) => tableName !== resolvedBlogTable)];
}

async function selectPostsFromTable(tableName) {
	return supabase
		.from(tableName)
		.select(BLOG_SELECT_COLUMNS)
		.order("published_date", { ascending: false, nullsFirst: false });
}

async function getPostBySlug(slug) {
	let lastError = null;

	for (const tableName of getTableCandidates()) {
		const { data, error } = await supabase
			.from(tableName)
			.select("id,views")
			.eq("slug", slug)
			.single();

		if (!error && data) {
			resolvedBlogTable = tableName;
			return { post: data, tableName };
		}

		lastError = error;
		if (!isMissingRelationError(error)) {
			throw error;
		}
	}

	throw lastError || new Error("Post not found for view increment.");
}

export async function fetchBlogPosts() {
	let lastError = null;
	let firstEmptyResult = null;

	for (const tableName of getTableCandidates()) {
		const { data, error } = await selectPostsFromTable(tableName);

		if (!error) {
			const posts = (data || []).map(mapBlogPost);
			if (posts.length > 0) {
				resolvedBlogTable = tableName;
				return posts;
			}

			if (!firstEmptyResult) {
				firstEmptyResult = { posts, tableName };
			}
			continue;
		}

		lastError = error;
		if (!isMissingRelationError(error)) {
			throw error;
		}
	}

	if (firstEmptyResult) {
		resolvedBlogTable = firstEmptyResult.tableName;
		return firstEmptyResult.posts;
	}

	throw lastError || new Error("Unable to load blog posts from Supabase.");
}

export async function incrementBlogPostViews(slug) {
	if (!slug) return null;

	const { data: rpcData, error: rpcError } = await supabase.rpc("increment_blog_post_views", {
		post_slug: slug,
	});

	if (!rpcError) {
		return Number(rpcData || 0);
	}

	const { post, tableName } = await getPostBySlug(slug);
	const nextViews = Number(post.views || 0) + 1;
	const { error: updateError } = await supabase
		.from(tableName)
		.update({ views: nextViews })
		.eq("id", post.id);

	if (updateError) throw updateError;
	return nextViews;
}
