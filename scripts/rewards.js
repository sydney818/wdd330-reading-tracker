const rewardChildName = document.querySelector("#rewardChildName");
const rewardPoints = document.querySelector("#rewardPoints");
const rewardList = document.querySelector("#rewardList");

// Load data from LocalStorage
let children = JSON.parse(localStorage.getItem("children")) || [];
let activeChildId = localStorage.getItem("activeChild") || "";
let activeChild = children.find((child) => child.id === activeChildId) || null;

// ---------- Big Rewards JSON (8+ attributes each) ----------
const bigRewards = [
    { id: "rw-1", title: "$5", cost: 50, category: "money", icon: "💵", description: "Cash reward for saving or spending", store: "Any", maxRedeems: 10, active: true, createdBy: "parent" },
    { id: "rw-2", title: "Ice Cream Trip", cost: 80, category: "treat", icon: "🍦", description: "Pick your favorite ice cream treat", store: "Ice Cream Shop", maxRedeems: 10, active: true, createdBy: "parent" },
    { id: "rw-3", title: "Boba Drink", cost: 80, category: "treat", icon: "🧋", description: "Choose your favorite boba drink", store: "Boba Shop", maxRedeems: 8, active: true, createdBy: "parent" },
    { id: "rw-4", title: "Starbucks Drink", cost: 90, category: "treat", icon: "☕", description: "Pick any drink at Starbucks", store: "Starbucks", maxRedeems: 6, active: true, createdBy: "parent" },
    { id: "rw-5", title: "Choose Dinner", cost: 120, category: "home", icon: "🍕", description: "Pick what the family eats for dinner", store: "Home", maxRedeems: 8, active: true, createdBy: "parent" },
    { id: "rw-6", title: "Choose Family Game", cost: 120, category: "home", icon: "🎲", description: "Pick the game for family night", store: "Home", maxRedeems: 8, active: true, createdBy: "parent" },
    { id: "rw-7", title: "Park Trip", cost: 120, category: "outing", icon: "🌳", description: "Special park visit with snacks", store: "Park", maxRedeems: 6, active: true, createdBy: "parent" },
    { id: "rw-8", title: "Indoor Playground", cost: 150, category: "outing", icon: "🛝", description: "Trip to an indoor play place", store: "Indoor Playground", maxRedeems: 4, active: true, createdBy: "parent" },
    { id: "rw-9", title: "Movie Night", cost: 200, category: "outing", icon: "🍿", description: "Family movie night (theater or at home)", store: "Movies", maxRedeems: 6, active: true, createdBy: "parent" },
    { id: "rw-10", title: "Amazon Prize", cost: 250, category: "store", icon: "📦", description: "Pick a small prize from Amazon", store: "Amazon", maxRedeems: 6, active: true, createdBy: "parent" },
    { id: "rw-11", title: "Hive Trampoline Park", cost: 300, category: "outing", icon: "🤸", description: "Trip to Hive trampoline park", store: "Hive", maxRedeems: 3, active: true, createdBy: "parent" },
];

// ---------- Helpers ----------
function getTotalPoints(child) {
    return (child.logs || []).reduce((sum, log) => sum + Number(log.minutes || 0), 0);
}

function getSpentPoints(child) {
    return (child.redeemedRewards || []).reduce((sum, r) => sum + Number(r.cost || 0), 0);
}

function getAvailablePoints(child) {
    return Math.max(0, getTotalPoints(child) - getSpentPoints(child));
}

function saveChildren() {
    localStorage.setItem("children", JSON.stringify(children));
}

// ---------- Render header ----------
function renderHeader() {
    const breakdownEl = document.querySelector("#rewardBreakdown");

    if (!activeChild) {
        rewardChildName.textContent = "No child selected";
        rewardPoints.textContent = "";
        if (breakdownEl) breakdownEl.textContent = "";
        return;
    }

    const earned = getTotalPoints(activeChild);
    const spent = getSpentPoints(activeChild);
    const available = getAvailablePoints(activeChild);

    rewardChildName.textContent = `Rewards for ${activeChild.name}`;
    rewardPoints.textContent = `Available points: ${available}`;

    if (breakdownEl) {
        breakdownEl.textContent = `Earned: ${earned} • Spent: ${spent}`;
    }
}

// ---------- Render rewards list ----------
function renderRewards() {
    rewardList.innerHTML = "";

    if (!activeChild) return;

    const available = getAvailablePoints(activeChild);

    bigRewards
        .filter((r) => r.active)
        .forEach((reward) => {
            const li = document.createElement("li");
            li.classList.add("reward-item");

            const text = document.createElement("div");
            text.innerHTML = `
        <strong>${reward.icon} ${reward.title}</strong> — ${reward.cost} points
        <br><small>${reward.description}</small>
      `;

            const btn = document.createElement("button");
            btn.classList.add("btn");
            btn.type = "button";
            btn.textContent = "Redeem";
            btn.disabled = available < reward.cost;

            btn.addEventListener("click", () => redeemReward(reward));

            li.appendChild(text);
            li.appendChild(btn);
            rewardList.appendChild(li);
        });
}

function redeemReward(reward) {
    if (!activeChild) return;

    activeChild.redeemedRewards = activeChild.redeemedRewards || [];

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

// Initial draw
renderHeader();
renderRewards();
