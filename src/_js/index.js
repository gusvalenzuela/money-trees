const API = require(`./API`);
import moment from "moment";

let transactions = [];
let localRecords = [];
var myChart;

// ().then(data => {
//   console.log(data)
// })

API.openDB()


function loadLocallySavedRecords() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("cached-transactions", 7);
    // Opens a transaction, accesses the toDoList objectStore and statusIndex.
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["cachedTransactions"], "readwrite");
      const store = transaction.objectStore("cachedTransactions");
      // const statusIndex = store.index("statusIndex");

      // Return an item by keyPath
      const getRequest = store.getAll();
      getRequest.onsuccess = () => {
        localRecords = getRequest.result
        resolve(getRequest.result)
      };

      // Return an item by index
      // const getRequestIdx = statusIndex.getAll("complete");
      // getRequestIdx.onsuccess = () => {
      //   console.log(getRequestIdx.result);
      // };
    };
  })



}


fetch("/api/transaction")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // save db data on global variable
    transactions = data;

    loadLocallySavedRecords().then(result => {
      if (result) {
        transactions.unshift(result[0])
        // also send to server
        fetch("/api/transaction/", {
          method: "POST",
          body: JSON.stringify(result[0]),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            // clear form
            API.deleteAllLocalRecords()

            response.json();
          })
      }

      return

    })

    populateTotal();
    populateTable();
    populateChart();

  });
function populateTotal() {
  // populateDelta()

  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let dashboardRow = document.querySelector(`.dashboard.row`);
  let totalDashboard = document.querySelector(`.dashboard-number-card`);
  let totalEl = document.querySelector("#total");

  let totalDelta = document.querySelector(`.dashboard-number-delta`);
  let delta = (transactions[0].value / (total - transactions[0].value)) * 100;

  if (transactions[0].value < 0) {
    totalDelta.innerHTML = `<i class="fa fa-arrow-down" aria-hidden="true"></i> $${
      transactions[0].value * -1
      } (${delta.toFixed(2)}%)`;
  } else {
    totalDelta.innerHTML = `<i class="fa fa-arrow-up" aria-hidden="true"></i> $${
      transactions[0].value
      } (+${delta.toFixed(2)}%)`;
  }

  if (total < 0) {
    totalDashboard.classList.remove(`positive`);
    totalDashboard.classList.add(`negative`);
    dashboardRow.classList.remove(`positive`);
    dashboardRow.classList.add(`negative`);
  } else {
    totalDashboard.classList.remove(`negative`);
    totalDashboard.classList.add(`positive`);
    dashboardRow.classList.remove(`negative`);
    dashboardRow.classList.add(`positive`);
  }

  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  if (transactions.length > 10) {
    var amtToDisplay = 10;
  } else {
    var amtToDisplay = transactions.length;
  }

  for (let index = 0; index < amtToDisplay; index++) {
    const element = transactions[index];

    // create and populate a table row
    let tr = document.createElement("tr");
    let trContent = document.createElement("tr");
    tr.classList.add(`table-expand-row`);
    tr.classList.add(`open-details`);
    trContent.classList.add(`table-expand-row-content`);

    tr.innerHTML = `<td>${element.name.toUpperCase()}</td>
      <td class="t-amount">${element.value}</td>
      <td>${moment(element.date).format(
      `MM/DD h:mm a`
    )} <span class="expand-icon"></span></td>
    `;
    trContent.innerHTML = `<td colspan="9" class="table-expand-row-nested">
      <span><i class="strong">Date:</i> ${moment(element.date).format(
      `llll`
    )}, <i class="strong">Category:</i> ${element.category}
    </span>
      </td>
    `;

    tbody.appendChild(tr);
    tbody.appendChild(trContent);
  }

  $(".open-details").click(function (e) {
    e.preventDefault();
    $(this).next().toggleClass("is-active");
    $(this).toggleClass("is-active");
  });

  $(".t-amount").each((key, val) => {
    let amount = Number($(val)[0].textContent);

    if (amount < 0) {
      $(val).attr(`style`, `color: #dd0000`);
    }
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map((t) => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map((t) => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Over Time",
          fill: true,
          backgroundColor: "#6666ff",
          data,
        },
      ],
    },
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  } else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString(),
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    const con = confirm(`Are you sure you want to SUBTRACT these funds?`);
    if (con) {
      transaction.value *= -1;
    } else {
      return;
    }
  } else {
    const con = confirm(`Are you sure you want to ADD these funds?`);
    if (!con) {
      return;
    }
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // also send to server
  fetch("/api/transaction/test", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      // clear form
      nameEl.value = "";
      amountEl.value = "";
      return response.json();
    })
    .then((data) => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      } else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";
      }
    })
    .catch((err) => {
      // fetch failed, so save in indexed db
      API.saveRecord(transaction);

      // clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}

document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false);
};
