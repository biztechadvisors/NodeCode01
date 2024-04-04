const express = require("express");
const logger = require("morgan");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSanitizer = require("express-sanitizer");
const helmet = require("helmet");
const rfs = require("rotating-file-stream");
require("./passport");

module.exports = {
  setup: (config) => {
    const app = express();

    // Create a rotating access log stream
    const accessLogStream = rfs.createStream("access.log", {
      interval: "1d",
      path: path.join(__dirname, "..", "log"),
    });

    // Use morgan for logging with the rotating access log stream
    app.use(logger(process.env.APP_LOG || "dev", { stream: accessLogStream }));

    // Body parser middleware for parsing application/json
    app.use(bodyParser.json({ limit: "50mb" }));

    // Body parser middleware for parsing application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    // Cookie parser middleware
    app.use(cookieParser(process.env.APP_SECRET));

    // Session middleware
    app.use(
      session({
        secret: process.env.APP_SECRET,
        resave: true,
        saveUninitialized: true,
      })
    );

    // Static files middleware for serving images
    app.use("/photo", express.static(path.join(__dirname, "public/images")));

    // Initialize Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // Sanitizer middleware
    app.use(expressSanitizer());

    // Helmet middleware for enhancing security
    app.use(helmet());

    // Configure HSTS middleware
    app.use(
      helmet.hsts({
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      })
    );

    // Extend Number prototype with pad function
    Number.prototype.pad = function (size) {
      var s = String(this);
      while (s.length < (size || 2)) {
        s = "0" + s;
      }
      return s;
    };

    return app;
  },
};
