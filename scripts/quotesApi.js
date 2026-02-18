
export async function getQuotes(count = 3) {
    try {
        const requests = Array.from({ length: count }, () =>
            fetch("https://api.quotable.io/random", { cache: "no-store" }).then((res) => {
                if (!res.ok) throw new Error(`Quote fetch failed: ${res.status}`);
                return res.json();
            })
        );

        const quotes = await Promise.all(requests);

        // Remove duplicates 
        const seen = new Set();
        return quotes.filter((q) => (seen.has(q._id) ? false : seen.add(q._id)));
    } catch (err) {
        console.error("Quote fetch failed:", err);
        return [];
    }
}


