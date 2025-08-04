var totalTransct = [];

function takeVal() {
  const inputAmount = document.querySelector("#transaction-amount").value;
  const inputDescription = document.querySelector(
    "#transaction-description"
  ).value;
  const inputType = document.querySelector("#transaction-type").value;
  const inputCategory = document.querySelector("#transaction-category").value;
  const inputDate = document.querySelector("#transaction-date").value;
  if (
    inputAmount &&
    inputDescription &&
    inputType !== "none" &&
    inputCategory !== "none" &&
    inputDate
  ) {
    const transaction = {
      amount: +inputAmount,
      type: inputType,
      category: inputCategory,
      date: inputDate,
      description: inputDescription,
    };
    totalTransct.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(totalTransct));
    updateSummary();
    updateexpenseChart();
    renderTransactionCard(transaction);
  } else {
    alert("Please fill all required fields.");
    return;
  }
  document.querySelector("#transaction-amount").value = "";
  document.querySelector("#transaction-description").value = "";
  document.querySelector("#transaction-type").value = "none";
  document.querySelector("#transaction-category").value = "none";
  document.querySelector("#transaction-date").value = "";
}

document.querySelector("#add-btn").addEventListener("click", takeVal);

document
  .querySelector("#transaction-type")
  .addEventListener("change", function () {
    document.querySelector("#transaction-category").value = "none";
    const inputVal = document.querySelector("#transaction-type").value;

    if (inputVal === "income") {
      document.querySelectorAll(".income").forEach((element) => {
        element.style.display = "block";
      });
      document.querySelectorAll(".expense").forEach((element) => {
        element.style.display = "none";
      });
    } else if (inputVal === "expense") {
      document.querySelectorAll(".expense").forEach((element) => {
        element.style.display = "block";
      });
      document.querySelectorAll(".income").forEach((element) => {
        element.style.display = "none";
      });
    }
  });
function updateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;
  totalTransct.forEach((element) => {
    if (element.type == "income") {
      totalIncome = Number(element.amount) + totalIncome;
    } else if (element.type == "expense") {
      totalExpense = Number(element.amount) + totalExpense;
    }
  });
  document.querySelector("#total-balance").textContent =
    " ₹ " + (totalIncome - totalExpense);
  document.querySelector("#total-income").textContent = " ₹ " + totalIncome;
  document.querySelector("#total-expenses").textContent = " ₹ " + totalExpense;
  updateincomeVSexpensechart(totalIncome, totalExpense);

  if (totalTransct.length > 0) {
    let last = totalTransct[totalTransct.length - 1];

    document.querySelector("#last-transaction").textContent =
      " ₹ " +
      last.amount +
      "  (" +
      last.type +
      " => " +
      last.category +
      " ) on " +
      last.date;
    document
      .querySelector("#last-transaction")
      .classList.remove("last-positive");
    document
      .querySelector("#last-transaction")
      .classList.remove("last-negative");
    if (last.type == "income") {
      document
        .querySelector("#last-transaction")
        .classList.add("last-positive");
    } else if (last.type == "expense") {
      document
        .querySelector("#last-transaction")
        .classList.add("last-negative");
    }
  }

  let totalBalance = totalIncome - totalExpense;
  document.querySelector(".summary").classList.remove("summary-positive");
  document.querySelector(".summary").classList.remove("summary-negative");
  if (totalBalance > 0) {
    document.querySelector(".summary").classList.add("summary-positive");
  } else if (totalBalance < 0) {
    document.querySelector(".summary").classList.add("summary-negative");
  }
}

function renderTransactionCard(transaction) {
  const container = document.querySelector("#transaction-list");
  document.querySelector("#no-transaction-message").style.display = "none";

  const card = document.createElement("div");
  card.classList.add("transaction-card");
  card.classList.add(
    transaction.type === "income" ? "card-income" : "card-expense"
  );
  card.innerHTML = `
  <div class="card-top">
    <span class="category">${transaction.category}</span>
    <span class="date">${transaction.date}</span>

  </div>

  <div class="card-bottom">
    <span class="type">${transaction.type}</span>
    <span class="amount">${transaction.type === "income" ? "+ ₹" : "- ₹"}${
    transaction.amount
  }</span>

  </div>
   <div class="description">${transaction.description}</div>
   `;
  container.prepend(card);
}

window.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("transactions");
  if (stored) {
    totalTransct = JSON.parse(stored);
    totalTransct.forEach((transaction) => renderTransactionCard(transaction));
    updateSummary();
    updateexpenseChart();
  }
  
});

let doughchart;
let piechart;

function updateexpenseChart() {
  const ctx = document.querySelector("#expense-doug-chart").getContext("2d");
  const categories = ["food", "rent", "electricity", "travel", "others"];
  const categoryTotal = {
    food: 0,
    rent: 0,
    electricity: 0,
    travel: 0,
    others: 0,
  };
let hasExpense=false;
  totalTransct.forEach((transaction) => {
    if (transaction.type === "expense") {
      if (categoryTotal.hasOwnProperty(transaction.category)) {
        categoryTotal[transaction.category] += transaction.amount;
        hasExpense=true;
      }
    }
  });

if(!hasExpense){
  document.querySelector("#no-chart-message").style.display="block";
  document.querySelector(".chart-grid").style.display="none";
  return;
}
   document.querySelector("#no-chart-message").style.display="none";
  document.querySelector(".chart-grid").style.display="flex";

  if (doughchart) {
    doughchart.destroy();
  }

  doughchart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Food", "Rent", "Electricity", "Travel", "Others"],
      datasets: [
        {
          label: "Expenses by Category",
          data: categories.map((cat) => categoryTotal[cat]),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}
function updateincomeVSexpensechart(inc, exp) {
  const ctx = document
    .querySelector("#income-expense-pie-chart")
    .getContext("2d");
  if (piechart) {
    piechart.destroy();
  }
  piechart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          label: "Amount (₹)",
          data: [inc, exp],
          backgroundColor: ["#10b981", "#ef4444"],
          borderRadius: 5,
          barThickness: 40,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

/*function updateChartVisibility(){
if(!totalTransct || totalTransct.length === 0){
  document.querySelector(".chart-grid").style.display="none";
}}*/