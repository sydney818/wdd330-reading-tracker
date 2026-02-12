
export async function getQuotes(count = 3) {
    try {
        const res = await fetch(`https://api.quotable.io/quotes?limit=${count}`);
        if (!res.ok) throw new Error(`Quotable failed: ${res.status}`);

        const data = await res.json();
        return data.results || [];
    } catch (err) {
        console.error("Quote fetch failed:", err);
        return [];
    }
}