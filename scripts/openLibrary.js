
export async function fetchCoverUrlByTitle(title) {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) return null;

        const data = await res.json();
        const book = data.docs?.[0];
        if (!book) return null;

        const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "";

        return {
            title: book.title ?? title,
            author: book.author_name?.[0] ?? "Unknown",
            publishYear: book.first_publish_year ?? "N/A",
            pages: book.number_of_pages_median ?? "N/A",
            isbn: book.isbn?.[0] ?? "N/A",
            subjects: book.subject?.slice(0, 3) ?? [],
            coverUrl
        };
    } catch (err) {
        console.error("Open Library error:", err);
        return null;
    }
}

