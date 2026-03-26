const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export const getSignedUrl = async (imageKey) => {
    try {
        const response = await fetch(`${API_URL}/api/images/${imageKey}`);
        if (!response.ok) throw new Error("Image fetch failed");
        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error("S3 Error:", error);
        return null;
    }
};