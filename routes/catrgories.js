const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");

router.route("/:category").get(async (req, res) => {
  let { category } = req.params;
  let parameter = category.replaceAll("_", " ");
  let allListings = await listing.find({ category: parameter });
  res.render("listings/index.ejs", { allListings, category });
});

module.exports = router;
