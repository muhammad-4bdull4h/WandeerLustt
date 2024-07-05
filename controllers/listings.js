const listing = require("../models/listing.js");
const axios = require("axios");
const geoApiKey = process.env.GEO_CODE_TOKEN;
const { cloudinary } = require("../cloudConfig.js");
const ExpressError = require("../utils/ExpressError.js");

let clouDelete = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id, function (result) {
      console.log(result);
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.index = async (req, res) => {
  let allListings = await listing.find({});
  res.render("listings/index.ejs", { allListings, category: "Trending" });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const foundListing = await listing
    .findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!foundListing) {
    req.flash("failure", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", {
    foundListing,
  });
};

module.exports.createListing = async (req, res) => {
  let Coordinates = {};
  try {
    let country = req.body.listing.country;
    let location = req.body.listing.location;
    let coordinates = await axios.get(
      `https://geocode.maps.co/search?q=${country}+${location}&api_key=${geoApiKey}`
    );
    if (
      coordinates.data &&
      coordinates.data[1] &&
      typeof coordinates.data[1].lon !== "undefined" &&
      typeof coordinates.data[1].lat !== "undefined"
    ) {
      let cordinateval = [coordinates.data[1].lon, coordinates.data[1].lat];
      Coordinates.type = "Point";
      Coordinates.coordinates = cordinateval;
    } else {
      clouDelete(req.file.filename);
      req.flash(
        "failure",
        "your entered location does not exist in our database"
      );
      return res.redirect("/listings/new");
    }
  } catch (error) {
    console.error(error);
  }
  let url = req.file.path;
  let fileName = req.file.filename;
  let newListing = new listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url: url, filename: fileName };
  if (Coordinates.coordinates.length !== 0) {
    newListing.geometry = Coordinates;
  } else {
    newListing.geometry = {
      type: "Point",
      coordinates: [73.0442858, 33.685858],
    };
  }
  await newListing.save();
  req.flash("success", "New Listing Created successfully");
  res.redirect("/listings");
};

module.exports.updateForm = async (req, res) => {
  let { id } = req.params;
  let foundListing = await listing.findById(id);
  if (!foundListing) {
    req.flash("failure", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { foundListing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let foundlist = await listing.findById(id);
  let updatedListing = await listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });
  if (typeof req.file !== "undefined") {
    clouDelete(foundlist.image.filename);
    let url = req.file.path;
    let fileName = req.file.filename;
    updatedListing.image = { url: url, filename: fileName };
    await updatedListing.save();
  }
  req.flash("success", "updated Listing successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let foundListing = await listing.findById(id);
  clouDelete(foundListing.image.filename);
  await listing.findByIdAndDelete(id);
  req.flash("success", "deleted Listing successfully");
  res.redirect("/listings");
};
