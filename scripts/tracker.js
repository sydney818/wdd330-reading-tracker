
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


// 2) LOAD SAVED DATA (localStorage)

let children = JSON.parse(localStorage.getItem("children")) || [];
let activeChild = localStorage.getItem("activeChild") || "";

// If there are children but none selected yet, auto-select the first one
if (!activeChild && children.length > 0) {
    activeChild = children[0].id;
    localStorage.setItem("activeChild", activeChild);
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
    if (!selectedChild) return;

    selectedChild.logs.forEach((log) => {
        const li = document.createElement("li");
        li.textContent = `${log.date} - ${log.title} (${log.minutes} min)`;
        logList.appendChild(li);
    });
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
logForm.addEventListener("submit", (event) => {
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

    selectedChild.logs.push({ title, minutes, date });
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
