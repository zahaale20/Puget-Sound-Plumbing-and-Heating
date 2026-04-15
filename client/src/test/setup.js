import "@testing-library/jest-dom/vitest";

// Provide a dummy Supabase storage URL so imageService doesn't throw during tests
import.meta.env.VITE_SUPABASE_STORAGE_URL =
	import.meta.env.VITE_SUPABASE_STORAGE_URL || "https://test.supabase.co";
