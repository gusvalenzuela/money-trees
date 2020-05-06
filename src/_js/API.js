// Loads any saved data for user
export function loadSavedTransactions(user) {
  return new Promise((resolve, reject) => {
    fetch(`/api/user/transactions/` + user)
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      });
  });


}
