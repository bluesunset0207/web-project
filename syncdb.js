const db = require('./model/db');

db.seq.sync({ force: true }).then(() => {
    console.log("All models were synchronized successfully.");
}).catch(error => {
    console.error("Error occurred during the synchronization:", error);
});
