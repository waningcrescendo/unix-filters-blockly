var express = require("express");
var router = express.Router();

/* GET home page. */
// va renvoyer les json d'exercices
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
