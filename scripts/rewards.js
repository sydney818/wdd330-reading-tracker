
// 1) GET ELEMENTS
const rewardChildName = document.querySelector("#rewardChildName");
const rewardPoints = document.querySelector("#rewardPoints");
const rewardList = document.querySelector("#rewardList");

const customRewardForm = document.querySelector("#customRewardForm");
const rewardTitleInput = document.querySelector("#rewardTitle");
const rewardCostInput = document.querySelector("#rewardCost");
const rewardDescInput = document.querySelector("#rewardDesc");


const breakdownEl = document.querySelector("#rewardBreakdown");

// 2) LOAD DATA
let children = JSON.parse(localStorage.getItem("children")) || [];
let activeChildId = localStorage.getItem("activeChild");
const activeChild = children.find((child) => child.id === activeChildId);

// Load custom rewards from localStorage
let customRewards = JSON.parse(localStorage.getItem("customRewards")) || [];

function saveChildren() {
    localStorage.setItem("children", JSON.stringify(children));
}

function saveCustomRewards() {
    localStorage.setItem("customRewards", JSON.stringify(customRewards));
}

// 3) REWARDS 
const bigRewards = [
    {
        id: "rw-1",
        title: "$5",
        cost: 50,
        category: "money",
        icon: "💵",
        description: "Cash reward for saving or spending",
        store: "Any",
        maxRedeems: 10,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-2",
        title: "Ice Cream Trip",
        cost: 80,
        category: "treat",
        icon: "🍦",
        description: "Pick your favorite ice cream treat",
        store: "Ice Cream Shop",
        maxRedeems: 10,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-3",
        title: "Boba Drink",
        cost: 80,
        category: "treat",
        icon: "🧋",
        description: "Choose your favorite boba drink",
        store: "Boba Shop",
        maxRedeems: 8,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-4",
        title: "Starbucks Drink",
        cost: 90,
        category: "treat",
        icon: "☕",
        description: "Pick any drink at Starbucks",
        store: "Starbucks",
        maxRedeems: 6,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-5",
        title: "Choose Dinner",
        cost: 120,
        category: "home",
        icon: "🍕",
        description: "Pick what the family eats for dinner",
        store: "Home",
        maxRedeems: 8,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-6",
        title: "Choose Family Game",
        cost: 120,
        category: "home",
        icon: "🎲",
        description: "Pick the game for family night",
        store: "Home",
        maxRedeems: 8,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-7",
        title: "Park Trip",
        cost: 120,
        category: "outing",
        icon: "🌳",
        description: "Special park visit with snacks",
        store: "Park",
        maxRedeems: 6,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-8",
        title: "Indoor Playground",
        cost: 150,
        category: "outing",
        icon: "🛝",
        description: "Trip to an indoor play place",
        store: "Indoor Playground",
        maxRedeems: 4,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-9",
        title: "Movie Night",
        cost: 200,
        category: "outing",
        icon: "🍿",
        description: "Family movie night (theater or at home)",
        store: "Movies",
        maxRedeems: 6,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-10",
        title: "Amazon Prize",
        cost: 250,
        category: "store",
        icon: "📦",
        description: "Pick a small prize from Amazon",
        store: "Amazon",
        maxRedeems: 6,
        active: true,
        createdBy: "parent",
    },
    {
        id: "rw-11",
        title: "Hive Trampoline Park",
        cost: 300,
        category: "outing",
        icon: "🤸",
        description: "Trip to Hive trampoline park",
        store: "Hive",
        maxRedeems: 3,
        active: true,
        createdBy: "parent",
    },
];

// 4) POINTS HELPERS
function getTotalPoints(child) {
    return (child.logs || []).reduce((sum, log) => sum + Number(log.minutes || 0), 0);
}

function getSpentPoints(child) {
    return (child.redeemedRewards || []).reduce((sum, r) => sum + Number(r.cost || 0), 0);
}

function getAvailablePoints(child) {
    
    return Math.max(0, getTotalPoints(child) - getSpentPoints(child));
}

// 5) RENDER HEADER
function renderHeader() {
    if (!activeChild) {
        rewardChildName.textContent = "No child selected";
        rewardPoints.textContent = "";
        if (breakdownEl) breakdownEl.textContent = "";
        return;
    }

    rewardChildName.textContent = `Rewards for ${activeChild.name}`;

    const earned = getTotalPoints(activeChild);
    const spent = getSpentPoints(activeChild);
    const available = getAvailablePoints(activeChild);

    rewardPoints.textContent = `Available points: ${available}`;

    if (breakdownEl) {
        breakdownEl.textContent = `Earned: ${earned} • Spent: ${spent}`;
    }
}

// 6) RENDER REWARDS LIST
function renderRewards() {
    rewardList.innerHTML = "";

    if (!activeChild) return;

    const available = getAvailablePoints(activeChild);

    const allRewards = [
        ...bigRewards.filter((r) => r.active),
        ...customRewards.filter((r) => r.active !== false),
    ];

    allRewards.forEach((reward) => {
        const li = document.createElement("li");
        li.style.marginBottom = "0.75rem";

        const text = document.createElement("div");
        text.innerHTML = `
      <strong>${reward.icon ?? "⭐"} ${reward.title}</strong> — ${reward.cost} points
      <br><small>${reward.description ?? ""}</small>
    `;

        const btn = document.createElement("button");
        btn.classList.add("btn");
        btn.type = "button";
        btn.textContent = "Redeem";
        btn.disabled = available < reward.cost;

        btn.addEventListener("click", () => redeemReward(reward));

        li.appendChild(text);
        li.appendChild(btn);

        if (String(reward.id).startsWith("custom-")) {
            const del = document.createElement("button");
            del.type = "button";
            del.textContent = "Remove";
            del.style.marginLeft = "0.5rem";
            del.classList.add("btn");
            del.addEventListener("click", () => {
                customRewards = customRewards.filter((r) => r.id !== reward.id);
                saveCustomRewards();
                renderRewards();
            });

            li.appendChild(del);
        }

        rewardList.appendChild(li);
    });
}


// 7) REDEEM REWARD
function redeemReward(reward) {
    if (!activeChild) return;

    activeChild.redeemedRewards = activeChild.redeemedRewards || [];

    // Prevent redeeming if not enough points
    if (getAvailablePoints(activeChild) < reward.cost) {
        alert("Not enough points for that reward.");
        return;
    }

    activeChild.redeemedRewards.push({
        id: `${reward.id}-${Date.now()}`,
        rewardId: reward.id,
        title: reward.title,
        cost: reward.cost,
        date: new Date().toISOString().slice(0, 10),
    });

    saveChildren();
    renderHeader();
    renderRewards();

    alert(`Redeemed: ${reward.title}`);
}


// 8) CUSTOM REWARD FORM
if (customRewardForm) {
    customRewardForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = rewardTitleInput.value.trim();
        const cost = Number(rewardCostInput.value);
        const description = rewardDescInput.value.trim();

        if (!title || !cost) return;

        customRewards.push({
            id: `custom-${Date.now()}`,
            title,
            cost,
            description,
            icon: "⭐",
            active: true,
            createdBy: "user",
        });

        saveCustomRewards();
        customRewardForm.reset();
        renderRewards();
    });
}

renderHeader();
renderRewards();
