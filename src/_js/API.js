// Loads any saved data for user
const TABLE_NAME = `cachedTransactions`
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
  openDB(){
    const request = window.indexedDB.open("cached-transactions", 1);

    // Create schema
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Creates an object store with a listID keypath that can be used to query on.
      const cachedTransactionsStore = db.createObjectStore(
        TABLE_NAME,
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
        console.log(`success`, db)
    };
  },

  deleteAllLocalRecords() {
    // Let us open our database
    var request = window.indexedDB.open("cached-transactions", 7);

    // grab a keyrange to delete
    // https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange
    var myIDBKeyRange = IDBKeyRange.lowerBound(0);

    request.onsuccess = function (event) {

      // store the result of opening the database in the db variable. This is used a lot below
      db = request.result;

      // open a read/write db transaction, ready for deleting the data
      var transaction = db.transaction([TABLE_NAME], "readwrite");

      // report on the success of the transaction completing, when everything is done
      transaction.oncomplete = function (event) {
        // note.innerHTML += '<li>Transaction completed.</li>';
      };

      transaction.onerror = function (event) {
        // note.innerHTML += '<li>Transaction not opened due to error: ' + transaction.error + '</li>';
      };

      // create an object store on the transaction
      var objectStore = transaction.objectStore(TABLE_NAME);

      // Make a request to delete the specified record out of the object store
      var objectStoreRequest = objectStore.delete(myIDBKeyRange);

      objectStoreRequest.onsuccess = function (event) {
        // report the success of our request
        const error = document.querySelector(`.error`)
        error.innerHTML += '<li>Request successful.</li>';
      };
    };

  },

  saveRecord(record) {
    const request = window.indexedDB.open("cached-transactions", 1);

    // Create schema
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Creates an object store with a listID keypath that can be used to query on.
      const cachedTransactionsStore = db.createObjectStore(
        TABLE_NAME,
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
        TABLE_NAME
      );

      // Adds data to our objectStore
      record.listID = Number(Date.now())
      cachedTransactionsStore.add(record);
    };
  },


};
