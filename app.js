// grab express
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

// get objectId
var ObjectID = mongodb.ObjectID;

// create an express app
var app = express();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.json());

var CONTACTS_COLLECTION = "contacts";

var ig = require("instagram-node").instagram();

// configure instagram app with your access_token
ig.use({
  // get access token here: http://instagram.pixelunion.net/
  access_token: "3665886821.1677ed0.90a90191fed64cdc9bc7440bbc125a46"
});

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

mongodb.MongoClient.connect(
  process.env.MONGODB_URI,
  function(err, database) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function() {
      var port = server.address().port;
      console.log("App now running on port", port);
    });
  }
);

// home page route - popular images
app.get("/", function(req, res) {
  // use the instagram package to get popular media
  ig.user_self_media_recent(function(
    err,
    medias,
    pagination,
    remaining,
    limit
  ) {
    // render the home page and pass in the popular images
    res.render("pages/index", { grams: medias });
  });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ error: message });
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/contacts", function(req, res) {});

app.post("/contacts", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(
      res,
      "Invalid user input",
      "Must provide a first or last name.",
      400
    );
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/contacts/:id", function(req, res) {});

app.put("/contacts/:id", function(req, res) {});

app.delete("/contacts/:id", function(req, res) {});
