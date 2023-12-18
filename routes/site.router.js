const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  req.logout()
  res.render("index", {fullname: "ThaiPham", title: "Welcome!"})
});

module.exports = router;
