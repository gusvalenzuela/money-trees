const API = require(`./API`);

const results = await API.loadLocallySavedRecords()

console.log(results)