
import { fetchCoverUrlByTitle } from "./openLibrary.js";
import { getQuotes } from "./quotesApi.js";

// 1) GET ELEMENTS FROM THE HTML (querySelector)
const form = document.querySelector("#childForm");
const input = document.querySelector("#childName");
const list = document.querySelector("#childList");
const activeTitle = document.querySelector("#activeChildTitle");

const logForm = document.querySelector("#logForm");
const bookTitleInput = document.querySelector("#bookTitle");
const minutesInput = document.querySelector("#minutes");
const logDateInput = document.querySelector("#logDate");
const logList = document.querySelector("#logList");
const minutesTotal = document.querySelector("#minutesTotal")
const pointsTotalEl = document.querySelector("#pointsTotal")


function makeId() {
    return Date.now().toString() + "-" + Math.random().toString(16).slice(2);
}

// 2) LOAD SAVED DATA (localStorage)

let children = JSON.parse(localStorage.getItem("children")) || [];
let activeChild = localStorage.getItem("activeChild") || "";

// If there are children but none selected yet, auto-select the first one
if (!activeChild && children.length > 0) {
    activeChild = children[0].id;
    localStorage.setItem("activeChild", activeChild);
}

function getTotalPoints(child) {
    return (child.logs || []).reduce(
        (sum, log) => sum + Number(log.minutes || 0),
        0
    );
}

function getSpentPoints(child) {
    return (child.redeemedRewards || []).reduce(
        (sum, r) => sum + Number(r.cost || 0),
        0
    );
}

function getAvailablePoints(child) {
    return getTotalPoints(child) - getSpentPoints(child);
}


// 3) "SHOW" FUNCTIONS (these DRAW the page)

function showChildren() {
    list.innerHTML = "";

    children.forEach((child) => {
        const li = document.createElement("li");
        li.textContent = child.name;
        li.classList.add("child-item");

        // highlight the selected child
        if (child.id === activeChild) {
            li.classList.add("active");
        }

        // click to select a child
        li.addEventListener("click", () => {
            activeChild = child.id;
            localStorage.setItem("activeChild", activeChild);

            showActiveChild();
            showChildren();
            showLogs();
            setLogFormEnabled(true);
        });

        list.appendChild(li);
    });
}

function showActiveChild() {
    const selectedChild = children.find((child) => child.id === activeChild);

    if (!selectedChild) {
        activeTitle.textContent = "No child selected";
    } else {
        activeTitle.textContent = `Selected: ${selectedChild.name}`;
    }
}

function showLogs() {
    logList.innerHTML = "";

    const selectedChild = children.find((child) => child.id === activeChild);
    if (!selectedChild) {
        minutesTotal.textContent = "";
        pointsTotalEl.textContent = "";
        return;
    }


    selectedChild.logs = selectedChild.logs || [];

    selectedChild.logs.forEach((log, index) => {
        const li = document.createElement("li");
        li.classList.add("log-item");

        const text = document.createElement("span");
        const author = log.author ?? "Unknown";
        text.textContent = `${log.date} – ${log.title} by ${author} (${log.minutes} min)`;

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.textContent = "✕";
        delBtn.classList.add("delete-log");

        delBtn.addEventListener("click", () => {
            selectedChild.logs.splice(index, 1);
            localStorage.setItem("children", JSON.stringify(children));
            showLogs();
        });

        const img = document.createElement("img");
        img.classList.add("log-cover");
        img.alt = `Cover for ${log.title}`;
        img.loading = "lazy";

        if (log.coverUrl) {
            img.src = log.coverUrl;
            img.onerror = () => img.remove();
            li.appendChild(img);
        }

        li.appendChild(text);
        li.appendChild(delBtn);
        logList.appendChild(li);
    });

    // Total Minutes
    const total = selectedChild.logs.reduce(
        (sum, log) => sum + Number(log.minutes || 0),
        0
    );

    minutesTotal.textContent = `Total minutes read: ${total}`;

    // Points (simple: 1 point per minute)
    const earned = getTotalPoints(selectedChild);
    const spent = getSpentPoints(selectedChild);
    const available = Math.max(0, earned - spent);

    pointsTotalEl.textContent = `Available points: ${available}`;
}

// Disable/enable the log form until a child is selected
function setLogFormEnabled(enabled) {
    bookTitleInput.disabled = !enabled;
    minutesInput.disabled = !enabled;
    logDateInput.disabled = !enabled;
    logForm.querySelector("button").disabled = !enabled;
}


// 4) EVENT LISTENERS (user actions)


// ADD CHILD
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = input.value.trim();
    if (!name) return;

    // Create the child object
    const newChild = {
        id: Date.now().toString(),
        name: name,
        logs: [],
    };

    children.push(newChild);
    localStorage.setItem("children", JSON.stringify(children));

    // auto-select the child you just added
    activeChild = newChild.id;
    localStorage.setItem("activeChild", activeChild);

    input.value = "";

    // re-draw everything
    showChildren();
    showActiveChild();
    showLogs();
    setLogFormEnabled(true);
});

// ADD LOG
logForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedChild = children.find((child) => child.id === activeChild);

    if (!selectedChild) {
        alert("Please select a child first.");
        return;
    }

    const title = bookTitleInput.value.trim();
    const minutes = Number(minutesInput.value);
    const date = logDateInput.value || new Date().toISOString().slice(0, 10);

    if (!title || !minutes) return;

    let bookData = null;
    try {
        bookData = await fetchCoverUrlByTitle(title);
    } catch (err) {
        console.error("Book fetch failed:", err);
    }


    selectedChild.logs.push({
        id: makeId(),
        title,
        minutes,
        date,

        author: bookData?.author ?? "Unknown",
        publishYear: bookData?.publishYear ?? "N/A",
        pages: bookData?.pages ?? "N/A",
        isbn: bookData?.isbn ?? "N/A",
        subjects: bookData?.subjects ?? [],

        coverUrl: bookData?.coverUrl ?? ""
    });

    localStorage.setItem("children", JSON.stringify(children));

    bookTitleInput.value = "";
    minutesInput.value = "";
    logDateInput.value = "";

    showLogs();
});



showChildren();
showActiveChild();
showLogs();
setLogFormEnabled(!!activeChild);


// Quotes
const quoteBtn = document.querySelector("#quoteBtn");
const quoteList = document.querySelector("#quoteList");

async function loadQuotes() {
    if (!quoteList) return;

    quoteList.innerHTML = "<li>Loading...</li>";

    const quotes = await getQuotes(3);

    quoteList.innerHTML = "";

    quotes.forEach((q) => {
        const li = document.createElement("li");

        const tags =
            Array.isArray(q.tags) && q.tags.length
                ? ` • ${q.tags.slice(0, 2).join(", ")}`
                : "";

        li.innerHTML = `
            “${q.content}”
            <br><small>— ${q.author}${tags}</small>`;
        quoteList.appendChild(li);
    });

    if (quotes.length === 0) {
        quoteList.innerHTML = "<li>No quotes returned.</li>";
    }
}

if (quoteBtn) {
    quoteBtn.addEventListener("click", loadQuotes);
}

// optional: auto-load once on page load
loadQuotes();