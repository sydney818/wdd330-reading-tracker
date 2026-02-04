const form = document.querySelector("#childForm");
const input = document.querySelector("#childName");
const list = document.querySelector("#child-list"); 

// 1) Empty array
let children = [];

// 2) Load saved children 
const savedChildren = localStorage.getItem("children");
if (savedChildren) {
    children = JSON.parse(savedChildren);
    showChildren();
}

// 3) Add submit listener
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = input.value.trim();
    if (name === "") return;

    children.push(name);

    // save to localStorage
    localStorage.setItem("children", JSON.stringify(children));

    // clear input
    input.value = "";

    // re-render list
    showChildren();
});

function showChildren() {
    list.innerHTML = "";

    children.forEach((childName) => {
        const div = document.createElement("div");
        div.classList.add("child-item");
        div.textContent = childName;
        list.appendChild(div);
    });
}
