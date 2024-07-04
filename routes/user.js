const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.models.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//serving signup form
router.get("/signup", (req, res) => {
  res.render("users/signUp.ejs");
});

//taking signup request and registring user
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, password, email } = req.body;
      let newUser = new User({ username, email });
      let registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }

        req.flash("success", "Welcome to WandeerLustt!");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("failure", err.message);
      res.redirect("/signup");
    }
  })
);

//serving login form
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

//taking login request and login ing user
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    let redirectUrl = res.locals.redirectUrl || "/listings";
    req.flash("success", "Welcome back to Wandeerlustt");
    res.redirect(redirectUrl);
  }
);

//logout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out");
    res.redirect("/listings");
  });
});

module.exports = router;
