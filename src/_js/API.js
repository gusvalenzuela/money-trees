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

  saveRecord(){
    // indexDB here
  }
};
