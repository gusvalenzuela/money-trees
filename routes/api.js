const router = require("express").Router();
const Transaction = require("../models/transaction.js");
const mongoose = require(`mongoose`);

router.post("/api/transaction", ({ body }, res) => {
  Transaction.create(body)
    .then((dbTransaction) => {
      res.json(dbTransaction);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

router.post("/api/transaction/bulk", ({ body }, res) => {
  Transaction.insertMany(body)
    .then((dbTransaction) => {
      res.json(dbTransaction);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

// router.get("/api/transaction/:userId", ({ userId }, res) => {
//   Transaction.find({ _id: mongoose.ObjectId(userId) })
//     .sort({ date: -1 })
//     .then((dbTransaction) => {
//       res.json(dbTransaction);
//     })
//     .catch((err) => {
//       res.status(404).json(err);
//     });
// });
router.get("/api/transaction/", (req, res) => {
  console.log(`find me the stuff`)
  
  Transaction.find({})
  .sort({ date: -1 })
  .then((dbTransaction) => {
    console.log(dbTransaction)
      res.json(dbTransaction);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

module.exports = router;
