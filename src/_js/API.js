// Loads any saved data for user
module.exports = {
  loadSavedTransactions(user) {
    return new Promise((resolve, reject) => {
      fetch(`/api/user/transactions/` + user)
        .then((res) => res.json())
        .then((data) => {
          resolve(data);
        });
    });
  },

  

  saveRecord(record) {
    const request = window.indexedDB.open("cached-transactions", 1);

    // Create schema
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Creates an object store with a listID keypath that can be used to query on.
      const cachedTransactionsStore = db.createObjectStore(
        "cachedTransactions",
        { keyPath: "listID" }
      );
      // Creates a statusIndex that we can query on.
      cachedTransactionsStore.createIndex("dateIndex", "date");
      cachedTransactionsStore.createIndex("nameIndex", "name");
      cachedTransactionsStore.createIndex("valueIndex", "value");
    };

    // Opens a transaction, accesses the cachedTransactions objectStore and statusIndex.
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["cachedTransactions"], "readwrite");
      const cachedTransactionsStore = transaction.objectStore(
        "cachedTransactions"
      );

      // Adds data to our objectStore
      record.listID = Number(Date.now())
      cachedTransactionsStore.add(record);
    };
  },


};
